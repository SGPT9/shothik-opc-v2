---
description: Comprehensive agent instructions, InsForge BaaS integration guide, and DeepSeek-close interface design rules
globs: *
alwaysApply: true
---

# AGENTS.md — Shothik Workspace Rules & Guidelines

## 1. Interface Design Standard: DeepSeek-Close Minimalist Shell
When developing, refactoring, or reviewing any frontend component in Shothik (`artifacts/shothik/src/**/*`), you **MUST** follow the rules defined in [`.agents/rules/shothik-interface-design.md`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/.agents/rules/shothik-interface-design.md):
- **Ask-First**: Center the experience on typing and getting results. Never require mode selection before typing.
- **3-Part Shell**: `Sidebar` (navigation) ➔ `Conversation` (primary work surface & composer) ➔ `User Details Drawer` (contextual secondary depth, closed by default).
- **Empty State**: Short heading + 1 line + 3 outcome-based starter prompts (*Research*, *Analysis*, *Create*). Zero launcher strip clutter around the composer on first paint.
- **Unified `Tools` Menu**: Group all advanced workflows into `Tools` (*Research*, *Create*, *Web Automation*, *Voice Mode*).
- **Intent-First Routing**: Infer GitHub repos, web automation, deep research, slides, and sheets directly from natural language prompts.
- **Dual-Voice Ergonomics**: Separate **Voice Input** (dictation into textarea) from **Voice Mode** (conversational fluid voice orb).
- **Surface Discipline**: Restrict raw trajectory traces, debug logs, and audit internals to privileged admin surfaces.

---

<!-- INSFORGE:START -->
## 2. InsForge Backend Integration

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **oss-project** (API base `https://ers8j28a.ap-southeast.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:
- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->
