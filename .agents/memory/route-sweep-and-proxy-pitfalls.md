---
name: Route sweep & proxy pitfalls
description: How to crash-test all SPA routes headlessly, and Vite proxy keys that swallow page routes
---

## Headless route sweep without Playwright
Nix store ships ungoogled-chromium (find via `ls /nix/store | grep ungoogled-chromium`). Run it with `--headless --no-sandbox --remote-debugging-port=9222` and drive CDP over Node's built-in WebSocket to catch `Runtime.exceptionThrown`, console errors, the vite-error-overlay (shadow DOM — read `ov.shadowRoot.querySelector('.message')`), and `#root` innerHTML length. Background processes die between ShellExec calls — launch chromium and the sweep script in the SAME shell command.
**Why:** `--dump-dom` misses runtime errors (overlay is shadow DOM) and module `curl` checks only catch transform errors, not render crashes.

## Vite proxy keys are prefixes — they swallow SPA page routes
A proxy entry like `'/paraphrase'` intercepts navigation to the `/paraphrase` page (500 when target is unreachable). Use the full API path prefix (e.g. `/paraphrase-with-variant`) so page routes stay with the SPA.

## Port-specific crash patterns found in sweep (Next→Vite)
- `import * as motion from "motion/react-client"` + `motion.div`: aliasing to `framer-motion` breaks namespace usage; needs a stub re-exporting `motion.div` etc. as named exports (`src/lib/stubs/motion-react-client.ts`).
- Next 15 `use(params)` / `await params` in pages: wouter passes params as a plain object — destructure directly.
- Next layout.jsx files with context providers are NOT auto-applied; wrap the page with its layout in App.tsx lazy imports or the page's `useContext` returns undefined.
- `async function Page()` client components crash under plain React — drop `async`.
