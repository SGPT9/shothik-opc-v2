# Security, Reliability & Code Quality Audit (`SECURITY_AUDIT.md`)

**Deliverable 4 — Full-Project Deep Technical Audit (re-verified edition)**
**Date**: 2026-10-28
**Scope**: `C:\Users\USER\hermes\shothik-web-mirror-v2` & `c:\Users\USER\hermes\bangla-audio-ai`
**Secret handling**: no secret values appear in this report; only file names, variable names and value lengths/presence are given. All values are `[REDACTED]`.
**Method**: every finding below was re-checked against the current source on 2026-10-28 (grep / file reads / `git ls-files`). The previous version of this file contained claims that did not survive that check (see Section 6).

---

## 1. Executive Summary

| Area | Verdict |
| :--- | :--- |
| Secrets in version control | **Critical open issue**: populated production env files are tracked by git (SEC-A). |
| Authorization | **Critical open issue**: only 2 of 138 route files reference any auth check (SEC-B). |
| Hard-coded fallback secrets | **High**: several security-relevant secrets fall back to a literal in source (SEC-C). |
| Abuse protection / headers | **High**: no rate limiting, no `helmet`, open `cors()` (SEC-D). |
| Code sandbox | **Medium-High residual risk**: regex deny-list, not OS-level isolation (SEC-E). |
| Auth hardening done earlier | Verified present in code (SEC-01..04, 06, 07). |

Measured vs. unmeasured: the items below are source-level facts. No dependency CVE scan (`pnpm audit`) or load test was run in this pass (needs network / was not performed), so dependency vulnerabilities and concurrency limits remain **unmeasured**.

---

## 2. Open Findings (not remediated)

