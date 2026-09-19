# Shothik AI / Polsia OPC — Official Production Release Notes v2.8.0

**Release Tag**: `v2.8.0-release`  
**Release Date**: September 18, 2026  
**Target Environment**: Monorepo Architecture (`@workspace/api-server`, `@workspace/shothik`, `@workspace/db`, `@workspace/hermes`, `@workspace/office-engine`, `@workspace/taste-skill`)

---

## 🌟 Executive Summary

Release **v2.8.0** establishes the **Agentic Engineering Operating System & Statutory Compliance Suite**. It introduces the 9 JSMastery engineering workflow skills directly into the editor environment, unlocks full **NBR Mushak-6.3 VAT & TDS Statutory Compliance Studio** (`⌘X`), formalizes **Supervised Autonomy** for monetary operations, and certifies all 27 foundation milestones under a 100% green automated test suite.

---

## 🚀 Key Major Features Added in v2.8.0

### 1. 📋 Statutory NBR Mushak-6.3 VAT & TDS Studio (`⌘X`)
- **Statutory Tax Calculations**: Full engine support for 0%, 5%, 7.5%, 10%, and 15% VAT, Supplementary Duty (SD), and TDS withholding tax (IT 2%, Print 3%, Supplies 5%, Professional 10%).
- **13-Digit BIN Validation**: Live checksum verification for seller and buyer Business Identification Numbers.
- **Statutory Printable Canvas**: Official NBR format with Bengali/English headers, tax breakdown tables, and cryptographically signed QR verification tokens (`vat.nbr.gov.bd`).
- **Mushak-9.1 Monthly Return Aggregator**: Treasury Code `1-1133-0006-0311` auto-reconciliation.

### 2. 🛡️ 9-Skill Agentic Engineering Pipeline (`.agents/skills/`)
- **`scope`**: Living requirement decomposition and milestone ordering in `docs/scope/scope.md`.
- **`audit`**: Automated monorepo context mapper creating nested, tool-agnostic `AGENTS.md` context files.
- **`architect`**: Tradeoff-driven design specifications in `docs/specs/` mapping value sources to eliminate hallucinated decisions.
- **`develop`**: Specification-grounded implementation engine that refuses unmade decisions.
- **`check` (`verify` & `review`)**: Interactive real-app verification and cross-model code review.
- **`test`**: High-intent test authoring covering edge cases and regression scenarios.
- **`document`**: PR, changelog, and release note authoring directly from git diffs.
- **`debug`**: Single-hypothesis root-cause investigation loops.
- **`sync`**: Post-merge knowledge reconciliation between code and documentation.

### 3. 💳 Supervised Autonomy & Safe Commerce
- **Transaction Gatekeeper**: Any monetary transfer, bKash payout, or statutory invoice exceeding ৳10,000 halts for manual merchant review via `SupervisedApprovalModal.tsx`.
- **Idempotent Dispatch**: Replay attack protection with unique transaction hashes and 5-minute timestamp drift rejection.

---

## 🧪 Certified Test Verification

| Module / Surface | Verification Suite | Status |
|---|---|---|
| Backend API Test Suite | `pnpm --filter @workspace/api-server test` | **`✓ 57/57 suites (336 passed)`** |
| Frontend Twin Test Suite | `pnpm --filter @workspace/shothik exec vitest run src/components/twin/` | **`✓ 33/33 suites (99 passed)`** |
| Backend TypeScript Check | `tsc -p tsconfig.json --noEmit` | **`✓ 0 Errors Clean`** |
| Frontend TypeScript Check | `node run_typecheck.cjs` | **`✓ 0 Errors Clean`** |
| Pre-Commit Security Gate | `pnpm test:ecc` | **`✓ 100% Passed`** |
| Pre-Push Chaos Fuzzing | Fuzz & Benchmark Gate | **`✓ 4/4 Probes Neutralized`** |

---

## 📦 Release Tag & Repository Information

- **Tag**: `v2.8.0-release`
- **Branch**: `main`
- **Synchronized Remotes**: `origin`, `docs`, `tonight`, `swarm`, `backend`, `frontend`, `economics`, `skills`, `writer`
