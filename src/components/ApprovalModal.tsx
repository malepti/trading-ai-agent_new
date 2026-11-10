/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock, Check, X, Edit3, Lock, Volume2 } from 'lucide-react';
import { NovaTask } from '../core/schemas';

interface ApprovalModalProps {
  task: NovaTask;
  payloadHash: string;
  expiresAt: number;
  onApprove: (task: NovaTask, token: string) => void;
  onReject: () => void;
  onEdit: (updatedTask: NovaTask) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  task,
  payloadHash,
  expiresAt,
  onApprove,
  onReject,
  onEdit,
}) => {
  const [timeLeftMs, setTimeLeftMs] = useState(expiresAt - Date.now());
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(task.entities.message || '');

  // 30-second TTL Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        clearInterval(timer);
        setTimeLeftMs(0);
        onReject(); // Auto-cancel on timeout per security rules
      } else {
        setTimeLeftMs(remaining);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [expiresAt, onReject]);

  const progressPercent = Math.max(0, Math.min(100, (timeLeftMs / 30000) * 100));

  const handleSaveEdit = () => {
    const updated: NovaTask = {
      ...task,
      entities: {
        ...task.entities,
        message: editedMessage,
      },
      stagedSummary: `Send WhatsApp message to ${task.entities.contact || 'contact'}: "${editedMessage}"`,
      steps: task.steps.map((s) => (s.actionType === 'SET_TEXT' ? { ...s, payload: editedMessage } : s)),
    };
    setIsEditing(false);
    onEdit(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#0F172A] border border-amber-500/40 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Top Warning Strip */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-amber-300 tracking-wide uppercase">
              Human-in-the-Loop Authorization Required
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
            <Clock className="w-4 h-4" />
            <span>{(timeLeftMs / 1000).toFixed(1)}s TTL</span>
          </div>
        </div>

        {/* TTL Progress Bar */}
        <div className="w-full h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Audio Spoken Prompt Visualizer */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
              <Volume2 className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Assistant Spoken Question:</span>
              <p className="text-sm font-medium text-slate-100 mt-0.5">
                "{task.stagedSummary}"
              </p>
            </div>
          </div>

          {/* Action Details Card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Operation Intent</span>
              <span className="font-mono text-amber-400 font-semibold">{task.intent} (Category C)</span>
            </div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Target Application</span>
              <span className="font-mono text-slate-200">{task.targetApp}</span>
            </div>
            {task.entities.contact && (
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="text-slate-400">Recipient / Contact</span>
                <span className="font-semibold text-slate-100">{task.entities.contact}</span>
              </div>
            )}

            {/* Message Body or Payload */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Staged Content Payload</span>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Draft</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2 mt-1">
                  <textarea
                    value={editedMessage}
                    onChange={(e) => setEditedMessage(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-indigo-500 text-xs text-slate-100 focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      Cancel Edit
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-2.5 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-500 font-medium"
                    >
                      Update & Recalculate Hash
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono">
                  "{task.entities.message || task.stagedSummary}"
                </div>
              )}
            </div>
          </div>

          {/* Cryptographic SHA-256 Action-Binding Fingerprint */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] font-mono text-slate-400">SHA-256 Action Token:</span>
            </div>
            <span className="text-[11px] font-mono text-indigo-300 font-semibold truncate max-w-[240px]">
              {payloadHash.substring(0, 24)}...
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Security Guarantee: This authorization is cryptographically bound to this exact payload. Any mutation to recipient or text invalidates prior approval immediately.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <button
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span>Cancel / Deny</span>
          </button>

          <button
            onClick={() => onApprove(task, payloadHash)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Approve & Execute (Yes)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
