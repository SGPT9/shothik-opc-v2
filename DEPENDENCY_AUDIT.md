# Technology & Dependency Audit (`DEPENDENCY_AUDIT.md`)

**Deliverable 5 — Full-Project Deep Technical Audit (re-verified edition)**
**Date**: 2026-10-28
**Scope**: Node.js (`pnpm`) workspace, Python services, native/GPU dependencies.
**Method**: every statement below comes from commands run on 2026-10-28 on the audit host (`node`, `pnpm`, `pnpm audit`, `uv pip list`, file reads). The previous version of this file contained several claims that were wrong; they are listed in Section 7.

---

## 1. Node.js & PNPM

### 1.1 Toolchain actually in use
| Item | Verified value |
| :--- | :--- |
| Node.js on host | `v24.19.0` |
| pnpm on host | `11.17.0` (store: `D:\.pnpm-store\v11`) |
| Lockfile | [`pnpm-lock.yaml`](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/pnpm-lock.yaml), `lockfileVersion: '9.0'` |
| Declared engine / package manager | **None.** Root [`package.json`](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/package.json) has no `engines` and no `packageManager` field. `preinstall` only rejects non-pnpm user agents. |
| `.npmrc` | `auto-install-peers=false`, `strict-peer-dependencies=false` |
| Supply-chain control | [`pnpm-workspace.yaml`](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/pnpm-workspace.yaml): `minimumReleaseAge: 1440` (1 day), with `minimumReleaseAgeExclude` for `@replit/*`, `stripe-replit-sync`, `wrangler`, `miniflare`. |
| Shared versions | pnpm `catalog:` (e.g. `drizzle-orm`, `zod`, `@tanstack/react-query`, `clsx`, `framer-motion`, `lucide-react`) |

### 1.2 Workspace projects (`pnpm -r`, 13 projects + root)
| Package | Prod deps | Dev deps |
| :--- | :-: | :-: |
| `@workspace/shothik` (frontend) | 80 | 69 |
| `@workspace/api-server` | 14 | 9 |
| `@workspace/mockup-sandbox` | 0 | 60 |
| `@workspace/db` | 5 | 3 |
| `@workspace/swarm-orchestrator` | 3 | 3 |
| `@shothik/taste-skill` | 3 | 4 |
| `@shothik/gortex` | 1 | 4 |
| `@workspace/office-engine` | 2 | 0 |
| `@workspace/hermes`, `@workspace/api-zod`, `@workspace/api-client-react` | 1 each | 0 |
| `@workspace/api-spec` | 0 | 1 |
| `@workspace/scripts` | 0 | 2 |

`@workspace/api-server` direct runtime dependencies are exactly: `@pinojs/redact`, `@libsql/client`, `cookie-parser`, `cors`, `drizzle-orm`, `express@^5.2.1`, `pino`, `pino-http`, `zod` and five workspace packages. It does **not** depend on `helmet`, `express-rate-limit`, `pg` or `better-sqlite3` directly (`pg` is a dependency of `@workspace/db`).

