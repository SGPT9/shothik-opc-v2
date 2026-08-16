# 🏛️ Shothik Cognitive OS & Advanced RAG Architecture Knowledge Base

> **Official Blueprint & Theoretical Specification**  
> *Target Architecture for Shothik AI / Second Me* · Version 2.4.0

---

## 1. ⚡ The Noetherian Momentum Invariant

$$\mathbf{M} = \frac{\text{Intent} \times \text{Verification}}{\text{Friction}}$$

### Core Principles
- **Ask-First Minimalist Surface**: The initial screen presents only the calm heading `"What do you want to accomplish today?"` with 3 intent starter prompts (*Research*, *Analysis*, *Create*). Zero setup checklists or multi-chip launcher walls on first paint.
- **Intent-First NLP Routing**: Prompts are routed server-side based on outcome rather than requiring manual mode switches.
- **Progressive Disclosure**: Dual-pane artifact canvases (Slide Studio, Sheet Canvas, Code Engine) and the User Details Drawer appear only when contextually produced (`artifact_produced`) or explicitly requested.

---

## 2. 🔍 Enterprise Cognitive RAG Engine

$$S_{\text{fused}}(d) = \left( w_{\text{dense}} \cdot RRF_{\text{dense}}(d) + w_{\text{sparse}} \cdot RRF_{\text{sparse}}(d) + w_{\text{graph}} \cdot S_{\text{graph}}(d) \right) \times e^{-\lambda \Delta t}$$

### Core Ingestion & Retrieval Pipeline
1. **Magika Content Pre-Validation**: Binary byte-level inspection to prevent corrupted/polyglot files and dangerous executables from reaching parsers.
2. **Hierarchical Parent-Child Chunking**: Granular 128-token child chunks enriched with contextual headers `[Document: Title | Section: Header]` for embedding precision; 1024-token parent sections passed to LLMs.
3. **4-Way Hybrid Search & RRF**: Fuses dense `pgvector` cosine similarity with sparse Postgres `tsvector` BM25 keyword matching and temporal decay.
4. **Cross-Encoder Multi-Dimensional Reranking**: Evaluates query-chunk cross-attention token interactions with authority tier weighting (Official = 1.0, Web = 0.4).
5. **Contradiction Detection Matrix**: Automatically surfaces conflicting statements and marks older policies as `temporal_superseded`.

---

## 3. 🛡️ Sandboxing, Security Rings & Control Layer

### OS Privilege Rings
- **Ring 3 (Perception / Read-Only)**: Autonomous web search, document parsing, repo inspection.
- **Ring 2 (Synthesis / Drafting)**: Isolated WebAssembly and gVisor micro-VM execution for code compilation, formula calculation, and slide drafting.
- **Ring 1 (Privileged Actuation)**: Cloud deployment, database schema migrations, and external payments require deterministic suspension via `await_checkpoint`.

### Ephemeral Secrets
- Sensitive credentials entered through `SecretShareCard` are transmitted in volatile memory and **never saved to Postgres transcripts**.
- Collapses into an immutable audit badge (`••••••••`) post-submission.

---

## 4. 🧠 "Second Me" Tri-Tier Memory System

1. **Working Memory**: In-session prompt state, composer buffer, context chips, and active canvas state.
2. **Episodic Memory**: Long-term cross-session user decisions, feedback corrections, and architectural choices with semantic recall.
3. **Semantic Memory**: Knowledge graph triples, domain documentation, and indexed codebases.
4. **Persona Calibration**: Dynamically tunes conciseness (0.0 to 1.0), technical depth, tone (neutral/executive/creative), and language (`en-US` / `bn-BD`).

---

## 5. 🧰 Agentic Engineering Loop & Pre-mortem Protocol

$$\text{Pipeline} = \text{Claude Code} + \text{Conductor} + \text{GitNexus} + \text{Context7} + \text{Postgres RLS} + \text{Premortem.md}$$

### Key Engineering Practices
- **Deep Modules & Seams**: "Accept dependencies, don't create them." Pluggable interfaces like `StreamTransport` and `ComposerAction` allow 100% deterministic unit testing.
- **Targeted Contiguous Edits**: Replaces code surgically using `replace_file_content` instead of destructive full-file rewrites.
- **Pre-mortem Protocol**: Simulates failure modes (momentum collapse, runaway cost loops, secret leaks, hallucinations, hanging SSE connections) prior to merging code.
