# Shothik AI / Polsia OPC — Official Production Release Notes v2.7.0

**Release Tag**: `v2.7.0-release`  
**Release Date**: August 17, 2026  
**Target Environment**: InsForge BaaS (`https://ers8j28a.ap-southeast.insforge.app`) & Docker Standalone Container (<88MB)

---

## 🌟 Executive Summary

Release **v2.7.0** delivers the **DeepSeek-Close Frontier Interface & Autonomous Workspace Intelligence System**. It centers the entire experience around typing and immediate results ("Ask-First"), introduces full keyboard ergonomics across all tools and dialogs, integrates asynchronous multi-agent background tickets, and bridges conversation streams directly into permanent company workspaces.

---

## 🚀 Key Major Features Added in v2.7.0

### 1. 🎯 DeepSeek-Close Ask-First Composer & Progressive Disclosure
- **Ask-First Ergonomics**: Immediate focus on typing without mandatory mode pickers.
- **Unified Tools Menu**: Progressive disclosure grouping specialized agentic tools (*Deep Research*, *Slide Studio*, *Data Sheet*, *Voice Mode*, *Web Automation*).
- **Expanded Slash (`/`) Commands**: 12 registered skills (`/research`, `/slides`, `/sheet`, `/code`, `/swarm`, `/boimela`, `/grill-me`, `/review`, `/prd`, `/browser`, `/commerce`, `/learn`).
- **Persona-Adaptive Starters**: Outcome-based starter prompt cards dynamically adjust based on active persona (*Core Assistant*, *Quantitative Analyst*, *Literary Writer*, *Business Growth Lead*).

### 2. ⚡ Live Studio Artifacts & Vector Exports
- **1-Click Markdown Table Export**: Instant client-side CSV download (`[ 📊 Export CSV ]`) from any rendered markdown table.
- **1-Click Code File Download**: Auto extension mapping (`.tsx`, `.py`, `.sql`, `.json`, etc.) with language-tagged file names.
- **OpenSearch-VL Component Inspector**: Non-blocking visual overlay and floating banner for inspecting live React/HTML stage DOM bounding boxes.
- **Vector SVG Diagram Export**: 1-click standalone SVG export for flowcharts and system topology diagrams.
- **Arrow Key Slide & Doc Navigation**: `←`, `→`, and `Space` keyboard traversal in slide presentations and multi-page documents.

### 3. 🛡️ Security, Provenance & Control Layer
- **Epistemic Truth Badging**: Instant provenance badges (*Consensus*, *Supported*, *Contested*, *Hypothesis*) with confidence metrics.
- **Human-in-the-Loop Approval Checkpoints**: Distinct `ApprovalCard` surfaces for privileged autonomous actions (database migrations, dispatches, webhooks).
- **In-Band Masked Secret Sharing**: Dedicated masked input for secure token/password entry that never leaks into transcript text.
- **Audit Receipt Trail Modal**: Replayable execution trace modal accessible via `⋯` overflow menu.

### 4. 🧭 Autonomous Swarms & Founder OS Integration
- **Wayfinder Goal Frontier DAG**: Interactive milestone progression board with 1-click `/grill-me` alignment triggers.
- **Overnight Deep Think Tickets**: Asynchronous background jobs with live status badges, cost savings counters, and 1-click artifact openers.
- **Founder OS Twin Bridge**: Context-preserving `TwinCtaCard` offering instant transition from chat discussions to multi-agent company workspaces.
- **Resilient Commerce Dispatch Sandbox**: Zero-latency offline mock fallback for Steadfast courier bookings and customer WhatsApp message generation.

### 5. ⌨️ Keyboard Shortcuts & Accessibility
- **Global Cheat Sheet Modal**: Accessible via `?` or `Ctrl+/`.
- **Keyboard Contracts**:
  - `Ctrl+Shift+O` / `Cmd+Shift+O`: New Chat Session
  - `/`: Focus Composer (outside inputs) or trigger Slash popup (inside composer)
  - `↑`: Recall last prompt (when composer is empty)
  - `Ctrl+Shift+E`: Export session as Markdown / JSON / Print
  - `Esc`: Global dismissal for all modal sheets, drawers, search filters, and slide presentations.
  - OS-Adaptive `Ctrl+K` (Windows/Linux) and `⌘K` (macOS).

---

## 🧪 Certified Test Verification

| Module / Surface | Verification Suite | Status |
|---|---|---|
| Ask-First Chat Shell | `scripts/verify-frontend-agent.ts` | **`✓ PASS (4/4)`** |
| TypeScript Monorepo Typecheck | `tsc --noEmit` | **`✓ 0 Errors Clean`** |
| Wayfinder Goal Frontier | `WayfinderBoard.test.tsx` | **`✓ PASS`** |
| Low-RAM StyleX Optimizations | `low-ram-stylex-optimizer.ts` | **`✓ PASS`** |
| Offline CRDT Sync Topology | `OFFLINE_FIRST_AND_DATA_SYNC_SPEC.md` | **`✓ VERIFIED`** |
| Model Mesh & Compute Topology | `MODEL_MESH_AND_COMPUTE_TOPOLOGY.md` | **`✓ VERIFIED`** |

---

## 📦 Release Tag & Repository Information

- **Tag**: `v2.7.0-release`
- **Branch**: `main`
