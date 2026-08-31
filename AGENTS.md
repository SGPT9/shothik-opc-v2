# Shothik AI — ECC Agent Instructions & System Architecture

This project is configured with the **Everything Claude Code (ECC)** agent operating system.

**Version:** 2.2.0

## Core Principles

1. **Continuous TDD** — Write tests before implementation (`src/routes/__tests__/`). Maintain 80%+ test coverage across all subsystems.
2. **Financial & Logistics Idempotency** — Never credit MFS wallets (`/api/v1/mfs/verify-trx`) or book couriers (`/api/v1/courier/dispatch`) without IETF `Idempotency-Key` headers and dual-ledger SQLite/Postgres verification.
3. **Resilient Offline Architecture** — Always provide local SQLite (`offlineNilkhetOrdersTable`, `offlineParcelsTable`) and memory fallback when PostgreSQL connections are disconnected.
4. **Bangla Academy Orthography & Formatting** — Enforce Anjali short-i spelling rules and strictly prohibit Sadhu-Cholit register mixing in all customer-facing linguistic outputs.
5. **GORTEX Multi-Tier Inference Mesh** — Dynamically route LLM tasks based on device memory, prompt complexity, and connectivity:
   - **Tier 0 (Cactus Needle 2)**: 14MB WASM (<28MB RAM, 2GB Android devices, 0 cost, offline Banglish dictionary & regex intent).
   - **Tier 2 (Colibri VPS)**: C inference engine on Hostinger VPS for background PDF compilation & RAG embedding generation.
   - **Tier 4 (Cloud Frontier)**: Gemini 3.7 / DeepSeek V3 for complex book translations, deep research synthesis, and multi-agent consensus.
6. **CRDT Delta Hygiene** — Sanitize all incoming CRDT operations against prototype pollution (`__proto__`, `constructor`, `prototype`). Ensure deterministic document/sheet state synchronization.
7. **Nilkhet Publishing SLA** — Enforce print-ready PDF imposition (A4/B5 formats, 80gsm book / 100gsm premium paper, 15mm inner spine binding gutter, CMYK color space verification).

## Available Agent Roles

| Agent | Purpose | Trigger Scenario |
|---|---|---|
| `tdd-guide` | Test-Driven Development | Writing new API routes, adding features, fixing test failures |
| `build-error-resolver` | TypeScript & Build Fixes | Resolving compiler errors, schema migrations |
| `security-reviewer` | Security & Idempotency Audit | Auditing MFS payments, Gatekeeper guardrails, CRDT sanitization |
| `e2e-runner` | Full-Lifecycle Verification | Verifying RAG ingestion, Swarm deliberation, Sandbox execution |

## Security & Gatekeeper Guardrails

- **READ_ONLY**: Viewing files, reading schemas, querying dictionary lookups (Autonomous).
- **HIGH_RISK_MUTATING**: Courier parcel dispatch, MFS transactions, CRDT sync merges (Requires verified test gating or user confirmation).
- **DESTRUCTIVE**: Database drop/truncate, filesystem purge, hard reset (Strictly blocked by ToolExecutionGuardrail).

## Testing Commands

```powershell
# Run the complete test suite (30 test files, 153+ tests)
pnpm test:ecc

# Run in live watch mode for TDD
pnpm --filter @workspace/api-server test -- --watch

# Pre-commit security and compliance check
pnpm pre-commit
```

