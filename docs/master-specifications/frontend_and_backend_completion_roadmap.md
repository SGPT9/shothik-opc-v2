# 🗺️ Shothik AI / Polsia OPC — Frontend & Backend Completion Roadmap

**Target Platform**: Shothik AI Web Platform (`shothik-web-mirror-v2`)  
**Target Branch**: `release/v2.5.0-polsia-opc`  
**InsForge BaaS Endpoint**: `https://ers8j28a.ap-southeast.insforge.app`  

---

## 1. Executive 2-Phase Execution Plan

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                  FRONTEND & BACKEND COMPLETION ROADMAP                      │
 ├─────────────────────────────────────────────────────────────────────────────┤
 │ PHASE 1: FRONTEND FINALIZATION (Mount UI Components & Experience Layer)     │
 │  1. Mount VTuber Voice Avatar Overlay in ChatAgentPage.tsx                  │
 │  2. Mount Inline Twin Dispatch Card in Transcript.tsx                       │
 │  3. Connect CommunityAstryxCard to /community Leaderboard                   │
 ├─────────────────────────────────────────────────────────────────────────────┤
 │ PHASE 2: INSFORGE BAAS BACKEND INTEGRATION (Database, Auth, Storage, WS)    │
 │  1. Apply InsForge PostgreSQL Tables & RLS Security Policies                │
 │  2. Wire InsForge React Auth UI (@insforge/sdk)                             │
 │  3. Create Storage Buckets (pitch-decks, ebook-exports, voice-avatars)      │
 │  4. Connect InsForge Realtime WebSocket Pub/Sub for Twin Job Updates        │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase 1: Frontend Finalization (Step-by-Step)

### Step 1.1: Mount VTuber Voice Avatar Overlay in `ChatAgentPage.tsx`
- Mount [`VTuberVoiceAvatarOverlay.tsx`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/components/voice/VTuberVoiceAvatarOverlay.tsx) in the floating action drawer of [`ChatAgentPage.tsx`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/components/agents/ChatAgentPage.tsx).

### Step 1.2: Mount Inline Twin Handover Card in `Transcript.tsx`
- Render the **Inline Twin Dispatch Card** when a prompt triggers heavy multi-step research (>3 mins), allowing 1-click handover to the Hostinger VPS background engine.

### Step 1.3: Connect `CommunityAstryxCard.tsx` to `/community` Leaderboard
- Render Meta Astryx StyleX-optimized agent cards on the `/community` page for zero-runtime CSS overhead.

---

## 3. Phase 2: InsForge BaaS Backend Integration (Step-by-Step)

### Step 2.1: InsForge PostgreSQL Schema & RLS Policies
- Configure `users`, `workspaces`, `task_credits`, `bkash_transactions`, and `twin_jobs` tables with Row-Level Security (`auth.uid() = user_id`).

### Step 2.2: InsForge Authentication Integration (`@insforge/sdk`)
- Wire Google OAuth and Email/Password sign-in flows using `@insforge/sdk`.

### Step 2.3: InsForge Storage Buckets Creation
- Provision storage buckets (`pitch-decks`, `ebook-exports`, `voice-avatars`) for storing generated PDFs, EPUBs, and audio files.

### Step 2.4: InsForge Realtime WebSocket Pub/Sub
- Connect WebSocket events for live bKash transaction confirmation and Twin job progress updates.

---

## 🧪 Next Immediate Action
We will execute **Phase 1 (Frontend Finalization)** by mounting the VTuber Voice Avatar and Inline Twin Handover Card in `ChatAgentPage.tsx` and `Transcript.tsx`!
