/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuditLogEntry, NovaTask, UserProfile, AgentConfig } from './schemas';

export interface ContactAlias {
  alias: string;
  fullName: string;
  destination: string; // phone, email, handle
  app: string;
}

/**
 * Three-Tier Memory & Security Vault.
 * 1. User Profile & Login: Owner identity, security PIN/biometric lock, authentication state.
 * 2. Agent Setup: Assistant name, wake phrase, model selection, voice enrollment, and permissions.
 * 3. Short-Term & Long-Term Memory: Pronouns, aliases, and full execution history log.
 */
export class MemoryVault {
  private userProfile: UserProfile = {
    userName: 'Venkatesh Malepati',
    userEmail: 'venkateshmalepati078@gmail.com',
    userPin: '2026',
    isLoggedIn: true,
    hasCompletedOnboarding: false,
  };

  private agentConfig: AgentConfig = {
    assistantName: 'NOVA',
    wakePhrase: 'Hey Nova',
    selectedModel: 'gemini-3.8-flash',
    speechRate: 1.0,
    pitch: 1.0,
    voicePersona: 'Nova Indian English (Warm & Natural)',
    language: 'en-IN',
    permissions: {
      microphone: true,
      accessibility: true,
      overlay: true,
    },
    voiceEnrollment: {
      isEnrolled: false,
      samplesCompleted: 0,
      samplePhrases: [],
    },
  };

  private shortTermTurns: Array<{ role: 'user' | 'assistant'; text: string; timestamp: number }> = [];
  private pronounContext: Record<string, string> = {
    him: 'Uday',
    her: 'Sarah',
    it: 'Resume_2026_Senior_AI_Architect.pdf',
  };

  private contactAliases: ContactAlias[] = [
    { alias: 'Uday', fullName: 'Uday Kiran', destination: '+1 555-0192', app: 'com.whatsapp' },
    { alias: 'HR', fullName: 'HR Recruitment Department', destination: 'recruiting@company.com', app: 'com.google.android.gm' },
    { alias: 'Mom', fullName: 'Mom', destination: '+1 555-0144', app: 'com.whatsapp' },
  ];

  private auditLogs: AuditLogEntry[] = [
    {
      id: 'audit-001',
      timestamp: Date.now() - 3600000 * 3,
      taskId: 'task-yt-01',
      intent: 'SEARCH_APP',
      userUtterance: 'Open YouTube and search for Python DSA tutorials',
      taskTitle: 'Search YouTube for Python DSA tutorials',
      targetApp: 'com.google.android.youtube',
      riskLevel: 'READ_ONLY',
      payloadHash: '4a8b8c2e91a03f44',
      approvalMethod: 'AUTO_AUTHORIZED',
      durationMs: 420,
      status: 'COMPLETED',
      details: 'Opened YouTube, entered query, and displayed results.',
      responseMessage: 'Showing Python DSA tutorials on YouTube. Bye!',
    },
    {
      id: 'audit-002',
      timestamp: Date.now() - 3600000 * 24,
      taskId: 'task-wa-02',
      intent: 'SEND_MESSAGE',
      userUtterance: 'Send a WhatsApp message to Uday saying I am waiting for him',
      taskTitle: 'Draft & Send WhatsApp Message to Uday',
      targetApp: 'com.whatsapp',
      riskLevel: 'HIGH_RISK_MUTATION',
      payloadHash: '7f91c3e120bc98a1',
      approvalMethod: 'UI_CLICK',
      durationMs: 980,
      status: 'COMPLETED',
      details: 'Drafted message "I am waiting for him.", obtained user confirmation, and sent.',
      responseMessage: 'I sent the message to Uday. Have a good time, bye!',
    },
    {
      id: 'audit-003',
      timestamp: Date.now() - 3600000 * 48,
      taskId: 'task-mail-03',
      intent: 'SEND_EMAIL',
      userUtterance: 'Find my latest resume and send it to HR through email',
      taskTitle: 'Email Resume to HR',
      targetApp: 'com.google.android.gm',
      riskLevel: 'HIGH_RISK_MUTATION',
      payloadHash: '1a2b3c4d5e6f7a8b',
      approvalMethod: 'VOICE_YES',
      durationMs: 1250,
      status: 'COMPLETED',
      details: 'Located Resume_2026_Senior_AI_Architect.pdf in local storage, attached to Gmail draft, confirmed, and sent.',
      responseMessage: 'Your latest resume has been sent to HR. Good luck, bye!',
    },
  ];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const savedLogs = localStorage.getItem('nova_audit_logs');
        if (savedLogs) {
          const parsed = JSON.parse(savedLogs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.auditLogs = parsed;
          }
        }

