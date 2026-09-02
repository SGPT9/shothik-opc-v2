---
summary: 'Defensive code only at real boundaries: internal modules rely on types and fail-fast, never mask errors with ?., || default, or empty catch'
---

# Defensive Code Only at Real Boundaries

- Real boundaries: user input, network/API, filesystem, third-party libraries, permissions, security, concurrency, cross-process or cross-system data.
- Between internal modules, rely on types, schemas, explicit invariants, fail-fast, and tests instead of defensive guards.
- Never mask upstream errors with unfounded `?.`, `|| default`, empty catch blocks, swallowed errors, duplicated state, or magic fallbacks. A guard that hides a broken internal invariant is a bug with better manners.
- Self-check for any guard: is this at a system boundary, or hiding a broken internal invariant? Which test would fail if I removed it?
