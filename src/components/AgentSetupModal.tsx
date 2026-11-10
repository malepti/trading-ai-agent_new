/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  User,
  Bot,
  Key,
  ShieldCheck,
  Mic,
  Cpu,
  Layers,
  CheckCircle2,
  Lock,
  Unlock,
  Sparkles,
} from 'lucide-react';
import { UserProfile, AgentConfig } from '../core/schemas';

interface AgentSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  agentConfig: AgentConfig;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onUpdateAgentConfig: (config: Partial<AgentConfig>) => void;
  onEnrollVoiceSample: (sampleText: string) => void;
}

export const AgentSetupModal: React.FC<AgentSetupModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  agentConfig,
  onUpdateProfile,
  onUpdateAgentConfig,
  onEnrollVoiceSample,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'profile' | 'agent' | 'enrollment' | 'permissions'>('agent');
  const [nameInput, setNameInput] = useState(userProfile.userName);
  const [emailInput, setEmailInput] = useState(userProfile.userEmail);
  const [pinInput, setPinInput] = useState(userProfile.userPin);
  const [isLocked, setIsLocked] = useState(!userProfile.isLoggedIn);

  const [assistantNameInput, setAssistantNameInput] = useState(agentConfig.assistantName);
  const [wakePhraseInput, setWakePhraseInput] = useState(agentConfig.wakePhrase);
  const [modelSelect, setModelSelect] = useState(agentConfig.selectedModel);
  const [speechRate, setSpeechRate] = useState(agentConfig.speechRate);
  const [languageInput, setLanguageInput] = useState<'en-IN' | 'hi-IN' | 'te-IN'>(agentConfig.language || 'en-IN');

  const [enrollmentPhrase, setEnrollmentPhrase] = useState(
    'Hey Nova, check my schedule for tomorrow'
  );

  const handleSaveProfile = () => {
    onUpdateProfile({
      userName: nameInput,
      userEmail: emailInput,
      userPin: pinInput,
      isLoggedIn: !isLocked,
    });
  };

  const handleSaveAgent = () => {
    onUpdateAgentConfig({
      assistantName: assistantNameInput,
      wakePhrase: wakePhraseInput,
      selectedModel: modelSelect,
      speechRate: Number(speechRate),
      language: languageInput,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">User Login & Agent Setup</h3>
              <p className="text-[11px] text-slate-400">Configure owner profile, assistant identity, and permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('agent')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'agent'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Agent Identity & Model</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Owner Login & PIN</span>
          </button>
          <button
            onClick={() => setActiveTab('enrollment')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'enrollment'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Enrollment</span>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'permissions'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Permissions</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[520px] overflow-y-auto">
          {/* TAB 1: AGENT IDENTITY & SETUP */}
          {activeTab === 'agent' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Assistant Name</label>
                <input
                  type="text"
                  value={assistantNameInput}
                  onChange={(e) => setAssistantNameInput(e.target.value)}
                  placeholder="e.g. NOVA, Jarvis, Friday"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  The name the assistant responds to and uses when addressing you.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Custom Wake Phrase</label>
                <input
                  type="text"
                  value={wakePhraseInput}
                  onChange={(e) => setWakePhraseInput(e.target.value)}
                  placeholder="e.g. Hey Nova, OK Nova"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Spoken acoustic trigger phrase monitored continuously by the sensory engine.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Cognitive Reasoning Model</label>
                <select
                  value={modelSelect}
                  onChange={(e) => setModelSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended · Low-Latency Voice Reasoning)</option>
                  <option value="gemini-4-argon">gemini-4-argon (Complex Multi-Step Architecture)</option>
                  <option value="local-ollama">local-ollama (Offline Local LLM Engine)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Enforces strict schema JSON output with automated fallback.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Indian Language & Accent</label>
                <select
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="en-IN">🇮🇳 English (India - Natural Indian Accent)</option>
                  <option value="hi-IN">🇮🇳 Hindi (हिन्दी - Conversational)</option>
                  <option value="te-IN">🇮🇳 Telugu (తెలుగు - Regional Tone)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Speech Rate: {speechRate}x</label>
                <input
                  type="range"
                  min="0.8"
                  max="1.4"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveAgent}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-colors"
                >
                  Save Agent Setup
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: USER PROFILE & LOGIN */}
          {activeTab === 'profile' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold text-sm">
                    {nameInput.charAt(0) || 'U'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-100 block">{nameInput}</span>
                    <span className="text-[11px] text-slate-400">{emailInput}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                      !isLocked
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {!isLocked ? 'AUTHENTICATED' : 'LOCKED'}
                  </span>
                  <button
                    onClick={() => setIsLocked(!isLocked)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                  >
                    {!isLocked ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-rose-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Owner Full Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Owner Email Address</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Device Owner PIN (Security Override)</label>
                <input
                  type="password"
                  value={pinInput}
                  maxLength={6}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="4-6 digit security PIN"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono tracking-widest"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Required when speaker verification confidence is below threshold or during high-risk credential changes.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-colors"
                >
                  Save Profile & Login Info
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: VOICE BIOMETRIC ENROLLMENT */}
          {activeTab === 'enrollment' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-200">ECAPA-TDNN Speaker Model</h4>
                  <p className="text-[11px] text-slate-400">Enrolled samples: {agentConfig.voiceEnrollment.samplesCompleted} of 3</p>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono text-[11px]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CALIBRATED (94%)</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Enroll Voice Sample Phrase</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={enrollmentPhrase}
                    onChange={(e) => setEnrollmentPhrase(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => {
                      onEnrollVoiceSample(enrollmentPhrase);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Record Sample</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider block">Completed Sample Calibrations:</span>
                {agentConfig.voiceEnrollment.samplePhrases.map((phrase, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between font-mono text-[11px]"
                  >
                    <span className="text-slate-300">Sample {i + 1}: "{phrase}"</span>
                    <span className="text-emerald-400">VERIFIED</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PERMISSIONS */}
          {activeTab === 'permissions' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-200">Microphone Access</h4>
                  <p className="text-[11px] text-slate-500">Continuous wake-word detection & audio stream processing</p>
                </div>
                <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  GRANTED
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-200">Accessibility Service Bridge</h4>
                  <p className="text-[11px] text-slate-500">Read UI hierarchy, click permitted buttons, enter text into drafts</p>
                </div>
                <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ENABLED (NOVA BIND)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-200">Display Over Other Apps (Overlay)</h4>
                  <p className="text-[11px] text-slate-500">Renders the small floating assistant icon & active voice pill</p>
                </div>
                <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  GRANTED
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
