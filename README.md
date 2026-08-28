# Shothik AI — Full-Stack Production Monorepo

[![Architecture: PostgreSQL + SQLite](https://img.shields.io/badge/Architecture-PostgreSQL%20%2B%20SQLite-0284c7.svg)](#architecture)
[![Auth: Better Auth](https://img.shields.io/badge/Auth-Better%20Auth-10b981.svg)](#authentication)
[![Monetization: bKash & Nagad](https://img.shields.io/badge/MFS-bKash%20%26%20Nagad-e11d48.svg)](#monetization--mfs-payments)
[![Logistics: Steadfast & Pathao](https://img.shields.io/badge/Logistics-Steadfast%20%26%20Pathao-f59e0b.svg)](#physical-book-courier-dispatch)
[![Local NLP: 4-Tier Gateway](https://img.shields.io/badge/Inference-Zero--Cost%20Local%20NLP-8b5cf6.svg)](#zero-cost-local-nlp--inference)

A production-grade **pnpm workspace monorepo** powering [Shothik AI](https://app.shothikgpt.com) — an advanced Bengali & multilingual writing studio, autonomous multi-agent swarm platform, and publishing engine.

---

## 🏛️ Monorepo Architecture

```
/
├── artifacts/
│   ├── shothik/          # Vite + React Web Frontend (Amar Ekushey Studio, Chat, Swarm)
│   └── api-server/       # Express Backend API Gateway (Port 3001 / 4000)
├── lib/
│   ├── db/               # PostgreSQL & SQLite Drizzle ORM Schemas and Migrations
│   └── hermes/           # Shared Zod Contracts, Types & Core Utilities
├── data/                 # Embedded SQLite LibSQL Database (shothik_local.db)
├── scripts/              # Verification, Build & Deployment Automation
├── docker-compose.prod.yml
├── wrangler.toml         # Cloudflare Workers Edge SPA Routing
└── pnpm-workspace.yaml
```

---

## 🗄️ 2-Tier Consolidated Database Architecture

Shothik operates on an ultra-fast, cost-effective 2-tier database architecture completely free of third-party vendor lock-in (0% Convex / 0% Clerk):

```
┌────────────────────────────────────────────────────────────────────────┐
│                              Shothik Web                               │
└──────────────────┬──────────────────────────────────┬──────────────────┘
                   │                                  │
                   ▼                                  ▼
     ┌───────────────────────────┐      ┌───────────────────────────┐
     │   SQLite (Local / LibSQL) │      │  PostgreSQL (InsForge DB) │
     │  - Local KV Cache         │      │  - Better Auth & Users    │
     │  - DSH Execution Traces   │      │  - Projects & Autosaves   │
     │  - Guest Offline Buffer   │      │  - Subscriptions & Quotas │
     │  - Zero-latency WAL mode  │      │  - Twin & SecondMe Memory │
     └───────────────────────────┘      │  - 18 RLS Protected Tables│
                                        └───────────────────────────┘
```

1. **PostgreSQL (InsForge Cloud Database)**:
   - Tables: `projects`, `writing_autosave`, `user_subscriptions`, `tool_usage`, `llm_usage`, `key_custody`, `writing_profiles`, `twins`, `twin_tasks`, `twin_activity_log`, `twin_pending_approvals`.
   - Connected via Drizzle ORM with automatic `.env.local` fallback parsing.
   - Superuser Row-Level Security (RLS) policies configured in `fix_insforge_rls.mjs`.

2. **SQLite (Embedded LibSQL Edge Database)**:
   - Path: `data/shothik_local.db`
   - Tables: `agentTracesTable`, `localCacheTable`.
   - Purpose: Millisecond-level agent trace replay, DSH telemetry, and local caching.

---

## 🚀 Key Platform Features

### 1. ✍️ Amar Ekushey Writing Studio
- **Nilkhet 6×9 Format**: Standard layout for Bengali novels, poetry, and academic books.
- **Real-Time Autosave**: Debounced snapshotting to PostgreSQL `writing_autosave` (`/api/v1/writing/autosave`).
- **1-Click Manuscript Packaging**: Client-side JSON & print-ready packaging.

### 2. 🎨 AI Book Cover Generator (300 DPI Vector)
- **Styles**: Amar Ekushey, Sci-Fi, Thriller, Academic, and Poetry themes.
- **Typography**: Native `SolaimanLipi` Bangla font rendering with ornamental borders.
- **Export**: Instant 300 DPI print-ready SVG downloads for Nilkhet offset presses and Amazon KDP.

### 3. 🚚 Steadfast & Pathao Physical Courier Dispatch
- **Ordering Modal**: Select 5, 20, 50, or 100 printed book copies.
- **Automated Pricing**: Dynamic Dhaka Metro (৳60) vs. Inter-city (৳120) fee calculations and Cash on Delivery (COD).
- **Backend Booking**: Direct API dispatch via `POST /api/v1/logistics/steadfast/book` generating tracking codes (`BD_STEADFAST_...`) and automated WhatsApp customer delivery alerts.

### 4. 🤖 Multi-Agent Swarm Deliberation & DSH
- **4-Agent Graph Debate**: Deliberation between Strategist, Fact Checker, Creative Writer, and Ethics Guard with citation grounding (`/api/v1/swarm/deliberate`).
- **DSH Execution Drawer**: Replay agent thoughts, tool invocations, and time-to-first-token (TTFT) metrics directly from SQLite traces.

### 5. 💳 bKash & Nagad MFS Monetization
- **Direct TrxID Verification**: Input 10-digit bKash/Nagad Transaction IDs to instantly upgrade subscriptions and add platform credits (`/api/v1/mfs/verify-trx`).

### 6. ⚡ 4-Tier Zero-Cost Local NLP Routing
1. **FreeToken / Colibri C Daemon** (<35MB RAM edge execution)
2. **Local Ollama / Ornith-9B** (Local Small Language Models)
3. **Cloud Models** (Gemini 2.5 Flash / Claude / DeepSeek)
4. **Offline Synthetic Fallback** (Zero downtime resilience)

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js**: `v20+` or `v22+`
- **pnpm**: `v9+` or `v10+`
- **PostgreSQL**: Local PostgreSQL or InsForge Cloud URL

### 2. Installation
```bash
pnpm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root:
```env
DATABASE_URL="postgresql://postgres:password@ers8j28a.ap-southeast.database.insforge.app:5432/insforge?sslmode=require"
BETTER_AUTH_SECRET="your-better-auth-secret-key-32-chars"
OLLAMA_HOST="http://127.0.0.1:11434"
PORT=3001
VITE_API_URL="http://localhost:3001"
```

### 4. Run Development Servers
```bash
# Start API Gateway (Port 3001)
pnpm --filter @workspace/api-server run dev

# Start Frontend (Port 5173 / 3000)
pnpm --filter @workspace/shothik run dev
```

---

## 🚢 Production Deployment

### Option A: Docker Compose (All-in-One)
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Option B: Cloudflare Edge (Frontend SPA) + VPS (API Server)
```bash
# Build frontend and deploy to Cloudflare Workers KV
pnpm run build:web
pnpm deploy:cloudflare
```

---

## 🔒 Security & Database Migration Tools

- **Verify Database & Schemas**:
  ```bash
  npx tsx artifacts/api-server/src/test-db-and-schemas.ts
  ```
- **Apply PostgreSQL RLS Security**:
  ```bash
  node fix_insforge_rls.mjs
  ```

---

© 2026 Shothik AI. Production Monorepo. All Rights Reserved.
