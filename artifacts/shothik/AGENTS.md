# artifacts/shothik/AGENTS.md
# Shothik Web Client – Architecture & UI Component Standards

This document establishes the UI architecture, state management patterns, and testing conventions for the React + Vite/Next.js frontend.

---

## 1. Core Stack & Configuration
- **Framework:** React 18 / Next.js app directory structure running under Vite dev bundler
- **Styling:** Tailwind CSS + Lucide React icons
- **State & Storage:** Zustand stores + OPFS (Origin Private File System) for offline SQLite caching
- **Testing:** Vitest + React Testing Library + `@testing-library/jest-dom` (`pnpm --filter @workspace/shothik run test`)
- **Port:** `5000` (Mounted at `http://localhost:5000`)

---

## 2. Twin Architecture & Modals (`src/components/twin/`)
- **Command Palette (`TwinCommandPalette.tsx`):** Triggered by `⌘K` or `Ctrl+K`. Global shortcut dispatcher for all 38 tools.
- **Hyperlocal Dark Store & Micro-Hub (`DarkHubFulfillmentModal.tsx`):** Triggered by `⌘H` or `Ctrl+H`. 5-tab studio (Dark Hubs Network, Hyperlocal Thana Router, S-Curve Bin Pick-Path Optimizer, FEFO Expiry Radar, Inter-Hub Velocity Rebalance).
- **Freelancer Remittance & ICT Subsidy (`FreelancerRemittanceModal.tsx`):** Triggered by `⌘I` or `Ctrl+I`. 4-tab studio (Incentive Calculator & Remittance Ledger, Bangladesh Bank Form-C Declaration, Inward PRC Reconciler, Milestone Escrow Contract Studio).
- **Courier Fleet Arbitrage (`CourierArbitrageModal.tsx`):** Triggered by `⌘R` or `Ctrl+R`. 4-carrier dynamic rate cards & DSR arbitrage (Steadfast vs. Pathao vs. RedX vs. Paperfly), 64-district SLA matrix, 1-click booking, and AI RTO risk mitigation.
- **Audit Ledger Studio (`AuditLedgerStudioModal.tsx`):** Triggered by `⌘D` or `Ctrl+D`. 4-tab statutory studio (Chart of Accounts, General Ledger, Real-time Trial Balance, NBR Sealed Audit Dossier).
- **Mushak Tax Studio (`MushakTaxStudioModal.tsx`):** Triggered by `⌘X` or `Ctrl+X`. 4-tab studio (Invoice Generator, Statutory Printable Canvas, TDS Ledger, Mushak-9.1 Summary).
- **AI Outbound Phone Verification (`OutboundCallVerificationModal.tsx`):** Triggered by `⌘O` or `Ctrl+O`. Voice IVR bot, Banglish intent parsing, BTRC compliance window (09:00-20:00 BST), Steadfast auto-dispatch.
- **WhatsApp Commerce & bKash QR (`WhatsAppCommerceModal.tsx`):** Triggered by `⌘W` or `Ctrl+W`. Multi-dialect customer assistant, bKash dynamic QR, Steadfast parcel booking.
- **Multi-Dialect Voice Commander (`MultiDialectVoiceTwinModal.tsx`):** Triggered by `⌘V` or `Ctrl+V`. Hands-free speech avatar.
- **Swarm Graph Studio (`SwarmGraphStudioModal.tsx`):** Triggered by `⌘G` or `Ctrl+G`. Visual DAG execution graph of autonomous subagents.
- **Vast.ai Spot GPU Orchestrator (`VastSpotGpuModal.tsx`):** Triggered by `⌘B` or `Ctrl+B`. Spot cluster allocation & fallback inference.
- **CRDT Edge Mesh Studio (`EdgeMeshStudioModal.tsx`):** Triggered by `⌘E` or `Ctrl+E`. P2P offline state sync.
- **Canary Traffic Director (`CanaryTrafficDirectorModal.tsx`):** Triggered by `⌘T` or `Ctrl+T`. Blue/green traffic splitting.
- **Courier Logistics Hub (`SteadfastCourierModal.tsx`):** Live consignment booking & printable shipping labels.
- **Supervised Gatekeeper Modal (`SupervisedApprovalModal.tsx`):** Mandatory founder approval for any protected actions >= ৳10,000 or irreversible public broadcasts.

---

## 3. Keyboard Shortcut Standards
All modals and studio components must register global keyboard listeners using `useEffect`:
```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "x") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```

---

## 4. Verification Commands
```bash
# Run frontend test suites
pnpm --filter @workspace/shothik run test

# Run strict TypeScript typecheck
pnpm --filter @workspace/shothik run typecheck
```
