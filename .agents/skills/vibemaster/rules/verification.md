---
summary: "Verify via the project's own commands and scripts. Degraded verification must be labeled. Screenshots for visual changes"
---

# Verification Discipline

- Discover official commands first: AGENTS.md, README, docs/, scripts/, package.json, Makefile, justfile, Procfile. Do not assume `make` exists.
- When the user gives a start command, run it as-is. Do not swap `run`/`start`/`dev`/`serve`/`preview` or rewrite `./script` as `bash script`, unless the original fails and you have stated why.
- Confirm working directory, env files, and port sources before starting. Run long-lived dev servers in a persistent session.
- If a project script fails, read the error and the script to locate the cause. Do not fall back to static HTML or build artifacts and present that as "browser tested". When degraded verification is unavoidable, label it as degraded explicitly.
- UI changes with visual impact: before/after screenshots.
- When finished, only stop the sessions and processes you started.