| ID | Severity | Finding | Evidence | Recommended action |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-A** | **P0 Critical** | `.env.production` and `.env.production.local` are **tracked in git** and contain populated values for `JWT_SECRET`, `KEY_VAULT_SECRET`, `BETTER_AUTH_SECRET`, `DATABASE_URL`, `INSFORGE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, `GEMINI_API_KEY`, `WHATSAPP_VERIFY_TOKEN` (`.env.production`) and `JWT_PRIVATE_KEY`, `VERCEL_OIDC_TOKEN`, `VERCEL_WEBHOOK_SECRET`, `INSFORGE_API_KEY` (`.env.production.local`). `.gitignore` contains `.env*`, but that does not untrack files already committed. Introduced in commit `956ce8e2` (also `0279755b`, `f33cafd6` touch them) and that commit is reachable from `main` and from `backend/main`, `docs/main`, `economics/main` remote-tracking refs, i.e. very likely already pushed to `github.com/SGPT9/*`. | `git ls-files` lists both files; `git log -- .env.production .env.production.local`; value presence/length check (values not printed). | **Treat all those credentials as compromised: rotate them first**, then `git rm --cached` the files, and purge history (e.g. `git filter-repo`) if the remotes are or were public. Whether the GitHub repos are public was not checked. |
| **SEC-B** | **P0 Critical** | **Broken access control.** Of 138 files in `artifacts/api-server/src/routes`, only `auth.ts` and `sandbox.ts` reference `verifyAuthRequest`/`verifyToken`. `app.ts` mounts no global auth middleware. Handlers commonly accept identity from the request body (e.g. `userId = "usr_default"` in [jobs.ts](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/jobs.ts#L18), [nightshift.ts](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/nightshift.ts#L13)), so any caller can act as any user (IDOR) and reach money-, tax-, key- and agent-related endpoints. Caveat: auth could be enforced upstream (reverse proxy / Cloudflare Access); no such enforcement exists in this repository. | `Select-String` for auth helpers across `routes/*.ts`; [app.ts](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/app.ts#L30-L41). | Add an auth middleware at `/api` mount with an explicit public-route allow-list; derive `userId` from the verified token, never from the body. |
| **SEC-C** | **P1 High** | Security-relevant secrets fall back to literals in source: [`whatsapp.ts` L20-L21](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/whatsapp.ts#L20-L21) (`WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, the latter used for HMAC webhook verification, so webhooks are forgeable if the env var is unset), [`user-key-vault.ts` L6](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/lib/user-key-vault.ts#L6) (key-vault encryption secret), [`connectors.ts` L111](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/connectors.ts#L111) (`PIPEDREAM_WEBHOOK_SECRET`), `meta-capi-engine.ts` L70, `chat-local.ts` L283 (`HERMES_API_KEY`). `JWT_SECRET` has a dev literal too ([auth.ts L50](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/auth.ts#L46-L50)) but is guarded by a production startup throw. | grep for `process.env.X || "<literal>"` patterns (literals redacted). | Fail fast at startup in production for every secret above; no literal fallbacks. |
| **SEC-D** | **P1 High** | No abuse/transport hardening: `helmet` and `express-rate-limit` are **not** dependencies of `@workspace/api-server` and are not used anywhere in `src`; `app.use(cors())` is open to all origins ([app.ts L30](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/app.ts#L30)); `express.json()` uses the default body limit. The frontend prod server also sends `Access-Control-Allow-Origin: *` ([server/index.mjs](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/server/index.mjs#L40-L47)). Unauthenticated LLM-backed endpoints can therefore be abused for cost and DoS. | `package.json` deps (only `cors`, `cookie-parser`, `@pinojs/redact`); grep. | Add `helmet`, per-IP and per-user rate limits (stricter on `/v1/inference`, `/v1/sandbox`, auth), restrict CORS origins, set body size limits. |
| **SEC-E** | **P1 Medium-High** | The "sandbox" ([code-sandbox.ts](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/lib/code-sandbox.ts#L66-L103)) spawns `node`, `python` and `bash` as the server's OS user with a stripped env and a 15-pattern regex deny-list. Regex filtering is bypassable (string building, encodings, `bash` builtins, network tools) and there is no filesystem, network or resource isolation. Auth is only required when `NODE_ENV=production` ([sandbox.ts L26-L29](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/sandbox.ts#L26-L29)); `/v1/sandbox/simulate-webhook` and `/deerflow-calc` have no auth check in that file. | Source read. | Run untrusted code in a container/gVisor/Firecracker or remove `bash`; apply auth to all sandbox routes. |
| **SEC-F** | **P2 Medium** | Cloudflare Access identity is trusted when `CF_ACCESS_ENABLED=true` and a `cf-access-jwt-assertion` header is merely **present** ([auth.ts L332-L335](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/auth.ts#L332-L335)); the JWT signature is not verified in the code read, so it is spoofable unless the origin is reachable only via Cloudflare. | Source read (lines 330-340). | Verify the Access JWT against the team JWKS, or firewall the origin. |
| **SEC-G** | **P2 Medium** | Users, credits and password hashes persist in a JSON file (`artifacts/api-server/data/users.json`) with an in-process map; single-instance only, no locking across processes, and not in the DB. Token format is custom HMAC (not standard JWT), 30-day expiry, no revocation list. | [auth.ts L23-L120](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/auth.ts#L23-L120). | Move users to PostgreSQL; use a vetted JWT library with `kid` rotation and revocation. |
| **SEC-H** | **P3 Low** | The reverse-proxy catch-all ([proxy.ts](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/proxy.ts#L9-L62)) forwards all request headers (including `Authorization` and cookies) to `CHAT_API_ORIGIN` (default `https://www.shothikgpt.com`) for any unmatched `/api/*` route. | Source read. | Allow-list forwarded headers; confirm the upstream is first-party. |

---

## 3. Hardening Verified Present in Current Code

| ID | Item | Evidence |
| :--- | :--- | :--- |
| **SEC-01** | Production fail-fast if `JWT_SECRET` unset ([auth.ts L46-L49](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/auth.ts#L46-L49)); `timingSafeEqual` with length check ([L64-L80](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/auth.ts#L64-L80)); dev seed accounts only when `!isProduction` (L123-L148); `?dev=1`/`x-dev-mode` only when `!isProduction` (L362); dev OAuth simulation blocked in production unless `ALLOW_DEV_OAUTH_SIMULATION=true` (L385); `oneTapUser` blocked in production (L494). Pre-audit state is from earlier session notes and cannot be re-verified now. | grep + source read. |
| **SEC-02** | `sanitizeRedirectPath()` ([auth.ts L188](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/auth.ts#L188)); regression test at [auth.test.ts L97](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/__tests__/auth.test.ts#L97). | grep + test list. |
| **SEC-03 (partial)** | `buildMinimalEnv()` + `SAFE_ENV_KEYS`, timeout clamp `[500, 15000]` ms, 15 deny patterns; spawn uses the minimal env ([L131-L133](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/lib/code-sandbox.ts#L131-L133)). Isolation is limited, see SEC-E. | Source read; [sandbox.test.ts](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/__tests__/sandbox.test.ts) (4 tests). |
| **SEC-04** | [services/skillRunner.ts](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/services/skillRunner.ts#L1-L55): name regex `^[a-zA-Z0-9_-]+$`, resolved path must stay inside a `SKILL_PATHS` base, `execFile` (no shell), 30 s timeout. (Earlier text cited `lib/skills/skillRunner.ts`; that path does not exist.) | Source read. |
| **SEC-06** | `persistUsers()` uses a **50 ms** debounced async `fs.promises.writeFile` with `.unref()` ([auth.ts L88-L106](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/auth.ts#L88-L106)); earlier text said 150 ms. | Source read. |
| **SEC-07** | Root [Dockerfile L36-L37](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/Dockerfile#L36-L37) builds `@workspace/api-server` and `@workspace/shothik` without `|| true`. | grep. |
| Logging | `pino` `redact` list configured ([logger.ts L7](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/lib/logger.ts#L7)); request logs strip query strings ([app.ts L9-L27](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/app.ts#L9-L27)). | Source read. |
| Webhook HMAC | WhatsApp webhook verifies `x-hub-signature-256` with HMAC-SHA256 ([whatsapp.ts L102-L112](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/whatsapp.ts#L102-L112)) but see SEC-C for the fallback secret. | Source read. |
| Graceful shutdown | In-flight drain + 503 during shutdown ([graceful-shutdown.ts](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/lib/lifecycle/graceful-shutdown.ts#L24-L120)). | Source read. |

---

## 4. Local Secrets on Disk (names only)

- `.env.local` (untracked, ignored by `.env*`) defines a very large set of provider variables (names only were read), including `JWT_SECRET`, `DATABASE_URL`, `STRIPE_SECRET_KEY`, `RAZORPAY_KEY_SECRET`, `BKASH_APP_SECRET`, `BKASH_MERCHANT_SECRET`, `NAGAD_MERCHANT_SECRET`, `STEADFAST_API_KEY`, `NVIDIA`/`DEEPSEEK`/`OPENROUTER`/`GEMINI` keys, `JWT_PRIVATE_KEY`. Only variable names were listed; whether each has a non-empty or live value was not checked for this file. `.env.local` is not tracked.
- Template files (`.env.example`, `.env.hostinger.example`) contain only empty values or short placeholders by length check. `.env.hostinger.example` has short non-empty values for `POSTGRES_PASSWORD` and Stripe/Clerk keys; they look like placeholders but were not inspected by value.

---

## 5. Reliability / Performance Observations

- **Measured**: full test suites green (API `156` suites / `914` passed, `8` skipped; frontend `423` suites / `2,122` tests) from earlier runs in this engagement.
- **Source-level risks, not load-tested**: in-memory state (users map, RAG store, rate-less endpoints, sagas/actors/jobs are process-local) means no horizontal scaling and data loss on restart unless persisted; synchronous `scryptSync` password hashing blocks the event loop under login bursts; RAG and embedding caches are bounded only by a 10,000-vector FIFO; SQLite WAL with `busy_timeout=5000` is used for the local fallback.
- The earlier SEC-08 reference to `lib/sqlite-db.ts` was wrong: that file does not exist. SQLite lives in [`lib/db/src/sqlite.ts`](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/lib/db/src/sqlite.ts).

---

## 6. Corrections to the Previous Version of This File

| Previous claim | Reality |
| :--- | :--- |
| "Helmet CSP/HSTS configured in `app.ts` L130-150" | `app.ts` is 69 lines and has no `helmet`. |
| "`express-rate-limit` guards high-risk endpoints; `payment-Router.ts`" | No rate-limit library or file by that name exists. |
| "All 8 P0 vulnerabilities remediated" | Remediation of SEC-01..04 is verified; new P0s (SEC-A, SEC-B) exist. |
| "`.gitignore` excludes `.env*` (mitigated)" | Two populated production env files are still tracked. |
| `sandbox/execute`, `lib/skills/skillRunner.ts`, `lib/sqlite-db.ts`, 150 ms debounce | Real: `/v1/sandbox/run`, `services/skillRunner.ts`, `lib/db/src/sqlite.ts`, 50 ms. |

---

## 7. Not Assessed in This Pass

Dependency CVEs (`pnpm audit`, `pip-audit`), file-upload size/type limits in [files.ts](file:///C:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/api-server/src/routes/files.ts) (no explicit limit found by grep), SQL-injection review of raw SQL in `db-bootstrap.ts` and route files, SSRF review of URL-ingesting endpoints (`rag`, `scraper`, `browser-takeover`), Python-service security (`bangla-audio-ai` bind address and auth were not verified (the server file was read only to line 120; it has no auth in that portion)), Docker image hardening, and the 15 secondary cloned repos.
