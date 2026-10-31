# Architecture Design Document: Unified DeepTech Supabase Transformation

**Document Date:** October 30, 2026  
**Status:** Approved by Human Partner — Ready for Implementation Planning  
**Target Systems:** Shothik AI Monorepo (`@workspace/api-server`, `@workspace/db`, `@workspace/web`), Supabase Project `supabase-erin-yacht` (`xgnzsikvguswhtozvokx`), Bangla Voice AI (`bangla-audio-ai`).

---

## 1. Intent and the "Why"

Shothik AI currently leverages Supabase PostgreSQL for hardened relational storage with Zero-Trust Row-Level Security (RLS) across 35 tables. However, critical user-facing intelligence, asset storage, and collaborative workflows currently operate either in-memory or on local disk. 

This design establishes a **Unified DeepTech Supabase Architecture** that elevates Shothik to parity with global AI leaders (ChatGPT, Perplexity Pro, Cursor, and Figma/Miro). By orchestrating **Supabase Realtime**, **Storage with TUS protocols**, **pgvector hybrid search**, **ephemeral temp execution sandboxes**, **shared GitHub repository synchronization**, and **Figma-style frictionless room link collaboration**, Shothik transforms into a world-class, collaborative vernacular AI platform tailored for Bangladesh and international creators.

---

## 2. Goals, Non-Goals, and Anti-Goals

### 2.1 Goals
1. **Multiplayer Monaco Writing Studio with Share Link Access**: Enable Figma/Miro-style instant room link collaboration with colored user cursors, presence selection indicators, and conflict-free text synchronization via Yjs over Supabase Broadcast channels.
2. **Inline AI Copilot & Ghost Typing**: Stream AI sentence completions and color-coded inline diffs directly into Monaco decorations with sub-50ms render latency.
3. **Perplexity-Grade Repository Knowledge**: Ingest and index connected GitHub repositories (chapters, research dossiers, `.shothik/` style guides) into Supabase `pgvector`, enabling whole-repository queries (`@chapters`) with clickable Git commit/lineage citations.
4. **ChatGPT-Style Ephemeral Sandbox Analysis**: Support drag-and-drop ingestion of large CSVs, PDFs, and audio recordings into short-lived, signed Supabase Storage buckets (`/temp/:sessionId`) with automated 24-hour TTL expiration, executed via our existing Node/Python code sandbox.
5. **Sub-Second Voice Waveform Streaming**: Stream 200ms generated audio chunks from our local Intel Arc dGPU voice engine over Supabase Realtime Broadcast, rendering live waveforms and beginning audio playback within 200ms.
6. **Zero-Friction Onboarding & Resilient Sync**: Enable anonymous guest writing sessions that seamlessly convert into permanent authenticated accounts, backed by our edge-to-cloud SQLite offline sync engine.

### 2.2 Non-Goals
* **Replacing Git**: We are not building a full Git VCS host; we are using GitHub's REST/GraphQL APIs for bi-directional synchronization and commit authoring.
* **Open Unrestricted PostgREST**: The Supabase Data API is strictly gated by Zero-Trust RLS; public access requires a valid room `share_token` or authenticated JWT.
* **Client-Side Heavy Vector Computations**: All embedding generation and dense vector indexing happen server-side or via Supabase pgvector; client browsers only receive lightweight ranked search results.

### 2.3 Anti-Goals
* **No Database Polling on Keystrokes**: Never write individual keystrokes or cursor updates directly to PostgreSQL tables. Ephemeral cursor locations and typing indicators must flow exclusively through in-memory Supabase Realtime channels.
* **No Hard Lockouts on Network Drop**: Never freeze or block the Monaco Editor UI when the user loses internet connection. All edits must buffer locally in SQLite and replay automatically on reconnect.
* **No Unauthenticated File Leaks**: Never expose raw temporary files, voice takes, or thesis drafts via public non-expiring URLs. All file access must be protected by signed pre-authenticated tokens or RLS-backed storage policies.

---

## 3. Constraints & Architecture Decisions

1. **Collaboration Authorization (Figma / Miro Style Room Links)**:
   * Projects feature a cryptographically random `share_token` (e.g. `prj_sh_8f3a9b21`) and an optional `room_passcode_hash`.
   * Access modes: `private` (owner only), `link_view` (read-only with share link), `link_edit` (full co-authoring with share link or passcode).
   * RLS policies permit access if `auth.uid() = user_id` OR `projects.share_token = current_setting('request.headers', true)::json->>'x-project-share-token'`.
2. **Code Sandbox Execution**:
   * Uses the pre-built sandbox runner (`artifacts/api-server/src/routes/sandbox.ts` / `codeSandbox.execute`), executing scripts in hardened Node.js, Python, and Bash sub-processes with resource caps.
3. **Anonymous Guest Onboarding**:
   * Guest users type and draft instantly in their local SQLite buffer. Upon registration or login (Google/Phone OTP), the client calls `offlineSyncEngine.syncAll()` to atomically reconcile and push local drafts to Supabase PostgreSQL without loss.
4. **Voice Audio Streaming**:
   * Chunks are broadcast from the Intel Arc `:8001` engine in 200ms segments as compact Base64 Opus/WAV frames (~8KB) over Supabase Realtime channel `voice:${sessionId}`, easily meeting the 200ms latency ceiling.
