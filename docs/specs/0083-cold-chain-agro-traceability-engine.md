# Spec 0083: Decentralized Farm-to-Table Cold Chain Telemetry & Agro-Commodity Traceability Engine

## 1. Executive Summary & Objective
Implement an autonomous cold-chain telemetry and farm-to-table traceability engine into **ShothikGPT (v2.8.0)**:
1. **Perishable Agro-Commodity Corridors**: Track refrigerated Reefer transports carrying high-value perishable produce (Rajshahi Fazli/Himsagar Mangoes, Bogra Seed Potatoes & Cauliflowers, Dinajpur Lychees, Jessore Green Chilis & Flowers) to metropolitan wholesale markets (Dhaka Badamtoli, Karwan Bazar, Jatrabari, and Chittagong Reazuddin Bazar).
2. **IoT / RFID Sensor Telemetry Logging**: Ingest periodic temperature ($^\circ\text{C}$) and relative humidity (RH %) telemetry readings from BLE/RFID data-loggers inside transport compartments.
3. **Arrhenius Spoilage Kinetic Risk Model**: Compute cumulative Spoilage Risk Index (SRI) using temperature-dependent microbial/enzymatic acceleration factors ($Q_{10} = 2.2$).
4. **Milestone Escrow Payouts**: Automated bKash/Nagad smart disbursements: 30% advance on loading at regional farm gate, 70% final settlement upon mandi arrival and digital seal inspection, with automated penalty deductions for SLA temperature breaches.
5. **NBR Mushak-6.3 Agricultural Exemption Compliance**: Generate statutory NBR VAT Exemption Declarations under Section 26 of the Value Added Tax and Supplementary Duty Act 2012 for unprocessed farm commodities.
6. **Frontend AG-UI Studio Modal**: Cockpit modal (`ColdChainAgroModal.tsx`) with live sensor graphs, milestone settlement ledger, temperature excursion alerts, and keyboard shortcut `⌘A` / `Ctrl+A`.

---

## 2. Mathematical Spoilage Risk Model

For logged temperature samples $T_i$ over duration $\Delta t_i$ (hours):
$$\text{Rate}(T_i) = Q_{10}^{\frac{T_i - T_{\text{ref}}}{10}}$$
Where $T_{\text{ref}} = 4.0^\circ\text{C}$ and $Q_{10} = 2.2$.

Cumulative Spoilage Risk Index ($\text{SRI}$):
$$\text{SRI} = \frac{1}{\text{ShelfLife}_{\text{nominal}}} \sum_{i=1}^{n} \text{Rate}(T_i) \cdot \Delta t_i$$

- **Normal Compliant**: $\text{SRI} < 0.40$ (Grade A Produce, 100% full payout).
- **Mild Excursion**: $0.40 \le \text{SRI} < 0.80$ (Grade B Produce, 5% transport penalty).
- **Critical Excursion**: $\text{SRI} \ge 0.80$ (Emergency auction alert, 25% penalty deduction, instant bKash partial settlement).

---

## 3. Sprint Tickets & API Routes

### Ticket 83.1: Domain Engine (`cold-chain-engine.ts`)
- Agro-commodity catalog (Mangoes, Potatoes, Tomatoes, Strawberries, Hilsa Fish).
- Telemetry ingestion and Arrhenius Spoilage Risk Index (SRI) calculator.
- Milestone payout escrow ledger with bKash/Nagad disbursement calculations.
- NBR Section 26 VAT exemption certificate generator.

### Ticket 83.2: Express Route Endpoints (`cold-chain.ts`)
- `GET /api/v1/agri/cold-chain/shipments` — List active cold-chain consignments.
- `POST /api/v1/agri/cold-chain/shipments` — Register new farm-to-mandi consignment with 30% advance escrow.
- `POST /api/v1/agri/cold-chain/shipments/:id/telemetry` — Ingest sensor log (temperature, humidity, GPS).
- `POST /api/v1/agri/cold-chain/shipments/:id/settle` — Finalize mandi arrival and disburse remaining payout.
- `GET /api/v1/agri/cold-chain/shipments/:id/vat-exemption` — Generate NBR Mushak Section 26 Certificate.

### Ticket 83.3: Frontend AG-UI Cockpit (`ColdChainAgroModal.tsx`)
- Standardized WAI-ARIA modal accessibility (`useModalA11y`, `role="dialog"`, `aria-modal="true"`, 36px touch targets).
- Keyboard shortcut `⌘A` / `Ctrl+A`.
- Real-time temperature & humidity sensor gauge with excursion warning banners.
- Escrow milestone ledger (loading advance vs mandi final settlement).

---

## 4. Acceptance Criteria
- **AC-1**: Arrhenius spoilage index correctly penalizes consignments subjected to sustained heat excursions ($> 12^\circ\text{C}$).
- **AC-2**: Milestone payout enforces 30% loading advance and conditions 70% final disbursement on arrival inspection.
- **AC-3**: NBR Section 26 Agricultural Produce exemption certificate verifies 0% VAT under statutory rules.
- **AC-4**: Zero TypeScript errors, 100% test pass rate across new route and component test suites.
