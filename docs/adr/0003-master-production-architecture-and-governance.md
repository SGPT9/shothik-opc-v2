# ADR 0003: Master Production Architecture, Polyrepo Governance & Operational Standards

## Status
**ACCEPTED & RATIFIED** (2026-08-23)

---

## Executive Summary
This Master Architecture Decision Record (ADR) formalizes the foundational engineering decisions across the entire Shothik platform (`shothikgpt.com`), synthesized through 10 comprehensive architectural grilling reviews.

---

## 🏛️ Section 1: Architectural Topology & Polyrepo Governance

1. **Ecosystem Layout**: Polyrepo architecture composed of 26 standalone, independently versioned repositories under `ahsanhab919-ux`, coordinated by the `shothik-opc-v2` master monorepo.
2. **Canonical Domain**: `shothikgpt.com` on Cloudflare Full (Strict) SSL/TLS with multi-tier subdomain routing (`app.`, `api.`, `ws.`, `docs.`, `models.`).
3. **Package Distribution**: Open-core components published under the `@shothik/*` namespace via NPM and GitHub Packages with signed provenance attestations.
4. **Licensing**: Dual-licensing model (Open-Core MIT for SDK/skills/search/UI components, Business Source License 1.1 for autonomous Swarm execution and MFS fraud engines).

---

## ⚡ Section 2: Core Intelligence & Compute Engines

5. **GORTEX Local Model Mesh (`@shothik/gortex`)**: Sub-50ms TTFT local inference gateway with three-tier fallback (Local Ollama/vLLM ➔ DeepSeek-R1 ➔ Claude 3.5 Sonnet).
6. **Soup 4GB Post-Training (`@shothik/soup`)**: Layer-streaming QLoRA fine-tuning engine powered by `MakazhanAlpamys/Soup`, enabling 8B model fine-tuning on 4GB consumer laptop GPUs (3.32 GB peak VRAM).
7. **Tonight Overnight Batch (`@shothik/tonight`)**: Scheduled background batch processor with Gaussian rate-limiting jitter (30s–180s delays) and ScenarioLabs 30-scenario stress simulator.
8. **Hybrid Retrieval (`@shothik/vespa`)**: Multi-stage retrieval combining BM25 exact term frequency, dense HNSW vector similarity, and tensor cross-scoring.
9. **Zero-Cost Local Search (`@shothik/search`)**: Zero-API-cost search engine with local SearXNG proxy and clean HTML-to-markdown scraping.

---

## 🇧🇩 Section 3: Emerging Market & Regional Demographic Moat

10. **Bangla NLP Engine (`@shothik/bangla`)**: High-throughput bidirectional Unicode ↔ Bijoy-52 ANSI font transformer and multilingual n-gram plagiarism scanner.
11. **Unit Economics & Fraud Guard (`@shothik/economics`)**: Dynamic preflight token cost formula with surge multipliers and real-time bKash/Nagad MFS replay attack prevention.
12. **Statutory Tax Compliance**: Automated NBR Tax Act 2023 compliance with instant Mushak-6.3 VAT receipt generation and AIT 10% / VAT 15% calculation.
13. **Bandwidth Optimization**: 180KB initial JS bundle budget, WebP/AVIF image pipeline, and offline-first IndexedDB sync for 2GB RAM / 3G mobile devices.

---

## 🛡️ Section 4: Security, Custody & Enterprise Governance

14. **Key Custody Vault (`@shothik/auth`)**: AES-256-CBC encrypted key custody vault with strict hardware/environment isolation.
15. **Row-Level Security Governance (`@shothik/admin`)**: Automated PostgreSQL RLS policy verification ensuring complete multi-tenant data isolation.
16. **Immutable Audit Trail**: Append-only cryptographic Merkle tree with in-toto / SLSA-3 provenance signatures for model weights and administrative actions.
17. **Tool Sandboxing**: 3-tier Human-in-the-Loop (HITL) gate for MCP tool executions with 1-click mobile approval for destructive or financial operations.

---

## 🔄 Section 5: Reliability, Networking & High Availability

18. **Cellular Stream Resiliency**: Indexed token replay buffer with `Last-Event-ID` auto-resume across mobile connection drops.
19. **Swarm Deadlock Arbiter**: 3-iteration self-correction loop limit with deterministic arbiter consensus.
20. **Multi-Cloud Disaster Recovery**: Dual-cloud active-passive failover with continuous Postgres WAL streaming and Cloudflare R2 / AWS S3 dual-write object replication ($RPO < 10\text{s}$, $RTO < 60\text{s}$).
21. **Realtime Work Canvas**: Conflict-Free Replicated Data Types (Yjs CRDTs) over WebSockets for collaborative multi-user whiteboarding.
22. **Priority Worker Queue**: Redis BullMQ priority-weighted queue with dynamic worker autoscaling under burst load.
