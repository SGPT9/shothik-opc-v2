# Ubiquitous Domain Glossary & Context Map

> **Canonical Terminology & Bounded Contexts for Shothik Platform**

---

## 🗺️ Bounded Contexts

```
                                  SHOTHIK ECOSYSTEM
                                          │
       ┌──────────────────┬───────────────┴───────────────┬──────────────────┐
       ▼                  ▼                               ▼                  ▼
 [1] INTELLIGENCE   [2] IDENTITY & CUSTODY          [3] INTERFACES      [4] PROTOCOLS & SKILLS
  • Swarm (5-DAG)    • JWT Auth Sessions             • React 19 Shell    • MCP Stdio Server
  • DSH Harness      • Second-Me Key Custody Vault   • Founder Cockpit   • 57-Skill Registry
  • SAM 2 Vision     • RLS Governance Auditor        • Visual Canvas     • CLI Tools
```

---

## 📖 Canonical Domain Glossary

* **Autonomous Swarm (`@shothik/swarm`)**: A 5-agent Directed Acyclic Graph (DAG) execution pipeline reaching deterministic consensus before code execution or financial actions.
* **DeepSeek Harness (DSH)**: Zero-token overhead execution sandbox running on local/edge models with full trajectory replay.
* **Founder Digital Twin (`@shothik/twin-engine`)**: Autonomous digital executive state machine running overnight pipelines, cold outreach, and 20 FPS phonetic viseme rendering.
* **Key Custody Vault (`@shothik/auth`)**: AES-256-CBC encrypted enclave protecting validator private keys, bKash API credentials, and cloud tokens.
* **Agent Skill Registry (`@shothik/skills`)**: 57 portable, self-evolving workflow prompts compatible with Claude Code, Cursor IDE, Windsurf, and Antigravity.
* **Master Monorepo Umbrella (`shothik-opc-v2`)**: The central repository coordinating multi-package orchestration, Docker compose setups, and cross-package testing.
