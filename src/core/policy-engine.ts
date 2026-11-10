/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NovaTask, RiskLevel } from './schemas';

export class ActionPolicyEngine {
  public static readonly APPROVAL_TTL_MS = 30_000; // 30 seconds

  /**
   * Classify risk category based on intent, targets, and operations.
   */
  public classifyRisk(intent: string, isDestructive: boolean = false): RiskLevel {
    const highRiskIntents = [
      'SEND_MESSAGE',
      'SEND_EMAIL',
      'DELETE_FILE',
      'TRANSFER_MONEY',
      'MODIFY_SYSTEM_PERMISSION',
      'PURCHASE_ITEM',
    ];
    const lowRiskIntents = ['TYPE_DRAFT', 'SAVE_DRAFT', 'SWITCH_APP', 'SET_THEME'];

    if (highRiskIntents.includes(intent.toUpperCase()) || isDestructive) {
      return 'HIGH_RISK_MUTATION'; // Category C
    }
    if (lowRiskIntents.includes(intent.toUpperCase())) {
      return 'LOW_RISK_MUTATION'; // Category B
    }
    return 'READ_ONLY'; // Category A
  }

  /**
   * Generates a cryptographic SHA-256 fingerprint bound to the exact staged payload.
   */
  public async computePayloadHash(task: NovaTask): Promise<string> {
    const rawString = [
      task.taskId,
      task.targetApp,
      task.intent,
      task.stagedSummary,
      JSON.stringify(task.entities),
      task.steps.map((s) => `${s.stepIndex}:${s.actionType}:${s.targetNodeId || ''}:${s.payload || ''}`).join(';'),
    ].join('::');

    try {
      const msgBuffer = new TextEncoder().encode(rawString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback for non-subtle crypto test environments
      let hash = 0;
      for (let i = 0; i < rawString.length; i++) {
        hash = (hash << 5) - hash + rawString.charCodeAt(i);
        hash |= 0;
      }
      return 'fb_' + Math.abs(hash).toString(16).padStart(16, '0');
    }
  }

  /**
   * Generates an approval token for a staged task.
   */
  public async stageTaskForApproval(task: NovaTask): Promise<{ task: NovaTask; hash: string; expiresAt: number }> {
    const hash = await this.computePayloadHash(task);
    const expiresAt = Date.now() + ActionPolicyEngine.APPROVAL_TTL_MS;

    const stagedTask: NovaTask = {
      ...task,
      approvalToken: hash,
      isApproved: false,
      status: 'STAGED',
    };

    return { task: stagedTask, hash, expiresAt };
  }

  /**
   * Verifies if the approval token matches the current task fingerprint and is within the TTL window.
   */
  public async verifyApproval(
    task: NovaTask,
    token: string,
    stagedAt: number
  ): Promise<{ valid: boolean; reason?: string }> {
    // Check TTL expiration
    const now = Date.now();
    if (now - stagedAt > ActionPolicyEngine.APPROVAL_TTL_MS) {
      return { valid: false, reason: 'Approval window expired (30s TTL exceeded). Action cancelled for safety.' };
    }

    // Verify cryptographic fingerprint match
    const currentHash = await this.computePayloadHash(task);
    if (currentHash !== token) {
      return {
        valid: false,
        reason: 'Action payload mutated after staging. Prior approval invalidated to prevent hijacking.',
      };
    }

    return { valid: true };
  }
}
