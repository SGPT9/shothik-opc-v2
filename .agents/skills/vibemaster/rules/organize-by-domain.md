---
summary: 'Organize files and content by domain (task, feature, scenario), not by type or layer. Typed files live inside domain directories'
---

# Organize by Domain, Not by Type

When creating directories, docs, or modules, group by domain first (the task, feature, or business scenario), with typed files inside. Do not create top-level type or layer buckets.

- Working docs: one directory per task (e.g. `.issues/<YYYY-MM-DD-topic>/` holding `spec.md`, `plan.md`, `notes.md`), not type buckets like `plans/` and `design/` that scatter one task across directories. Kiro (`.kiro/specs/<feature>/`) and spec-kit (`specs/NNN-feature/`) follow the same shape.
- Code: prefer package-by-feature over package-by-layer (the Go convention). A feature's handler, logic, and types live together, not in global `controllers/`, `services/`, `models/` buckets.
- The test: can one unit of business meaning be taken, reviewed, moved, or deleted as a whole? If a single task or feature is scattered across type folders, the structure is wrong.
- Exception: genuinely cross-cutting shared assets may sit in a shared location. Keep that set small.
