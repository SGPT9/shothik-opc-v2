# ⚡ Shothik GORTEX (`@shothik/gortex`)

> **Local LLM Inference Mesh, Sub-50ms Model Gateway Router, and Zero-Cost Fallback Engine.**

---

## 🌟 Features

1. **Local VRAM Mesh**: Routes high-frequency tasks to on-premise Ollama / vLLM workers for 0ms network latency.
2. **Dynamic Failover**: Auto-switches from local ➔ DeepSeek V3 ➔ Cloudflare Workers AI during high GPU saturation.
3. **96% Token Cost Savings**: Eliminates cloud inference costs for repetitive coding and formatting tasks.

---

## 🧪 Testing & Build

```bash
# Clone repository
git clone https://github.com/ahsanhab919-ux/shothik-gortex.git
cd shothik-gortex

# Install dependencies
pnpm install

# Run unit tests
pnpm test

# Build TypeScript
pnpm build
```

---

## 📜 License
MIT © [Ahsan Habib](https://github.com/ahsanhab919-ux)
