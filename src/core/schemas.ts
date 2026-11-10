/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NovaStateType =
  | 'IDLE'
  | 'LISTENING'
  | 'AUTHENTICATING'
  | 'TRANSCRIBING'
  | 'UNDERSTANDING'
  | 'OBSERVING'
  | 'PLANNING'
  | 'DISAMBIGUATING'
  | 'STAGING'
  | 'AWAITING_APPROVAL'
  | 'EXECUTING'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type RiskLevel = 'READ_ONLY' | 'LOW_RISK_MUTATION' | 'HIGH_RISK_MUTATION';

export type ActionType =
  | 'LAUNCH_PACKAGE'
  | 'CLICK_NODE'
  | 'SET_TEXT'
  | 'SCROLL_FORWARD'
  | 'SCROLL_BACKWARD'
  | 'STAGE_ACTION'
  | 'VERIFY_STATE';

export interface ActionStep {
  stepIndex: number;
  actionType: ActionType;
  targetApp?: string;
  targetNodeId?: string;
  targetText?: string;
  payload?: string;
  status?: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
}

export interface NovaTask {
  taskId: string;
  intent: 'SEND_MESSAGE' | 'SEND_EMAIL' | 'SEARCH_APP' | 'OPEN_APP' | 'FIND_FILE' | 'SYSTEM_SETTING' | 'CONVERSATIONAL_QUERY';
  targetApp: string;
  entities: {
    contact?: string;
    message?: string;
    searchQuery?: string;
    fileName?: string;
    settingKey?: string;
    settingValue?: string;
    [key: string]: string | undefined;
  };
  riskLevel: RiskLevel;
  requiresConfirmation: boolean;
  stagedSummary: string;
  steps: ActionStep[];
  timestamp: number;
  approvalToken?: string;
  isApproved?: boolean;
  status: 'STAGED' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  failureReason?: string;
  canRunOnLockScreen?: boolean;
  requiresUnlock?: boolean;
  answer?: string;
}

export interface AccessibilityNode {
  id: string;
  text: string;
  description: string;
  className: string;
  packageName: string;
  clickable: boolean;
  editable: boolean;
  focused: boolean;
  bounds?: { x: number; y: number; width: number; height: number };
  children?: AccessibilityNode[];
}

export interface StateTransitionEvent {
  from: NovaStateType;
  to: NovaStateType;
  timestamp: number;
  reason?: string;
}

export interface SpeakerProfile {
  name: string;
  enrolledAt: number;
  samplesCount: number;
  embeddingVector: number[];
  threshold: number; // e.g. 0.82
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  taskId: string;
  intent: string;
  userUtterance: string; // What the user said
  taskTitle: string;     // What task it worked on
  targetApp: string;
  riskLevel: RiskLevel;
  payloadHash: string;
  approvalMethod: 'VOICE_YES' | 'UI_CLICK' | 'AUTO_AUTHORIZED' | 'REJECTED' | 'EXPIRED' | 'VOICE_BIOMETRIC_LOCKSCREEN';
  durationMs: number;
  status: 'COMPLETED' | 'FAILED' | 'CANCELLED';
  details: string;
  responseMessage: string; // Assistant goodbye / interaction message e.g. "Message sent to Uday! Bye!"
}

export interface UserProfile {
  userName: string;
  userEmail: string;
  userPin: string;
  isLoggedIn: boolean;
  hasCompletedOnboarding?: boolean;
}

export interface AgentConfig {
  assistantName: string;
  wakePhrase: string;
  selectedModel: string;
  speechRate: number;
  pitch: number;
  voicePersona: string;
  language: 'en-IN' | 'hi-IN' | 'te-IN';
  permissions: {
    microphone: boolean;
    accessibility: boolean;
    overlay: boolean;
  };
  voiceEnrollment: {
    isEnrolled: boolean;
    samplesCompleted: number;
    samplePhrases: string[];
  };
}

