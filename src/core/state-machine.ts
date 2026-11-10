/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NovaStateType, NovaTask, StateTransitionEvent } from './schemas';

export type StateListener = (state: NovaStateType, task: NovaTask | null, event: StateTransitionEvent) => void;

/**
 * 15-State Deterministic Finite State Machine.
 * Strictly guarantees that transitions follow authorized edges.
 */
export class NovaStateMachine {
  private currentState: NovaStateType = 'IDLE';
  private activeTask: NovaTask | null = null;
  private listeners: Set<StateListener> = new Set();
  private history: StateTransitionEvent[] = [];

  // Deterministic valid transition graph
  private readonly validTransitions: Record<NovaStateType, NovaStateType[]> = {
    IDLE: ['LISTENING'],
    LISTENING: ['AUTHENTICATING', 'CANCELLED', 'FAILED'],
    AUTHENTICATING: ['TRANSCRIBING', 'FAILED', 'CANCELLED'],
    TRANSCRIBING: ['UNDERSTANDING', 'FAILED', 'CANCELLED'],
    UNDERSTANDING: ['OBSERVING', 'PLANNING', 'FAILED', 'CANCELLED'],
    OBSERVING: ['PLANNING', 'FAILED', 'CANCELLED'],
    PLANNING: ['DISAMBIGUATING', 'STAGING', 'EXECUTING', 'FAILED', 'CANCELLED'],
    DISAMBIGUATING: ['PLANNING', 'STAGING', 'CANCELLED', 'FAILED'],
    STAGING: ['AWAITING_APPROVAL', 'EXECUTING', 'CANCELLED'],
    AWAITING_APPROVAL: ['EXECUTING', 'CANCELLED', 'FAILED'],
    EXECUTING: ['VERIFYING', 'FAILED', 'CANCELLED'],
    VERIFYING: ['COMPLETED', 'FAILED'],
    COMPLETED: ['IDLE'],
    FAILED: ['IDLE'],
    CANCELLED: ['IDLE'],
  };

  constructor() {
    this.history.push({
      from: 'IDLE',
      to: 'IDLE',
      timestamp: Date.now(),
      reason: 'System Initialized',
    });
  }

  public getState(): NovaStateType {
    return this.currentState;
  }

  public getActiveTask(): NovaTask | null {
    return this.activeTask;
  }

  public getHistory(): StateTransitionEvent[] {
    return [...this.history];
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    // Initial notification
    listener(this.currentState, this.activeTask, this.history[this.history.length - 1]);
    return () => this.listeners.delete(listener);
  }

  public setTask(task: NovaTask | null): void {
    this.activeTask = task;
    this.notify();
  }

  public canTransitionTo(nextState: NovaStateType): boolean {
    const allowed = this.validTransitions[this.currentState] || [];
    return allowed.includes(nextState);
  }

  public transition(nextState: NovaStateType, reason?: string): boolean {
    if (this.currentState === nextState) return true;

    if (!this.canTransitionTo(nextState)) {
      console.warn(
        `[NovaStateMachine] ILLEGAL TRANSITION ATTEMPT: ${this.currentState} -> ${nextState}. Allowed:`,
        this.validTransitions[this.currentState]
      );
      return false;
    }

    const event: StateTransitionEvent = {
      from: this.currentState,
      to: nextState,
      timestamp: Date.now(),
      reason: reason || `Transition from ${this.currentState} to ${nextState}`,
    };

    this.currentState = nextState;
    this.history.unshift(event);
    if (this.history.length > 50) this.history.pop();

    this.notify(event);
    return true;
  }

  public forceReset(): void {
    const event: StateTransitionEvent = {
      from: this.currentState,
      to: 'IDLE',
      timestamp: Date.now(),
      reason: 'Manual Coordinator Reset',
    };
    this.currentState = 'IDLE';
    this.activeTask = null;
    this.history.unshift(event);
    this.notify(event);
  }

  private notify(event?: StateTransitionEvent): void {
    const currentEvent = event || this.history[0];
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentState, this.activeTask, currentEvent);
      } catch (err) {
        console.error('[NovaStateMachine] Error in state listener:', err);
      }
    });
  }
}
