# 🧠 5-Tier Model Mesh & Compute Topology Specification

> **Cost Optimization Target**: Average Blended Cost $<৳0.008$ ($<0.00007\text{ USD}$) per Query  
> **Latency Budget**: $<150\text{ms}$ on Standard Queries &middot; Zero GPU Overhead on Tier 0/1  

---

## 1. The 5-Tier Autonomous Cascade

```
                       [ USER PROMPT INGRESS ]
                                  │
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │  Complexity & Budget Classifier (Regex + 10ms Heuristic)│
      └───────────────────────────┬────────────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │ (68% of traffic)       │ (26% of traffic)       │ (6% of traffic)
         ▼                        ▼                        ▼
  ┌───────────────┐        ┌───────────────┐        ┌───────────────┐
  │    Tier 0     │        │    Tier 1     │        │    Tier 4     │
  │ Edge Browser  │        │  Colibri VPS  │        │  Frontier MoE │
  │ (Cactus/WASM) │        │     (7B)      │        │(DeepSeek-R1)  │
  │  0ms • ৳0.000 │        │150ms • ৳0.003 │        │ 2.5s • ৳0.040 │
  └───────────────┘        └───────────────┘        └───────────────┘
                                  ▲
                                  │ (Periodic Sync)
                  ┌───────────────┴───────────────┐
                  │            Tier 2             │
                  │     Soup 4GB VRAM Trainer     │
                  │   (NVMe Fine-Tuning • ৳0.000) │
                  └───────────────┬───────────────┘
                                  │ (Overnight)
                                  ▼
                  ┌───────────────────────────────┐
                  │            Tier 3             │
                  │     Tonight Engine / AirLLM   │
                  │  (Batch Processing • ৳0.000)  │
                  └───────────────────────────────┘
```

---

## 2. Detailed Tier Specifications

### Tier 0: Edge Browser WebAssembly (Cactus Needle 2)
* **Execution Environment**: Client-side WASM engine running in browser Web Worker.
* **Responsibilities**:
  * Intent classification (routing to `/slides`, `/research`, `/twin`).
  * Autocomplete, grammar tokenization, and regex parsing.
  * 100% offline, zero server cost.

### Tier 1: Colibri VPS Node (7B Instruct)
* **Execution Environment**: High-speed CPU/vGPU instances in domestic Dhaka/Singapore datacenters.
* **Responsibilities**:
  * Routine customer DM replies, Banglish translation, thesis paraphrasing.
  * Cost: ৳0.003 per query.

### Tier 2: Soup 4GB VRAM Trainer
* **Execution Environment**: Local desktop / edge server with NVMe SSD layer-streaming.
* **Responsibilities**:
  * Fine-tunes personalized store personas on merchant catalogs in 8 minutes without blowing VRAM limits.

### Tier 3: Tonight Engine / AirLLM
* **Execution Environment**: Asynchronous overnight batch worker.
* **Responsibilities**:
  * Compiles 400-page dissertations, analyzes historical annual sales ledgers.

### Tier 4: Frontier Mixture-of-Experts (MoE) — DeepSeek-R1 / 70B
* **Execution Environment**: High-capacity GPU clusters via API Gateway.
* **Responsibilities**:
  * Complex legal NBR tax audits, Supreme Court case research, AlphaFold structural biology, and multi-agent debate synthesis.
