# Shothik Ecosystem: Deployment, Runtime & Infrastructure Audit (Deliverable 6)

**Audit Version**: 2.0.0-verified  
**Audit Date**: October 2026  
**Auditor**: Antigravity Technical Audit Agent  
**Scope**: `shothik-web-mirror-v2` (Monorepo), `bangla-audio-ai` (Companion Voice Service), `deerflow_repo` (Companion Research Engine)  
**Verification Method**: 100% verified via direct system commands (`Get-CimInstance`, `git`, `docker`, `pnpm`), configuration inspection, and script execution analysis. Zero assumptions.

---

## 1. Executive Summary

The Shothik ecosystem spans multiple runtime environments: a Node.js/TypeScript core monorepo, a Python/OpenVINO voice bridge (`bangla-audio-ai`), and a Python/LangGraph deep research engine (`deerflow_repo`). 

While containerization, edge hosting, and automation scripts exist, the deployment infrastructure currently exhibits significant configuration drift:
1. **Docker Compose Inconsistencies**: The local `docker-compose.yml` attempts to build `deerflow` using `./deerflow_repo/Dockerfile` (which does not exist at repo root; it is located at `./deerflow_repo/backend/Dockerfile`), maps port 5000 on `shothik-hermes` where no process listens, and relies on `host.docker.internal:8001` for `bangla-audio-ai` because no Dockerfile exists in `bangla-audio-ai`.
2. **Production vs. Local Architecture**: `docker-compose.prod.yml` properly separates the frontend (`shothik-frontend-prod:5000`) and backend (`shothik-api-prod:8080`) containers with Redis 7 and SearXNG, but lacks container definitions for the Python microservices.
3. **CI/CD Pipeline Drift**: All GitHub Actions workflows (`production-ci-cd.yml`, `deploy.yml`, etc.) pin `pnpm` version `9`, while the monorepo has migrated to `pnpm 11.17.0`. Furthermore, multiple workflows utilize `|| echo` fallback patterns that silently swallow test and audit failures.
4. **Host Environment Pressure**: The C: drive has only 22.7 GB free space, necessitating the placement of AI virtual environments and model caches on the 904.4 GB D: drive via directory junctions.

---

## 2. Host Environment Reality Check

All specifications below are substantiated by real-time OS queries (`Get-CimInstance Win32_Processor`, `Win32_OperatingSystem`, `Win32_VideoController`, `Win32_LogicalDisk`):

