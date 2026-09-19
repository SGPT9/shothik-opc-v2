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
The primary UI shell runs the **Twin Doctrine** (OPC merchant command center):
- **Command Palette (`TwinCommandPalette.tsx`):** Triggered by `⌘K` or `Ctrl+K`. Global shortcut dispatcher for all merchant tools.
- **Mushak Tax Studio (`MushakTaxStudioModal.tsx`):** Triggered by `⌘X` or `Ctrl+X`. 4-tab studio (Invoice Generator, Statutory Printable Canvas, TDS Ledger, Mushak-9.1 Summary).
- **bKash/Nagad Payment Hub (`PaymentModal.tsx`):** Triggered by `⌘B`. MFS merchant transfers and ledger.
- **Courier Logistics Hub (`CourierModal.tsx`):** Triggered by `⌘C`. Pathao and Steadfast parcel booking.
- **Supervised Gatekeeper Modal (`SupervisedApprovalModal.tsx`):** Required for any protected actions > ৳10,000 or irreversible broadcasts.

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
