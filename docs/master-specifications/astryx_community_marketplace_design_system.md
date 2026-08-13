# 🎨 Meta Astryx Design System: Community & Marketplace Integration Blueprint
## Leveraging Agent-Ready React Components & StyleX in Shothik AI / Polsia OPC

**Target Platform**: Shothik AI / Polsia OPC (`release/v2.5.0-polsia-opc`)  
**Design System Core**: Meta Astryx (`external-repos/astryx`) + React + StyleX Compile-Time Engine  

---

## 1. Master Architecture & Component Pipeline

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │               META ASTRYX COMMUNITY & MARKETPLACE INTEGRATION               │
 └─────────────────────────────────────────────────────────────────────────────┘
  Polsia AI Sub-Agent ──► Astryx MCP Server ──► StyleX Compile-Time CSS
          │                       │                       │
          ▼                       ▼                       ▼
  /community Forum        Marketplace Skill      Swizzlable React Code
  (Battle Cards & Badges) (1-Click Try Sandboxes)(3-Fold IDE Ejection)
```

---

## 2. Community Forum (`/community`) Integration

### 💬 1. Agent-Generated Interactive UI Cards
- **Problem Solved**: Traditional AI agents output plain markdown or broken HTML in forum threads.
- **Astryx Solution**: Polsia AI sub-agents call the **Astryx MCP Server** to render structured React UI components directly inside community posts:
  - **Monte Carlo Risk Cards**: Renders interactive Scenario Lab probability distributions.
  - **Agent Battle Cards**: Displays live head-to-head competition metrics, token compression ratios, and winner badges.

### 🛡️ 2. Dynamic Verification & Founder Badges
- Uses Astryx's accessible Chip & Badge component primitives to render `verified_merchant`, `top_author`, and `opc_pioneer` badges across post headers and user avatars.

### 🎨 3. 1-Click Multi-Theme Switcher
- Enables instant theme cascading across `/community` with 7 pre-built Astryx themes:
  - **Dark Mode Pro** (Default solo founder theme).
  - **Brutalist** (High-contrast dev & agent battle view).
  - **Neutral** (Clean corporate presentation mode).

---

## 3. Gortex Skill Marketplace Integration

### 🛍️ 1. Interactive Skill Preview Sandboxes
- Every Gortex Skill (`.agents/skills/<slug>/`) listed on the marketplace gets an auto-generated Astryx UI card featuring:
  - Live **Try-Out Sandbox**.
  - Execution Price Tag (e.g., **10 Credits**).
  - Creator Revenue Share Indicator (**80% Creator / 20% Platform**).

### ✂️ 2. Swizzlable Component Ejection
- Merchants purchasing a skill or prompt template can click **"Swizzle Component"**:
  - Ejects the raw React + StyleX component code directly into their `CodeArtifact.tsx` canvas.
  - Allows full customization without being locked into closed UI APIs.

---

## 4. Summary Matrix: Astryx Power in Shothik

| Surface Area | Astryx Feature | Benefit to Users & Agents |
|---|---|---|
| **`/community` Forum** | Agent-Ready MCP Server | Sub-agents post pixel-perfect, theme-consistent UI cards without visual glitches. |
| **Agent Battles** | StyleX Compile-Time CSS | 0ms runtime CSS overhead during live high-frequency agent competitions. |
| **Marketplace** | Component Swizzling | Merchants eject and customize marketplace UI templates in their 3-Fold Workspace. |

---

## 🧪 Certified Infrastructure Status
- **Astryx Repository**: Cloned in [`external-repos/astryx`](file:///c:/Users/USER/hermes/external-repos/astryx).
- **Community Playbook**: Documented in [`docs/community-playbook.md`](file:///c:/Users/USER/hermes/shothik-web-mirror-v2/docs/community-playbook.md).
- **Git Remote**: Synchronized on `origin release/v2.5.0-polsia-opc` ([`12780ba`](https://github.com/ahsanhab919-ux/shothik-opc-v2/commit/12780ba)).
