/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TopNavigation } from './components/TopNavigation';
import { SensoryConsole } from './components/SensoryConsole';
import { AndroidSimulator } from './components/AndroidSimulator';
import { AccessibilityInspector } from './components/AccessibilityInspector';
import { ApprovalModal } from './components/ApprovalModal';
import { MemoryAndAuditPanel } from './components/MemoryAndAuditPanel';
import { ArchitectureView } from './components/ArchitectureView';
import { AgentSetupModal } from './components/AgentSetupModal';
import { OnboardingSetupWizard } from './components/OnboardingSetupWizard';

import { NovaStateMachine } from './core/state-machine';
import { SensoryEngine } from './core/sensory-engine';
import { AccessibilityBridge, AppState } from './core/accessibility-bridge';
import { ActionPolicyEngine } from './core/policy-engine';
import { MemoryVault } from './core/memory-vault';
import {
  NovaStateType,
  NovaTask,
  StateTransitionEvent,
  AccessibilityNode,
  UserProfile,
  AgentConfig,
} from './core/schemas';
import { Lock, Unlock, ShieldCheck, Sparkles, Bot, Terminal, Volume2, Wand2 } from 'lucide-react';

export default function App() {
  // Singletons initialized once
  const stateMachine = useMemo(() => new NovaStateMachine(), []);
  const sensoryEngine = useMemo(() => new SensoryEngine(), []);
  const accessibilityBridge = useMemo(() => new AccessibilityBridge(), []);
  const policyEngine = useMemo(() => new ActionPolicyEngine(), []);
  const memoryVault = useMemo(() => new MemoryVault(), []);

  // React State bindings
  const [activeTab, setActiveTab] = useState<'console' | 'simulator' | 'memory' | 'architecture'>('console');
  const [currentState, setCurrentState] = useState<NovaStateType>('IDLE');
  const [activeTask, setActiveTask] = useState<NovaTask | null>(null);
  const [transitionHistory, setTransitionHistory] = useState<StateTransitionEvent[]>([]);

  // Phone Lock State (Defaults to true so user immediately sees lock screen experience)
  const [isDeviceLocked, setIsDeviceLocked] = useState(true);
  const [isUnlockingInProgress, setIsUnlockingInProgress] = useState(false);
  const [isFullscreenMobile, setIsFullscreenMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // User Profile & Agent Setup state
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => memoryVault.getUserProfile());
  const [agentConfig, setAgentConfig] = useState<AgentConfig>(() => memoryVault.getAgentConfig());

  // Sensory State
  const [isListening, setIsListening] = useState(false);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [rms, setRms] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [activeUtterance, setActiveUtterance] = useState<string>('');
  const [goodbyeMessage, setGoodbyeMessage] = useState<string>('');
  const [speakerScore, setSpeakerScore] = useState<{ verified: boolean; confidence: number }>({
    verified: true,
    confidence: 0.94,
  });

  // OS / Accessibility State
  const [activeApp, setActiveApp] = useState<AppState>(accessibilityBridge.getActiveApp());
  const [prunedNodes, setPrunedNodes] = useState<AccessibilityNode[]>(accessibilityBridge.getPrunedTree());
  const [activeTargetNodeId, setActiveTargetNodeId] = useState<string | undefined>();

  // Approval State
  const [stagedApproval, setStagedApproval] = useState<{
    task: NovaTask;
    hash: string;
    expiresAt: number;
  } | null>(null);

  // Sync initial voice settings with SensoryEngine
  useEffect(() => {
    sensoryEngine.setVoiceSettings(agentConfig.language, agentConfig.speechRate, agentConfig.pitch);
  }, [agentConfig.language, agentConfig.speechRate, agentConfig.pitch, sensoryEngine]);

  // Subscriptions setup
  useEffect(() => {
    // 1. Subscribe to FSM
    const unsubFSM = stateMachine.subscribe((state, task, event) => {
      setCurrentState(state);
      setActiveTask(task);
      setTransitionHistory(stateMachine.getHistory());
    });

    // 2. Subscribe to Accessibility Bridge
    const unsubA11y = accessibilityBridge.subscribe((app) => {
      setActiveApp({ ...app });
      setPrunedNodes(accessibilityBridge.getPrunedTree(app.uiTree));
    });

    // 3. Subscribe to Audio Stream
    const unsubAudio = sensoryEngine.onAudioData((wave, curRms, speaking) => {
      setWaveform(wave);
      setRms(curRms);
      setIsSpeaking(speaking);
    });

    // 4. Subscribe to Transcripts
    const unsubTranscript = sensoryEngine.onTranscript((text, isFinal) => {
      setTranscript(text);
      if (isFinal && text.trim().length > 3) {
        handleUserInstruction(text.trim());
      }
    });

    // 5. Subscribe to Wake Word
    const unsubWake = sensoryEngine.onWakeWord((phrase) => {
      if (stateMachine.getState() === 'IDLE') {
        stateMachine.transition('LISTENING', `Wake word matched: "${phrase}"`);
      }
    });

    return () => {
      unsubFSM();
      unsubA11y();
      unsubAudio();
      unsubTranscript();
      unsubWake();
      sensoryEngine.stopMicrophone();
    };
  }, [stateMachine, sensoryEngine, accessibilityBridge]);

  // Voice toggle
  const handleToggleVoice = async () => {
    if (isListening) {
      sensoryEngine.stopMicrophone();
      setIsListening(false);
      stateMachine.transition('IDLE', 'Microphone disabled');
    } else {
      const ok = await sensoryEngine.startMicrophone();
      setIsListening(true);
      stateMachine.transition('LISTENING', `Microphone active, listening for "${agentConfig.wakePhrase}"`);
    }
  };

  // Profile & Agent Setup Handlers
  const handleUpdateProfile = (partial: Partial<UserProfile>) => {
    const updated = memoryVault.updateUserProfile(partial);
    setUserProfile(updated);
  };

  const handleUpdateAgentConfig = (partial: Partial<AgentConfig>) => {
    const updated = memoryVault.updateAgentConfig(partial);
    setAgentConfig(updated);
    sensoryEngine.setVoiceSettings(updated.language, updated.speechRate, updated.pitch);
  };

  const handleEnrollVoiceSample = (sampleText: string) => {
    const res = sensoryEngine.enrollSample(sampleText);
    const updated = memoryVault.updateAgentConfig({
      voiceEnrollment: {
        ...agentConfig.voiceEnrollment,
        samplesCompleted: Math.min(3, agentConfig.voiceEnrollment.samplesCompleted + 1),
        samplePhrases: [...agentConfig.voiceEnrollment.samplePhrases, sampleText],
      },
    });
    setAgentConfig(updated);
    sensoryEngine.speak(res.status, undefined, agentConfig.language);
  };

  // Execute full agent planning loop
  const handleUserInstruction = useCallback(
    async (instructionText: string) => {
      setActiveUtterance(instructionText);
      setTranscript(instructionText);
      setGoodbyeMessage('');
      memoryVault.addTurn('user', instructionText);

      const lang = agentConfig.language || 'en-IN';

      // Step 1: Listening -> Authenticating
      if (stateMachine.canTransitionTo('AUTHENTICATING')) {
        stateMachine.transition('AUTHENTICATING', 'Biometric voice verification');
      }

      // Step 2: Speaker verification simulation
      const auth = sensoryEngine.verifySpeaker();
      setSpeakerScore(auth);
      if (!auth.verified) {
        stateMachine.transition('FAILED', 'Speaker verification threshold unmet');
        const errVoice = lang === 'hi-IN' ? 'आवाज़ की पहचान विफल रही।' : lang === 'te-IN' ? 'వాయిస్ ధృవీకరణ విఫలమైంది.' : 'Speaker identity could not be verified.';
        sensoryEngine.speak(errVoice, undefined, lang);
        return;
      }

      // Step 3: Transcribing
      if (stateMachine.canTransitionTo('TRANSCRIBING')) {
        stateMachine.transition('TRANSCRIBING', 'Speech transcribed successfully');
      }

      // Step 4: Understanding
      if (stateMachine.canTransitionTo('UNDERSTANDING')) {
        stateMachine.transition('UNDERSTANDING', 'Classifying intent & extracting entities');
      }

      // Step 5: Observing UI Tree
      if (stateMachine.canTransitionTo('OBSERVING')) {
        stateMachine.transition('OBSERVING', 'Serializing and pruning accessibility hierarchy');
      }

      // Step 6: Planning with Gemini
      if (stateMachine.canTransitionTo('PLANNING')) {
        stateMachine.transition('PLANNING', `Synthesizing plan with ${agentConfig.selectedModel}`);
      }

      try {
        const response = await fetch('/api/agent/reason', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: instructionText,
            activePackage: activeApp.packageName,
            prunedNodes,
            conversationHistory: memoryVault.getRecentTurns(),
          }),
        });

        const data = await response.json();
        const plan: NovaTask = data.plan;
        stateMachine.setTask(plan);

        // Step 7: Staging
        stateMachine.transition('STAGING', `Task staged: ${plan.intent}`);

        // LOCK SCREEN DUAL-BEHAVIOR EVALUATION:
        if (isDeviceLocked) {
          if (plan.canRunOnLockScreen || (!plan.requiresUnlock && plan.intent === 'CONVERSATIONAL_QUERY')) {
            // General query (facts, weather, time, history, search) -> RUN DIRECTLY ON LOCK SCREEN
            stateMachine.transition('EXECUTING', 'Executing voice-authorized lock screen query');
            await new Promise((r) => setTimeout(r, 400));
            stateMachine.transition('VERIFYING', 'Verifying response integrity');
            await new Promise((r) => setTimeout(r, 300));

            const completedTask: NovaTask = { ...plan, status: 'COMPLETED' };
            stateMachine.setTask(completedTask);
            stateMachine.transition('COMPLETED', 'Lock-screen query answered with voice authorization');

            const answerText = plan.answer || plan.stagedSummary;
            let bye = `${answerText} Have a wonderful day! Bye!`;
            if (lang === 'hi-IN') {
              bye = `${answerText} आपका दिन शुभ हो, अलविदा!`;
            } else if (lang === 'te-IN') {
              bye = `${answerText} మంచి రోజు గడవాలని కోరుకుంటున్నాను, బాయ్!`;
            }

            setGoodbyeMessage(bye);
            sensoryEngine.speak(bye, undefined, lang);

            memoryVault.logExecution(
              completedTask,
              'VOICE_BIOMETRIC_LOCKSCREEN',
              450,
              instructionText,
              bye
            );

            // Auto-return to IDLE after 4.5s
            setTimeout(() => {
              if (stateMachine.getState() === 'COMPLETED') {
                stateMachine.transition('IDLE', 'Coordinator ready for next instruction');
                setGoodbyeMessage('');
                setTranscript('');
              }
            }, 4500);
            return;
          } else {
            // App task that requires phone unlock (WhatsApp, YouTube, Gmail, Files)
            setIsUnlockingInProgress(true);
            let unlockNotice = 'Your phone is locked. Verifying your voice to unlock...';
            if (lang === 'hi-IN') {
              unlockNotice = 'आपका फोन लॉक है। अनलॉक करने के लिए आपकी आवाज़ की पुष्टि कर रहा हूँ...';
            } else if (lang === 'te-IN') {
              unlockNotice = 'మీ ఫోన్ లాక్ చేయబడింది. అన్‌లాక్ చేయడానికి మీ వాయిస్‌ని ధృవీకరిస్తున్నాను...';
            }

            sensoryEngine.speak(unlockNotice, undefined, lang);
            await new Promise((r) => setTimeout(r, 1500));
            setIsDeviceLocked(false);
            setIsUnlockingInProgress(false);
          }
        }

        // Step 8: Risk evaluation & HITL check
        if (plan.requiresConfirmation) {
          // Category C: Mandatory Human-In-The-Loop Approval
          const staged = await policyEngine.stageTaskForApproval(plan);
          setStagedApproval(staged);
          stateMachine.transition('AWAITING_APPROVAL', 'Awaiting explicit human approval (30s TTL)');
          sensoryEngine.speak(plan.stagedSummary, undefined, lang);
        } else {
          // Category A / B: Auto-Execute
          executeTaskSteps(plan, 'AUTO_AUTHORIZED', instructionText);
        }
      } catch (err: any) {
        stateMachine.transition('FAILED', `Planning error: ${err.message}`);
      }
    },
    [stateMachine, sensoryEngine, activeApp, prunedNodes, memoryVault, policyEngine, agentConfig, isDeviceLocked]
  );

  // Execute staged action steps
  const executeTaskSteps = async (task: NovaTask, approvalMethod: any, utteranceText?: string) => {
    stateMachine.transition('EXECUTING', `Executing ${task.steps.length} accessibility actions`);
    const startTime = Date.now();
    const lang = agentConfig.language || 'en-IN';

    for (const step of task.steps) {
      if (step.targetApp && step.targetApp !== activeApp.packageName) {
        accessibilityBridge.launchPackage(step.targetApp);
        await new Promise((r) => setTimeout(r, 400));
      }

      if (step.targetNodeId) {
        setActiveTargetNodeId(step.targetNodeId);
      }

      if (step.actionType === 'CLICK_NODE' && step.targetNodeId) {
        accessibilityBridge.clickNode(step.targetNodeId);
        await new Promise((r) => setTimeout(r, 500));
      } else if (step.actionType === 'SET_TEXT' && step.targetNodeId && step.payload) {
        accessibilityBridge.setText(step.targetNodeId, step.payload);
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    // Step 9: Verifying
    stateMachine.transition('VERIFYING', 'Verifying post-action UI hierarchy');
    await new Promise((r) => setTimeout(r, 400));

    // Step 10: Completed
    const duration = Date.now() - startTime;
    const completedTask: NovaTask = { ...task, status: 'COMPLETED' };
    stateMachine.setTask(completedTask);
    stateMachine.transition('COMPLETED', 'Action execution verified successfully');

    let bye = 'Task completed. Have a wonderful day, bye!';
    if (lang === 'hi-IN') {
      if (task.intent === 'SEND_MESSAGE') {
        bye = `मैंने ${task.entities.contact || 'उदय'} को संदेश भेज दिया है। आपका दिन शुभ हो, अलविदा!`;
      } else if (task.intent === 'SEARCH_APP') {
        bye = `यहाँ यूट्यूब पर आपके खोज परिणाम हैं। अलविदा!`;
      } else if (task.intent === 'SEND_EMAIL') {
        bye = `आपका रिज्यूमे एचआर को भेज दिया गया है। अलविदा!`;
      } else {
        bye = `कार्य सफलतापूर्वक पूरा हुआ। अलविदा!`;
      }
    } else if (lang === 'te-IN') {
      if (task.intent === 'SEND_MESSAGE') {
        bye = `నేను ${task.entities.contact || 'ఉదయ్‌'}కి మెసేజ్ పంపించాను. మంచి రోజు గడవాలని కోరుకుంటున్నాను, బాయ్!`;
      } else if (task.intent === 'SEARCH_APP') {
        bye = `యూట్యూబ్‌లో మీ శోధన ఫలితాలు సిద్ధంగా ఉన్నాయి. బాయ్!`;
      } else if (task.intent === 'SEND_EMAIL') {
        bye = `మీ రెజ్యూమ్ హెచ్‌ఆర్‌కి పంపబడింది. బాయ్!`;
      } else {
        bye = `టాస్క్ విజయవంతంగా పూర్తయింది. బాయ్!`;
      }
    } else {
      if (task.intent === 'SEND_MESSAGE') {
        bye = `I sent your message to ${task.entities.contact || 'Uday'}. Have a wonderful day, bye!`;
      } else if (task.intent === 'SEARCH_APP') {
        bye = `Here are the results for ${task.entities.searchQuery || 'your search'}. Bye!`;
      } else if (task.intent === 'SEND_EMAIL') {
        bye = `Your resume has been sent to HR. Bye!`;
      }
    }

    setGoodbyeMessage(bye);
    memoryVault.logExecution(
      completedTask,
      approvalMethod,
      duration,
      utteranceText || activeUtterance || task.stagedSummary,
      bye
    );

    sensoryEngine.speak(bye, undefined, lang);
    setActiveTargetNodeId(undefined);

    // Auto-return to IDLE after 4.5 seconds
    setTimeout(() => {
      if (stateMachine.getState() === 'COMPLETED') {
        stateMachine.transition('IDLE', 'Coordinator ready for next instruction');
        setGoodbyeMessage('');
        setTranscript('');
      }
    }, 4500);
  };

  // HITL Approval Handlers
  const handleApproveAction = async (task: NovaTask, token: string) => {
    if (!stagedApproval) return;
    const verification = await policyEngine.verifyApproval(task, token, stagedApproval.expiresAt - 30000);

    if (!verification.valid) {
      stateMachine.transition('CANCELLED', verification.reason);
      sensoryEngine.speak('Approval rejected: payload mutated or timed out.', undefined, agentConfig.language);
      setStagedApproval(null);
      return;
    }

    setStagedApproval(null);
    executeTaskSteps(task, 'UI_CLICK', activeUtterance);
  };

  const handleRejectAction = () => {
    stateMachine.transition('CANCELLED', 'Operation rejected by user or 30s TTL expired');
    sensoryEngine.speak('Action cancelled.', undefined, agentConfig.language);
    setStagedApproval(null);
  };

  const handleEditStagedAction = async (updatedTask: NovaTask) => {
    const reStaged = await policyEngine.stageTaskForApproval(updatedTask);
    setStagedApproval(reStaged);
    stateMachine.setTask(updatedTask);
    sensoryEngine.speak(`Updated draft: ${updatedTask.entities.message || ''}`, undefined, agentConfig.language);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070A11] text-slate-100">
      {/* Top Bar Navigation with Phone Lock, Quick Prompts & Setup */}
      <TopNavigation
        currentState={currentState}
        isListening={isListening}
        onToggleVoice={handleToggleVoice}
        onResetState={() => stateMachine.forceReset()}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSetup={() => setIsSetupOpen(true)}
        onOpenWizard={() => setIsOnboardingOpen(true)}
        onTestAudio={() => sensoryEngine.testVoiceAudio(agentConfig.language)}
        currentLanguage={agentConfig.language}
        assistantName={agentConfig.assistantName}
        isDeviceLocked={isDeviceLocked}
        onToggleDeviceLock={() => setIsDeviceLocked(!isDeviceLocked)}
        onTriggerPreset={handleUserInstruction}
        isFullscreenMobile={isFullscreenMobile}
        onToggleFullscreenMobile={() => setIsFullscreenMobile(!isFullscreenMobile)}
      />

      {/* Main Workspace Display */}
      <main className={`flex-1 w-full flex flex-col justify-center ${isFullscreenMobile ? 'p-0 max-w-none' : 'max-w-[1500px] mx-auto p-4 md:p-6'}`}>
        {activeTab === 'console' && (
          isFullscreenMobile ? (
            /* PURE NATIVE FULLSCREEN MOBILE VIEW */
            <div className="w-full h-full flex-1 flex flex-col">
              <AndroidSimulator
                activeApp={activeApp}
                onLaunchPackage={(pkg) => accessibilityBridge.launchPackage(pkg)}
                onNodeClick={(id) => accessibilityBridge.clickNode(id)}
                onNodeTextChange={(id, text) => accessibilityBridge.setText(id, text)}
                activeTargetNodeId={activeTargetNodeId}
                currentState={currentState}
                activeTask={activeTask}
                transcript={transcript}
                isListening={isListening}
                onTriggerVoice={() => {
                  if (!isListening) handleToggleVoice();
                }}
                auditLogs={memoryVault.getAuditLogs()}
                onApproveStagedTask={() => {
                  if (stagedApproval) handleApproveAction(stagedApproval.task, stagedApproval.hash);
                }}
                onCancelStagedTask={handleRejectAction}
                goodbyeMessage={goodbyeMessage}
                userProfile={userProfile}
                agentConfig={agentConfig}
                onUpdateProfile={handleUpdateProfile}
                onUpdateAgentConfig={handleUpdateAgentConfig}
                onEnrollVoiceSample={handleEnrollVoiceSample}
                isDeviceLocked={isDeviceLocked}
                onToggleDeviceLock={() => setIsDeviceLocked(!isDeviceLocked)}
                isUnlockingInProgress={isUnlockingInProgress}
                isFullscreenMobile={true}
                onToggleFullscreenMobile={() => setIsFullscreenMobile(false)}
              />
            </div>
          ) : (
            /* DESKTOP SPLIT VIEW: Center Phone Simulator + Right Companion Console */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-center">
              {/* Center Mobile Experience (Columns 1-6 lg) */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center">
                <div className="w-full max-w-[370px] flex items-center justify-between mb-2 px-2 text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <span>Android 15 Experience</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({isDeviceLocked ? 'Locked' : 'Unlocked'})
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsOnboardingOpen(true)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 cursor-pointer"
                      title="Run Full Setup Wizard"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>Setup Wizard</span>
                    </button>
                    <span className="text-slate-600">·</span>
                    <button
                      onClick={() => setIsFullscreenMobile(true)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 cursor-pointer"
                      title="Test full screen without phone frame"
                    >
                      <span>Fullscreen</span>
                    </button>
                  </div>
                </div>

                {/* Responsive Smartphone Simulator Frame */}
                <AndroidSimulator
                  activeApp={activeApp}
                  onLaunchPackage={(pkg) => accessibilityBridge.launchPackage(pkg)}
                  onNodeClick={(id) => accessibilityBridge.clickNode(id)}
                  onNodeTextChange={(id, text) => accessibilityBridge.setText(id, text)}
                  activeTargetNodeId={activeTargetNodeId}
                  currentState={currentState}
                  activeTask={activeTask}
                  transcript={transcript}
                  isListening={isListening}
                  onTriggerVoice={() => {
                    if (!isListening) handleToggleVoice();
                  }}
                  auditLogs={memoryVault.getAuditLogs()}
                  onApproveStagedTask={() => {
                    if (stagedApproval) handleApproveAction(stagedApproval.task, stagedApproval.hash);
                  }}
                  onCancelStagedTask={handleRejectAction}
                  goodbyeMessage={goodbyeMessage}
                  userProfile={userProfile}
                  agentConfig={agentConfig}
                  onUpdateProfile={handleUpdateProfile}
                  onUpdateAgentConfig={handleUpdateAgentConfig}
                  onEnrollVoiceSample={handleEnrollVoiceSample}
                  isDeviceLocked={isDeviceLocked}
                  onToggleDeviceLock={() => setIsDeviceLocked(!isDeviceLocked)}
                  isUnlockingInProgress={isUnlockingInProgress}
                  isFullscreenMobile={false}
                  onToggleFullscreenMobile={() => setIsFullscreenMobile(true)}
                />
              </div>

              {/* Right Side Companion Console (Columns 7-12 lg) */}
              <div className="lg:col-span-6 space-y-4">
                {/* Context Card with Indian Multilanguage & Wizard Trigger */}
                <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-950/40 to-slate-900 border border-indigo-500/30 text-xs text-indigo-200 flex items-start justify-between gap-3 shadow-lg">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{agentConfig.assistantName} OS · Indian Multilingual Engine</span>
                    </h4>
                    <p className="leading-relaxed text-indigo-200/90 text-[11px]">
                      Language: <strong>{agentConfig.language === 'hi-IN' ? 'Hindi (हिन्दी)' : agentConfig.language === 'te-IN' ? 'Telugu (తెలుగు)' : 'English (India)'}</strong>. Calibrated to owner <strong>{userProfile.userName}</strong>.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOnboardingOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 shrink-0 cursor-pointer"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Run Wizard</span>
                  </button>
                </div>

                <SensoryConsole
                  currentState={currentState}
                  waveform={waveform}
                  rms={rms}
                  isSpeaking={isSpeaking}
                  transcript={transcript}
                  isListening={isListening}
                  speakerProfile={sensoryEngine.getSpeakerProfile()}
                  speakerScore={speakerScore}
                  transitionHistory={transitionHistory}
                  onSubmitPrompt={handleUserInstruction}
                  onEnrollSample={() => handleEnrollVoiceSample('The quick brown fox jumps over the lazy dog')}
                />
              </div>
            </div>
          )
        )}

        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 flex justify-center">
              <AndroidSimulator
                activeApp={activeApp}
                onLaunchPackage={(pkg) => accessibilityBridge.launchPackage(pkg)}
                onNodeClick={(id) => accessibilityBridge.clickNode(id)}
                onNodeTextChange={(id, text) => accessibilityBridge.setText(id, text)}
                activeTargetNodeId={activeTargetNodeId}
                currentState={currentState}
                activeTask={activeTask}
                transcript={transcript}
                isListening={isListening}
                onTriggerVoice={() => {
                  if (!isListening) handleToggleVoice();
                }}
                auditLogs={memoryVault.getAuditLogs()}
                onApproveStagedTask={() => {
                  if (stagedApproval) handleApproveAction(stagedApproval.task, stagedApproval.hash);
                }}
                onCancelStagedTask={handleRejectAction}
                goodbyeMessage={goodbyeMessage}
                userProfile={userProfile}
                agentConfig={agentConfig}
                onUpdateProfile={handleUpdateProfile}
                onUpdateAgentConfig={handleUpdateAgentConfig}
                onEnrollVoiceSample={handleEnrollVoiceSample}
                isDeviceLocked={isDeviceLocked}
                onToggleDeviceLock={() => setIsDeviceLocked(!isDeviceLocked)}
                isUnlockingInProgress={isUnlockingInProgress}
              />
            </div>

            <div className="lg:col-span-7 h-[720px]">
              <AccessibilityInspector
                rawTree={activeApp.uiTree}
                prunedNodes={prunedNodes}
                activeTargetNodeId={activeTargetNodeId}
                onSelectNode={(id) => setActiveTargetNodeId(id)}
              />
            </div>
          </div>
        )}

        {activeTab === 'memory' && (
          <MemoryAndAuditPanel
            auditLogs={memoryVault.getAuditLogs()}
            aliases={memoryVault.getAliases()}
            recentTurns={memoryVault.getRecentTurns()}
            onClearLogs={() => memoryVault.clearAuditLogs()}
          />
        )}

        {activeTab === 'architecture' && <ArchitectureView />}
      </main>

      {/* Full Onboarding & Voice Calibration Wizard Modal */}
      <OnboardingSetupWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        userProfile={userProfile}
        agentConfig={agentConfig}
        onSaveProfile={handleUpdateProfile}
        onSaveAgentConfig={handleUpdateAgentConfig}
        onEnrollSample={handleEnrollVoiceSample}
        onPronounceName={(name, lang, owner) => sensoryEngine.pronounceAgentName(name, lang, owner)}
        onTestVoice={(lang) => sensoryEngine.testVoiceAudio(lang)}
        onPlayChime={() => sensoryEngine.playActivationChime()}
      />

      {/* Human-In-The-Loop Approval Modal Overlay */}
      {stagedApproval && (
        <ApprovalModal
          task={stagedApproval.task}
          payloadHash={stagedApproval.hash}
          expiresAt={stagedApproval.expiresAt}
          onApprove={handleApproveAction}
          onReject={handleRejectAction}
          onEdit={handleEditStagedAction}
        />
      )}

      {/* Dedicated User Login & Agent Setup Modal */}
      <AgentSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        userProfile={userProfile}
        agentConfig={agentConfig}
        onUpdateProfile={handleUpdateProfile}
        onUpdateAgentConfig={handleUpdateAgentConfig}
        onEnrollVoiceSample={handleEnrollVoiceSample}
      />
    </div>
  );
}
