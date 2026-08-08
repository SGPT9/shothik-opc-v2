# Shothik AI — Frontend Monorepo

A **pnpm workspace monorepo** containing the Vite + React frontend, Express API gateway, and supporting tooling for [Shothik AI](https://app.shothikgpt.com) — an AI-powered writing and productivity platform.

---

## Monorepo layout

```
/
├── artifacts/
│   ├── shothik/          # Main web frontend (React + Vite)
│   ├── api-server/       # Express API gateway (proxies /api → shothik.work)
│   └── mockup-sandbox/   # Design canvas / component preview server
├── packages/
│   └── db/               # Shared Convex schema & generated types
├── deploy/               # Docker Compose files for VPS / local deployment
├── scripts/              # Post-merge and utility scripts
└── pnpm-workspace.yaml
```

### `artifacts/shothik` — Web frontend

React 18 + Vite SPA, ported from Next.js. Key libraries:

| Area | Library |
|---|---|
| Routing | [wouter](https://github.com/molefrog/wouter) + shims at `src/lib/navigation` |
| State | Redux Toolkit + TanStack Query |
| Real-time | [Convex](https://convex.dev) (`VITE_CONVEX_URL`) |
| Auth | [InsForge](https://insforge.app) browser SDK (`VITE_INSFORGE_URL`, `VITE_INSFORGE_ANON_KEY`) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| i18n | Custom hook at `src/i18n` — English + Bengali |

### `artifacts/api-server` — API gateway

Express server mounted at `/api`. Proxies chat, twin, and tool endpoints to the main Hermes backend at `CHAT_API_ORIGIN` (default `https://www.shothikgpt.com`). Owns Convex JWT signing and the Tonight Engine (agent swarm) routes.

---

## Running locally (Replit)

Workflows are managed by the Replit platform:

```
artifacts/shothik: web       →  pnpm --filter @workspace/shothik run dev
artifacts/api-server: ...    →  pnpm --filter @workspace/api-server run dev
```

### Required environment variables

| Variable | Description |
|---|---|
| `VITE_CONVEX_URL` | Convex deployment URL (`https://<name>.convex.cloud`) |
| `VITE_INSFORGE_URL` | InsForge project base URL |
| `VITE_INSFORGE_ANON_KEY` | InsForge browser-safe anonymous key |
| `CHAT_API_ORIGIN` | Hermes backend origin (default `https://www.shothikgpt.com`) |
| `GEMINI_API_KEY` | Google Gemini API key (used by api-server) |
| `SESSION_SECRET` | Express session secret |
| `CONVEX_DEPLOY_KEY` | Convex deploy key for schema pushes |

> **Never commit actual values.** Set them as Replit Secrets or in a local `.env` (already gitignored).

---

## Docker deployment

See [`deploy/README.md`](./deploy/README.md) for Docker Compose instructions for the VPS at `app.shothikgpt.com` and the Hermes engine.

---

## Key design decisions

- **Vite `define` block** inlines `NEXT_PUBLIC_*` env vars at build time for compatibility with components originally written for Next.js (`artifacts/shothik/vite.config.ts`).
- **`/api` routing** is owned entirely by `artifacts/api-server`; the Vite dev proxy forwards `/api/*` to that gateway, not to an external host directly.
- **Convex auth** uses a custom JWT-exchange flow: the api-server signs a short-lived Convex token using `CONVEX_DEPLOY_KEY`, which the frontend then uses for `ConvexProviderWithAuth`.
- **InsForge auth** uses the browser SDK directly; the anonymous key is intentionally public (browser-safe) and is not a secret.
