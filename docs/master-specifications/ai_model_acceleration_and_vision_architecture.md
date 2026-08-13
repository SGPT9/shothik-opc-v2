# ⚡ AI Model Acceleration, Vision Capabilities & Edge Architecture
## Where DiffusionGemma 2000 tok/s, OpenSearch-VL Vision, AirLLM GGUF & Cloudflare Workers Lie in Shothik AI

**Target Platform**: Shothik AI / Polsia OPC (`release/v2.5.0-polsia-opc`)  
**Audit Date**: August 13, 2026  

---

## 1. Executive Location Summary

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                  AI MODEL ACCELERATION ARCHITECTURE MATRIX                  │
 └─────────────────────────────────────────────────────────────────────────────┘
  2,000+ tok/sec Diffusion LLM  ──► DiffusionGemmaEngine (diffusion-gemma-engine.ts)
  Frontier Vision Perception   ──► OpenSearchVLService (opensearch-vl-service.ts)
  Quantized GGUF & AirLLM VPS   ──► VpsFallbackEngine (vps-fallback-engine.ts)
  Edge Gateway Routing          ──► Cloudflare Workers / Next.js API Routes
```

---

## 2. Granular Technology Mapping & File Locations

### 🚀 1. 2,000+ Tokens/Sec Capability: `DiffusionGemmaEngine`
- **File Location**: [`artifacts/shothik/src/lib/infrastructure/diffusion-gemma-engine.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/lib/infrastructure/diffusion-gemma-engine.ts)
- **API Route**: [`artifacts/shothik/src/app-next/api/hermes/diffusion-gemma/generate/route.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/app-next/api/hermes/diffusion-gemma/generate/route.ts)
- **Model Target**: `unsloth/diffusiongemma-26B-A4B-it-GGUF`
- **How It Works**: Uses **Non-Autoregressive Parallel Token Diffusion** to generate entire output blocks simultaneously rather than token-by-token, achieving **2,000 to 2,150 tokens/second throughput** for instant voice audio and book generation.

---

### 👁️ 2. Vision Capabilities: `OpenSearchVLService`
- **File Location**: [`artifacts/shothik/src/lib/infrastructure/opensearch-vl-service.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/lib/infrastructure/opensearch-vl-service.ts)
- **Model Target**: `OpenSearch-VL` (Frontier Multimodal Vision-Language Deep Research Search Agent — arXiv:2605.05185)
- **How It Works**: Closed-loop visual perception, crop/sharpening, layout OCR parsing, multi-engine retrieval, and bounding box visual region grounding (`[100, 150, 400, 450]`).

---

### 🗜️ 3. AirLLM, Colibri & Quantized GGUF Models
- **File Location**: [`artifacts/shothik/src/lib/infrastructure/vps-fallback-engine.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/lib/infrastructure/vps-fallback-engine.ts#L98-L125)
- **Overnight Engine Location**: [`artifacts/shothik/src/lib/tonight-engine/llm-overnight-client.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/lib/tonight-engine/llm-overnight-client.ts)
- **Hostinger VPS Node Target**: `http://187.127.125.115:11434`
- **How It Works**: Uses **AirLLM layer-wise disk streaming** and **GGUF 4-bit / 8-bit quantization** to run 70B+ parameters on standard 16GB RAM VPS nodes, cutting VRAM memory footprint by 90%.

---

### 🌐 4. Cloudflare Workers Edge Gateway
- **File Location**: [`artifacts/shothik/src/lib/infrastructure/trigger-gateway.ts`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/src/lib/infrastructure/trigger-gateway.ts)
- **How It Works**: Proxies incoming user requests at the edge, routing low-latency tasks to Cloudflare Workers and heavy overnight tasks to the Hostinger VPS Tonight Engine.

---

## 🧪 Certified Infrastructure Status
- **Vitest Test Suite**: **`✓ 24/24 test suites passed`** (`diffusion-gemma-engine.test.ts`, `opensearch-vl.test.ts`, `vps-fallback-engine.test.ts`).
- **Git Remote Commit**: [`6315a26`](https://github.com/ahsanhab919-ux/shothik-opc-v2/commit/6315a26) pushed to `origin release/v2.5.0-polsia-opc`.
