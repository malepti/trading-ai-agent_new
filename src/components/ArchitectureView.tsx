/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layers, ShieldCheck, Cpu, GitBranch, Terminal } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 5-Layer Stack Card */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            NOVA Core Architecture (5 Layers + Cross-Cutting Security)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-mono text-emerald-400 font-semibold text-[11px] block">LAYER 1</span>
            <h4 className="font-semibold text-slate-200">On-Device Sensory</h4>
            <ul className="text-slate-400 text-[11px] space-y-1 list-disc list-inside">
              <li>"Hey Nova" Wake Word</li>
              <li>ECAPA-TDNN Speaker Auth</li>
              <li>Realtime VAD Energy</li>
              <li>Vosk / Whisper STT</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-mono text-indigo-400 font-semibold text-[11px] block">LAYER 2</span>
            <h4 className="font-semibold text-slate-200">State Coordinator</h4>
            <ul className="text-slate-400 text-[11px] space-y-1 list-disc list-inside">
              <li>15-State Finite Machine</li>
              <li>Deterministic Routing</li>
              <li>Cancellation Teardown</li>
              <li>Timeout Policy Guard</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-mono text-cyan-400 font-semibold text-[11px] block">LAYER 3</span>
            <h4 className="font-semibold text-slate-200">Cognitive Reasoning</h4>
            <ul className="text-slate-400 text-[11px] space-y-1 list-disc list-inside">
              <li>Gemini 3.8 Flash</li>
              <li>Structured Schema JSON</li>
              <li>Intent & Entity Parser</li>
              <li>Task Step Planner</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-mono text-purple-400 font-semibold text-[11px] block">LAYER 4</span>
            <h4 className="font-semibold text-slate-200">OS Execution Bridge</h4>
            <ul className="text-slate-400 text-[11px] space-y-1 list-disc list-inside">
              <li>AccessibilityService</li>
              <li>85% Tree Pruning</li>
              <li>ACTION_CLICK / TEXT</li>
              <li>MediaProjection Fallback</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-mono text-amber-400 font-semibold text-[11px] block">LAYER 5</span>
            <h4 className="font-semibold text-slate-200">Security Vault</h4>
            <ul className="text-slate-400 text-[11px] space-y-1 list-disc list-inside">
              <li>HITL Policy Engine</li>
              <li>SHA-256 Action Token</li>
              <li>30s TTL Expiration</li>
              <li>Short/Long-Term Memory</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 15-State FSM Diagram Card */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Deterministic 15-State Coordinator Transition Graph
          </h3>
        </div>

        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 overflow-x-auto">
          <pre className="text-xs font-mono text-slate-300 leading-relaxed">
{`   ┌───────────┐
   │   IDLE    │ ◄──────────────────────────────────────────────┐
   └─────┬─────┘                                                │
         │ Wake Word Detected ("Hey Nova")                      │
         ▼                                                      │
   ┌───────────┐                                                │
   │ LISTENING │                                                │
   └─────┬─────┘                                                │
         │ Voice Activity Complete (800ms silence)              │
         ▼                                                      │
   ┌────────────────┐                                           │
   │ AUTHENTICATING │ (ECAPA-TDNN Speaker Biometric Check)      │
   └─────┬──────────┘                                           │
         │ Identity Verified (τ ≥ 0.82)                         │
         ▼                                                      │
   ┌─────────────┐                                              │
   │TRANSCRIBING │ (Offline STT / Whisper)                      │
   └─────┬───────┘                                              │
         │ Transcript Ready                                     │
         ▼                                                      │
   ┌───────────────┐                                            │
   │ UNDERSTANDING │ (Intent & Entity Parsing)                  │
   └─────┬─────────┘                                            │
         │ Needs UI Target Hierarchy                            │
         ▼                                                      │
   ┌───────────┐                                                │
   │ OBSERVING │ (Accessibility Bridge Tree Pruning)            │
   └─────┬─────┘                                                │
         │ Actionable Nodes Extracted                           │
         ▼                                                      │
   ┌──────────┐      Ambiguous?       ┌────────────────┐        │
   │ PLANNING │ ────────────────────> │ DISAMBIGUATING │        │
   └─────┬────┘                       └───────┬────────┘        │
         │                                    │ Resolved        │
         ▼ ◄──────────────────────────────────┘                 │
   ┌─────────┐                                                  │
   │ STAGING │                                                  │
   └────┬────┘                                                  │
        ├─────────────────────────────────────┐                 │
        │ Category C (HIGH_RISK_MUTATION)     │ Cat A/B         │
        ▼                                     │                 │
 ┌──────────────────┐                         │                 │
 │AWAITING_APPROVAL │ (30s Countdown running) │                 │
 └──────┬─────┬─────┘                         │                 │
        │     │ User Cancel / TTL Timeout     │                 │
        │     └─────────────────────────────> ┼──> ┌───────────┐│
        │ User Approved ("Yes" / Click)       │    │ CANCELLED ││
        ▼                                     │    └─────┬─────┘│
   ┌───────────┐                              │          │      │
   │ EXECUTING │ ◄────────────────────────────┘          │      │
   └─────┬─────┘                                         │      │
         │ Node Action Dispatched (Click / Text)         │      │
         ▼                                               │      │
   ┌───────────┐                                         │      │
   │ VERIFYING │ (Post-Execution Hierarchy Inspection)   │      │
   └─────┬─────┘                                         │      │
         ├──────────────────────┐                        │      │
         │ Verified             │ Failed                 │      │
         ▼                      ▼                        │      │
   ┌───────────┐          ┌────────┐                     │      │
   │ COMPLETED │          │ FAILED │                     │      │
   └─────┬─────┘          └───┬────┘                     │      │
         │                    │                          │      │
         └────────────────────┴──────────────────────────┴──────┘`}
          </pre>
        </div>
      </div>
    </div>
  );
};
