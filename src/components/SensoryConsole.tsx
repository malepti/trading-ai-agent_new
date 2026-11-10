/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { Mic, Activity, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { NovaStateType, StateTransitionEvent, SpeakerProfile } from '../core/schemas';

interface SensoryConsoleProps {
  currentState: NovaStateType;
  waveform: number[];
  rms: number;
  isSpeaking: boolean;
  transcript: string;
  isListening: boolean;
  speakerProfile: SpeakerProfile;
  speakerScore: { verified: boolean; confidence: number };
  transitionHistory: StateTransitionEvent[];
  onSubmitPrompt: (text: string) => void;
  onEnrollSample: () => void;
}

export const SensoryConsole: React.FC<SensoryConsoleProps> = ({
  currentState,
  waveform,
  rms,
  isSpeaking,
  transcript,
  isListening,
  speakerProfile,
  speakerScore,
  transitionHistory,
  onSubmitPrompt,
  onEnrollSample,
}) => {
  const [inputText, setInputText] = React.useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw audio waveform on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const bars = waveform.length > 0 ? waveform : new Array(32).fill(0.08);
    const barWidth = width / bars.length;

    bars.forEach((val, i) => {
      const barHeight = Math.max(4, val * height * 0.9);
      const x = i * barWidth;
      const y = height / 2 - barHeight / 2;

      // Color gradation based on active state
      if (currentState === 'LISTENING') {
        ctx.fillStyle = `rgba(16, 185, 129, ${Math.max(0.3, val + 0.2)})`;
      } else if (currentState === 'AUTHENTICATING' || currentState === 'PLANNING') {
        ctx.fillStyle = `rgba(99, 102, 241, ${Math.max(0.3, val + 0.2)})`;
      } else if (currentState === 'AWAITING_APPROVAL') {
        ctx.fillStyle = `rgba(245, 158, 11, ${Math.max(0.3, val + 0.2)})`;
      } else {
        ctx.fillStyle = `rgba(148, 163, 184, 0.2)`;
      }

      ctx.fillRect(x + 1, y, Math.max(2, barWidth - 2), barHeight);
    });
  }, [waveform, currentState]);

  const handleQuickCommand = (cmd: string) => {
    setInputText(cmd);
    onSubmitPrompt(cmd);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Sensory Waveform & VAD Card */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">Layer 1: On-Device Sensory Spectrum</h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>RMS: {(rms * 100).toFixed(1)}%</span>
            <span>·</span>
            <span>VAD: {isSpeaking ? 'VOICE_ACTIVE' : 'SILENCE'}</span>
            <span>·</span>
            <span className="text-emerald-400 font-semibold">"Hey Nova" ARMED</span>
          </div>
        </div>

        {/* Audio Visualizer Canvas */}
        <div className="w-full h-20 bg-slate-950 rounded-lg p-2 border border-slate-800/80 flex items-center justify-center relative overflow-hidden">
          <canvas ref={canvasRef} width={600} height={70} className="w-full h-full" />
          {!isListening && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-xs text-slate-400 font-mono">
              MICROPHONE STANDBY — CLICK 'ENABLE MICROPHONE' TO STREAM AUDIO
            </div>
          )}
        </div>

        {/* Live Transcript / Speech Input */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Live Speech Transcription (STT Engine)</span>
            {transcript && <span className="text-indigo-400 font-mono">Realtime Stream</span>}
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono text-slate-300 min-h-[44px] flex items-center">
            {transcript ? (
              <span className="text-slate-100">"{transcript}"</span>
            ) : (
              <span className="text-slate-600 italic">Say "Hey Nova..." or choose a test interaction below</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Speaker Verification (Layer 1 Biometrics) & FSM State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Speaker Verification Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Speaker Verification</h4>
            </div>
            <button
              onClick={onEnrollSample}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              + Enroll Sample
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Profile Name</span>
              <span className="text-slate-200 font-medium">{speakerProfile.name}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Cosine Similarity</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {(speakerScore.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Auth Threshold</span>
              <span className="font-mono text-slate-300">{(speakerProfile.threshold * 100).toFixed(0)}%</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
              {speakerScore.verified ? (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Voice Biometric Confirmed</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-400 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Threshold Unmet — Secondary PIN Required</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 15-State FSM Status Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Layer 2: State Coordinator</h4>
            </div>
            <span className="text-[11px] font-mono text-slate-400">15-State FSM</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Active State</span>
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-xs font-mono font-bold text-indigo-300">
                {currentState}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              <span className="block text-[11px] text-slate-500 mb-0.5">Last Transition:</span>
              <span className="font-mono text-slate-300">
                {transitionHistory[0]?.reason || 'Awaiting initial trigger'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Test Voice Commands */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Canonical Voice Interaction Scenarios (Phase 0 Verification)
        </h4>
        <div className="grid grid-cols-1 gap-2.5">
          <button
            onClick={() => handleQuickCommand('Hey Nova, send a WhatsApp message to Uday saying I am waiting for him.')}
            className="group flex items-center justify-between p-3 rounded-lg bg-slate-950/80 hover:bg-slate-800/60 border border-slate-800 text-left transition-all"
          >
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                Communication: "Send a WhatsApp message to Uday saying I am waiting for him"
              </span>
              <span className="text-[11px] text-slate-500">
                Tests WhatsApp navigation, drafting, and Category C HITL staging
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </button>

          <button
            onClick={() => handleQuickCommand('Open YouTube and search for Python DSA tutorials.')}
            className="group flex items-center justify-between p-3 rounded-lg bg-slate-950/80 hover:bg-slate-800/60 border border-slate-800 text-left transition-all"
          >
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                App Management: "Open YouTube and search for Python DSA tutorials"
              </span>
              <span className="text-[11px] text-slate-500">
                Tests Category A read-only auto-execution and query input
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </button>

          <button
            onClick={() => handleQuickCommand('Find my latest resume and send it to HR through email.')}
            className="group flex items-center justify-between p-3 rounded-lg bg-slate-950/80 hover:bg-slate-800/60 border border-slate-800 text-left transition-all"
          >
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                File & Email: "Find my latest resume and send it to HR through email"
              </span>
              <span className="text-[11px] text-slate-500">
                Tests file identification, email drafting, and mandatory approval
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </button>

          <button
            onClick={() => handleQuickCommand('What did I ask you to do yesterday?')}
            className="group flex items-center justify-between p-3 rounded-lg bg-slate-950/80 hover:bg-slate-800/60 border border-slate-800 text-left transition-all"
          >
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                Conversational Memory: "What did I ask you to do yesterday?"
              </span>
              <span className="text-[11px] text-slate-500">
                Tests Layer 5 memory audit retrieval and conversational response
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </button>
        </div>

        {/* Custom text entry input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputText.trim()) onSubmitPrompt(inputText.trim());
          }}
          className="mt-4 flex gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type custom voice instruction (e.g. 'Hey Nova, send Uday...')"
            className="flex-1 px-4 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            Execute Plan
          </button>
        </form>
      </div>
    </div>
  );
};
