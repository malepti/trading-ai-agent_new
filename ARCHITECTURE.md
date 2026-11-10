# ARCHITECTURE.md: NOVA Operating System

## 1. System Overview

NOVA is a modular, voice-controlled personal AI operating system architected to understand conversational natural language, plan task sequences, inspect host operating system user interfaces via accessibility bridges, and safely execute mutations subject to deterministic policy controls and human-in-the-loop (HITL) approval.

The system is structured as five decoupled layers plus a centralized cross-cutting security and approval engine:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NOVA SYSTEM ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  LAYER 1: SENSORY ENGINE     │              │  LAYER 2: STATE COORDINATOR  │
│  - Wake Word ("Hey Nova")    │              │  - 15-State Deterministic FSM│
│  - Speaker Verification      │ ── Events ─> │  - Task Execution Context    │
│  - Speech-to-Text (STT)      │              │  - Session & History Manager │
│  - Audio Pipeline & VAD      │              │  - Timeout & Cancellation    │
└──────────────────────────────┘              └──────────────────────────────┘
                                                              │
                                                              ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  LAYER 4: EXECUTION ENGINE   │              │  LAYER 3: COGNITIVE ENGINE   │
│  - Accessibility Bridge      │ <── Actions ──│  - Gemini 3.8 Flash Provider │
│  - Hierarchy Serialization   │              │  - ModelRouter & Fallbacks   │
│  - Tree Pruning Engine       │ ── UI Tree ─>│  - Intent & Task Planner     │
│  - UI Node Action Dispatcher │              │  - Action Schema Validator   │
└──────────────────────────────┘              └──────────────────────────────┘
            │                                                 ▲
            ▼                                                 │
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  HUMAN-IN-THE-LOOP (HITL)    │              │  LAYER 5: SECURITY VAULT     │
│  - 3-Category Risk Classifier│              │  - Short-Term Session Cache  │
│  - Action-Bound Approval     │              │  - Long-Term User Preferences│
│  - Cryptographic Hash Auth   │              │  - Execution Audit Logger    │
│  - 30s Revalidation Timeout  │              │  - Encrypted Credential Vault│
└──────────────────────────────┘              └──────────────────────────────┘
```

---

## 2. Layer 1: On-Device Sensory Engine

### 2.1 Wake Word Detection
- **Objective**: Passive, ultra-low-power listening for trigger phrase `"Hey Nova"` (customizable).
- **Android Target**: `openWakeWord` or lightweight TFLite model running inside a foreground service with `FOREGROUND_SERVICE_MICROPHONE` permission.
- **Web Simulation**: Continuous audio analysis using Web Audio API RMS energy detection and Web Speech API continuous grammar matching.

### 2.2 Speaker Verification
- **Objective**: Biometric identity confirmation before processing requests.
- **Model Architecture**: ECAPA-TDNN (Emphasized Channel Attention, Propagation and Aggregation in TDNN) extracting 192-dimensional speaker embeddings.
- **Enrollment Protocol**: User speaks 3 calibration phrases to generate an enrolled centroid vector.
- **Authentication**: Cosine similarity score $S = \frac{u \cdot v}{\|u\| \|v\|}$. 
  - Acceptance threshold: $\tau \ge 0.82$.
  - Low confidence triggers secondary PIN or biometric prompt.
  - Critical Policy: Voice verification alone never authorizes Category C mutations.

### 2.3 Speech-to-Text (STT)
- **Local Target**: Vosk offline STT engine or Whisper-base TFLite.
- **Cloud Fallback**: Server-side audio transcription via Google GenAI SDK.
- **Voice Activity Detection (VAD)**: Energy thresholding with 800ms trailing silence cutoff to trigger automatic transcription dispatch.

---

## 3. Layer 2: Interactive State Coordinator

The State Coordinator maintains strict operational safety using a 15-state deterministic Finite State Machine (FSM). The Large Language Model (LLM) is strictly treated as an analytical sub-component and **never** directly mutates the state machine.

### 3.1 State Definitions
1. `IDLE`: Resting state, waiting for wake word or manual voice trigger.
2. `LISTENING`: Microphone active, streaming audio into buffer and running VAD.
3. `AUTHENTICATING`: Computing speaker embedding and verifying against enrolled voice profile.
4. `TRANSCRIBING`: Converting speech audio segment to normalized text.
5. `UNDERSTANDING`: Extracting intent, entities, and required capabilities.
6. `OBSERVING`: Capturing active window package and serializing accessibility hierarchy.
7. `PLANNING`: Synthesizing user intent + UI hierarchy into structured action plan.
8. `DISAMBIGUATING`: Solves ambiguous entity references (e.g. multiple contacts named "Uday") via conversational clarification.
9. `STAGING`: Formatting payload, computing risk classification, and generating preview.
10. `AWAITING_APPROVAL`: Suspended state for Category C operations; 30-second timeout running.
11. `EXECUTING`: Dispatching low-level accessibility action (`CLICK`, `SET_TEXT`, `SCROLL`).
12. `VERIFYING`: Re-inspecting UI hierarchy to confirm target mutation succeeded.
13. `COMPLETED`: Reporting success to user via audio TTS and UI feedback.
14. `FAILED`: Gracefully reporting failure with actionable diagnostic and recovery options.
15. `CANCELLED`: Immediate teardown upon user command or safety policy violation.

---

## 4. Layer 3: Cognitive Reasoning Engine

### 4.1 Model Routing & Provider Abstraction
```
                    ┌─────────────────────────┐
                    │      ModelRouter        │
                    └────────────┬────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       ┌───────────────────┐           ┌───────────────────┐
       │  GeminiProvider   │           │   OllamaProvider  │
       │ (gemini-3.8-flash)│           │ (Local LLM / Dev) │
       └───────────────────┘           └───────────────────┘
