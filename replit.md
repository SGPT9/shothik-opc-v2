# Shothik AI — Replit Workspace

## Project Overview

**Shothik AI** is a comprehensive AI-powered writing and productivity platform. It provides tools for:
- AI chat (multi-agent conversations)
- Paraphrasing, humanizing AI text
- Grammar checking, summarizing, translating
- AI slide generation, research, plagiarism checking
- Community forums, marketplace, agent studio
- Writing studio, books/projects management

### Architecture

This is a **pnpm monorepo** with three artifacts:
- `artifacts/shothik` — Main React+Vite web frontend (serves at `/`)
- `artifacts/api-server` — Express API server (serves at `/api`)
- `artifacts/mockup-sandbox` — Design mockup canvas

### External API

Most API functionality proxies to `https://shothik.work` via Vite's proxy config in `artifacts/shothik/vite.config.ts`. The frontend also uses:
- **Convex** for real-time features (URL configured via `VITE_CONVEX_URL`)
- **Redux** for global state management
- **TanStack Query** for server state

### Running the App

The app runs via Replit workflows:
- `artifacts/shothik: web` — starts the Vite dev server
- `artifacts/api-server: API Server` — starts the Express backend

### Porting Notes

This app was ported from Next.js to Vite+React:
- `next/navigation` → `@/lib/navigation` (wouter-based shim)
- `next/link` → `<Link>` from wouter
- `next/image` → `<img>` tags
- API routes → proxied to external API via Vite config
- Convex and InsForge are stubbed; real credentials needed in `.env`

## User Preferences

- Keep all API calls proxied to `https://shothik.work` for the external backend
- Use oklch color values matching the Shothik design system
- Primary color: `oklch(64.91% 0.163 163.97)` (green)
