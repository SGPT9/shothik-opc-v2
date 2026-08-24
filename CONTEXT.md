# Ubiquitous Domain Glossary & Context Map

> **Canonical Terminology, Production Domain Topology & Bounded Contexts for Shothik Platform**

---

## 🌐 Official Production Domain & Edge Topology (`shothikgpt.com`)

* **Primary Web & Ask-First Shell**: `https://shothikgpt.com`
* **API Gateway & InsForge Connector**: `https://api.shothikgpt.com`
* **Realtime Audio & Swarm WebSockets**: `wss://ws.shothikgpt.com`
* **Developer Docs & OpenAPI 3.1**: `https://docs.shothikgpt.com`
* **Quantized Model Registry (GGUF)**: `https://models.shothikgpt.com`

---

## 🗺️ Bounded Contexts

```
                                  SHOTHIK ECOSYSTEM
                                          │
       ┌──────────────────┬───────────────┴───────────────┬──────────────────┐
       ▼                  ▼                               ▼                  ▼
 [1] INTELLIGENCE   [2] IDENTITY & CUSTODY          [3] INTERFACES      [4] PROTOCOLS & SKILLS
  • Swarm (5-DAG)    • JWT Auth Sessions             • React 19 Shell    • MCP Stdio Server
  • Gortex Mesh      • Key Custody Vault             • Founder Cockpit   • 57-Skill Registry
  • Tonight Engine   • RLS Governance Auditor        • Visual Canvas     • Smart Router
  • Bangla NLP       • Unit Economics Engine         • Office Slidev     • Local Search Scraper
  • Vespa Hybrid RAG • MFS Fraud Guard               • Writing Studio    • CLI Tools
  • Soup Fine-Tuning
```

---

## 📖 Canonical Domain Glossary

* **Autonomous Swarm (`@shothik/swarm`)**: A 5-agent Directed Acyclic Graph (DAG) execution pipeline reaching deterministic consensus before code execution or financial actions.
* **Vespa Hybrid Search & Tensor Engine (`@shothik/vespa`)**: High-throughput BM25 lexical matching, dense HNSW vector search, and Tensor cross-scoring retrieval engine.
* **Smart Intent Router (`@shothik/router`)**: Intent-first semantic prompt classifier and multi-model dispatcher.
* **GORTEX Local Mesh (`@shothik/gortex`)**: Sub-50ms local LLM gateway and 96% token cost reducer.
* **Tonight Autonomous Engine (`@shothik/tonight`)**: Scheduled overnight batch executor, competitor ad spy, and ScenarioLabs 30-scenario stress simulator.
* **Soup 4GB Post-Training Engine (`@shothik/soup`)**: 4GB VRAM layer-streaming post-training, QLoRA fine-tuning, and GGUF model exporter powered by `MakazhanAlpamys/Soup`.
* **Zero-Cost Local Search (`@shothik/search`)**: Zero-API-cost local search engine, SearXNG proxy, and clean HTML markdown scraper.
* **Unit Economics Engine (`@shothik/economics`)**: Preflight task pricing simulator and real-time MFS payment fraud protection.
* **Bangla NLP & Font Transformer (`@shothik/bangla`)**: Unicode ↔ Bijoy-52 ANSI keyboard converter and plagiarism detection engine.
* **Founder Digital Twin (`@shothik/twin-engine`)**: Autonomous digital executive state machine running overnight pipelines and 20 FPS phonetic viseme rendering.
* **Key Custody Vault (`@shothik/auth`)**: AES-256-CBC encrypted enclave protecting validator private keys, bKash API credentials, and cloud tokens.
* **Agent Skill Registry (`@shothik/skills`)**: 57 portable, self-evolving workflow prompts compatible with Claude Code, Cursor IDE, Windsurf, and Antigravity.
* **Master Monorepo Umbrella (`shothik-opc-v2`)**: The central repository coordinating multi-package orchestration, Docker compose setups, and cross-package testing.
