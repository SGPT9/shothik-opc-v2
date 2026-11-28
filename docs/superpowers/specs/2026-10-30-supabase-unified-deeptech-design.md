# Architecture Design Document: Unified DeepTech Supabase Transformation

**Document Date:** October 30, 2026  
**Status:** Approved by Human Partner — Ready for Implementation Planning  
**Target Systems:** Shothik AI Monorepo (`@workspace/api-server`, `@workspace/db`, `@workspace/web`), Supabase Project `supabase-erin-yacht` (`xgnzsikvguswhtozvokx`), Bangla Voice AI (`bangla-audio-ai`).

---

## 1. Intent and the "Why"

Shothik AI currently leverages Supabase PostgreSQL for hardened relational storage with Zero-Trust Row-Level Security (RLS) across 35 tables. However, critical user-facing intelligence, asset storage, and collaborative workflows currently operate either in-memory or on local disk. 

This design establishes a **Unified DeepTech Supabase Architecture** that elevates Shothik to parity with global AI leaders (ChatGPT, Perplexity Pro, Cursor, and Figma/Miro). By orchestrating **Supabase Realtime**, **Storage with TUS protocols**, **pgvector hybrid search**, **ephemeral temp execution sandboxes**, **shared GitHub repository synchronization**, **Figma-style room link collaboration**, **Git for Writers plot branching**, **cryptographic authorship certificates**, **synchronized dual-language translation**, and **automated podcast syndication**, Shothik transforms into a world-class, collaborative vernacular AI platform tailored for Bangladesh and international creators.

---

## 2. Goals, Non-Goals, and Anti-Goals

### 2.1 Goals
1. **Multiplayer Monaco Writing Studio with Share Link Access**: Enable Figma/Miro-style instant room link collaboration with colored user cursors, presence selection indicators, and conflict-free text synchronization via Yjs over Supabase Broadcast channels.
2. **"Git for Writers" — Plot Branching & Merging**: Enable authors to branch manuscripts (e.g. *Branch: Tragic Ending* vs. *Branch: Happy Ending*) without touching the canonical manuscript, merging alternate storylines back with a visual diff reconciler.
3. **Cryptographic Proof of Authorship & Copyright Certificates**: Anchor chapter revisions to an immutable SHA-256 cryptographic audit ledger (`audit_journal_entries`) in Supabase using `pgcrypto`, issuing verifiable digital certificates that prove original authorship dates and ownership.
4. **Synchronized Dual-Language Split View**: In Monaco, translators and bilingual authors view English and Bengali side-by-side with locked scrolling and paragraph alignment markers synchronized via Supabase Realtime presence.
5. **Classroom & Publisher Role Modes (Custom Claims)**: Support multi-tiered academic and publishing permissions (`Student`, `Reviewer/TA`, `Professor/Publisher`) via Supabase Auth custom claims, enforced natively at the database RLS layer.
6. **Perplexity-Grade Repository Knowledge**: Ingest and index connected GitHub repositories (chapters, research dossiers, `.shothik/` style guides) into Supabase `pgvector`, enabling whole-repository queries (`@chapters`) with clickable Git commit/lineage citations.
7. **ChatGPT-Style Ephemeral Sandbox Analysis**: Support drag-and-drop ingestion of large CSVs, PDFs, and audio recordings into short-lived, signed Supabase Storage buckets (`/temp/:sessionId`) with automated 24-hour TTL expiration, executed via our existing Node/Python code sandbox.
8. **Sub-Second Voice Waveform Streaming & Podcast Feeds**: Stream 200ms generated audio chunks from our local Intel Arc dGPU voice engine over Supabase Realtime Broadcast, with automated RSS 2.0 / Apple Podcasts syndication for completed audiobooks.
9. **Zero-Friction Onboarding & Resilient Sync**: Enable anonymous guest writing sessions that seamlessly convert into permanent authenticated accounts, backed by our edge-to-cloud SQLite offline sync engine.

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
2. **Plot Branching Lineage Model**:
   * Stored in `projects` via `parent_project_id` (UUID nullable), `branch_name` (text default 'main'), and `lineage_root_id` (UUID). Branching duplicates section snapshots without altering the canonical root.
3. **Cryptographic Proof Ledger**:
   * Uses `digest(content, 'sha256')` via `pgcrypto` recorded into immutable `audit_journal_entries`, generating verifiable tamper-evident signatures for proof-of-authorship certificates.
4. **Classroom & Publisher RBAC**:
   * Supabase JWT Custom Claims (`app_metadata.role`: `'student'`, `'reviewer'`, `'professor'`, `'publisher'`) mapped into RLS policies to restrict "Suggest Only" vs. "Full Publish".
5. **Code Sandbox Execution**:
   * Uses the pre-built sandbox runner (`artifacts/api-server/src/routes/sandbox.ts` / `codeSandbox.execute`), executing scripts in hardened Node.js, Python, and Bash sub-processes with resource caps.
