# NOVA — Voice-Controlled Personal AI Operating System

NOVA is a production-grade, modular, voice-controlled personal AI operating system that translates spoken human instructions into verifiable, policy-governed actions across mobile and desktop environments without delegating unchecked authority to the language model.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were aligned during Phase 1 interactive clarification:
> - **Runtime & Interface Structure**: An interactive NOVA OS Console and live Android runtime simulator, allowing real-time voice interaction, accessibility tree inspection, state transitions, and HITL approvals in this browser environment, backed by clean Android Kotlin module contracts.
> - **Primary Cognitive Reasoning Model**: `gemini-3.8-flash` (Gemini Flash series) with structured JSON schemas for low-latency voice reasoning, multi-step planning, and UI grounding.
> - **Voice Pipeline**: Continuous listening engine with "Hey Nova" wake-word detection, live Voice Activity Detection (VAD), speaker enrollment/verification simulation, and speech-to-text fallback.
> - **Phase 0 Deliverables**: We will deliver the core foundational documentation (`ARCHITECTURE.md`, `DEVELOPMENT_PLAN.md`, `TECHNICAL_DECISIONS.md`), schemas, state machine contracts, and the initial working foundation.

---

## 1. Overview & Core Concept

### What It Does
NOVA operates as an intelligent human assistant on mobile and desktop devices. When the user activates NOVA with the customizable wake phrase ("Hey Nova"), it captures speech, verifies speaker identity against enrolled voice samples, transcribes the command, and orchestrates an intelligent agent loop. 

Crucially, NOVA does not merely chat: it inspects the live accessibility UI hierarchy of target applications (e.g., WhatsApp, YouTube, Gmail, Files), plans multi-step interaction sequences, stages modifications, presents high-risk actions to the user in a Human-In-The-Loop (HITL) approval dialog with a strict timeout, executes verified clicks/text inputs, and verifies final UI states.

### Target Audience & Persona
Power users, accessibility-dependent users, and mobile professionals seeking hands-free, voice-directed automation across everyday applications with transparent security guarantees.

### Key Value
- **Zero Unchecked AI Hallucination**: The LLM outputs strict JSON action plans validated by typed schemas; it never directly touches system APIs or bypasses security checks.
- **Enforced Human-in-the-Loop**: High-risk mutations (sending messages, deleting files, financial transactions) are cryptographically bound to explicit user approval.
- **Resilient UI Automation**: Tree-pruned accessibility parsing with fallback visual inspection ensures navigation succeeds even across dynamic Android views.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌─────────────────┐       ┌─────────────────┐       ┌──────────────────┐
│  "Hey Nova"     │  ───> │  Voice Capture  │  ───> │  Speaker Auth &  │
│  Wake Word      │       │  & VAD Stream   │       │  STT Transcribe  │
└─────────────────┘       └─────────────────┘       └──────────────────┘
                                                              │
                                                              ▼
┌─────────────────┐       ┌─────────────────┐       ┌──────────────────┐
│  HITL Approval  │  <─── │  Staging & Risk │  <─── │  Reasoning &     │
│  (Yes/Edit/No)  │       │  Classification │       │  UI Tree Parsing │
└─────────────────┘       └─────────────────┘       └──────────────────┘
        │
        ▼ (Approved)