```
- Primary Production Provider: `gemini-3.8-flash` via `@google/genai` TypeScript SDK on Node.js/Express backend.
- Low-latency structured output enforced via `responseMimeType: "application/json"` and strict `responseSchema`.
- Model router dynamically switches between cloud and local providers based on connectivity and privacy configuration.

### 4.2 Structured Plan Output Contract
Plans are strictly validated against JSON schema definitions:
```json
{
  "taskId": "task-uuid-v4",
  "intent": "SEND_MESSAGE",
  "targetApp": "com.whatsapp",
  "entities": {
    "contact": "Uday",
    "message": "I am waiting for him."
  },
  "riskLevel": "HIGH_RISK_MUTATION",
  "requiresConfirmation": true,
  "stagedSummary": "Send WhatsApp message to Uday: 'I am waiting for him.'",
  "steps": [
    { "stepIndex": 1, "actionType": "LAUNCH_PACKAGE", "targetApp": "com.whatsapp" },
    { "stepIndex": 2, "actionType": "CLICK_NODE", "targetNodeId": "com.whatsapp:id/search" },
    { "stepIndex": 3, "actionType": "SET_TEXT", "targetNodeId": "com.whatsapp:id/search_src_text", "payload": "Uday" },
    { "stepIndex": 4, "actionType": "CLICK_NODE", "targetNodeId": "com.whatsapp:id/contact_row_uday" },
    { "stepIndex": 5, "actionType": "SET_TEXT", "targetNodeId": "com.whatsapp:id/entry", "payload": "I am waiting for him." },
    { "stepIndex": 6, "actionType": "STAGE_ACTION", "targetNodeId": "com.whatsapp:id/send" }
  ]
}
```

---

## 5. Layer 4: Android OS Execution Engine

### 5.1 Android Accessibility Service (`NovaAccessibilityService`)
- Subscribed to `AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED` and `TYPE_WINDOW_CONTENT_CHANGED`.
- Traverses `AccessibilityNodeInfo` hierarchy and applies **Intelligent Tree Pruning**:
  - Eliminates purely decorative containers (`FrameLayout`, `LinearLayout` with single child and no description/clickability).
  - Retains actionable elements (`clickable=true`, `focusable=true`, `editable=true`).
  - Retains semantic context (`text.isNotEmpty()`, `contentDescription.isNotEmpty()`).
  - Output compression reduces raw node trees from 300+ nodes to 15–30 high-value actionable nodes, reducing LLM token consumption by 85%.

### 5.2 Action Dispatcher
- Dispatches native accessibility actions:
  - `AccessibilityNodeInfo.ACTION_CLICK`
  - `AccessibilityNodeInfo.ACTION_SET_TEXT` (via `Bundle(ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE)`)
  - `AccessibilityNodeInfo.ACTION_SCROLL_FORWARD` / `ACTION_SCROLL_BACKWARD`
- Visual Fallback: If accessibility nodes are masked (e.g. Flutter/Unity canvas), MediaProjection captures frame, queries Gemini Vision with pixel coordinates, and simulates input via Android `AccessibilityService.dispatchGesture`.

---

## 6. Human-In-The-Loop (HITL) Security Engine

### 6.1 Action Risk Categorization
- **Category A: READ_ONLY**:
  - Launch application, view screen, search query, read notifications, list files.
  - Policy: Authorized automatically under active user session.
- **Category B: LOW_RISK_MUTATION**:
  - Typing into draft field, saving local temporary notes, toggling dark mode.
  - Policy: Configurable auto-approval with undo capability.
- **Category C: HIGH_RISK_MUTATION**:
  - Sending messages, sending emails, deleting files, money transfer, setting changes.
  - Policy: **Mandatory Human Approval**. Requires explicit user consent via spoken "Yes" or UI button click.

### 6.2 Cryptographic Payload Binding
To prevent execution hijacking or context tampering:
1. When a Category C action is staged, a SHA-256 fingerprint is generated:
   $$\text{Hash} = \text{SHA-256}(\text{taskId} \mathbin{\Vert} \text{targetApp} \mathbin{\Vert} \text{targetNodeId} \mathbin{\Vert} \text{payload})$$
2. The approval token is uniquely tied to this hash.
3. If the user edits the message, the hash recalculates, immediately invalidating previous approval.
4. Approval tokens expire after a 30-second TTL countdown. Silence is never interpreted as consent.

---

## 7. Memory Architecture

1. **Short-Term Memory (Session Context)**:
   - Rolling conversation turns, pronoun references ("send him", "it"), currently active application package, and last extracted UI state.
2. **Long-Term Memory (Preferences & Aliases)**:
   - User-approved contact aliases (e.g., "Dad" $\rightarrow$ "+15550192", "HR" $\rightarrow$ "recruiting@company.com").
   - Frequently opened applications and preferred default apps.
3. **Execution History & Audit Trail**:
   - Structured logs recording `timestamp`, `taskId`, `intent`, `riskCategory`, `approvalMethod`, `executionDurationMs`, and `resultStatus`.
   - Stored in encrypted SQLite / Room database.