6. **Voice Audio Streaming & Podcast Feeds**:
   * Chunks are broadcast from the Intel Arc `:8001` engine in 200ms segments as compact Base64 Opus/WAV frames (~8KB) over Supabase Realtime channel `voice:${sessionId}`. Completed books generate dynamic RSS 2.0 XML feeds with pre-signed audio URLs from Supabase Storage.

---

## 4. Architectural Specification by Milestones

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SHOTHIK CLIENT INTERFACES                             │
│   Monaco Studio (Multi-Cursor, Dual-Lang, Branching) • AI Twin • Voice Hub  │
└──────────────────────┬──────────────────────┬───────────────────────────────┘
                       │                      │
                       ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE DATA & REALTIME                          │
│   Realtime Channels (Presence / Broadcast)  •  Storage (TUS Resumable)      │
│   Data API (PostgREST / pg_graphql)         •  pgvector Hybrid Search       │
│   Immutable Cryptographic Audit Ledger      •  Auth Role Claims & RLS       │
└──────────────────────┬──────────────────────┬───────────────────────────────┘
                       │                      │
                       ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SHOTHIK API & HARDENED INFRA                         │
│   Edge-to-Cloud Sync Engine  •  Letta Twin Engine  •  Code Sandbox Runner   │
│   Intel Arc Voice AI Server  •  PostgreSQL 17.6 (Zero-Trust RLS Policies)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Milestone 1: Data Infrastructure, RBAC & Storage Foundation
1. **Supabase Storage Buckets**:
   * `temp-sandboxes`: Ephemeral bucket for drag-and-drop CSVs, deeds, and scratchpad files (24h TTL).
   * `manuscripts`: Resumable TUS storage bucket for PDF/DOCX academic thesis files and book exports.
   * `audio-assets`: Chunked storage bucket for master voice takes and public podcast episodes.
2. **Schema & RBAC Enhancements**:
   * Add `share_token`, `access_mode`, `passcode_hash`, `parent_project_id`, `branch_name`, and `lineage_root_id` to `projects` table.
   * Add role verification policies checking `auth.jwt() -> 'app_metadata' ->> 'role'`.
   * Create `document_embeddings` table with pgvector HNSW index for Bengali hybrid search.
3. **Cryptographic Proof Engine**:
   * Ledger integration: `/api/v1/projects/:id/proof-of-authorship` generates SHA-256 digital certificates anchored to `audit_journal_entries`.

### Milestone 2: Collaborative Monaco Studio, Branching & Dual-Language
1. **Supabase Realtime Channel Topologies**:
   * Channel format: `project:${projectId}`.
   * **Presence State**: Tracks `{ userId, name, avatar, cursor, selection, color, activeParagraphId }`.
   * **Broadcast Events**: `cursor-move` (30ms throttle), `ghost-token-stream`, `diff-preview`, `scroll-sync`.
2. **Synchronized Dual-Language Split Screen**:
   * Presence broadcasts `activeParagraphId` to lock scrolling between parallel English and Bengali Monaco editors.
3. **"Git for Writers" Branching Manager**:
   * Endpoints: `POST /api/v1/projects/:id/branches` (fork branch) and `POST /api/v1/projects/:id/merge` (merge with diff preview).
4. **Yjs CRDT Synchronization & Time-Travel Rollback**:
   * Lightweight `y-supabase` provider with elected leader persistence to `projects` and `writing_autosave`.

### Milestone 3: Letta Twin Knowledge Engine & GitHub Workspace
1. **Shared GitHub Repository Bridge**:
   * `POST /api/v1/connectors/github/sync` indexing repository file trees into `document_embeddings`.
   * Multi-file whole-repository context queries (`@chapters`, `@notes`).
2. **Git-Lineage Citation Metadata**:
   * Clickable citation pills with exact commit SHA, file path, and line anchors.
3. **Automated AI Editor PR Reviews**:
   * Webhook handler for GitHub Pull Requests running Letta Twin grammar and consistency reviews.

### Milestone 4: Low-Latency Voice Streaming & Podcast Syndication
1. **Sub-Second Audio Waveform Streaming**:
   * Broadcasts 200ms audio chunks over `voice:${sessionId}` with synchronized phoneme teleprompter arrays.
2. **Automated Audiobook Podcast RSS Syndication**:
   * Endpoint: `GET /api/v1/projects/:id/podcast/feed.xml` dynamically rendering Apple Podcasts/Spotify-compliant RSS 2.0 XML with pre-signed chapter MP3/WAV links from Supabase Storage.
3. **Typesetting Task Queue (`pgmq`)**:
   * Durable task queue compiling print-ready Nilkhet books (EPUB/PDF with SolaimanLipi Bengali ligatures).

---

## 5. What's Left to the Builder

* **Exact UI Color Schemes**: Selection colors for up to 8 concurrent collaborators.
* **Audio Transcoding Library Selection**: Selection between Web Audio PCM decoder or WebAssembly Opus decoder.
* **Debounce Durations**: Tuning client-side cursor broadcast throttling between 25ms and 50ms.