┌─────────────────┐       ┌─────────────────┐       ┌──────────────────┐
│  Accessibility  │  ───> │  UI State       │  ───> │  Spoken TTS      │
│  Action Exec    │       │  Verification   │       │  Confirmation    │
└─────────────────┘       └─────────────────┘       └──────────────────┘
```

1. **Wake & Listen Flow**: Continuous listening with visual audio spectrum and wake phrase detection triggers the state coordinator (`IDLE` $\rightarrow$ `LISTENING` $\rightarrow$ `AUTHENTICATING` $\rightarrow$ `TRANSCRIBING`).
2. **Cognitive Planning Flow**: NOVA receives transcribed intent ("send a WhatsApp message to Uday saying I am waiting for him"), extracts entities, captures the target app UI hierarchy, and constructs a structured multi-step plan.
3. **HITL Review & Staging Flow**: High-risk operations stage a human-readable action card detailing exact application, contact, and message body. The assistant speaks the prompt: *"I drafted the message to Uday. Should I send it?"* A 30-second countdown timer runs with instant cancellation if target state mutates.
4. **Execution & Verification Flow**: Upon explicit approval ("Yes" or button click), the accessibility bridge executes the click, verifies text entry in the message node, confirms message transmission, and returns to `COMPLETED`.

### Visual Identity & Theme
- **Aesthetic Direction**: Utilitarian, precision-engineered operating system console and mobile runtime simulator. High visual density, crisp typography, and restrained dark slate surfaces.
- **Color Palette & Mood**:
  - Dominant Neutral Canvas (60%): `#090D16` (Deep Midnight Slate) with `#0F172A` structural cards.
  - Structural Surfaces (30%): Hairline borders (`rgba(255, 255, 255, 0.08)`), subtle cool gray dividers, and high-legibility muted text (`#94A3B8`).
  - Accent Budget (10%): 
    - Active / Nominal / Listening: Emerald Green (`#10B981`)
    - Staged / Awaiting Approval: Amber / Topaz (`#F59E0B`)
    - Destructive / High Risk / Security: Crimson / Ruby (`#EF4444`)
    - Cognitive AI Processing: Cyan / Indigo (`#6366F1`)
- **Typography**:
  - Display & Headings: `Plus Jakarta Sans` (weights 600, 700)
  - Body Prose: `Plus Jakarta Sans` (14px–15px, weight 400)
  - Data, Telemetry, Node IDs & Timestamps: `JetBrains Mono` with `tabular-nums`
- **Layout Structure**:
  - **Top Navigation Bar Contract**: One-line brand wordmark ("NOVA OS // v0.1-ALPHA"), clean text navigation links (Console, Simulator, Memory, Security, Specs), and a primary voice listening toggle button.
  - **Left Pane (48% width)**: NOVA Sensory Engine & State Coordinator. Contains real-time audio waveform, 15-state FSM state badge, cognitive reasoning inspector (prompt $\rightarrow$ plan JSON $\rightarrow$ action execution), memory inspector, and audit log.
  - **Right Pane (52% width)**: Interactive Android Device Simulator. Visualizes an Android 15 device running simulated applications (WhatsApp, YouTube, Gmail, Storage Manager, System Settings), live Accessibility Tree viewer with element bounding highlights, and the interactive Human-In-The-Loop approval modal overlay.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Deterministic 15-State Finite State Machine (FSM)
- **Chosen Approach**: Centralized, deterministic TypeScript/Kotlin state machine controlling all valid lifecycle states (`IDLE`, `LISTENING`, `AUTHENTICATING`, `TRANSCRIBING`, `UNDERSTANDING`, `OBSERVING`, `PLANNING`, `DISAMBIGUATING`, `STAGING`, `AWAITING_APPROVAL`, `EXECUTING`, `VERIFYING`, `COMPLETED`, `FAILED`, `CANCELLED`).
- **Why**: The LLM must NEVER independently dictate state transitions or bypass approval checks. Deterministic code guarantees that a staged high-risk mutation cannot execute without transitioning through `AWAITING_APPROVAL`.
- **Alternatives Considered**: Autonomous ReAct agent loop. Rejected because autonomous loops can hallucinate action confirmations or loop infinitely on unexpected UI changes.

### Decision 2: 3-Tier Action Policy Engine & Cryptographic Action Binding
- **Chosen Approach**: Categorize all operations into `READ_ONLY` (Category A: open app, search, read screen), `LOW_RISK_MUTATION` (Category B: typing draft, changing non-sensitive preferences), and `HIGH_RISK_MUTATION` (Category C: sending messages, deleting files, financial transfers). Category C requires explicit human approval bound to a cryptographic SHA-256 hash of the exact payload.
- **Why**: Prevents prompt injection or race conditions where approval given for "send draft A" is diverted to "send draft B".
- **Alternatives Considered**: General voice confirmation without payload hashing. Rejected as vulnerable to context drift.

