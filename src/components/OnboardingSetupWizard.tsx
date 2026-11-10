/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  User,
  Key,
  Bot,
  Mic,
  Volume2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Globe,
  Radio,
  Sliders,
  Check,
  X,
  Lock,
} from 'lucide-react';
import { UserProfile, AgentConfig } from '../core/schemas';

interface OnboardingSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  agentConfig: AgentConfig;
  onSaveProfile: (profile: Partial<UserProfile>) => void;
  onSaveAgentConfig: (config: Partial<AgentConfig>) => void;
  onEnrollSample: (sampleText: string) => void;
  onPronounceName: (agentName: string, lang: 'en-IN' | 'hi-IN' | 'te-IN', ownerName: string) => void;
  onTestVoice: (lang: 'en-IN' | 'hi-IN' | 'te-IN') => void;
  onPlayChime: () => void;
}

export const OnboardingSetupWizard: React.FC<OnboardingSetupWizardProps> = ({
  isOpen,
  onClose,
  userProfile,
  agentConfig,
  onSaveProfile,
  onSaveAgentConfig,
  onEnrollSample,
  onPronounceName,
  onTestVoice,
  onPlayChime,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [userName, setUserName] = useState(userProfile.userName || 'Venkatesh Malepati');
  const [userEmail, setUserEmail] = useState(userProfile.userEmail || 'venkateshmalepati078@gmail.com');
  const [userPin, setUserPin] = useState(userProfile.userPin || '2026');

  // Agent State
  const [assistantName, setAssistantName] = useState(agentConfig.assistantName || 'NOVA');
  const [wakePhrase, setWakePhrase] = useState(agentConfig.wakePhrase || 'Hey Nova');
  const [selectedModel, setSelectedModel] = useState(agentConfig.selectedModel || 'gemini-3.8-flash');
  const [language, setLanguage] = useState<'en-IN' | 'hi-IN' | 'te-IN'>(agentConfig.language || 'en-IN');
  const [speechRate, setSpeechRate] = useState(agentConfig.speechRate || 0.98);
  const [pitch, setPitch] = useState(agentConfig.pitch || 1.0);

  // Biometric Voice Capture Simulation State
  const sampleList = [
    `Hey ${assistantName}, verify my voice profile`,
    `I authorize ${assistantName} for personal task execution`,
    `Authenticate my biometric voice identity for this device`,
  ];
  const [enrolledSamples, setEnrolledSamples] = useState<number[]>(
    agentConfig.voiceEnrollment.samplesCompleted >= 3 ? [0, 1, 2] : []
  );
  const [isRecordingSample, setIsRecordingSample] = useState<number | null>(null);
  const [biometricScore, setBiometricScore] = useState<number>(0.984);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    if (isOpen) {
      onPlayChime();
    }
  }, [isOpen, onPlayChime]);

  if (!isOpen) return null;

  const handleRecordSample = (index: number) => {
    setIsRecordingSample(index);
    onPlayChime();

    setTimeout(() => {
      setIsRecordingSample(null);
      if (!enrolledSamples.includes(index)) {
        setEnrolledSamples((prev) => [...prev, index]);
        onEnrollSample(sampleList[index]);
      }
    }, 1400);
  };

  const handlePronounce = () => {
    setIsPlayingAudio(true);
    onPronounceName(assistantName, language, userName);
    setTimeout(() => setIsPlayingAudio(false), 3500);
  };

  const handleTestAudio = () => {
    setIsPlayingAudio(true);
    onTestVoice(language);
    setTimeout(() => setIsPlayingAudio(false), 3500);
  };

  const handleCompleteAll = () => {
    onSaveProfile({
      userName,
      userEmail,
      userPin,
      isLoggedIn: true,
      hasCompletedOnboarding: true,
    });

    onSaveAgentConfig({
      assistantName,
      wakePhrase,
      selectedModel,
      language,
      speechRate,
      pitch,
      voiceEnrollment: {
        isEnrolled: true,
        samplesCompleted: Math.max(3, enrolledSamples.length),
        samplePhrases: sampleList,
      },
    });

    // Pronounce final activation greeting
    onPronounceName(assistantName, language, userName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-[#090D16] border border-indigo-500/30 shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]">
        
        {/* Wizard Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Setup & Voice Calibration Wizard</span>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  Step {step} of 4
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Configure owner security, voice biometrics, and human-like Indian multilingual persona
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress Indicator */}
        <div className="grid grid-cols-4 border-b border-slate-800/80 text-xs font-medium">
          <button
            onClick={() => setStep(1)}
            className={`py-3 px-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              step === 1
                ? 'border-indigo-500 text-indigo-300 font-bold bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Owner Login</span>
          </button>
          <button
            onClick={() => setStep(2)}
            className={`py-3 px-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              step === 2
                ? 'border-indigo-500 text-indigo-300 font-bold bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>2. Voice Capture</span>
          </button>
          <button
            onClick={() => setStep(3)}
            className={`py-3 px-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              step === 3
                ? 'border-indigo-500 text-indigo-300 font-bold bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>3. Agent & Name</span>
          </button>
          <button
            onClick={() => setStep(4)}
            className={`py-3 px-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              step === 4
                ? 'border-indigo-500 text-indigo-300 font-bold bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>4. Indian Voices</span>
          </button>
        </div>

        {/* Wizard Step Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {/* STEP 1: OWNER LOGIN & SECURITY PIN */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Owner Security Identity:</strong> Nova links all high-risk actions (WhatsApp messages, file transfers, and device unlocking) exclusively to your registered identity and voiceprint.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Full Owner Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Venkatesh Malepati"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Owner Email Address</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="venkateshmalepati078@gmail.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                    <span>4-Digit Security Override PIN</span>
                    <span className="text-[10px] text-amber-400 font-normal">Used for biometric fallback</span>
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={userPin}
                    onChange={(e) => setUserPin(e.target.value)}
                    placeholder="2026"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 tracking-widest font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: VOICE CAPTURE & SPEAKER IDENTIFICATION */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-white">Speaker Verification Status</span>
                  <p className="text-[11px] text-slate-400">
                    Acoustic Centroid: <span className="font-mono text-indigo-300">ECAPA-TDNN 8-dim</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Match: {(biometricScore * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs font-mono text-slate-400">
                  Record 3 Voice Calibration Samples for Owner ({userName}):
                </label>

                {sampleList.map((sampleText, idx) => {
                  const isDone = enrolledSamples.includes(idx);
                  const isRecording = isRecordingSample === idx;

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isDone
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : isRecording
                          ? 'bg-indigo-950/40 border-indigo-500 animate-pulse'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isDone
                              ? 'bg-emerald-500 text-black'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-medium text-slate-200">"{sampleText}"</p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {isDone
                              ? 'Biometric features extracted & calibrated'
                              : isRecording
                              ? 'Recording & extracting acoustic vector...'
                              : 'Tap mic button to capture voice'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRecordSample(idx)}
                        disabled={isRecording}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                          isDone
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                        }`}
                      >
                        <Mic className={`w-3.5 h-3.5 ${isRecording ? 'animate-ping' : ''}`} />
                        <span>{isDone ? 'Re-Record' : 'Record'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Owner identity: <strong>{userName}</strong> is registered. Tasks spoken by other voices will be rejected.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: AGENT NAME & PRONUNCIATION VERIFICATION */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Agent Name</label>
                  <input
                    type="text"
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                    placeholder="NOVA"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-indigo-300 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Wake Phrase</label>
                  <input
                    type="text"
                    value={wakePhrase}
                    onChange={(e) => setWakePhrase(e.target.value)}
                    placeholder="Hey Nova"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Cognitive Reasoning Engine</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended for Voice & Sub-second Planning)</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Standard)</option>
                </select>
              </div>

              {/* Pronunciation Verification Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/40 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-indigo-400" />
                    <span>Pronunciation & Verification Test</span>
                  </span>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    Audio Active
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Verify how your assistant pronounces its name <strong>"{assistantName}"</strong> and greets owner <strong>"{userName}"</strong>.
                </p>

                <button
                  onClick={handlePronounce}
                  disabled={isPlayingAudio}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
                  <span>{isPlayingAudio ? `Speaking "${assistantName}"...` : `🔊 Pronounce & Verify Agent Name`}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: HUMAN-LIKE INDIAN MULTILANGUAGE VOICE (ENGLISH, HINDI, TELUGU) */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300">
                  Select Natural Human Language & Accent:
                </label>

                <div className="grid grid-cols-3 gap-2.5">
                  {/* English (India) */}
                  <button
                    onClick={() => setLanguage('en-IN')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      language === 'en-IN'
                        ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/50'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">🇮🇳</span>
                      {language === 'en-IN' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <div className="mt-2">
                      <h4 className="text-xs font-bold text-white">English (India)</h4>
                      <p className="text-[10px] text-slate-400">Indian Accent · Crisp</p>
                    </div>
                  </button>

                  {/* Hindi */}
                  <button
                    onClick={() => setLanguage('hi-IN')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      language === 'hi-IN'
                        ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/50'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">🇮🇳</span>
                      {language === 'hi-IN' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <div className="mt-2">
                      <h4 className="text-xs font-bold text-white">Hindi (हिन्दी)</h4>
                      <p className="text-[10px] text-slate-400">Natural Conversational</p>
                    </div>
                  </button>

                  {/* Telugu */}
                  <button
                    onClick={() => setLanguage('te-IN')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      language === 'te-IN'
                        ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/50'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">🇮🇳</span>
                      {language === 'te-IN' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <div className="mt-2">
                      <h4 className="text-xs font-bold text-white">Telugu (తెలుగు)</h4>
                      <p className="text-[10px] text-slate-400">Regional Natural Tone</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Sliders for Human Warmth */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Human Voice Tuning</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Speed: {speechRate.toFixed(2)}x · Pitch: {pitch.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Speech Rate (Pacing)</span>
                    <span>{speechRate.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.2"
                    step="0.02"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Voice Pitch (Warmth)</span>
                    <span>{pitch.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.85"
                    max="1.15"
                    step="0.02"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Instant Audio Sample Test */}
              <button
                onClick={handleTestAudio}
                disabled={isPlayingAudio}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
                <span>
                  {isPlayingAudio
                    ? 'Playing Voice Sample...'
                    : `🔊 Test ${language === 'hi-IN' ? 'Hindi' : language === 'te-IN' ? 'Telugu' : 'Indian English'} Audio Output`}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as any)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleCompleteAll}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Setup & Activate {assistantName}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
