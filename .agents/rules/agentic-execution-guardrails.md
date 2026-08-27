---
description: Universal agent execution discipline, pre/post-tool safety interceptors, context window budget caps, and privilege separation
globs: *
alwaysApply: true
---

# Agentic Execution Guardrails & Safety Invariants

This rule establishes strict, deterministic execution constraints across all agent and tool interactions, derived from enterprise harness standards (`affaan-m/ECC`).

---

## 1. Pre-Execution Safety Filters & Destructive Pattern Interception

Before executing any terminal command, database query, or tool invocation, agents **MUST** evaluate arguments against security guardrails:

* **Blocked Destructive Shell Commands**:
  - `rm -rf /`, `rm -rf <path-without-strict-qualification>`
  - `git push --force`, `git push -f`, `git reset --hard`
  - `mkfs`, `dd if=/dev/`
* **Blocked Destructive SQL Injections**:
  - Unbounded `DROP TABLE`, `TRUNCATE`, `ALTER TABLE ... DROP COLUMN` without explicit migration files.

If a destructive pattern is detected, the execution **MUST** halt and require explicit user confirmation.

---

## 2. Tool Privilege Classification & Confirmation Gates

Tools are partitioned into four strict privilege classes:

| Risk Class | Description | Execution Policy |
| :--- | :--- | :--- |
| `READ_ONLY` | File viewing, schema inspection, read queries, search | **Autonomous** (Sub-50ms execution) |
| `LOW_RISK` | In-memory formatting, typechecking, AST linting, test runs | **Autonomous** |
| `HIGH_RISK_MUTATING` | Modifying project configuration, schema migrations, payment webhooks | **Requires User Approval** or verified test gating |
| `DESTRUCTIVE` | Permanent file deletion, dropping tables, production deployment | **Strict Confirmation Gate Required** |

---

## 3. Context Window Protection & MCP Tool Pruning

To prevent prompt bloat, latency spikes, and LLM hallucination:

1. **SessionStart Context Cap**: Dynamic context payloads injected at session initialization **MUST NOT** exceed **4,000 characters** (`ECC_SESSION_START_MAX_CHARS`).
2. **Intent-Based Tool Pruning**: Never inject the entire tool catalog (80+ tools) into prompt contexts. Dynamically rank and expose only the top **≤10 tools** relevant to the user's intent keywords.
3. **KV Cache Prefix Preservation**: Maintain stable system prompt prefixes to maximize prompt caching efficiency across turns.

---

## 4. Epistemic Replay & Append-Only Tracing

* Every agent action (user input, model reasoning, tool call, tool response) must be recorded in an immutable, append-only event stream.
* The system must support deterministic step-by-step playback and speculative branch forking from any event index.
