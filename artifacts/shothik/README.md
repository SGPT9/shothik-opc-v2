# Shothik AI — Frontend Workspace (v2)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB.svg)](https://react.dev/)
[![InsForge BaaS](https://img.shields.io/badge/BaaS-InsForge%20Postgres-00E599.svg)](https://insforge.dev)
[![DeepSeek Standard](https://img.shields.io/badge/UI-DeepSeek--Close%20Minimalist-4D6BFE.svg)](https://deepseek.com)

A high-performance AI workspace and agentic studio built on a **DeepSeek-close minimalist shell**, backed by **InsForge BaaS**, self-hosted **Ollama / vLLM** inference, **Posthuman Validator MCP**, and emerging-market demographic engines.

---

## 📑 Table of Contents
1. [Core Architecture & Design Philosophy](#-core-architecture--design-philosophy)
2. [Full-Stack Architecture Roadmap](#-full-stack-architecture-roadmap)
3. [Connecting Frontend to Backend](#-connecting-frontend-to-backend)
4. [Environment Variables Configuration](#-environment-variables-configuration)
5. [Directory & Component Layout](#-directory--component-layout)
6. [Development & Verification](#-development--verification)
7. [Deployment Topologies](#-deployment-topologies)

---

## 🎨 Core Architecture & Design Philosophy

The Shothik frontend adheres strictly to the **DeepSeek-Close Minimalist Pattern**:

* **Ask-First Ergonomics**: The entire workspace is centered on typing natural language prompts. No upfront modal walls or mandatory mode selections.
* **3-Part Responsive Shell**:
  1. **Navigation Sidebar**: Collapsible icon/drawer navigation with chat session history and studio bookmarks.
  2. **Conversation Work Surface**: The primary canvas hosting the ask-first composer, streaming message transcripts, and interactive artifact split-panes.
  3. **Contextual User Details Drawer**: Secondary metadata drawer for epistemic provenance, system metrics, and audit checkpoints (closed by default).
* **Progressive Disclosure**: Zero launcher clutter around the composer on first paint. Advanced features are discovered naturally via intent routing or the unified **`Tools`** dropdown menu (*Deep Research*, *Browser Agent*, *Slide Studio*, *Financial Sheet*, *Code Engine*, *NBR VAT & Tax*).
* **Dual-Voice System**:
  * **Voice Input**: Push-to-dictate speech-to-text with automated Banglish commerce normalization into the composer textarea.
  * **Conversational Voice Mode**: Immersive 3D Avatar Orb popup for fluid, bi-directional realtime audio dialog.
* **LiquidGlass Dynamic Styling**: Native CSS token-based glassmorphic surfaces with brand-accent glow palettes (`bkash`, `steadfast`, `tax_gold`, `cyan`, `indigo`).

---

## 🏛️ Full-Stack Architecture Roadmap

```
                                    ┌────────────────────────────────────────────────────────┐
                                    │                   SHOTHIK WORKSPACE                    │
                                    │      (DeepSeek Minimalist Shell · React 19 · Vite)     │
                                    └───────────────────────────┬────────────────────────────┘
                                                                │
                                    ┌───────────────────────────┴────────────────────────────┐
                                    ▼                                                        ▼
                    ┌───────────────────────────────┐                        ┌───────────────────────────────┐
                    │       INSFORGE BaaS           │                        │      SHOTHIK API GATEWAY      │
                    │   (System of Record)          │                        │      (Express 5 / Node.js)    │
                    ├───────────────────────────────┤                        ├───────────────────────────────┤
                    │ • PostgreSQL 16 + Auth RLS    │                        │ • /api/ollama (Stream Proxy)  │
                    │ • Session & User Tenancy      │                        │ • /api/mcp (Tool Registry)    │
                    │ • Cloud Object Buckets        │                        │ • /api/v1/mfs (bKash/Nagad)   │
                    │ • Realtime Event Streams      │                        │ • /api/v1/logistics (Steadfast)│
                    │ • Edge Functions & Webhooks   │                        │ • /api/v1/loop (Self-Healing) │
                    └───────────────────────────────┘                        └───────────────┬───────────────┘
                                                                                             │
                                            ┌────────────────────────────────────────────────┼────────────────────────────────────────┐
                                            ▼                                                ▼                                        ▼
                            ┌───────────────────────────────┐                ┌───────────────────────────────┐        ┌───────────────────────────────┐
                            │    LOCAL / VPS INFERENCE      │                │     POSTHUMAN VALIDATOR MCP   │        │     AGENT RUNTIME (DSH)       │
                            │   (Ollama / llama.cpp / vLLM) │                │     (AI-Skills-for-Networks)  │        │   (DeepSeek Harness Plugin)   │
                            ├───────────────────────────────┤                ├───────────────────────────────┤        ├───────────────────────────────┤
                            │ • DeepSeek-R1 / Qwen2.5 Coder │                │ • Celestia / Monad / Oraichain│        │ • Append-only Session Log     │
                            │ • Colibri C Autocomplete Engine│               │ • Validator Ops & Incident    │        │ • Fork, Replay & Step Tracing │
                            │ • Zero-cloud private inference│                │ • Port Audit & Node Health    │        │ • Epistemic Sandbox Execution │
                            └───────────────────────────────┘                └───────────────────────────────┘        └───────────────────────────────┘
```

### Layer Responsibilities

| Layer | Technology | Primary Role |
| :--- | :--- | :--- |
| **Frontend Shell** | React 19, Vite, Tailwind/Vanilla CSS, Lucide | UI Rendering, Ask-First Composer, Canvas, Split-Pane Artifacts, Voice Orb |
| **System of Record** | InsForge BaaS (Postgres + JWT + RLS) | User Accounts, Permissions, Projects, Chat Persistence, File Storage |
| **API Gateway** | Express 5 (`artifacts/api-server`) | Route aggregation, MFS tokenized auth, Logistics dispatch, SSE streaming |
| **Tool Execution** | Model Context Protocol (MCP) | Validator skill registry (`reference-repos/AI-skills-for-networks`), FS tools |
| **Inference Engines** | Hostinger VPS / Local Ollama (`11434`) | Uncensored reasoning, Banglish code generation, local token completion |
| **Semantic Memory** | Memori (`@memori/client`) | Cross-session semantic memory and episodic user context recall |

---

## 🔌 Connecting Frontend to Backend

To connect this frontend to your backend services:

### 1. Connect to InsForge BaaS (Database & Auth)
The frontend talks directly to InsForge using `@insforge/sdk` for user authentication, project storage, and real-time syncing.
Configure the following in `.env.local`:

```env
# InsForge BaaS Connection
VITE_INSFORGE_URL=https://ers8j28a.ap-southeast.insforge.app
VITE_INSFORGE_ANON_KEY=anon_09a9f554a6d1ef3abb1eb3691c0224e22c30b4bfe25809c6222a8301bfa80f7b
```

### 2. Connect to the Express API Gateway (`artifacts/api-server`)
The Vite development server is configured to proxy all `/api/*` and `/vps-engine/*` traffic to your local or VPS API gateway:

* **Local API Server**: `http://localhost:5001`
* **Production API Gateway**: Set via `VITE_API_GATEWAY_URL` or reverse-proxied via Nginx / Cloudflare Worker.

In [`vite.config.ts`](./vite.config.ts):
```ts
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: process.env.API_GATEWAY_URL || 'http://localhost:5001',
      changeOrigin: true,
      ws: true,
    },
    '/vps-engine': {
      target: process.env.VPS_ENGINE_URL || 'http://187.127.125.115:11434',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/vps-engine/, ''),
    }
  }
}
```

### 3. Connect to Posthuman Validator MCP Server
The API server hosts `/api/mcp` which provides dynamic discovery of capabilities:
* `GET /api/mcp/capabilities`: Lists all registered network and operational skills (Celestia, Monad, Oraichain, incident response).
* `GET /api/mcp/:id/source`: Fetches raw executable skill instructions for agent consumption.

---

## 🔐 Environment Variables Configuration

Copy `.env.production.example` to `.env.local` to configure local secrets:

```bash
cp .env.production.example .env.local
```

### Key Variables

```env
# Application Host & Port
PORT=3000
NODE_ENV=development

# InsForge BaaS Credentials
VITE_INSFORGE_URL=https://ers8j28a.ap-southeast.insforge.app
VITE_INSFORGE_ANON_KEY=anon_your_anon_key_here

# API Gateway & Backend
API_GATEWAY_URL=http://localhost:5001

# Self-Hosted VPS / Local Ollama Inference
TONIGHT_ENGINE_SELF_HOSTED_URL=http://187.127.125.115:11434
TONIGHT_ENGINE_SELF_HOSTED_MODEL=qwen2:7b

# Cloudflare R2 CDN Storage (Optional Fallback to InsForge Buckets)
CLOUDFLARE_R2_BUCKET=shothik-r2-assets
CLOUDFLARE_R2_PUBLIC_DOMAIN=cdn.shothik.ai
```

---

## 📁 Directory & Component Layout

```
src/
├── app-next/                    # Next.js App Router hybrid pages & routes
│   ├── auth/                    # Login, Register, Callback handlers
│   └── writing-studio/          # Book writing & research hub
├── components/                  # Core UI Component Library
│   ├── chat/                    # Ask-First Chat Experience
│   │   ├── Composer.tsx         # DeepSeek-standard intent-first composer
│   │   ├── MarkdownMessage.tsx  # Perspective lens & interactive citation renderer
│   │   ├── ArtifactPane.tsx     # Split-screen slides, code & table editor
│   │   ├── CommerceActionCard.tsx # bKash settlement & 1-click Steadfast booking
│   │   └── AvatarOrb3D.tsx      # Realtime Conversational Voice Mode orb
│   ├── admin/                   # Privileged admin & telemetry control center
│   ├── partials/                # Navigation sidebar, Header, and User Drawers
│   └── ui/                      # Base primitives (shadcn / Radix / LiquidGlass)
├── hooks/                       # Custom React state & telemetry hooks
│   ├── use-chat-session.ts      # SSE stream parser & multi-turn state
│   ├── use-offline-sync.ts      # IndexedDB ➔ Postgres sync queue
│   └── use-voice-assistant.ts   # Dual-voice dictation & WebRTC orb
├── lib/                         # Client-side domain & infrastructure libraries
│   ├── insforge/                # Database RLS, Auth client, and bucket storage
│   ├── demography/              # bKash API, SMS parser, RouteXpress courier adapter
│   └── mcp/                     # Client-side MCP tool registry bridges
└── test/                        # Vitest test setup and mock servers
```

---

## 🛠️ Development & Verification

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Local Development Server
```bash
pnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Typecheck
```bash
node run_typecheck.cjs
```
> **Output:** `✨ Typecheck clean! 0 TypeScript errors found in @workspace/shothik.`

### 4. Run Vitest Unit & Integration Suites
```bash
npx vitest run
```
> **Output:** `15 passed (15) · 54 passed (54)`

### 5. Build for Production
```bash
pnpm run build
```
Creates an optimized production bundle in `dist/`.

---

## 🚀 Deployment Topologies

### Option A: Cloudflare Workers & Pages (Zero-Egress Static CDN)
Deploy using `wrangler.toml`:
```bash
npx wrangler deploy
```

### Option B: Docker Container on Hostinger VPS
Build and run using the multi-stage `Dockerfile`:
```bash
docker build -t shothik-frontend .
docker run -p 3000:3000 --env-file .env.production shothik-frontend
```

### Option C: Vercel Deploy
Push to `main` branch connected to Vercel with framework preset `Vite`.

---

## 📜 License
Private and Proprietary — Shothik AI Technologies.
