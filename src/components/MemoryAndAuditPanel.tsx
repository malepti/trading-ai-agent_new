/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { History, Database, UserCheck, Trash2, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { AuditLogEntry } from '../core/schemas';
import { ContactAlias } from '../core/memory-vault';

interface MemoryAndAuditPanelProps {
  auditLogs: AuditLogEntry[];
  aliases: ContactAlias[];
  recentTurns: Array<{ role: 'user' | 'assistant'; text: string; timestamp: number }>;
  onClearLogs: () => void;
}

export const MemoryAndAuditPanel: React.FC<MemoryAndAuditPanelProps> = ({
  auditLogs,
  aliases,
  recentTurns,
  onClearLogs,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Audit Trail Table */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200">Execution Audit Trail & Immutable Log</h3>
          </div>
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-2 font-normal">TIMESTAMP</th>
                <th className="pb-2 font-normal">INTENT</th>
                <th className="pb-2 font-normal">TARGET APP</th>
                <th className="pb-2 font-normal">RISK CATEGORY</th>
                <th className="pb-2 font-normal">AUTH METHOD</th>
                <th className="pb-2 font-normal">DURATION</th>
                <th className="pb-2 font-normal text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 font-medium text-slate-200">{log.intent}</td>
                  <td className="py-2.5 text-slate-400">{log.targetApp}</td>
                  <td className="py-2.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-sans font-semibold ${
                        log.riskLevel === 'HIGH_RISK_MUTATION'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : log.riskLevel === 'LOW_RISK_MUTATION'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {log.riskLevel.replace('_MUTATION', '')}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-400 text-[11px]">{log.approvalMethod}</td>
                  <td className="py-2.5 text-slate-400">{log.durationMs}ms</td>
                  <td className="py-2.5 text-right">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        log.status === 'COMPLETED' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {log.status === 'COMPLETED' ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                      <span>{log.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Short-Term & Long-Term Memory Viewports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Short-Term Memory: Pronoun & Session Context */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Short-Term Context & Pronoun References
            </h4>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>"him" / "he"</span>
                <span className="text-indigo-400 font-bold">→ Uday Kiran</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>"it" / "the document"</span>
                <span className="text-indigo-400 font-bold">→ Resume_2026_Senior_AI_Architect.pdf</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>"her"</span>
                <span className="text-indigo-400 font-bold">→ Sarah</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Pronouns are dynamically resolved using recent conversation turns before agent task planning.
            </p>
          </div>
        </div>

        {/* Long-Term Memory: User Contact Aliases */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Long-Term Approved Aliases & Integrations
            </h4>
          </div>
          <div className="space-y-2 text-xs">
            {aliases.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200">"{item.alias}"</span>
                  <span className="text-[11px] text-slate-500">{item.fullName} · {item.destination}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {item.app}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
