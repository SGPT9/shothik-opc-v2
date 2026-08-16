# 🛠️ Shothik Operations & Disaster Recovery Runbook

> **Target Architecture**: Hybrid Multi-Node Mesh (Edge + Colibri VPS + Hostinger + InsForge BaaS)  
> **SLA Target**: 99.95% Availability with Sub-Second Local Fallback  

---

## 1. Monorepo Port & Microservice Topology

| Port | Service Component | Technology Stack | Health Check Endpoint |
| :--- | :--- | :--- | :--- |
| **5000** | Shothik Web Frontend | Next.js 15 / React 19 | `http://localhost:5000/api/health` |
| **8080** | API Ingress Gateway | Node.js / Express / Zod | `http://localhost:8080/healthz` |
| **3001** | Loomfeed Social Network | Next.js 15 / Go Gin | `http://localhost:3001` |
| **8000** | RVC Bengali Voice Synthesis | Python FastAPI / PyTorch | `http://localhost:8000/health` |
| **5432** | InsForge PostgreSQL BaaS | PostgreSQL 16 + pgvector | `https://ers8j28a.ap-southeast.insforge.app` |
| **11434**| Local LLM / Ollama | C++ / GGUF Llama.cpp | `http://localhost:11434/api/tags` |

### Single-Command Startup
```powershell
./scripts/dev-all.ps1
```

---

## 2. Disaster Recovery Protocol: Submarine Cable Disruption (SEA-ME-WE 4/5)

### Impact
When Bangladesh's international undersea fiber-optic links (Cox's Bazar / Kuakata landings) experience cuts, international latency spikes to $>600\text{ms}$ and foreign APIs (OpenAI, Anthropic) become unreachable.

### Automated Mitigation Procedure
1. **Health Sentinel Trigger**:
   - `McpGuardrailService` detects 3 consecutive request timeouts ($>3,500\text{ms}$) to international endpoints.
2. **BDIX Domestic Reroute**:
   - Traffic is rerouted through the **Bangladesh Internet Exchange (BDIX)** to domestic Colibri VPS nodes hosted in local Dhaka datacenters.
3. **Local Mesh Promotion**:
   - Tier 1 (Colibri 7B) and Tier 2 (Soup Local LoRA) handle 100% of user queries.
   - UI displays banner: `⚡ Operating in High-Speed Domestic Mesh Mode (Zero Latency via BDIX)`.

---

## 3. Hostinger VPS Snapshot Recovery & UFW Firewall Sync

### Restoring from an Automated Snapshot
If a worker node crashes or suffers OS corruption:
1. Fetch latest daily snapshot ID via `VPS_getSnapshotV1`.
2. Trigger automated restoration:
   ```json
   { "action": "restore", "snapshot_id": "snap_20260816_daily" }
   ```
3. Re-synchronize UFW firewall rules via `VPS_syncFirewallV1`:
   - Port 22: Restricted to authorized deployer SSH keys (`VPS_getAttachedPublicKeysV1`).
   - Ports 80, 443, 5000, 8080: Open for web traffic.
   - Internal ports 5432, 8000, 11434: Restricted to internal VPC subnet.

---

## 4. InsForge PostgreSQL Backup & Schema Migration

### Declarative Schema Migrations
```bash
npx insforge db push
```
* Every migration is verified on a shadow dry-run database.
* Rollback files are stored in `.insforge/migrations/rollback/`.