### Decision 3: Dual-Target Architecture (Interactive Simulator + Android Kotlin Blueprint)
- **Chosen Approach**: Implement the operational AI engine, state machine, voice pipeline, and simulated accessibility bridge in the web workspace so the assistant can be immediately experienced and tested end-to-end; simultaneously structure clean Android Kotlin source packages (`app/src/main/java/com/nova/assistant/...`) and architectural contracts matching production Android requirements.
- **Why**: Allows instant live testing of conversational flows, Gemini reasoning, and accessibility workflows while maintaining an exact production Android codebase structure.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       NOVA PERSONAL AI OPERATING SYSTEM                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  LAYER 1: SENSORY ENGINE     │              │  LAYER 2: STATE COORDINATOR  │
│  - Wake Word ("Hey Nova")    │              │  - 15-State Deterministic FSM│
│  - Audio Capture & VAD       │ ── Events ─> │  - Task Execution Context    │
│  - Speaker Enrollment/Verify │              │  - Session & History Manager │
│  - STT Provider (Web/Whisper)│              │  - Timeout & Retry Policies  │
└──────────────────────────────┘              └──────────────────────────────┘
                                                              │
                                                              ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  LAYER 4: EXECUTION ENGINE   │              │  LAYER 3: COGNITIVE ENGINE   │
│  - Accessibility Bridge      │ <── Actions ──│  - Gemini 3.8 Flash Provider │
│  - Hierarchy Serialization   │              │  - Structured JSON Schemas   │
│  - Tree Pruning Engine       │ ── Tree UI ─>│  - Intent & Entity Parser    │
│  - Node Action Dispatcher    │              │  - Multi-Step Task Planner   │
└──────────────────────────────┘              └──────────────────────────────┘
            │                                                 ▲
            ▼                                                 │
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  HUMAN-IN-THE-LOOP (HITL)    │              │  LAYER 5: SECURITY & MEMORY  │
│  - Risk Categorization (A/B/C)│              │  - Short-Term Session Cache  │
│  - Staged Action Payload     │              │  - Long-Term User Prefs      │
│  - Cryptographic Binding     │              │  - Execution Audit Trail     │
│  - 30s Countdown & Cancel    │              │  - Redacted Secret Vault     │
└──────────────────────────────┘              └──────────────────────────────┘
```

### 15-State FSM State Machine

```
   ┌───────────┐
   │   IDLE    │ ◄────────────────────────┐
   └─────┬─────┘                          │
         │ Wake Word Detected             │
         ▼                                │
   ┌───────────┐                          │
   │ LISTENING │                          │
   └─────┬─────┘                          │
         │ Speech Complete                │
         ▼                                │
   ┌────────────────┐                     │
   │ AUTHENTICATING │                     │
   └─────┬──────────┘                     │
         │ Speaker Verified               │
         ▼                                │
   ┌─────────────┐                        │
   │TRANSCRIBING │                        │
   └─────┬───────┘                        │
         │ Transcript Ready               │
         ▼                                │
   ┌───────────────┐                      │
   │ UNDERSTANDING │                      │
   └─────┬─────────┘                      │
         │ Needs UI Context               │
         ▼                                │
   ┌───────────┐                          │
   │ OBSERVING │                          │
   └─────┬─────┘                          │
         │ UI Tree Extracted              │
         ▼                                │
   ┌──────────┐   Ambiguous?   ┌────────────────┐
   │ PLANNING │ ─────────────> │ DISAMBIGUATING │
   └─────┬────┘                └───────┬────────┘
         │                             │ Resolved
         ▼ ◄───────────────────────────┘
   ┌─────────┐
   │ STAGING │
   └────┬────┘
        ├─────────────────────────────┐
        │ High Risk (Cat C)           │ Read Only / Low Risk (Cat A/B)
        ▼                             │
 ┌──────────────────┐                 │
 │AWAITING_APPROVAL │                 │
 └──────┬─────┬─────┘                 │
        │     │ User Cancel / Timeout │
        │     └─────────────────────> ┼──> ┌───────────┐
        │ Approved                    │    │ CANCELLED │
        ▼                             │    └───────────┘
   ┌───────────┐                      │
   │ EXECUTING │ ◄────────────────────┘
   └─────┬─────┘
         │ Action Dispatched
         ▼
   ┌───────────┐
   │ VERIFYING │
   └─────┬─────┘
         ├──────────────────┐
         │ Verified         │ Failed verification
         ▼                  ▼
   ┌───────────┐      ┌────────┐
   │ COMPLETED │      │ FAILED │
   └─────┬─────┘      └───┬────┘
         │                │
         └────────────────┴───────> (Return to IDLE)
