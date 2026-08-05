---
name: Next.js → Vite port conventions (shothik)
description: Durable rules for keeping the ported frontend buildable and stable
---

- Legacy `next/*` imports are resolved via Vite aliases to local shims — never patch individual importers when a new "Failed to resolve next/..." error appears; add/extend the alias instead.
- **Why:** dozens of files share these imports; per-file patches drift and get reintroduced by copies from the migration backup.
- Next's `useSearchParams()` must return a `URLSearchParams`-like object directly (not a wouter-style tuple), or pages crash with "searchParams.get is not a function".
- HOC-wrapped route components must be hoisted to module scope; creating them inline in the routes render remounts the whole layout on every parent rerender.
- Files rendering `<Image>` without an import silently resolve to the DOM `Image` constructor and crash at render — check imports when that error appears.
- The dev server's esbuild `.js`-as-JSX loader does NOT apply to production Rollup builds; any `.js` file containing JSX must be renamed `.jsx` or the build fails.
- Verify with the production build, not just the dev server — dev lazily transforms only visited routes, so unresolved imports on unvisited routes stay hidden until build.