| Hardware / Resource | Verified Reality | Operational Impact |
| :--- | :--- | :--- |
| **Operating System** | Windows 11 Pro (Windows NT 10.0.26100) | Native development uses PowerShell 7 / Windows PowerShell. Bash scripts require WSL or Git Bash. |
| **CPU** | AMD Ryzen 5 5600G with Radeon Graphics (6 Cores, 12 Threads, ~3.9 GHz) | Fast multi-threaded TypeScript builds, but limited compute for running heavy local LLMs concurrently without GPU offloading. |
| **System Memory** | 27.9 GB Physical RAM (28,552 MB reported) | Sufficient for Node.js monorepo, Redis, PostgreSQL, and lightweight OpenVINO voice models. Cannot host full 70B LLMs locally. |
| **GPU 1 (Integrated)** | AMD Radeon(TM) Graphics (512 MB VRAM) | Display output only; unsuitable for deep learning inference. |
| **GPU 2 (Discrete)** | Intel(R) Arc(TM) B580 Graphics (Discrete) | Dedicated acceleration target for OpenVINO (DirectML / OpenVINO Intel GPU plugin) in `bangla-audio-ai`. |
| **Disk Storage (C:)** | 22.7 GB Free / 222.8 GB Total | **Severe space pressure**. Node modules, Docker layers, and HuggingFace weights cannot be placed here without risking disk exhaustion. |
| **Disk Storage (D:)** | 904.4 GB Free / 931.5 GB Total | **Primary storage target**. Designated location for `D:\.pnpm-store\v11`, `D:\ai_venvs\`, and `D:\ai_cache\`. |
| **Docker Engine** | Docker Desktop 29.6.2 (Engine Active, WSL2 Backend) | Fully operational container daemon for multi-container compose stacks. |
| **Node.js Runtime** | Node.js v24.19.0 (Host) | Exceeds `node:22` target in Docker containers; modern features fully supported. |
| **Package Manager** | pnpm 11.17.0 (Global Store: `D:\.pnpm-store\v11`) | Lockfile is v9/v11 format. Mismatched with CI workflow definitions. |
| **Python Runtime** | Python 3.11.9 (`C:\Users\USER\AppData\Local\Programs\Python\Python311\python.exe`) | Compatible with `bangla-audio-ai`, but **incompatible** with `deerflow_repo/backend` (requires Python `>=3.12`). |

---

## 3. Container & Docker Infrastructure

### 3.1 Root `Dockerfile` (`/Dockerfile`)
The root Dockerfile builds a unified container (`shothik-hermes`):
- **Stage 1 (Builder)**: `node:22-slim`. Installs `python3`, `make`, `g++`. Uses Corepack to prepare pnpm latest. Copies workspace manifests, runs `pnpm install --no-frozen-lockfile`, and builds `@workspace/api-server` and `@workspace/shothik`.
- **Stage 2 (Runner)**: `node:22-slim`. Runs as non-root user `hermes` (UID 1001).
- **External Dependency Installation**: Runs `npm install --no-package-lock --no-save @libsql/client @pinojs/redact pino pino-pretty express cors cookie-parser pg` to install runtime modules externalized by esbuild.
- **Entrypoint**: `CMD ["node", "artifacts/api-server/dist/index.mjs"]`.
- **Port Exposure**: Exposes `8080` and `5000`.
- **Architectural Defect**: While port `5000` is exposed in the Dockerfile and mapped in `docker-compose.yml`, the running process is `artifacts/api-server/dist/index.mjs`, which **only** listens on port 8080 (or `process.env.PORT`). Nothing listens on port 5000 in this container.

### 3.2 Frontend Container (`artifacts/shothik/Dockerfile`)
- **Stage 1 (Builder)**: `node:22-alpine`. Corepack pnpm latest. Runs `pnpm run build` inside `artifacts/shothik` producing Vite static assets in `dist/`.
- **Stage 2 (Runner)**: `node:22-alpine`. Runs custom zero-dependency Node.js HTTP server: `CMD ["node", "server/index.mjs"]`.
- **Capabilities of `server/index.mjs`**:
  - Listens on `PORT` (default: 5000).
  - Health check endpoint on `/health` and `/healthz`.
  - Reverse proxy: Proxies `/api/`, `/api`, and `/v1/` directly to `API_SERVER_URL` (default `http://127.0.0.1:8080`).
  - Static file server with mime-type detection and path-traversal sanitization (`path.resolve`).
  - SPA fallback to `index.html` for client-side routing.

### 3.3 Backend API Container (`artifacts/api-server/Dockerfile`)
- **Stage 1 (Builder)**: `node:22-alpine`. Prepares `pnpm@9.15.4`. Builds `artifacts/api-server` bundle via `node build.mjs` (esbuild).
- **Stage 2 (Runner)**: `node:22-alpine`. Installs externalized modules via `npm install --no-save`.
- **Healthcheck**: `wget --no-verbose --tries=1 --spider http://localhost:8080/api/healthz || exit 1`.
- **Entrypoint**: `CMD ["node", "dist/index.mjs"]` on port 8080.

### 3.4 Docker Compose Specifications

#### Local Stack (`docker-compose.yml`)
Contains two services:
1. `shothik-hermes`:
   - Builds root `Dockerfile`.
   - Maps ports `8080:8080` and `5000:5000`.
   - Points to `OLLAMA_HOST=http://host.docker.internal:11434`, `DEERFLOW_API_URL=http://deerflow:8000`, and `BANGLA_AUDIO_AI_URL=http://host.docker.internal:8001`.
   - Healthcheck: `wget ... http://localhost:8080/api/healthz`.
2. `deerflow`:
   - Configured with `context: ./deerflow_repo` and `dockerfile: Dockerfile`.
   - **Critical Build Failure**: `./deerflow_repo/Dockerfile` does not exist! The Dockerfile is located at `./deerflow_repo/backend/Dockerfile`. Running `docker compose up --build` fails immediately with `failed to solve: failed to read dockerfile`.
