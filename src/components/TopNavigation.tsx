/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mic, MicOff, Shield, Cpu, RefreshCw, Lock, Unlock, Sparkles, MessageSquare, Play, Mail, HelpCircle, Maximize2, Smartphone, Volume2, Wand2 } from 'lucide-react';
import { NovaStateType } from '../core/schemas';

interface TopNavigationProps {
  currentState: NovaStateType;
  isListening: boolean;
  onToggleVoice: () => void;
  onResetState: () => void;
  activeTab: 'console' | 'simulator' | 'memory' | 'architecture';
  onSelectTab: (tab: 'console' | 'simulator' | 'memory' | 'architecture') => void;
  onOpenSetup?: () => void;
  onOpenWizard?: () => void;
  onTestAudio?: () => void;
  currentLanguage?: 'en-IN' | 'hi-IN' | 'te-IN';
  assistantName?: string;
  isDeviceLocked: boolean;
  onToggleDeviceLock: () => void;
  onTriggerPreset: (prompt: string) => void;
  isFullscreenMobile?: boolean;
  onToggleFullscreenMobile?: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentState,
  isListening,
  onToggleVoice,
  onResetState,
  activeTab,
  onSelectTab,
  onOpenSetup,
  onOpenWizard,
  onTestAudio,
  currentLanguage = 'en-IN',
  assistantName = 'NOVA',
  isDeviceLocked,
  onToggleDeviceLock,
  onTriggerPreset,
  isFullscreenMobile = false,
  onToggleFullscreenMobile,
}) => {
  return (
    <header className="flex flex-col border-b border-slate-800 bg-[#090D16]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Primary Top Bar */}
      <div className="flex items-center justify-between gap-4 px-6 py-2.5">
        {/* Wordmark & Brand */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-slate-100 flex items-center gap-1.5">
              {assistantName} <span className="text-[10px] font-mono font-normal text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">OS · Voice System</span>
            </span>
          </div>
        </div>

        {/* Views Navigation */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-slate-400">
          <button
            onClick={() => onSelectTab('console')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'console' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Assistant Device Experience
          </button>
          <button
            onClick={() => onSelectTab('memory')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'memory' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Security & Audit Logs
          </button>
          <button
            onClick={() => onSelectTab('architecture')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'architecture' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            System Architecture
          </button>
        </nav>

        {/* Actions Zone: Lock Toggle, Setup & Login, Mic */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Lock / Unlock Toggle Button */}
          <button
            onClick={onToggleDeviceLock}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isDeviceLocked
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
            }`}
            title="Click to Toggle Phone Lock State"
          >
            {isDeviceLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Phone: Locked</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Phone: Unlocked</span>
              </>
            )}
          </button>

          {/* Fullscreen Mobile View Toggle */}
          {onToggleFullscreenMobile && (
            <button
              onClick={onToggleFullscreenMobile}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
              title={isFullscreenMobile ? 'Exit Fullscreen Mobile' : 'Switch to Fullscreen Native Mobile View'}
            >
              {isFullscreenMobile ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Phone Frame</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Fullscreen Mobile</span>
                </>
              )}
            </button>
          )}

          {/* FSM State Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="text-slate-500">STATE:</span>
            <span
              className={`font-semibold ${
                currentState === 'AWAITING_APPROVAL'
                  ? 'text-amber-400'
                  : currentState === 'EXECUTING'
                  ? 'text-indigo-400'
                  : currentState === 'COMPLETED'
                  ? 'text-emerald-400'
                  : 'text-slate-300'
              }`}
            >
              {currentState}
            </span>
          </div>

          {/* Audio Test Button */}
          {onTestAudio && (
            <button
              onClick={onTestAudio}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-medium transition-colors cursor-pointer"
              title="Test Indian Accent Voice Audio"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Voice Test</span>
              <span className="text-[10px] font-mono text-indigo-400">({currentLanguage.split('-')[0].toUpperCase()})</span>
            </button>
          )}

          {/* Full Setup & Voice Calibration Wizard */}
          {onOpenWizard && (
            <button
              onClick={onOpenWizard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              title="Start Full Setup & Voice Enrollment Wizard"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Setup Wizard</span>
            </button>
          )}

          {onOpenSetup && (
            <button
              onClick={onOpenSetup}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors"
              title="User Login & Agent Setup"
            >
              <span>Settings</span>
            </button>
          )}

          <button
            onClick={onResetState}
            title="Reset Coordinator to IDLE"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleVoice}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all shadow-sm whitespace-nowrap shrink-0 ${
              isListening
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
            }`}
          >
            {isListening ? (
              <>
                <Mic className="w-3.5 h-3.5 animate-pulse text-white" />
                <span>Listening</span>
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 text-indigo-200" />
                <span>Mic On</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Secondary Quick-Test Scenario Bar */}
      <div className="flex items-center gap-2 px-6 py-2 bg-slate-950/70 border-t border-slate-900 overflow-x-auto text-[11px]">
        <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Quick Voice Prompts:</span>
        </span>

        {/* Lock Screen Safe 1: Capital of France */}
        <button
          onClick={() => onTriggerPreset('What is the capital of France?')}
          className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-indigo-300 shrink-0 transition-colors flex items-center gap-1"
          title="Executes on Lock Screen without unlocking"
        >
          <Lock className="w-2.5 h-2.5 text-amber-400" />
          <span>"What is the capital of France?"</span>
        </button>

        {/* Lock Screen Safe 2: Weather */}
        <button
          onClick={() => onTriggerPreset("What's the weather today?")}
          className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-indigo-300 shrink-0 transition-colors flex items-center gap-1"
          title="Executes on Lock Screen without unlocking"
        >
          <Lock className="w-2.5 h-2.5 text-amber-400" />
          <span>"What's the weather today?"</span>
        </button>

        {/* Lock Screen Safe 3: Yesterday History */}
        <button
          onClick={() => onTriggerPreset('What did I ask you to do yesterday?')}
          className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-indigo-300 shrink-0 transition-colors flex items-center gap-1"
          title="Executes on Lock Screen without unlocking"
        >
          <Lock className="w-2.5 h-2.5 text-amber-400" />
          <span>"What did I ask you yesterday?"</span>
        </button>

        {/* App Task 1: WhatsApp (Requires Unlock) */}
        <button
          onClick={() => onTriggerPreset('Hey Nova, send a WhatsApp message to Uday saying I am waiting for him')}
          className="px-2.5 py-1 rounded-md bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/40 text-emerald-300 shrink-0 transition-colors flex items-center gap-1"
          title="Verifies voice, auto-unlocks phone, opens WhatsApp & stages message"
        >
          <MessageSquare className="w-2.5 h-2.5 text-emerald-400" />
          <span>"WhatsApp Uday: I am waiting" (Unlocks Phone)</span>
        </button>

        {/* App Task 2: YouTube (Requires Unlock) */}
        <button
          onClick={() => onTriggerPreset('Open YouTube and search for Python DSA tutorials')}
          className="px-2.5 py-1 rounded-md bg-red-950/40 hover:bg-red-900/40 border border-red-800/40 text-red-300 shrink-0 transition-colors flex items-center gap-1"
          title="Verifies voice, auto-unlocks phone, opens YouTube & searches"
        >
          <Play className="w-2.5 h-2.5 text-red-400" />
          <span>"YouTube Python DSA" (Unlocks Phone)</span>
        </button>

        {/* App Task 3: Resume to HR (Requires Unlock) */}
        <button
          onClick={() => onTriggerPreset('Find my latest resume and send it to HR through email')}
          className="px-2.5 py-1 rounded-md bg-blue-950/40 hover:bg-blue-900/40 border border-blue-800/40 text-blue-300 shrink-0 transition-colors flex items-center gap-1"
          title="Verifies voice, auto-unlocks phone, attaches resume & drafts email"
        >
          <Mail className="w-2.5 h-2.5 text-blue-400" />
          <span>"Send Resume to HR" (Unlocks Phone)</span>
        </button>
      </div>
    </header>
  );
};
