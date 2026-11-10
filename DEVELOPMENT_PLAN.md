# DEVELOPMENT_PLAN.md: NOVA Roadmap

## 1. Overview

This document specifies the multi-phase engineering roadmap for NOVA — Voice-Controlled Personal AI Operating System. Each phase defines concrete deliverables, test strategies, and acceptance criteria. Development proceeds incrementally with verification at each gate.

---

## 2. Phase Breakdown

### Phase 0: Architecture & Foundation (Current Phase)
- **Scope**: Core specifications, system contracts, 15-state deterministic state coordinator, structured schema validator, HITL policy engine, and full interactive workstation with Android simulator.
- **Deliverables**:
  - `ARCHITECTURE.md`, `DEVELOPMENT_PLAN.md`, `TECHNICAL_DECISIONS.md`, `DEVELOPMENT_STATUS.md`.
  - Android Kotlin package blueprints (`app/src/main/java/com/nova/assistant/...`).
  - Full-stack runtime (`server.ts` + Express + `@google/genai` backend).
  - Web OS Console & Interactive Android Device Simulator with live accessibility inspector, live speech/wake-word engine, and approval modal.
- **Acceptance Criteria**:
  - [x] State machine enforces valid transitions and rejects invalid state jumps.
  - [x] High-risk mutations require explicit human approval and payload binding.
  - [x] Gemini 3.8 Flash outputs typed, schema-validated plans.
  - [x] Full build and lint passes without errors.

### Phase 1: Android Foundation & Native Service Bridge
- **Scope**: Native Kotlin Android 15 application skeleton using Jetpack Compose, Coroutines, StateFlow, and Hilt.
- **Deliverables**:
  - `MainActivity.kt` with navigation graph.
  - Android Keystore integration for encrypted local token storage.
  - `NovaAccessibilityService.kt` declaration in `AndroidManifest.xml`.
  - Permission onboarding for `BIND_ACCESSIBILITY_SERVICE`, `RECORD_AUDIO`, `SYSTEM_ALERT_WINDOW`.
- **Acceptance Criteria**:
  - App launches on Android device/emulator with clean onboarding.
  - Accessibility service binds and detects foreground application package changes.

### Phase 2: Accessibility Tree Parser & Intelligent Pruning
- **Scope**: Fast, memory-efficient UI hierarchy extraction and pruning.
- **Deliverables**:
  - `AccessibilityTreeParser.kt`: Traverses `AccessibilityNodeInfo` to JSON.
  - `TreePruningEngine.kt`: Strips zero-semantic layout containers, filters non-clickable and non-text elements.
  - Node lookup index by `resource-id`, `content-description`, and `text`.
- **Acceptance Criteria**:
  - 85%+ node reduction on complex apps (WhatsApp, Chrome, YouTube).
  - Serialization latency $<30\text{ms}$.
  - Element references remain accurate for click/set-text dispatch.

### Phase 3: Agent Orchestration & Cognitive Reasoning
- **Scope**: Provider-independent model routing, prompt engineering, and structured task planner.
- **Deliverables**:
  - `GeminiProvider.kt` / `GeminiProvider.ts` integrating `gemini-3.8-flash`.
  - `ModelRouter`: Handles dynamic provider fallback and latency monitoring.
  - `TaskPlanner`: Generates step-by-step UI action sequences based on goal + pruned UI tree.
  - Disambiguation dialog generator for missing entity details.
- **Acceptance Criteria**:
  - 100% of LLM outputs validated against JSON schemas before dispatch.
  - Disambiguation triggers when multiple target candidates match user query.

### Phase 4: Human-In-The-Loop (HITL) Security Engine
- **Scope**: Centralized policy enforcement, staging engine, and approval interface.
- **Deliverables**:
  - `ActionPolicyEngine.kt` / `policy-engine.ts`: Categorization (Category A, B, C).
  - Staged action card showing exact app, contact, and message.
  - Cryptographic payload hashing (`SHA-256`) binding approval to immutable payload.
  - 30-second TTL countdown with automatic cancellation.
- **Acceptance Criteria**:
  - Category C actions cannot execute without verified user approval token.
  - Changing payload invalidates prior approval token immediately.
  - Execution audit trail logged to encrypted database.

### Phase 5: Voice Sensory Pipeline & Wake-Word
- **Scope**: On-device voice capture, wake phrase detection, speaker verification, and offline STT.
- **Deliverables**:
  - Wake-word listener for "Hey Nova" using lightweight TFLite / openWakeWord.
  - Speaker verification module using ECAPA-TDNN embeddings with 3-sample enrollment.
  - Offline STT provider abstraction (Vosk / Whisper-base).
  - Conversational approval listener for hands-free "Yes" / "Cancel".
- **Acceptance Criteria**:
  - Wake phrase triggers state change from `IDLE` to `LISTENING` with $<300\text{ms}$ latency.
  - Unenrolled voices cannot authenticate if verification threshold is set to strict.

### Phase 6: Core Third-Party App Integrations
- **Scope**: Native accessibility interaction recipes for key target applications.
- **Deliverables**:
  - WhatsApp: Contact search, chat navigation, message draft, stage send.
  - YouTube: Search navigation, query input, video result selection.
  - Email (Gmail): Recipient input, subject, body composition, stage send.
  - Files / Storage: Name-based search, latest file identification, stage attach/share.
- **Acceptance Criteria**:
  - Successful end-to-end execution of all 4 canonical interaction scenarios.

### Phase 7: Memory & Continuous Learning
- **Scope**: Multi-tier memory store for context retention and personalized aliases.
- **Deliverables**:
  - Short-term session context store with pronoun resolution.
  - Long-term preference store with user-editable alias dictionary.
  - Task execution history with query search and replay diagnostic.
- **Acceptance Criteria**:
  - User can ask "What did I ask you to do yesterday?" and receive accurate task logs.
  - Pronoun references ("send him a message") resolve using recent context.

### Phase 8: Windows Desktop Port
- **Scope**: Native Python/PySide6 desktop adaptation sharing identical architecture and schemas.
- **Deliverables**:
  - Python desktop client using `pywinauto` / Windows UI Automation.
  - Piper TTS and Faster-Whisper local engine integration.
  - Windows Credential Manager integration.
- **Acceptance Criteria**:
  - Desktop client executes identical action JSON schemas against Windows applications.