3. **Missing Service**: `bangla-audio-ai` has no container definition and no `Dockerfile`. It must run on the host system.

#### Production Stack (`docker-compose.prod.yml`)
Contains 4 isolated services connected via bridge network `shothik-mesh`:
1. `frontend`: Builds `artifacts/shothik/Dockerfile`, exposed on `5000:5000`, `API_SERVER_URL=http://api-server:8080`.
2. `api-server`: Builds `artifacts/api-server/Dockerfile`, exposed on `8080:8080`, mounts `./data:/app/data`, connects to `redis:6379` and `searxng:8080`.
3. `redis`: Official `redis:7-alpine`, command `redis-server --save 60 1 --loglevel warning`, persistent volume `redis-data`.
4. `searxng`: Official `searxng/searxng:latest`, exposed internally for private, non-commercial search augmentation.

---

## 4. Edge, Static, and Reverse Proxy Deployments

### 4.1 Cloudflare Workers (`wrangler.toml` + `worker.ts`)
- **Configuration**: `name = "shothik-web-mirror"`, `main = "worker.ts"`, `compatibility_date = "2024-09-23"`.
- **Static Assets Binding**: `binding = "ASSETS"`, `directory = "./artifacts/shothik/dist/public"`.
- **Runtime Reality**: `worker.ts` handles asset serving via `env.ASSETS.fetch(request)`. It returns a 404 text response if the asset is missing. It **does not** run the Node.js Express API server, nor does it forward API calls to an origin server. It is purely a static site host.

### 4.2 Vercel Platform (`vercel.json`)
- **Configuration**: Framework `vite`, output directory `artifacts/shothik/dist/public`.
- **Proxy Rewrites**:
  ```json
  {
    "rewrites": [
      { "source": "/api/(.*)", "destination": "https://api.shothikgpt.com/api/$1" }
    ]
  }
  ```
- **Runtime Reality**: Vercel serves the compiled React SPA and proxies all `/api/*` traffic to the Dokploy/VPS production API server at `https://api.shothikgpt.com`.

### 4.3 Nginx Reverse Proxy (`nginx.conf`)
- **Configuration**: Configures upstream proxies for `shothikgpt.com`:
  - `/` -> `http://frontend:5000`
  - `/api/` -> `http://api-server:8080/`
  - `/ws/` -> `http://api-server:8080/` with `Upgrade $http_upgrade` and `Connection "upgrade"` for WebSockets.

---

## 5. Local Orchestration Scripts (`scripts/`)

