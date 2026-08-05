---
name: Shared db package builds
description: Consumers typecheck against the shared db package's emitted d.ts, not src.
---

- **Rule:** after changing the shared db package's schema/exports, rebuild its declaration output (`npx tsc -b --force` in the package) before typechecking consumers, and apply the schema with its push script.
- **Why:** consumers resolve the composite project's stale `dist/` d.ts, so new exports appear "missing" even though the source is correct — a misleading failure that is not fixable in the consumer.
