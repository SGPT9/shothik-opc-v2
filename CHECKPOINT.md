# 🌟 ShothikGPT AgenticOS — Master System Checkpoint & Resume Reference

**Timestamp:** 2026-09-04 (Morning Engineering Session)  
**Active Workspace:** `c:\Users\USER\hermes\shothik-web-mirror-v2`  
**Primary Repository:** `https://github.com/SGPT9/shothik-opc-v2.git`  
**Active Branch:** `main`  
**Architecture Doctrine:** Demography-Aware AgenticOS ([`THESIS.md`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/THESIS.md))  

---

## 1. 🌐 Polyrepo Synchronization Matrix (All 9 Targets Active)
All 9 GitHub repositories are synchronized with local HEAD on branch `main`:

| Repository | Remote Name | GitHub URL | Role |
|---|---|---|---|
| **Core Monorepo** | `origin` | `https://github.com/SGPT9/shothik-opc-v2.git` | Primary unified workspace & AgenticOS runtime |
| **Documentation** | `docs` | `https://github.com/SGPT9/shothik-docs.git` | Architecture specs, thesis, and API docs |
| **Tonight Engine** | `tonight` | `https://github.com/SGPT9/shothik-tonight.git` | Autonomous overnight swarm & WebGPU execution |
| **Swarm Orchestrator**| `swarm` | `https://github.com/SGPT9/shothik-swarm.git` | Multi-agent state graph & consensus engine |
| **Backend API** | `backend` | `https://github.com/SGPT9/shothik-backend-v2.git` | Fastify/Express API, RAG, MFS & Courier |
| **Frontend UI** | `frontend` | `https://github.com/SGPT9/shothik-frontend-v2.git` | React + Vite UI & WebGPU client shaders |
| **Economics Engine** | `economics` | `https://github.com/SGPT9/shothik-economics.git` | bKash/Nagad MFS, NBR Tax, Paywall & Credits |
| **Skills Library** | `skills` | `https://github.com/SGPT9/shothik-skills.git` | Official Cloudflare & Agent workflow skills |
| **Writer Studio** | `writer` | `https://github.com/SGPT9/shothik-writer.git` | Nilkhet POD book compiler & 3-fold editor |

---

## 2. ⚡ System State & Hardware Configuration
- **Host CPU:** AMD Ryzen 5 5600G (6 Cores / 12 Threads) — allocated for parallel test runners and swarm workers.
- **Host GPU:** Intel Arc B580 (Battlemage Xe2 architecture, 12GB VRAM) — client-side WebGPU & WGSL compute shaders active.
- **Host RAM:** 32GB DDR4 (**~11.75 GB free headroom**) with active in-memory hot vector RAG buffer (`rag-engine.ts`).
- **OS:** Windows 11 (PowerShell & Git Bash environments).

---

## 3. 🚀 Active Services & Endpoints

| Component | Port / URL | Health Endpoint | Status | Details |
|---|---|---|---|---|
| **Backend API Server** | `http://localhost:8080` | `http://localhost:8080/health` | **200 OK (<1ms)** | Fastify/Express backend, Vast.ai & Vespa Hybrid RAG, bKash PGW, CRDT |
| **Vite Frontend Web App**| `http://localhost:5000` | `http://localhost:5000/tonight` | **200 OK** | React + Vite UI, Tonight Engine Swarm Lab, WebGPU Live Kernel |
| **Overnight Loop Daemon**| Background `task-2601` | Cron `*/30 * * * *` | **Active** | 16 automated tests + hardware headroom tracking |

---

## 4. 🛠️ Cloudflare Agent Setup & Tool Ecosystem
- **Official Cloudflare Skills (13 Installed):**  
  `agents-sdk`, `cloudflare`, `cloudflare-email-service`, `cloudflare-one`, `cloudflare-one-migrations`, `durable-objects`, `sandbox-migrate-to-next`, `sandbox-next`, `sandbox-stable`, `turnstile-spin`, `web-perf`, `workers-best-practices`, `wrangler`.
- **Remote MCP Servers Active:**
  - `cloudflare`: `https://mcp.cloudflare.com/mcp`
  - `cloudflare-docs`: `https://docs.mcp.cloudflare.com/mcp`
  - `cloudflare-bindings`: `https://bindings.mcp.cloudflare.com/mcp`
  - `cloudflare-builds`: `https://builds.mcp.cloudflare.com/mcp`
  - `cloudflare-observability`: `https://observability.mcp.cloudflare.com/mcp`
  - `context7`: `https://mcp.context7.com/mcp`
- **Wrangler Version:** `4.129.0`.

---

## 5. 🧪 Complete Verification & Test Matrix
- **TypeScript Typecheck:** `0` errors across all projects (`node run_typecheck.cjs`).
- **Backend Test Matrix:** **32 test files (166 tests)** passing 100%.
- **Frontend Test Matrix:** **338 test files (1,735 tests)** passing cleanly.
- **Overnight Benchmark Loop:** 16 infrastructure, speculative WebGPU, and autonomous evals passing in 3s.

---

## 6. 🛑 How to Pause the Workflow
To cleanly pause or stop all running local background servers:
```powershell
# Stop all node, tsx, and vite dev processes (frees ports 8080 and 5000)
Get-Process node, tsx -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## 7. ▶️ How to Resume the Workflow in Future Sessions

When returning to the project, execute these commands in order:

### Step 1: Pull Latest Code Across Remotes
```powershell
cd "c:\Users\USER\hermes\shothik-web-mirror-v2"
git pull origin main
```

### Step 2: Start API Server & Frontend UI (in separate terminals)
```powershell
# Terminal 1: Start Fastify/Express Backend (Port 8080)
pnpm --filter @workspace/api-server run dev

# Terminal 2: Start Vite Frontend UI (Port 5000)
pnpm --filter @workspace/shothik run dev
```

### Step 3: Run Verification Benchmark
```powershell
# Verify system health and test suite:
npx tsx scripts/overnight-loop.ts

# Test API health:
curl.exe http://localhost:8080/health
```

---

## 8. 🗺️ Next Strategic Milestones (Big Tech Playbook)
1. **Phase 1:** Multi-Tier Inference Router (WebGPU on-device -> In-Memory Vector Cache -> Vast.ai Spot GPU -> Frontier Models).
2. **Phase 2:** DeepSeek Harness (DSH) Interactive Trace Replay & Forking in Tonight Dashboard.
3. **Phase 3:** Vernacular Dialect Adapter Matrix (Sylheti, Chatgaya, Noakhailla, Dhakaiya).
4. **Phase 4:** Autonomous Chaos Fuzzing & Memory Profiling in the Overnight Daemon.