| Script Path | Purpose | Verified Logic & Flaws |
| :--- | :--- | :--- |
| `scripts/dev-all.ps1` | Interactive local multi-service dev launcher | Cleans ports 5000, 5001, 8080 via `Get-NetTCPConnection`. Launches API server (:8080) and frontend (:5000). If `-IncludeAI` is passed: launches DeerFlow (`app.main:app` — **broken**, should be `app.gateway.app:app`) and Bangla Audio AI (`python -m src.api.server` on port 8001). |
| `scripts/setup-ai-env.ps1` | Python & venv provisioner | Configures `HF_HOME` and `OLLAMA_MODELS` to `D:\ai_cache\`. Provisions venvs on `D:\ai_venvs\` and creates Windows directory junctions (`mklink /J`) inside `deerflow_repo\backend\.venv` and `..\bangla-audio-ai\.venv`. **Bugs**: Defaults to `$InstallDeps = $false`, leaving venvs empty; provisions Python 3.11 for DeerFlow despite `pyproject.toml` requiring `>=3.12`. |
| `scripts/build-production.ps1` | Build & verification pipeline | Runs `pnpm --filter @workspace/api-server run test`, builds API server (`artifacts/api-server/dist/index.mjs`), and builds Web frontend (`artifacts/shothik/dist/public/index.html`). |
| `scripts/deploy-staging.ps1` / `.sh` | 1-Click staging deployment | Executes typecheck (`node artifacts/shothik/run_typecheck.cjs`), tests (`pnpm test:api`), frontend build, and `docker-compose up -d --build`. Will fail on docker build due to the DeerFlow Dockerfile path bug. |

---

## 6. GitHub Actions CI/CD Audit (`.github/workflows/`)

Five workflows exist in `.github/workflows/`:

```
.github/workflows/
├── production-ci-cd.yml      # CI/CD test, audit, and Dokploy webhook deploy
├── deploy.yml                # Docker GHCR container build and Cloudflare Workers deploy
├── agentic-evals.yml         # GORTEX evals and guardrail checks
├── polyrepo-ci-matrix.yml    # Ecosystem validation matrix
└── release-please.yml        # Release automation
```

### 6.1 Critical Pipeline Deficiencies

1. **pnpm Version Incompatibility**:
   - Every single workflow file specifies:
     ```yaml
     - name: Install pnpm
       uses: pnpm/action-setup@v3
       with:
         version: 9
     ```
   - The workspace lockfile (`pnpm-lock.yaml`) is generated by **pnpm 11.17.0**. When pnpm 9 attempts to parse a pnpm 11 lockfile, it encounters schema warnings or forces regeneration.
   - Workflows compensate by running `pnpm install --no-frozen-lockfile`, which breaks reproducible build guarantees in CI.

2. **Test Failure Suppression Anti-Pattern**:
   - `production-ci-cd.yml`:
     ```yaml
     run: npx vitest run --reporter=verbose || echo "Vitest unit & integration test suite completed"
     run: pnpm audit --audit-level=high || echo "Advisories logged"
     ```
   - `polyrepo-ci-matrix.yml`:
     ```yaml
     run: pnpm run test || echo "Subsystem suites run independently in respective CI runners"
     ```
   - `deploy.yml`:
     ```yaml
     - name: Deploy to Cloudflare Workers
       continue-on-error: true
     ```
   - **Impact**: Test suites and security audits that fail will still exit with code 0, allowing broken or vulnerable commits to trigger production deployments via the Dokploy webhook (`DOKPLOY_DEPLOY_WEBHOOK_URL`).

3. **Dokploy Auto-Deploy Trigger**:
   - In `production-ci-cd.yml`, on push to `main`, a POST request is sent to `secrets.DOKPLOY_DEPLOY_WEBHOOK_URL`.
   - If the Dokploy server pulls and builds using `docker-compose.prod.yml`, the build succeeds. If it pulls root `Dockerfile`, it deploys an API server with a dead port 5000.

---

## 7. Production Readiness & Remediation Matrix

| Subsystem / Area | Current State | Risk Level | Required Remediation |
| :--- | :--- | :--- | :--- |
| **Local Docker Compose** | `deerflow` context points to non-existent `./deerflow_repo/Dockerfile`. | **High** | Change context to `./deerflow_repo/backend` or specify `dockerfile: backend/Dockerfile`. |
| **Unified Dockerfile** | Exposes port 5000 but only runs API server (:8080). | **High** | Either embed `server/index.mjs` proxy or run reverse proxy (caddy/nginx) inside container, or deprecate unified Dockerfile in favor of `docker-compose.prod.yml`. |
| **Bangla Audio AI Dockerization** | No `Dockerfile` exists; runs only on host via Python. | **Medium** | Create multi-stage `Dockerfile` with OpenVINO Intel GPU / CPU runtime for `bangla-audio-ai`. |
| **CI/CD pnpm Version** | Workflows pin pnpm 9; monorepo is on pnpm 11. | **High** | Update all workflows to `version: 11` and use `--frozen-lockfile`. |
| **CI/CD Test Masking** | `|| echo` swallows test and audit failures. | **Critical** | Remove `|| echo` fallbacks from all test and audit steps in GitHub Actions. |
| **Python venv Setup** | Venvs on D: are unpopulated; DeerFlow given Python 3.11 instead of 3.12+. | **High** | Install Python 3.12 on host, update `setup-ai-env.ps1` to target Python 3.12 for DeerFlow, and run `-InstallDeps`. |
| **Host Disk Space** | C: drive has only 22.7 GB free space. | **Medium** | Enforce all package caches (`pnpm`, `pip`, `uv`), Docker data root, and AI models reside on `D:\`. |
