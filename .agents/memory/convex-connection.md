---
name: Convex connection
description: How the shothik frontend is wired to the live Convex deployment, and deploy-key pitfalls.
---

- Frontend connects to Convex deployment `dashing-mandrill-233` via `VITE_CONVEX_URL` (shared env). Vite stub aliases for convex/react|browser|server were removed; real client is active. `src/convex/_generated/api.ts` uses `anyApi` from convex/server — identical to official Convex JS codegen output, safe in browser bundles.
- Backend functions live in the GitHub fork (ahsanhab919-ux/shothik-web `convex/` dir, ~38 modules / ~297 functions). Deploy with `npx convex dev --once --typecheck=disable` (upstream has TS errors) from a clone with CONVEX_DEPLOY_KEY set.
- **Deploy key pitfalls:** users often paste the key with a literal `CONVEX_DEPLOY_KEY=` prefix inside the secret value — strip with `${VAR#CONVEX_DEPLOY_KEY=}` before use. Scoped/limited dev keys fail with `deployment:logs:view` / `data:view` permission errors mid-push; a full-permission dev key is required.
- **Why:** the stored Replit secret CONVEX_DEPLOY_KEY may still be the old double-prefixed limited key; a working full key was used transiently in-session (exposed in chat — should be rotated and re-saved).
- **How to apply:** any future `npx convex` CLI work: strip prefix, expect typecheck failures, verify with `npx convex function-spec`.
