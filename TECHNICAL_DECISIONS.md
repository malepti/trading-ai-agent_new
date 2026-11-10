# TECHNICAL_DECISIONS.md: Architectural Decision Records (ADRs)

## ADR-001: Centralized Deterministic 15-State Finite State Machine (FSM)

### Context
Autonomous agent loops (e.g. LangChain AgentExecutor, ReAct loops) allow LLMs to decide their own control flow, tool execution order, and termination conditions. However, in an operating system assistant with permissions to send messages, delete files, and click arbitrary buttons, giving the LLM uncontrolled execution loops introduces critical security risks: prompt injection, hallucinated user confirmations, runaway loops, and accidental financial/personal data loss.

### Decision
We enforce a centralized, deterministic 15-State Finite State Machine (`IDLE`, `LISTENING`, `AUTHENTICATING`, `TRANSCRIBING`, `UNDERSTANDING`, `OBSERVING`, `PLANNING`, `DISAMBIGUATING`, `STAGING`, `AWAITING_APPROVAL`, `EXECUTING`, `VERIFYING`, `COMPLETED`, `FAILED`, `CANCELLED`).
The LLM is invoked solely as an analytical inference function during `PLANNING` or `DISAMBIGUATING`. It cannot alter the FSM state directly, skip `AWAITING_APPROVAL`, or force an `EXECUTING` transition.

### Consequences
- **Positive**: Strict, mathematically verifiable safety guarantees. High-risk mutations cannot execute without transitioning through explicit approval.
- **Negative**: Adds state management plumbing compared to simple prompt-in/text-out chatbots.

---

## ADR-002: 3-Tier Human-In-The-Loop (HITL) Action Policy Engine

### Context
Not all user instructions carry the same risk. Forcing user approval for opening an application or searching YouTube creates cognitive friction and degrades user experience. Conversely, sending a message or deleting files without approval risks irreparable mistakes.

### Decision
Categorize all system actions into three strict categories:
1. **Category A (`READ_ONLY`)**: Launch app, read screen, query search, inspect files. Auto-authorized during an authenticated session.
2. **Category B (`LOW_RISK_MUTATION`)**: Typing draft text, changing local theme, queuing a task. Auto-authorized with visual feedback and undo.
3. **Category C (`HIGH_RISK_MUTATION`)**: Sending messages, sending emails, deleting records, financial transactions, changing OS permissions. Mandatory explicit human approval required.

### Cryptographic Action-Binding
Every staged Category C action generates an immutable SHA-256 fingerprint:
$$\text{PayloadHash} = \text{SHA-256}(\text{taskId} + \text{targetApp} + \text{targetNodeId} + \text{payload})$$
The user approval token is explicitly bound to this exact hash. If the user edits the message text or recipient, the hash changes, invalidating previous approval.

---

## ADR-003: Tree-Pruned Accessibility Hierarchy vs. Raw Screenshots

### Context
Vision-language models (VLMs) can take full-screen screenshots and output $(x, y)$ coordinate taps. However, VLM screenshot inference has high latency (1500–4000ms), high token cost, and coordinate drift across screen resolutions.

### Decision
Prioritize the native **Android AccessibilityService** hierarchy. Parse `AccessibilityNodeInfo` into semantic JSON and apply intelligent layout pruning:
- Strip empty layout wrappers (`FrameLayout`, `LinearLayout` without accessibility tags).
- Preserve actionable controls (`isClickable`, `isEditable`, `isFocusable`).
- Preserve semantic content (`text`, `contentDescription`, `viewIdResourceName`).

### Fallback Policy
MediaProjection and coordinate-based VLM vision are reserved strictly as secondary fallbacks when accessibility nodes are obscured by custom canvas renderers (e.g., games or Flutter views).

---

## ADR-004: Server-Side Gemini API Proxy with Structured Output Schemas

### Context
Calling LLM APIs directly from client-side code exposes API keys and secrets. Furthermore, unconstrained LLM responses often output markdown preambles or malformed JSON that crashes parsers.

### Decision
All Gemini calls are executed server-side via Node.js/Express proxy routes using the official `@google/genai` TypeScript SDK (`gemini-3.8-flash`). We utilize `responseMimeType: "application/json"` with strict `responseSchema` definitions (`Type.OBJECT`, `Type.ARRAY`, `Type.STRING`, `Type.BOOLEAN`). The API key is stored in environment variables and never exposed to the client bundle.

---

## ADR-005: Dual-Target Architecture (Web Simulation Workstation & Android Blueprint)

### Context
Developing and validating conversational operating system flows requires immediate interactivity, audio testing, and visual state verification. However, production Android deployment requires native Kotlin, Jetpack Compose, and AccessibilityService APIs.

### Decision
We architect NOVA with a dual-target design:
1. **Interactive Web OS Console & Simulator**: Fully functional web workstation simulating the Android accessibility tree, real microphone capture, audio waveform, 15-state FSM, and live Gemini cognitive reasoning.
2. **Native Android Kotlin Codebase**: Canonical Kotlin architecture and contracts under `app/src/main/java/com/nova/assistant/...` conforming to Android 15, Hilt, Room, and AccessibilityService standards.
Both targets share identical schema contracts, state machine definitions, and security policies.