        const savedAliases = localStorage.getItem('nova_contact_aliases');
        if (savedAliases) this.contactAliases = JSON.parse(savedAliases);

        const savedUser = localStorage.getItem('nova_user_profile');
        if (savedUser) this.userProfile = JSON.parse(savedUser);

        const savedAgent = localStorage.getItem('nova_agent_config');
        if (savedAgent) this.agentConfig = JSON.parse(savedAgent);
      } catch (e) {
        console.warn('[MemoryVault] Local storage read error:', e);
      }
    }
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('nova_audit_logs', JSON.stringify(this.auditLogs));
        localStorage.setItem('nova_contact_aliases', JSON.stringify(this.contactAliases));
        localStorage.setItem('nova_user_profile', JSON.stringify(this.userProfile));
        localStorage.setItem('nova_agent_config', JSON.stringify(this.agentConfig));
      } catch (e) {
        console.warn('[MemoryVault] Local storage save error:', e);
      }
    }
  }

  // --- User Profile & Login ---
  public getUserProfile(): UserProfile {
    return { ...this.userProfile };
  }

  public updateUserProfile(profile: Partial<UserProfile>): UserProfile {
    this.userProfile = { ...this.userProfile, ...profile };
    this.saveToStorage();
    return { ...this.userProfile };
  }

  public login(pin: string): boolean {
    if (pin === this.userProfile.userPin) {
      this.userProfile.isLoggedIn = true;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public logout(): void {
    this.userProfile.isLoggedIn = false;
    this.saveToStorage();
  }

  // --- Agent Setup ---
  public getAgentConfig(): AgentConfig {
    return { ...this.agentConfig };
  }

  public updateAgentConfig(config: Partial<AgentConfig>): AgentConfig {
    this.agentConfig = { ...this.agentConfig, ...config };
    this.saveToStorage();
    return { ...this.agentConfig };
  }

  // --- Short-Term Context ---
  public addTurn(role: 'user' | 'assistant', text: string): void {
    this.shortTermTurns.push({ role, text, timestamp: Date.now() });
    if (this.shortTermTurns.length > 20) this.shortTermTurns.shift();

    const contactMatch = text.match(/\bto ([A-Z][a-z]+)\b/i);
    if (contactMatch) {
      this.pronounContext['him'] = contactMatch[1];
    }
  }

  public getRecentTurns(): Array<{ role: 'user' | 'assistant'; text: string; timestamp: number }> {
    return [...this.shortTermTurns];
  }

  public resolvePronoun(pronoun: string): string | undefined {
    return this.pronounContext[pronoun.toLowerCase()];
  }

  // --- Long-Term Aliases ---
  public getAliases(): ContactAlias[] {
    return [...this.contactAliases];
  }

  public resolveContact(query: string): ContactAlias | undefined {
    const q = query.toLowerCase();
    return this.contactAliases.find(
      (c) => c.alias.toLowerCase() === q || c.fullName.toLowerCase().includes(q)
    );
  }

  public addAlias(alias: ContactAlias): void {
    this.contactAliases.push(alias);
    this.saveToStorage();
  }

  // --- Audit Trail ---
  public logExecution(
    task: NovaTask,
    approvalMethod: AuditLogEntry['approvalMethod'],
    durationMs: number,
    userUtterance?: string,
    responseMessage?: string
  ): void {
    const utterance = userUtterance || task.entities.message || task.intent;
    const byeMessage = responseMessage || `I finished your task: ${task.stagedSummary}. Bye!`;

    const entry: AuditLogEntry = {
      id: 'audit-' + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      taskId: task.taskId,
      intent: task.intent,
      userUtterance: utterance,
      taskTitle: task.stagedSummary || task.intent,
      targetApp: task.targetApp,
      riskLevel: task.riskLevel,
      payloadHash: task.approvalToken || 'none',
      approvalMethod,
      durationMs,
      status: task.status === 'COMPLETED' ? 'COMPLETED' : task.status === 'CANCELLED' ? 'CANCELLED' : 'FAILED',
      details: task.stagedSummary,
      responseMessage: byeMessage,
    };

    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 100) this.auditLogs.pop();
    this.saveToStorage();
  }

  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }

  public clearAuditLogs(): void {
    this.auditLogs = [];
    this.saveToStorage();
  }
}
