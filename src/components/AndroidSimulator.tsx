/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Wifi,
  BatteryMedium,
  Signal,
  Search,
  Send,
  FileText,
  ArrowLeft,
  MoreVertical,
  Paperclip,
  CheckCheck,
  Home,
  RotateCcw,
  Square,
  Sparkles,
  Mic,
  CheckCircle2,
  Clock,
  MessageSquare,
  Check,
  X,
  Bot,
  Volume2,
  User,
  ShieldCheck,
  Key,
  Lock,
  Unlock,
  Settings,
  Flashlight,
  Camera,
  Compass,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { AppState } from '../core/accessibility-bridge';
import { NovaStateType, NovaTask, AuditLogEntry, UserProfile, AgentConfig } from '../core/schemas';

interface AndroidSimulatorProps {
  activeApp: AppState;
  onLaunchPackage: (pkg: string) => void;
  onNodeClick: (nodeId: string) => void;
  onNodeTextChange: (nodeId: string, text: string) => void;
  activeTargetNodeId?: string;
  currentState: NovaStateType;
  activeTask: NovaTask | null;
  transcript: string;
  isListening: boolean;
  onTriggerVoice: () => void;
  auditLogs: AuditLogEntry[];
  onApproveStagedTask?: () => void;
  onCancelStagedTask?: () => void;
  goodbyeMessage?: string;
  userProfile?: UserProfile;
  agentConfig?: AgentConfig;
  onUpdateProfile?: (p: Partial<UserProfile>) => void;
  onUpdateAgentConfig?: (c: Partial<AgentConfig>) => void;
  onEnrollVoiceSample?: (phrase: string) => void;
  isDeviceLocked: boolean;
  onToggleDeviceLock: () => void;
  isUnlockingInProgress?: boolean;
  isFullscreenMobile?: boolean;
  onToggleFullscreenMobile?: () => void;
}

