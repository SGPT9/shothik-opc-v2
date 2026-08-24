# ADR 0001: Spec-Driven Polyrepo-Monorepo Architecture & Workspace Hygiene

## Status
**ACCEPTED** (Confirmed & Executed)

## Context
Shothik is an enterprise-scale Autonomous AI Operating System. As the platform matured, capabilities spanning AI Swarms, Digital Twins, MCP Servers, LaTeX Publishing, Key Custody, Developer CLIs, and 57 Agent Skills were developed within a single master monorepo (`shothik-opc-v2`).

To enable independent CI/CD, external developer contributions, and micro-package distribution via npm and GitHub, we extracted 15 specialized standalone repositories. The workspace currently contains remaining submodules (`deer-flow-backend`, `inkos-clone`), along with ~85 MB of transient test and build artifacts (`.png`, `.log`, `.tar.gz`).

## Decisions Under Review
1. **Workspace Hygiene**: Permanently purge ephemeral test inspection captures, deployment logs, and monolithic tarballs from Git tracking.
2. **Sub-engine Extraction**: Extract `deer-flow-backend` into `shothik-research` and `inkos-clone` into `shothik-canvas` as dedicated repositories while maintaining clean SDK client wrappers in the master umbrella.
3. **Master Monorepo Synchronization**: Consolidate the root `README.md` as the unified Ecosystem Hub with verified CI badges, publishing tag `v2.0.0-enterprise`.

## Consequences
### Positive
* Fast, lightweight Git clones (<5s) across all repositories.
* Independent release cycles for skills, research workflows, and UI tools.
* Clear domain seams allowing third-party integration via npm and Claude/Cursor configs.

### Considerations
* Requires synchronization of version tags across package manifests.
