# 🔒 Shothik AI — Production Infrastructure & Tiered Architecture Specification

**Status**: LOCKED & FROZEN  
**Architecture Version**: `v2.7.0-locked`  
**Target Demographic**: South Asian & Emerging Market F-Commerce Operators  

---

## 1. ⚡ Tiered Inference & Latency Topology

```
                               ┌──────────────────────────────────────────────┐
                               │               User Interaction               │
                               │  (Banglish Spoken Voice / Pasted Image / Text)│
                               └──────────────────────┬───────────────────────┘
                                                      │
                         ┌────────────────────────────┴────────────────────────────┐
                         ▼                                                         ▼
        ┌──────────────────────────────────┐                     ┌──────────────────────────────────┐
        │       Tier 0: Local WebGPU       │                     │     Tier 1: Cloud Primary        │
        │   (WebLLM / Qwen 2.5 0.5B/1B)    │                     │      (DeepSeek V4 Flash)         │
        ├──────────────────────────────────┤                     ├──────────────────────────────────┤
        │ • TTFT: 10ms – 25ms              │                     │ • TTFT: 420ms – 520ms            │
        │ • Cost: $0.00 / ৳0.00            │                     │ • Cost: $0.028/1M (Cached)       │
        │ • 100% Offline Autocomplete      │                     │ • Smart Compaction (85% KV Hit)  │
        │ • Sensitive Ledger Privacy       │                     │ • Full Reasoning & Orchestration │
        └──────────────────────────────────┘                     └────────────────┬─────────────────┘
                                                                                  │
                                                ┌─────────────────────────────────┴─────────────────┐
                                                ▼                                                   ▼
                               ┌──────────────────────────────────┐                ┌──────────────────────────────────┐
                               │   Tier 2: ModLens Vision Bridge  │                │    Tier 3: Swarm / Research      │
                               │   (Gemini Flash / Antigravity)   │                │     (DeepSeek R1 / Sonnet)       │
                               ├──────────────────────────────────┤                ├──────────────────────────────────┤
                               │ • Latency: 1.2s – 2.1s           │                │ • Latency: 12s – 35s             │
                               │ • Cost: $0.00 (Free) / $0.075/1M │                │ • Cost: $0.55/1M in, $2.19/1M out│
                               │ • Handwritten Memos & Waybills   │                │ • Multi-Agent Adversarial Debate │
                               │ • bKash/Nagad Screenshot OCR     │                │ • NBR Mushak-6.3 VAT Audit       │
                               └──────────────────────────────────┘                └──────────────────────────────────┘
```

---

## 2. 🛡️ Backend & Data Invariants (InsForge + Cloudflare DO)

1. **Storage & Database**: InsForge BaaS (PostgreSQL + RLS + Auth + Storage).
2. **Edge Webhooks**: Cloudflare Workers + Durable Object SQLite (`/api/v1/logistics/webhook`, `/api/v1/mfs/sms/webhook`).
3. **Session Vault**: BrowserOS Local Profile Encrypted Cookie Vault (`browser-session-runner.ts`) for Steadfast/Pathao portal authentication.
4. **Overnight Goals**: DeepSeek Goal Lifecycle (`overnight-merchant-goal.ts`) executing at 03:00 AM with 07:00 AM WhatsApp briefings.
5. **UI Shell**: DeepSeek Minimalist Shell with single-row trace chips, live telemetry ribbon, and 3-column Codex split layout.

---

## 3. 💰 Unit Economics Guarantee

- **Cost per Order Fulfilled**: `<৳0.04` (Less than 4 Poisha per transaction).
- **Fleet Infrastructure (10k Merchants / 250k Orders/mo)**: `<$70.00 / month` total.
- **Cache Hit Ratio**: Guaranteed `>= 80%` via prompt prefix reuse and `<compacted-summary>` checkpoints.

---

## 4. 🧪 Test & Validation Ledger

- **Vitest Unit & Integration Suites**: 10 passed (10), 43 passed (43).
- **TypeScript**: 0 errors across `@workspace/shothik`.
- **Git Commit**: `a8f5ad2` -> Locked on `main`.