5. **Yjs CRDT Document Authority**:
   * A single client leader elected dynamically via Supabase Presence flushes debounced document text updates to `projects` and `writing_autosave` every 5 seconds of inactivity, eliminating write races and pooler contention.

---

## 4. Architectural Specification by Milestones

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SHOTHIK CLIENT INTERFACES                             │
│      Monaco Writing Studio   •   AI Twin & Chat   •   Bangla Voice Studio   │
└──────────────────────┬──────────────────────┬───────────────────────────────┘
                       │                      │
                       ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE DATA & REALTIME                          │
│   Realtime Channels (Presence / Broadcast)  •  Storage (TUS Resumable)      │
│   Data API (PostgREST / pg_graphql)         •  pgvector Hybrid Search       │
└──────────────────────┬──────────────────────┬───────────────────────────────┘
                       │                      │
                       ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SHOTHIK API & HARDENED INFRA                         │
│   Edge-to-Cloud Sync Engine  •  Letta Twin Engine  •  Code Sandbox Runner   │
│   Intel Arc Voice AI Server  •  PostgreSQL 17.6 (Zero-Trust RLS Policies)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Milestone 1: Data Infrastructure & Storage Foundation
1. **Supabase Storage Buckets**:
   * `temp-sandboxes`: Ephemeral bucket for drag-and-drop CSVs, deeds, and scratchpad files. Configured with a 24-hour lifecycle TTL rule.
   * `manuscripts`: Resumable TUS storage bucket for PDF/DOCX academic thesis files and book exports.
   * `audio-assets`: Chunked storage bucket for master voice takes and audiobook chapters.
2. **Storage RLS Policies**:
   * Enforce bucket-level RLS: Users can only upload, read, and delete files under their own `auth.uid()` prefix (`/${bucket}/${userId}/*`).
3. **Schema Enhancements**:
   * Add `share_token` (text unique), `access_mode` (text default 'private'), `passcode_hash` (text nullable) to `projects` table.
   * Update RLS policies on `projects` to authorize access via `x-project-share-token`.
   * Create `document_embeddings` table with pgvector HNSW index for Bengali hybrid search.

### Milestone 2: Collaborative Monaco Studio & Realtime Presence
1. **Supabase Realtime Channel Topologies**:
   * Channel format: `project:${projectId}`.
   * **Presence State**: Tracks `{ userId, name, avatar, cursor: { lineNumber, column }, selection: { startLine, startColumn, endLine, endColumn }, color }`.
   * **Broadcast Events**:
     * `cursor-move`: Throttled to 30ms for 60fps smooth remote cursor animations.
     * `ghost-token-stream`: Streams AI completion chunks into dimmed inline Monaco decorations.
     * `diff-preview`: Broadcasts structured green/red replacement deltas.
2. **Yjs CRDT Synchronization**:
   * Use a lightweight `y-supabase` provider broadcasting state vectors over the Realtime channel.
   * Document debounced flush (via elected Presence leader) syncing clean document state to `projects` and `writing_autosave` tables.
3. **Visual Time-Travel Rollback**:
   * Query historical snapshots from `writing_autosave` and `projects` tables, displaying side-by-side Monaco diff views with a one-click restore mutation.

### Milestone 3: Letta Twin Knowledge Engine & GitHub Workspace
1. **Shared GitHub Repository Bridge**:
   * Enhance `POST /api/v1/connectors/github/sync` to index repository file trees into `document_embeddings`.
   * Support multi-file whole-repository context queries (`@chapters`, `@notes`).
2. **Git-Lineage Citation Metadata**:
   * Every citation returned in Chat or Studio includes `{ repo, branch, commitSha, filePath, startLine, endLine }`.
   * Clicking a citation highlights the source text directly in the Monaco sidebar or navigates to the external GitHub commit.
3. **Automated AI Editor PR Reviews**:
   * Webhook handler for GitHub Pull Requests. When a PR is created on a registered repo, the Letta Twin performs automated grammar, readability, and consistency checks, posting inline comments via GitHub's API.

### Milestone 4: Low-Latency Voice Streaming & Async Queue Pipeline
1. **Sub-Second Audio Waveform Streaming**:
   * Voice server on `:8001` generates Opus/WAV audio chunks and broadcasts binary frames over channel `voice:${sessionId}`.
   * Frontend Web Audio API initializes playback on the first 200ms chunk while the visual waveform animates in real time.
2. **Word-Synchronized Karaoke Teleprompter**:
   * Audio chunk metadata includes phoneme timestamp arrays `[{ word: "সোনার", startMs: 0, endMs: 420 }, ...]`.
   * Monaco editor applies synchronized highlighted span styles as each word is spoken.
3. **Typesetting Task Queue (`pgmq`)**:
   * Queue long-running Nilkhet book compilation tasks (EPUB/PDF generation with SolaimanLipi Bengali ligatures) in Postgres `pgmq`.
   * Realtime channel broadcasts step-by-step progress pills (`35%`, `70%`, `Done`) to the client.

---

## 5. What's Left to the Builder

* **Exact UI Color Schemes**: Selection colors for up to 8 concurrent collaborators (e.g., emerald, violet, amber, cyan).
* **Audio Transcoding Library Selection**: Selection between client-side Web Audio PCM decoder or lightweight WebAssembly Opus decoder for legacy browser compatibility.
* **Debounce Durations**: Tuning client-side cursor broadcast throttling between 25ms and 50ms based on local CPU usage.
