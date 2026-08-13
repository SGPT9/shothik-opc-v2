# 🧠 Chat-to-Twin Agent Trigger & Experience Specification
## How & When the Second-Me Twin Agent is Dispatched Directly from Chat

**Target Platform**: Shothik AI / Polsia OPC (`release/v2.5.0-polsia-opc`)  
**Core Objective**: Define the exact triggers, intent recognition, and UI/UX experience for handing over tasks from active chat to the Second-Me Twin Agent.

---

## 1. Chat-to-Twin Trigger Funnel Architecture

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                CHAT-TO-TWIN AGENT TRIGGER EXPERIENCE                        │
 └─────────────────────────────────────────────────────────────────────────────┘
   User Chat Prompt ──► Intent Auto-Detection ──► Inline Twin Dispatch Card ──► Background Run
  ("Run this overnight")  (Task > 3 mins or Async)  ("Hand over to Twin (12 Credits)") (Tonight Engine)
```

---

## 2. The 3 Chat Trigger Scenarios for Twin Dispatch

### 📍 Trigger 1: Heavy / Long-Running Task Intent Auto-Detection
- **When It Triggers**: When the user's prompt involves multi-page scraping, deep research across 10+ sources, or complex code generation estimated to take >3 minutes.
- **Experience Layer Action**:
  - The chat AI auto-pauses active streaming and displays an **Inline Twin Dispatch Card**:
    ```text
    🧠 Heavy Task Detected: Deep Market Analysis
    Executing this in active chat may take 15 minutes.
    Would you like your Second-Me Twin to execute this in the background?
    
    Est. Cost: 12 Task Credits | Hostinger VPS Overnight Engine

    [ 🚀 Dispatch to Twin Agent (12 Credits) ]  [ ⚡ Run in Active Chat ]
    ```

---

### 📍 Trigger 2: Direct `@Twin` Slash Command or Mention
- **When It Triggers**: When the user explicitly types `@Twin` or `/twin` in the chat input composer ([`Composer.tsx`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/components/chat/Composer.tsx)).
- **Examples**:
  - `@Twin check competitor Facebook ad campaigns overnight`
  - `/twin audit my manuscript plot holes`
- **Experience Layer Action**:
  - Input field highlights in a subtle purple glow with a **"Twin Mode Active"** badge.
  - Automatically dispatches the task to the Twin background queue without blocking active chat.

---

### 📍 Trigger 3: Tonight Engine Overnight Toggle
- **When It Triggers**: When the user toggles the **Moon Icon (Tonight Engine)** in the `Composer.tsx` toolbar or types *"run this overnight"*.
- **Experience Layer Action**:
  - Dispatches the job to the **Hostinger VPS DeepSeek R1 worker** (`http://187.127.125.115:11434`).
  - Displays an **Overnight Job Status Card** in `Transcript.tsx` with a estimated completion time (*"Result ready tomorrow at 8:00 AM"*).

---

## 3. Experience Layer Touches for Twin Dispatches

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                     TWIN CHAT EXPERIENCE WIDGET                             │
 └─────────────────────────────────────────────────────────────────────────────┘
  1. Live Twin Progress Bar   │ Real-time step progress (Searching 1/10 sources...)
  2. Tab-Close Safety         │ User can safely close browser; job continues on VPS
  3. Spoken Completion Chime │ VTuber Voice Avatar alerts user upon task completion
```

### 🎨 1. Live Twin Progress Widget in Chat Thread
- An animated **Twin Pulse Status Card** appears directly inside the chat thread displaying real-time execution steps without reloading the page.

### 🎨 2. Zero-Loss Background Continuity
- The user can close their laptop or navigate to another page; the Twin continues executing on the **InsForge PostgreSQL & Hostinger VPS background queue**.

### 🎨 3. Voice Avatar Completion Notification
- Upon completion, the **VTuber 3D Voice Avatar** ([`vtuber-presenter.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/lib/infrastructure/vtuber-presenter.ts)) speaks a notification when the user returns (*"আপনার Twin ওভারনাইট অ্যানালাইসিস কমপ্লিট করেছে!"*).

---

## 🧪 Certified Infrastructure Status
- **Twin Dispatcher Service**: Active in [`twin-research-dispatcher.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/services/twin-research-dispatcher.ts).
- **Tonight Engine Client**: Active in [`llm-overnight-client.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/lib/tonight-engine/llm-overnight-client.ts).
- **Git Remote**: Synchronized on `origin release/v2.5.0-polsia-opc` ([`12780ba`](https://github.com/ahsanhab919-ux/shothik-opc-v2/commit/12780ba)).