```

### Action JSON Schema Specification
Every cognitive output conforms to typed schemas validated before execution:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "NovaActionPlan",
  "type": "object",
  "properties": {
    "taskId": { "type": "string" },
    "intent": {
      "type": "string",
      "enum": ["SEND_MESSAGE", "SEARCH_APP", "OPEN_APP", "FIND_FILE", "SYSTEM_SETTING", "CONVERSATIONAL_QUERY"]
    },
    "targetApp": { "type": "string" },
    "entities": {
      "type": "object",
      "properties": {
        "contact": { "type": "string" },
        "message": { "type": "string" },
        "searchQuery": { "type": "string" },
        "fileName": { "type": "string" }
      }
    },
    "riskLevel": {
      "type": "string",
      "enum": ["READ_ONLY", "LOW_RISK_MUTATION", "HIGH_RISK_MUTATION"]
    },
    "requiresConfirmation": { "type": "boolean" },
    "stagedSummary": { "type": "string" },
    "steps": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "stepIndex": { "type": "integer" },
          "actionType": {
            "type": "string",
            "enum": ["LAUNCH_PACKAGE", "CLICK_NODE", "SET_TEXT", "SCROLL", "VERIFY_ELEMENT"]
          },
          "targetNodeId": { "type": "string" },
          "targetText": { "type": "string" },
          "payload": { "type": "string" }
        },
        "required": ["stepIndex", "actionType"]
      }
    }
  },
  "required": ["taskId", "intent", "targetApp", "riskLevel", "requiresConfirmation", "steps"]
}
```

---

## 5. Development Phases & Roadmap

### Phase 0: Repository, Specs & Architecture (Current Turn Target)
- Produce `ARCHITECTURE.md`, `DEVELOPMENT_PLAN.md`, `TECHNICAL_DECISIONS.md`, and `DEVELOPMENT_STATUS.md`.
- Establish Android Kotlin package structure contracts (`app/src/main/java/com/nova/assistant/...`).
- Deliver the initial foundational workstation:
  - Central 15-state FSM implementation with event dispatcher.
  - Server-side Gemini cognitive reasoning proxy (`/api/agent/reason`) using `@google/genai` and structured schema generation.
  - Interactive OS Console UI: Voice waveform, live state transitions, and memory inspector.
  - Interactive Android Simulator: Running interactive apps (WhatsApp, YouTube, Files, Email) with accessibility node inspection and tree pruning.
  - HITL Approval Engine with countdown, cryptographic payload binding, approval/rejection handlers, and verification.

### Phase 1: Android Foundation & Accessibility Engine
- Accessibility Service implementation (`NovaAccessibilityService.kt`).
- Tree serializer with intelligent pruning (stripping decorative layout containers).
- Element locator and action dispatcher (`ACTION_CLICK`, `ACTION_SET_TEXT`).

### Phase 2: Cognitive Reasoning & Multi-Step Task Planner
- ModelRouter with Gemini 3.8 Flash provider.
- Context manager maintaining active app state and conversation turns.
- Plan generator with fallback disambiguation.

### Phase 3: HITL Security & Approval Policy Engine
- Action policy enforcement (Category A, B, C).
- Staging and timeout invalidation.
- Audit trail logging and encrypted storage.

### Phase 4: Sensory Voice Pipeline
- Web Speech API + audio stream processor.
- Audio spectrum visualizer and Hey Nova wake-word detection.
- Voice enrollment and cosine similarity verification.

### Phase 5: Production Refinements & Desktop Adaptation Blueprint
- Comprehensive automated test suite for FSM, policy engine, and action serializer.
- Cross-platform architectural abstraction for future Windows desktop port.
