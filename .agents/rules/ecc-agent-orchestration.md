---
description: Universal agent orchestration and ECC v2.2 operating system standards for Shothik Platform
globs: *
alwaysApply: true
---

# ECC Agent Orchestration & Execution Standards

This rule governs agent lifecycle, role delegation, TDD enforcement, and immutable coding patterns across Shothik workspaces.

## 1. Role Delegation Matrix

When handling domain-specific tasks, invoke the specialized agent persona:

- **Complex feature design / multi-package refactoring**: Invoke `planner` or `architect`.
- **New API routes, bug fixes, state mutations**: Invoke `tdd-guide` (TDD mandatory: write failing test in `src/routes/__tests__/` first).
- **TypeScript compilation or schema mismatches**: Invoke `build-error-resolver`.
- **Payment, ledger, auth, or courier integration**: Invoke `security-reviewer`.
- **End-to-end integration and smoke verification**: Invoke `e2e-runner`.

## 2. Invariant Rules

1. **Continuous TDD**:
   - Write tests first. Every route in `@workspace/api-server` must have an accompanying test file.
   - Maintain 80%+ line and branch test coverage.
2. **Immutable State Transitions**:
   - Never mutate in-memory objects or global configuration directly. Always return new cloned instances.
3. **Dual-Ledger Idempotency**:
   - Financial mutations (bKash/Nagad/Rocket verification) and courier bookings must validate IETF `Idempotency-Key` headers against local SQLite tables before committing to PostgreSQL.
4. **Offline Resiliency**:
   - Provide local SQLite fallbacks (`offlineNilkhetOrdersTable`, `offlineParcelsTable`) for offline operations.
5. **CRDT Delta Hygiene**:
   - Strip `__proto__`, `constructor`, and `prototype` from any incoming delta patches.