export const AndroidSimulator: React.FC<AndroidSimulatorProps> = ({
  activeApp,
  onLaunchPackage,
  onNodeClick,
  onNodeTextChange,
  activeTargetNodeId,
  currentState,
  activeTask,
  transcript,
  isListening,
  onTriggerVoice,
  auditLogs,
  onApproveStagedTask,
  onCancelStagedTask,
  goodbyeMessage,
  userProfile = {
    userName: 'Venkatesh Malepati',
    userEmail: 'venkateshmalepati078@gmail.com',
    userPin: '2026',
    isLoggedIn: true,
  },
  agentConfig = {
    assistantName: 'NOVA',
    wakePhrase: 'Hey Nova',
    selectedModel: 'gemini-3.8-flash',
    speechRate: 1.05,
    voicePersona: 'Nova Studio (Crisp)',
    permissions: { microphone: true, accessibility: true, overlay: true },
    voiceEnrollment: {
      isEnrolled: true,
      samplesCompleted: 3,
      samplePhrases: [
        'Hey Nova, send a WhatsApp message to Uday',
        'Open YouTube and search for Python DSA tutorials',
        'Find my latest resume and send it to HR',
      ],
    },
  },
  onUpdateProfile,
  onUpdateAgentConfig,
  onEnrollVoiceSample,
  isDeviceLocked,
  onToggleDeviceLock,
  isUnlockingInProgress = false,
  isFullscreenMobile = false,
  onToggleFullscreenMobile,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [novaTab, setNovaTab] = useState<'history' | 'setup'>('history');

  // Local state for setup inputs inside the mobile app
  const [editingName, setEditingName] = useState(userProfile.userName);
  const [editingAssistantName, setEditingAssistantName] = useState(agentConfig.assistantName);
  const [editingWakePhrase, setEditingWakePhrase] = useState(agentConfig.wakePhrase);
  const [editingModel, setEditingModel] = useState(agentConfig.selectedModel);
  const [sampleInput, setSampleInput] = useState('Hey Nova, what is on my schedule today?');

  const isOverlayActive =
    currentState !== 'IDLE' && currentState !== 'FAILED' && currentState !== 'CANCELLED';

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.userUtterance.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.taskTitle.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.targetApp.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className={`flex flex-col items-center select-none relative ${isFullscreenMobile ? 'w-full h-full' : ''}`}>
      {/* Physical Hardware Frame Container (Only shows bezel in desktop preview mode) */}
      <div
        className={`relative flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreenMobile
            ? 'w-full h-[100dvh] max-h-none rounded-none border-0 p-0 bg-slate-950 shadow-none'
            : 'w-[370px] h-[720px] max-h-[calc(100vh-120px)] rounded-[50px] bg-slate-950 p-[10px] shadow-2xl border-4 border-slate-700/80'
        }`}
      >
        {/* Hardware Side Buttons (Hidden in native fullscreen mode) */}
        {!isFullscreenMobile && (
          <>
            {/* Power/Lock Button (Click to toggle lock) */}
            <button
              onClick={onToggleDeviceLock}
              title={isDeviceLocked ? 'Press to Wake/Unlock' : 'Press to Lock Phone'}
              className="absolute -right-[7px] top-28 w-[6px] h-14 bg-slate-600 hover:bg-indigo-400 rounded-r-md transition-colors cursor-pointer z-50"
            />
            {/* Volume Up */}
            <div className="absolute -left-[7px] top-24 w-[6px] h-10 bg-slate-600 rounded-l-md pointer-events-none" />
            {/* Volume Down */}
            <div className="absolute -left-[7px] top-38 w-[6px] h-10 bg-slate-600 rounded-l-md pointer-events-none" />

            {/* Dynamic Island / Punch Hole */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-3 shadow-md border border-slate-900/60">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/90" />
              </div>
              {isOverlayActive ? (
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  <span className="text-[9px] font-mono font-bold text-indigo-300">
                    {agentConfig.assistantName}
                  </span>
                </div>
              ) : isDeviceLocked ? (
                <Lock className="w-2.5 h-2.5 text-amber-400/80" />
              ) : (
                <span className="text-[9px] font-mono text-emerald-400 font-semibold">ONLINE</span>
              )}
            </div>
          </>
        )}

        {/* ===================== VIEWPORT DISPLAY ===================== */}
        <div
          className={`relative flex-1 overflow-hidden flex flex-col bg-slate-900 transition-all duration-300 ${
            isFullscreenMobile ? 'rounded-none' : 'rounded-[40px]'
          } ${isOverlayActive ? 'ring-2 ring-indigo-400/80 siri-edge-glow' : ''}`}
        >
          {/* Apple Siri / Google Gemini Ambient Aurora Border Edge Glow */}
          {isOverlayActive && (
            <div
              className={`absolute inset-0 pointer-events-none z-40 p-[2.5px] aurora-border-anim opacity-90 ${
                isFullscreenMobile ? 'rounded-none' : 'rounded-[40px]'
              }`}
            >
              <div
                className={`w-full h-full border-2 border-indigo-400/60 ${
                  isFullscreenMobile ? 'rounded-none' : 'rounded-[38px]'
                }`}
              />
            </div>
          )}

          {/* Android Status Bar */}
          <div className="w-full h-8 pt-1.5 px-6 flex items-center justify-between text-[11px] font-mono text-slate-300 z-30 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight">09:41</span>
              {isFullscreenMobile && onToggleFullscreenMobile && (
                <button
                  onClick={onToggleFullscreenMobile}
                  className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[9px] text-slate-300 hover:text-white flex items-center gap-1 border border-slate-700 cursor-pointer"
                  title="Return to Device Frame preview"
                >
                  <Minimize2 className="w-2.5 h-2.5" />
                  <span>Exit Fullscreen</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-400 font-medium">5G</span>
              <Wifi className="w-3.5 h-3.5 text-slate-300" />
              <Signal className="w-3.5 h-3.5 text-slate-300" />
              <BatteryMedium className="w-4 h-4 text-slate-300" />
            </div>
          </div>

          {/* ==================== SCREEN CONTENT ==================== */}
          <div className="flex-1 relative flex flex-col overflow-hidden">
            {/* VIEW A: LOCK SCREEN */}
            {isDeviceLocked ? (
              <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-950 relative overflow-hidden select-none">
                {/* Wallpaper ambient glow */}
                <div className="absolute -top-16 -left-16 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 right-0 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

                {/* Top Lock Indicator */}
                <div className="flex flex-col items-center pt-3 z-10">
                  <button
                    onClick={onToggleDeviceLock}
                    className="p-2 rounded-full bg-slate-900/60 border border-slate-700/60 backdrop-blur-md text-amber-400 hover:text-amber-300 hover:scale-110 transition-all flex items-center gap-1.5 px-3 shadow-lg"
                    title="Tap to Unlock"
                  >
                    {isUnlockingInProgress ? (
                      <>
                        <Unlock className="w-4 h-4 text-emerald-400 animate-bounce" />
                        <span className="text-[10px] font-mono text-emerald-300 font-semibold">
                          UNLOCKED VIA VOICE
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-mono text-slate-300">Locked · Tap to Open</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Lock Screen Time & Date */}
                <div className="flex flex-col items-center my-auto z-10">
                  <span className="text-6xl font-extralight tracking-tight text-white font-mono drop-shadow-md">
                    09:41
                  </span>
                  <span className="text-sm font-medium text-indigo-200/90 mt-1.5">
                    Tuesday, November 3
                  </span>
                  <span className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <span>21°C</span>
                    <span>·</span>
                    <span>Sunny Cupertino</span>
                  </span>

                  {/* Lock Screen Context Notice */}
                  <div className="mt-6 px-3.5 py-1.5 rounded-full bg-slate-900/70 border border-indigo-500/30 backdrop-blur-md flex items-center gap-2 text-[11px] text-indigo-300 shadow-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Voice Biometrics Active on Lock Screen</span>
                  </div>
                </div>

                {/* Bottom Lock Screen Actions */}
                <div className="flex items-center justify-between z-10 pt-4">
                  <div className="w-10 h-10 rounded-full bg-slate-900/70 border border-slate-800 backdrop-blur-md flex items-center justify-center text-slate-400 shadow-md">
                    <Flashlight className="w-4 h-4" />
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                    Say "{agentConfig.wakePhrase}"
                  </span>

                  <div className="w-10 h-10 rounded-full bg-slate-900/70 border border-slate-800 backdrop-blur-md flex items-center justify-center text-slate-400 shadow-md">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ) : (
              /* VIEW B: UNLOCKED ANDROID SYSTEM */
              <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* 1. ANDROID HOME SCREEN LAUNCHER */}
                {activeApp.packageName === 'com.android.launcher' && (
                  <div className="flex-1 flex flex-col justify-between p-5 bg-gradient-to-b from-indigo-950/70 via-slate-950 to-slate-950 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Clock Widget */}
                    <div className="pt-4 pb-2 flex flex-col items-center">
                      <span className="text-5xl font-extralight tracking-tight text-white font-mono">
                        09:41
                      </span>
                      <span className="text-xs text-indigo-300/80 mt-1">
                        Tuesday, November 3 · 21°C Sunny
                      </span>
                    </div>

                    {/* Google Search Bar Widget */}
                    <div className="w-full px-4 py-2.5 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Search className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">Say "{agentConfig.wakePhrase}"</span>
                      </div>
                      <button
                        onClick={onTriggerVoice}
                        className="w-6 h-6 rounded-full bg-indigo-500/20 hover:bg-indigo-500/40 flex items-center justify-center text-indigo-400 transition-colors"
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* App Icons Grid */}
                    <div className="grid grid-cols-4 gap-4 py-4">
                      {/* NOVA OS App */}
                      <button
                        onClick={() => onLaunchPackage('com.nova.assistant')}
                        className="flex flex-col items-center gap-1.5 group cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                          <Bot className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] text-slate-200 font-medium">
                          {agentConfig.assistantName} OS
                        </span>
                      </button>

                      {/* WhatsApp */}
                      <button
                        onClick={() => onLaunchPackage('com.whatsapp')}
                        className="flex flex-col items-center gap-1.5 group cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                          <MessageSquare className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] text-slate-200 font-medium">WhatsApp</span>
                      </button>

                      {/* YouTube */}
                      <button
                        onClick={() => onLaunchPackage('com.google.android.youtube')}
                        className="flex flex-col items-center gap-1.5 group cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30 group-hover:scale-105 transition-transform">
                          <span className="font-bold text-sm tracking-tighter">▶</span>
                        </div>
                        <span className="text-[10px] text-slate-200 font-medium">YouTube</span>
                      </button>

                      {/* Gmail */}
                      <button
                        onClick={() => onLaunchPackage('com.google.android.gm')}
                        className="flex flex-col items-center gap-1.5 group cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 group-hover:scale-105 transition-transform">
                          <span className="font-bold text-sm">M</span>
                        </div>
                        <span className="text-[10px] text-slate-200 font-medium">Gmail</span>
                      </button>

                      {/* Files */}
                      <button
                        onClick={() => onLaunchPackage('com.android.documentsui')}
                        className="flex flex-col items-center gap-1.5 group cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                          <FileText className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] text-slate-200 font-medium">Files</span>
                      </button>

                      {/* Lock Device shortcut */}
                      <button
                        onClick={onToggleDeviceLock}
                        className="flex flex-col items-center gap-1.5 group cursor-pointer"
                        title="Lock Phone"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                          <Lock className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Lock</span>
                      </button>
                    </div>

                    {/* Home Screen Dock */}
                    <div className="p-2.5 bg-slate-900/60 rounded-3xl border border-slate-800/80 backdrop-blur-md flex items-center justify-around">
                      <button
                        onClick={() => onLaunchPackage('com.nova.assistant')}
                        className="p-1.5 text-indigo-400 hover:text-white"
                        title="NOVA History & Setup"
                      >
                        <Bot className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onLaunchPackage('com.whatsapp')}
                        className="p-1.5 text-emerald-400 hover:text-white"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onLaunchPackage('com.google.android.youtube')}
                        className="p-1.5 text-red-400 hover:text-white"
                      >
                        <span className="text-lg leading-none">▶</span>
                      </button>
                      <button
                        onClick={() => onLaunchPackage('com.google.android.gm')}
                        className="p-1.5 text-rose-400 hover:text-white"
                      >
                        <span className="font-bold text-xs">M</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. NOVA OS INTERNAL APP (HISTORY & SETUP) */}
                {activeApp.packageName === 'com.nova.assistant' && (
                  <div className="flex-1 flex flex-col bg-[#0B0F19] text-slate-100 overflow-hidden">
                    <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowLeft
                          onClick={() => onLaunchPackage('com.android.launcher')}
                          className="w-4 h-4 text-slate-400 cursor-pointer hover:text-white"
                        />
                        <div className="flex items-center gap-1.5">
                          <Bot className="w-4 h-4 text-indigo-400" />
                          <h4 className="text-xs font-bold text-slate-100">
                            {agentConfig.assistantName} OS
                          </h4>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                        {agentConfig.selectedModel}
                      </span>
                    </div>

                    {/* Inner Tabs */}
                    <div className="flex border-b border-slate-800 text-[11px] font-medium bg-slate-950/60">
                      <button
                        onClick={() => setNovaTab('history')}
                        className={`flex-1 py-2 text-center transition-colors ${
                          novaTab === 'history'
                            ? 'text-indigo-400 border-b-2 border-indigo-500 font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Task History & Audit ({auditLogs.length})
                      </button>
                      <button
                        onClick={() => setNovaTab('setup')}
                        className={`flex-1 py-2 text-center transition-colors ${
                          novaTab === 'setup'
                            ? 'text-indigo-400 border-b-2 border-indigo-500 font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Agent Setup & Login
                      </button>
                    </div>

                    {/* Tab 1 Content: History & What NOVA Worked On */}
                    {novaTab === 'history' && (
                      <div className="flex-1 flex flex-col p-3 overflow-hidden">
                        <div className="relative mb-2.5">
                          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                            placeholder="Filter voice tasks or apps..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-slate-200 focus:outline-none"
                          />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                          {filteredLogs.length === 0 ? (
                            <div className="p-6 text-center text-slate-500 text-xs">
                              <Bot className="w-8 h-8 mx-auto mb-2 opacity-30" />
                              <p>No voice tasks executed yet.</p>
                              <p className="text-[10px] mt-1 text-slate-600">
                                Call "{agentConfig.wakePhrase}" to execute your first task!
                              </p>
                            </div>
                          ) : (
                            filteredLogs.map((log) => (
                              <div
                                key={log.id}
                                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-1.5 shadow-sm"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-slate-200">
                                    {log.taskTitle}
                                  </span>
                                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                    {log.status}
                                  </span>
                                </div>
                                <div className="text-slate-400 italic">
                                  "{log.userUtterance}"
                                </div>
                                {log.responseMessage && (
                                  <div className="text-[10px] text-indigo-300 bg-indigo-500/10 p-1.5 rounded-lg border border-indigo-500/20">
                                    <span className="font-semibold">{agentConfig.assistantName}:</span>{' '}
                                    {log.responseMessage}
                                  </div>
                                )}
                                <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1 border-t border-slate-800/80">
                                  <span>{log.targetApp}</span>
                                  <span>{log.durationMs}ms</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tab 2 Content: Agent Setup & Login */}
                    {novaTab === 'setup' && (
                      <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400">Owner Name</label>
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={() => onUpdateProfile && onUpdateProfile({ userName: editingName })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400">
                              Assistant Name
                            </label>
                            <input
                              type="text"
                              value={editingAssistantName}
                              onChange={(e) => setEditingAssistantName(e.target.value)}
                              onBlur={() =>
                                onUpdateAgentConfig &&
                                onUpdateAgentConfig({ assistantName: editingAssistantName })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:outline-none font-semibold text-indigo-300"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400">Wake Phrase</label>
                            <input
                              type="text"
                              value={editingWakePhrase}
                              onChange={(e) => setEditingWakePhrase(e.target.value)}
                              onBlur={() =>
                                onUpdateAgentConfig &&
                                onUpdateAgentConfig({ wakePhrase: editingWakePhrase })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400">Gemini Model</label>
                          <select
                            value={editingModel}
                            onChange={(e) => {
                              setEditingModel(e.target.value);
                              if (onUpdateAgentConfig)
                                onUpdateAgentConfig({ selectedModel: e.target.value });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:outline-none font-mono"
                          >
                            <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended)</option>
                            <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400">Indian Language & Voice</label>
                          <select
                            value={agentConfig.language || 'en-IN'}
                            onChange={(e) => {
                              if (onUpdateAgentConfig) {
                                onUpdateAgentConfig({ language: e.target.value as any });
                              }
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:outline-none"
                          >
                            <option value="en-IN">🇮🇳 English (India - Natural Accent)</option>
                            <option value="hi-IN">🇮🇳 Hindi (हिन्दी - Conversational)</option>
                            <option value="te-IN">🇮🇳 Telugu (తెలుగు - Regional)</option>
                          </select>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-200">
                              Voice Biometrics ({agentConfig.voiceEnrollment.samplesCompleted}/3 Calibrated)
                            </span>
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Calibrated to {userProfile.userName}. Speaker verification active for safe
                            lock-screen execution.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. WHATSAPP */}
                {activeApp.packageName === 'com.whatsapp' && (
                  <div className="flex-1 flex flex-col bg-[#0B141B] text-slate-200">
                    <div className="p-2.5 bg-[#1F2C34] flex items-center justify-between border-b border-[#2A3942]">
                      <div className="flex items-center gap-2">
                        <ArrowLeft
                          onClick={() => onLaunchPackage('com.android.launcher')}
                          className="w-4 h-4 text-slate-400 cursor-pointer"
                        />
                        <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-semibold text-white">
                          U
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-100">
                            {activeApp.data.activeChatWith || 'Uday'}
                          </span>
                          <span className="text-[9px] text-emerald-400">online</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                      <div className="flex justify-start">
                        <div className="p-2 rounded-xl bg-[#202C33] text-xs max-w-[80%] rounded-tl-none text-slate-300">
                          Hey, are you coming to the office today?
                        </div>
                      </div>
                      {activeApp.data.messages?.map((msg: any) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`p-2 rounded-xl text-xs max-w-[80%] ${
                              msg.isMe
                                ? 'bg-[#005C4B] text-slate-100 rounded-tr-none'
                                : 'bg-[#202C33] text-slate-300 rounded-tl-none'
                            }`}
                          >
                            <p>{msg.text}</p>
                            <span className="text-[9px] text-slate-400 block text-right mt-0.5">
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* WhatsApp Input Bar */}
                    <div className="p-2 bg-[#1F2C34] flex items-center gap-2 border-t border-[#2A3942]">
                      <input
                        type="text"
                        value={activeApp.data.draftMessage || ''}
                        onChange={(e) =>
                          onNodeTextChange('com.whatsapp:id/entry', e.target.value)
                        }
                        placeholder="Type a message"
                        className="flex-1 bg-[#2A3942] rounded-full px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                      />
                      <button
                        onClick={() => onNodeClick('com.whatsapp:id/send')}
                        className="w-8 h-8 rounded-full bg-[#00A884] flex items-center justify-center text-white cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. YOUTUBE */}
                {activeApp.packageName === 'com.google.android.youtube' && (
                  <div className="flex-1 flex flex-col bg-[#0F0F0F] text-slate-100">
                    <div className="p-2 bg-[#212121] flex items-center gap-2">
                      <ArrowLeft
                        onClick={() => onLaunchPackage('com.android.launcher')}
                        className="w-4 h-4 text-slate-400 cursor-pointer"
                      />
                      <div className="flex-1 flex items-center bg-[#121212] rounded-full px-3 py-1 border border-slate-700">
                        <input
                          type="text"
                          value={activeApp.data.searchQuery || ''}
                          onChange={(e) =>
                            onNodeTextChange(
                              'com.google.android.youtube:id/search_box',
                              e.target.value
                            )
                          }
                          placeholder="Search YouTube"
                          className="flex-1 bg-transparent text-xs text-slate-100 focus:outline-none"
                        />
                        <Search
                          onClick={() =>
                            onNodeClick('com.google.android.youtube:id/search_btn')
                          }
                          className="w-3.5 h-3.5 text-slate-400 cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                      <div className="space-y-1.5">
                        <div className="w-full h-28 rounded-xl bg-slate-800 flex items-center justify-center text-red-500">
                          <span className="text-3xl">▶</span>
                        </div>
                        <h5 className="text-xs font-semibold text-slate-200">
                          Python DSA Complete Course 2026 - Master Data Structures
                        </h5>
                        <p className="text-[10px] text-slate-400">
                          Tech Academy · 480K views · 2 days ago
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. GMAIL */}
                {activeApp.packageName === 'com.google.android.gm' && (
                  <div className="flex-1 flex flex-col bg-[#1A1A1A] text-slate-100">
                    <div className="p-2.5 bg-[#262626] flex items-center justify-between border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <ArrowLeft
                          onClick={() => onLaunchPackage('com.android.launcher')}
                          className="w-4 h-4 text-slate-400 cursor-pointer"
                        />
                        <h4 className="text-xs font-medium text-slate-200">Compose</h4>
                      </div>
                      <button
                        onClick={() => onNodeClick('com.google.android.gm:id/send_button')}
                        className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send</span>
                      </button>
                    </div>
                    <div className="p-3 space-y-2 text-xs flex-1 flex flex-col">
                      <div className="flex items-center gap-2 border-b border-slate-800 py-1">
                        <span className="text-slate-500 w-12">To:</span>
                        <input
                          type="text"
                          value={activeApp.data.to || ''}
                          onChange={(e) =>
                            onNodeTextChange('com.google.android.gm:id/to_field', e.target.value)
                          }
                          placeholder="recruiting@company.com"
                          className="flex-1 bg-transparent text-slate-100 focus:outline-none font-mono text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2 border-b border-slate-800 py-1">
                        <span className="text-slate-500 w-12">Subject:</span>
                        <input
                          type="text"
                          value={activeApp.data.subject || ''}
                          onChange={(e) =>
                            onNodeTextChange(
                              'com.google.android.gm:id/subject_field',
                              e.target.value
                            )
                          }
                          placeholder="Application - Senior AI Architect"
                          className="flex-1 bg-transparent text-slate-100 focus:outline-none text-xs"
                        />
                      </div>
                      <div className="p-2 rounded bg-slate-800/60 border border-slate-700 flex items-center gap-2 text-[10px] text-slate-300">
                        <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Resume_2026_Senior_AI_Architect.pdf (240 KB)</span>
                      </div>
                      <textarea
                        value={activeApp.data.body || ''}
                        onChange={(e) =>
                          onNodeTextChange('com.google.android.gm:id/body_field', e.target.value)
                        }
                        placeholder="Draft message body..."
                        className="flex-1 bg-transparent text-slate-100 focus:outline-none resize-none pt-2 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* 6. FILES */}
                {activeApp.packageName === 'com.android.documentsui' && (
                  <div className="flex-1 flex flex-col bg-[#141414] text-slate-200">
                    <div className="p-3 bg-[#1F1F1F] border-b border-slate-800 flex items-center gap-2">
                      <ArrowLeft
                        onClick={() => onLaunchPackage('com.android.launcher')}
                        className="w-4 h-4 text-slate-400 cursor-pointer"
                      />
                      <h4 className="text-xs font-semibold text-slate-200">Recent Documents</h4>
                    </div>
                    <div className="p-3 space-y-2 flex-1">
                      {activeApp.data.files?.map((file: any, idx: number) => (
                        <div
                          key={idx}
                          onClick={() => onNodeClick(`com.android.documentsui:id/file_${idx}`)}
                          className="p-2.5 rounded-lg bg-[#222222] hover:bg-[#2B2B2B] border border-slate-800 flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-indigo-400" />
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-slate-200">
                                {file.name}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {file.size} · {file.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================== APPLE SIRI / GOOGLE ASSISTANT FLOATING OVERLAY ==================== */}
            {isOverlayActive ? (
              <div className="absolute inset-x-3 bottom-14 z-50 rounded-2xl bg-slate-950/95 border border-indigo-500/50 p-3.5 shadow-2xl backdrop-blur-xl flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
                {/* Assistant Title & State */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
                    <span className="text-xs font-bold text-indigo-300">
                      {agentConfig.assistantName} · {currentState}
                    </span>
                  </div>
                  {isDeviceLocked && (
                    <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Lock Screen</span>
                    </span>
                  )}
                </div>

                {/* User Prompt */}
                {transcript && (
                  <div className="text-xs text-slate-200 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block font-mono">You:</span>
                    "{transcript}"
                  </div>
                )}

                {/* Lock Screen Safe Answer (e.g. Capital of France / Weather / Math) */}
                {activeTask?.answer && (
                  <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-[10px]">
                      <Sparkles className="w-3 h-3" />
                      <span>Voice Authorized Response</span>
                    </div>
                    <p className="font-medium text-white">{activeTask.answer}</p>
                  </div>
                )}

                {/* Staged Summary for App Tasks */}
                {activeTask?.stagedSummary && !activeTask?.answer && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="line-clamp-2">{activeTask.stagedSummary}</span>
                  </div>
                )}

                {/* Human-In-The-Loop Approval (Category C Sensitive Action) */}
                {currentState === 'AWAITING_APPROVAL' && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-amber-300">Authorize execution?</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={onCancelStagedTask}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={onApproveStagedTask}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm"
                      >
                        Yes, Execute
                      </button>
                    </div>
                  </div>
                )}

                {/* Completed / Goodbye Card */}
                {currentState === 'COMPLETED' && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{goodbyeMessage || 'Task completed. Bye!'}</span>
                  </div>
                )}

                {/* Fluid Soundwave at base of Assistant Capsule */}
                <div className="flex items-center justify-center gap-1 pt-1">
                  <div className="w-1 h-3 bg-indigo-400 rounded-full animate-pulse" />
                  <div className="w-1 h-5 bg-cyan-400 rounded-full animate-pulse delay-75" />
                  <div className="w-1 h-4 bg-pink-400 rounded-full animate-pulse delay-150" />
                  <div className="w-1 h-6 bg-indigo-400 rounded-full animate-pulse delay-100" />
                  <div className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse delay-200" />
                </div>
              </div>
            ) : (
              /* RESTING STATE: Compact Floating Assistant Orb on screen */
              <div className="absolute bottom-14 right-4 z-40 pointer-events-auto">
                <button
                  onClick={onTriggerVoice}
                  title={`${agentConfig.assistantName} Assistant (Tap to Speak)`}
                  className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-all flex items-center justify-center group cursor-pointer"
                >
                  <div className="w-full h-full rounded-full bg-[#090D16] flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform animate-pulse" />
                    <Mic className="w-4 h-4 text-indigo-300 absolute" />
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Android Bottom Navigation Bar (Back, Home, Recents) */}
          <div className="w-full h-10 flex items-center justify-around px-8 z-30 shrink-0 text-slate-500 bg-slate-950/80 border-t border-slate-800/60">
            <button
              onClick={() => {
                if (!isDeviceLocked) onLaunchPackage('com.android.launcher');
              }}
              className="p-1.5 hover:text-slate-300 transition-colors"
              title="Back"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (!isDeviceLocked) onLaunchPackage('com.android.launcher');
              }}
              className="p-1.5 hover:text-slate-300 transition-colors"
              title="Home Screen"
            >
              <div className="w-3 h-3 rounded-full border-2 border-current" />
            </button>
            <button
              onClick={() => {
                if (!isDeviceLocked) onLaunchPackage('com.nova.assistant');
              }}
              className="p-1.5 hover:text-indigo-400 transition-colors"
              title="Assistant History & Setup"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