### 1.3 Findings
| ID | Severity | Finding | Evidence |
| :--- | :--- | :--- | :--- |
| **DEP-01** | **High** | **Known-vulnerable packages.** `pnpm audit` (all deps, 1,659 packages): **4 critical, 69 high, 91 moderate, 21 low**. Production-only (`--prod`, 849 packages): **2 critical, 47 high, 62 moderate, 13 low**. | `pnpm audit --json`, `--prod --json` (run 2026-10-28; advisory database is live, so counts will drift). |
| **DEP-02** | High | Critical advisories: `dompurify` (`>=3.4.4 <=3.4.16`, fix `>=3.4.17`; also 4 more) and `proxy-addr` (`<2.0.8`, IP spoofing via IPv4-mapped IPv6 trust subnet; reached through Express) are in the **production** set; `tinypool` (RCE via prototype pollution, 2 advisories) is dev/test tooling (vitest). | Same audit output. |
| **DEP-03** | High | Most-affected production modules (high severity or worse): `axios` (7), `undici` (7), `@xmldom/xmldom` (8), `hono`/`@hono/node-server`, `xlsx` (2), `markdown-it` (2), `js-yaml` (2), `lodash`, `mysql2`, `body-parser` (via Express 5), `fast-uri`, `follow-redirects`, `brace-expansion`, `image-size`, `@tiptap/core`, `prosemirror-view`, `zod`, `effect`, `deepmerge-ts`, `source-map-js`. Reachability was not analysed; many are transitive. | `pnpm audit --prod`. |
| **DEP-04** | Medium | Root `overrides` pins `axios` to `^1.7.9`, a range that still resolves into the vulnerable `>=1.13.0 <1.20.0` band; vulnerable `axios` is in the audit output. The override should require `>=1.20.0`. | [package.json](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/package.json) `overrides`; audit output. |
| **DEP-05** | Medium | Non-reproducible container install: root [Dockerfile](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/Dockerfile#L11) uses `corepack prepare pnpm@latest` (L11) and `pnpm install --no-frozen-lockfile` (L30), so the lockfile is not enforced and the pnpm major can change under you (host is already on 11.x). Add `packageManager` + `engines` and use `--frozen-lockfile`. | Dockerfile read. |
| **DEP-06** | Medium | Windows-only native binaries are declared as direct root devDependencies (`@esbuild/win32-x64`, `@rollup/rollup-win32-x64-msvc`, `@tailwindcss/oxide-win32-x64-msvc`, `lightningcss-win32-x64-msvc`). Meanwhile `pnpm-workspace.yaml` overrides state "replit uses linux-x64 only" and strip other esbuild platforms. Whether `pnpm install` succeeds on Linux/Docker with these was **not tested** (no Linux build run); treat as a portability risk. | `package.json` and workspace overrides. |
| **DEP-07** | Low | Two build-script allow lists exist (`onlyBuiltDependencies` in `package.json`, plus `onlyBuiltDependencies`/`allowBuilds` in `pnpm-workspace.yaml`) and disagree (e.g. `@swc/core`, `msw` only in the workspace file; `onnxruntime-node`, `core-js` only in `package.json`; `allowBuilds` sets several to `false`). Behaviour depends on pnpm version. | Both files. |
| **DEP-08** | Low | Replit-specific tooling remains (`@replit/*` packages, catalog entries, `minimumReleaseAgeExclude`). Not harmful, but ties the workspace to that ecosystem. | `package.json`, workspace file. |
| **DEP-09** | Info | PNPM is appropriate for the Node portion: 13 interdependent workspace packages with `workspace:*` links and a shared catalog. Not measured: duplicated or unused dependencies (no `depcheck`/`knip` run). | n/a |

---

## 2. Python Services

### 2.1 `bangla-audio-ai`
| Item | Verified |
| :--- | :--- |
| Files in repo root | `README.md`, `requirements.txt`, plus the audit markdown files. **There is no `pyproject.toml` and no `requirements.lock`.** |
| Dependency spec | [`requirements.txt`](file:///c:/Users/USER/hermes/bangla-audio-ai/requirements.txt): 16 packages, all lower-bounded ranges (e.g. `openvino>=2024.6.0`, `torch>=2.5.0,<2.8.0`, `transformers>=4.48.0,<5.0.0`, `faster-whisper>=1.1.0`, `fastapi>=0.115.0`). **Nothing is pinned or locked**, so installs are not reproducible. |
| Virtual environment | `.venv` exists and resolves to `D:\ai_venvs\bangla-audio-ai` (Python `3.11.15`), but it is **empty**: `uv pip list` returns no packages and it has no `pip`. |
| What runs today | The system interpreter `C:\Users\USER\AppData\Local\Programs\Python\Python311\python.exe` has `torch==2.4.1` (below the `>=2.5.0` pin), `numpy==2.4.6`, `uvicorn==0.52.3`, and no `fastapi`, `openvino` or `faster-whisper` in the checked package set. The Node `voice.test.ts` bridge test therefore exercises the **standard-library fallback server** in [server.py](file:///c:/Users/USER/hermes/bangla-audio-ai/src/api/server.py), not a FastAPI/OpenVINO deployment. (The test's exact interpreter was not re-run in this pass.) |
| Pre-audit pin problem | The earlier note that `requirements.txt` held non-existent versions (`torch==2.13.0` etc.) cannot be re-verified now; the present file is syntactically valid ranges. |

### 2.2 DeerFlow backend (`deerflow_repo/backend`)
| Item | Verified |
| :--- | :--- |
| Spec | [`pyproject.toml`](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/deerflow_repo/backend/pyproject.toml): `requires-python = ">=3.12"`, 12 direct deps; `uv.lock` present; uv workspace member `packages/harness` ([`deerflow-harness`](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/deerflow_repo/backend/packages/harness/pyproject.toml), also `>=3.12`, 26 deps incl. `langgraph`, `langchain*`, `kubernetes`, `duckdb`, `tavily-python`, `firecrawl-py`, `markitdown`). |
| Virtual environment | `.venv` is a junction to `D:\ai_venvs\deerflow`, interpreter **Python 3.11.15**, which **cannot satisfy** `requires-python >=3.12`. The venv is **empty** (`uv pip list` shows no packages). |
| Consequence | The DeerFlow service cannot start from this environment. The Node bridge (`research-paper.ts`) therefore always falls back to the inference gateway / `AutoResearchBridge` on this host. (Fallback behaviour itself was confirmed from source in Deliverable 2.) |
| Other venvs | `D:\ai_venvs` also contains `openwebui` and `rvc`; contents not inspected. |

### 2.3 Additional Python facts
- Node-to-Python communication is HTTP only (no shared native libs).
- GPU: no CUDA verification was performed; `config/settings.py` sets `OPENVINO_DEVICE = "GPU"`, which only matters once `openvino` is installed.
- Model-loading cost, memory and inference latency were **not measured** (no model weights are loaded by the fallback server).

---

## 3. How the Tools Coexist (recommendation, not current state)
| Layer | Tool | Lock | Isolation |
| :--- | :--- | :--- | :--- |
| Node/TS | pnpm 11 workspace | `pnpm-lock.yaml` | `node_modules` (store on `D:`) |
| Python service(s) | `uv` + one `pyproject.toml` per service, Python `3.12` for DeerFlow | `uv.lock` per service (missing today for `bangla-audio-ai`) | one venv per service |
| Reproducible runtime | Docker image per service | image digest | container |
PNPM and venv are orthogonal; the gap is that the Python side is not actually provisioned or locked.

---

## 4. Recommended Actions (ordered)
1. Run `pnpm audit fix` / bump `dompurify`, `axios` (override to `>=1.20.0`), `express`/`body-parser`/`proxy-addr`, `xlsx` replacement, then re-audit; measure reachability for the rest.
2. Add `packageManager` and `engines` to the root manifest; change the Dockerfile to a pinned pnpm and `--frozen-lockfile`.
3. Decide Python versions: recreate the DeerFlow venv on Python `3.12+` with `uv sync` (or drop the service); create `pyproject.toml` + `uv.lock` for `bangla-audio-ai` and install into its venv.
4. Reconcile the two build-script allow lists.
5. Re-run a Linux install (Docker) to confirm DEP-06.

---

## 5. Not Assessed
`pip-audit` / `uv` vulnerability scans for Python, unused-dependency detection, bundle-size analysis, licence review, and any Linux/Docker build.

---

## 6. Evidence Snapshot
- `pnpm audit --json` totals: critical 4, high 69, moderate 91, low 21, info 0; `totalDependencies` 1659.
- `pnpm audit --prod --json` totals: critical 2, high 47, moderate 62, low 13; `totalDependencies` 849.

---

## 7. Corrections to the Previous Version
| Previous claim | Reality |
| :--- | :--- |
| `pnpm@10.26.1`, Node engine `>=22.0.0` | Host pnpm is `11.17.0`; no `engines`/`packageManager` declared. |
| `@workspace/api-server` uses `helmet`, `express-rate-limit`, `pg` | Not in its dependency list. |
| deerflow "Production-Ready", isolated `.venv` | venv is Python 3.11 vs `>=3.12` required, and empty. |
| `bangla-audio-ai` provisioned with a working venv; `pyproject.toml`/`requirements.lock` exist | venv is empty; neither file exists. |
| "906 GB free" on `D:` | Not re-measured. |
