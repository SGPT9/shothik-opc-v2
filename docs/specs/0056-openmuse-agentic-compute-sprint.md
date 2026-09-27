# Sprint Spec 0056: OpenMuse Agentic Compute, Persistent Browser Takeover & CAS Leased Task Orchestration Engine

## 1. Executive Summary & Objective
Integrate the core architectural patterns discovered from **OpenMuse (CopilotKit)** into **ShothikGPT (v2.8.0)**:
1. **Durable Task Engine & SQL Compare-and-Swap (CAS) Leases**: Zero lost background jobs during node/pod crashes.
2. **Protected Action Proposal & Stored Review State Machine**: Enforce human approval gates for bKash/Nagad payouts, WhatsApp broadcasts, and COD order dispatches.
3. **Playwright Egress-Proxied Persistent Browser Worker with Live Screenshot Takeover**: Visual screenshot stream + normalized $(X, Y)$ coordinate clicks for merchant portal automation (Steadfast, Pathao, Daraz, Facebook).
4. **Nilkhet Interactive PDF Form Extraction & Signed Delivery Receipts**: Form field extraction, client-side fill preview, and SHA-256 sealed print receipts.
5. **AG-UI Mobile-First Studio Modal & Interactive Chat Cards**: Cross-platform responsive cockpit with keyboard shortcut `⌘U` for Autonomous Agentic Computer control.

---

## 2. Sprint Tickets Breakdown

### Ticket 56.1: Distributed SQL Compare-and-Swap (CAS) Leased Task Worker
- **Goal**: Implement resilient background task orchestration in `lib/hermes/` with compare-and-swap atomic locking, heartbeat renewals, and lease-loss protection.
- **Files**:
  - `lib/hermes/src/leased-task-worker.ts`
  - `artifacts/api-server/src/routes/tasks.ts`
  - `artifacts/api-server/src/routes/__tests__/tasks.test.ts`
- **Acceptance Criteria**:
  - `CAS Acquisition`: Uses atomic JSONB/PostgreSQL update with `leaseId` and `leaseUntil`.
  - `Heartbeat Renewal`: Auto-renews `leaseUntil` at $\frac{1}{3} \times \text{leaseDuration}$.
  - `Abort On Lost Lease`: Immediately stops execution and throws `LostLeaseError` if overridden or canceled.
  - `Crash Recovery`: Tasks in `running` status whose lease has expired are automatically requeued.

---

### Ticket 56.2: Protected Action Proposal & Stored Review Engine
- **Goal**: Build an audit-proof `ActionProposal` state machine that gates destructive or financial operations.
- **Files**:
  - `artifacts/api-server/src/lib/actions/action-proposal-engine.ts`
  - `artifacts/api-server/src/routes/action-proposals.ts`
  - `artifacts/api-server/src/routes/__tests__/action-proposals.test.ts`
- **Acceptance Criteria**:
  - Discriminated union for `bkash.payout`, `courier.dispatch`, `whatsapp.broadcast`, and `invoice.issue`.
  - Stored in state `awaiting_review` with SHA-256 payload hash and expiration timer.
  - Idempotent execution endpoint requiring explicit user approval token.
  - Server restart recovery: in-flight executing actions transition to `outcome_unknown` with recovery instructions.

---

### Ticket 56.3: Egress-Proxied Browser Worker & Live Screenshot Takeover
- **Goal**: Provide a secure Playwright browser worker with SSRF protection and live screenshot-based human takeover.
- **Files**:
  - `artifacts/api-server/src/lib/browser/browser-takeover-engine.ts`
  - `artifacts/api-server/src/routes/browser-takeover.ts`
  - `artifacts/api-server/src/routes/__tests__/browser-takeover.test.ts`
- **Acceptance Criteria**:
  - SSRF blocklist: Prevents navigation to `127.0.0.1`, `localhost`, `169.254.169.254`, and private subnets.
  - Coordinate Normalizer: Maps client click $(e.clientX, e.clientY)$ to $(1280 \times 800)$ Playwright viewport.
  - Pure visual streaming: Remote page JavaScript never executes within the host/client web document.
  - Action support: Click, typing, key press (`Enter`, `Tab`, `Backspace`), and scroll $(\pm \Delta Y)$.

---

### Ticket 56.4: Nilkhet Interactive PDF Form Extraction & Receipt Engine
- **Goal**: Enable end-to-end PDF processing: field extraction, typed input schema generation, fill preview, and SHA-256 signed delivery receipt.
- **Files**:
  - `lib/office-engine/src/pdf-form-engine.ts`
  - `artifacts/api-server/src/routes/pdf-forms.ts`
  - `artifacts/api-server/src/routes/__tests__/pdf-forms.test.ts`
- **Acceptance Criteria**:
  - Extracts text fields, checkboxes, and radio groups with byte-level validation.
  - Generates interactive JSON schema for missing/required values.
  - Renders filled PDF copy with cryptographic SHA-256 seal.

---

### Ticket 56.5: Frontend AG-UI Twin Studio Modal & Action Cards
- **Goal**: Create responsive AG-UI components and Twin Studio modal with keyboard shortcut `⌘U` / `Ctrl+U`.
- **Files**:
  - `artifacts/shothik/src/components/twin/AgentComputerModal.tsx`
  - `artifacts/shothik/src/components/chat/ActionProposalCard.tsx`
  - `artifacts/shothik/src/components/twin/__tests__/AgentComputerModal.test.tsx`
- **Acceptance Criteria**:
  - Interactive Twin Modal with Browser Console Takeover viewport, Terminal run output, and Active Task Leases table.
  - Inline chat card for `ActionProposal` with `Approve`, `Edit`, and `Reject` buttons.
  - Seamless keyboard shortcut binding (`⌘U`) and mobile responsive viewport.
