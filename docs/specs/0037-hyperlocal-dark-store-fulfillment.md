# Spec 0037: Autonomous Hyperlocal Dark Store & Micro-Fulfillment Dark Hub Orchestrator

## Overview
Bangladeshi direct-to-consumer (D2C) brands and high-velocity One-Person Companies (OPCs) face intense pressure for sub-2-hour urban delivery in mega-cities like Dhaka and Chittagong. Centralized warehousing introduces severe traffic bottlenecks, high RTO rates, and delayed fulfillment.
Slice 37 implements the **Autonomous Hyperlocal Dark Store & Micro-Fulfillment Dark Hub Orchestrator**, providing distributed micro-hub inventory management, thana-level automated routing, S-curve bin pick-path optimization, FEFO (First-Expired, First-Out) lot/batch management, and proactive inter-hub inventory rebalancing.

---

## Acceptance Criteria

### AC-1: Distributed Dark Hub Network & Geofenced Thana Routing
- Pre-seeded high-density fulfillment hubs across Bangladesh:
  - Dhaka Hubs: Dhanmondi (Hub-DHK-01), Uttara (Hub-DHK-02), Mirpur (Hub-DHK-03), Gulshan/Badda (Hub-DHK-04), Old Dhaka (Hub-DHK-05).
  - Regional Hubs: Chittagong GEC (Hub-CTG-01), Chittagong Agrabad (Hub-CTG-02), Sylhet Zindabazar (Hub-SYL-01), Rajshahi Shaheb Bazar (Hub-RAJ-01).
- Automated customer delivery address resolution matching thana, ward, and coordinates to the optimal dark store with stock availability and shortest SLA.

### AC-2: 3D Bin Location Scheme & S-Curve Pick-Path Optimizer
- Precise 4-segment bin coordinate system: `[Aisle]-[Rack]-[Shelf]-[Bin]` (e.g. `A02-R04-S03-B08`).
- Serpentine (S-shape) warehouse traversal algorithm that sorts pick tasks to minimize picker walking footsteps and pick time (<90 seconds per 5-item order).

### AC-3: FEFO (First-Expired, First-Out) Lot & Expiry Tracker
- Granular batch/lot tracking with manufacturing date, expiry date, and shelf-life decay percentage.
- Automatic dispatch prioritization choosing earliest expiring lot.
- Automated liquidation / flash discount alerts when remaining shelf life drops below 30 days.

### AC-4: Velocity-Driven Inter-Hub Stock Rebalancing
- 7-day velocity consumption tracking per SKU per hub.
- Automated replenishment calculation generating transfer orders from Central Master Hub (Tejgaon) to depleted micro-hubs before stockout threshold is breached.

### AC-5: Express API Endpoints (`/api/v1/fulfillment/*`)
- `GET /api/v1/fulfillment/hubs`: List dark stores with capacity, operational status, and SKU inventory levels.
- `POST /api/v1/fulfillment/route-order`: Smart-route order to optimal hub based on location and real-time inventory.
- `POST /api/v1/fulfillment/pick-list`: Generate optimized S-curve picking path with bin addresses and barcodes.
- `POST /api/v1/fulfillment/batch-register`: Register batch/lot with FEFO expiry tagging.
- `GET /api/v1/fulfillment/expiry-alerts`: Retrieve expiring batches with dynamic clearance discount rules.
- `POST /api/v1/fulfillment/rebalance-plan`: Generate inter-hub replenishment recommendations.

### AC-6: Frontend Studio Modal (`DarkHubFulfillmentModal.tsx`) & Twin Integration
- Interactive Twin Studio modal accessible via `⌘H` / `Ctrl+H` shortcut.
- Visual dark store capacity cards, interactive pick-path simulator, FEFO expiry radar, and 1-click inter-hub transfer dispatcher.
- Full integration into `TwinCommandPalette.tsx` and `twin/page.tsx`.

---

## Technical Design

### Data Structures
```typescript
export interface DarkHub {
  hubId: string;
  name: string;
  city: 'Dhaka' | 'Chittagong' | 'Sylhet' | 'Rajshahi';
  zone: string;
  coveredThanas: string[];
  capacityUnits: number;
  utilizedUnits: number;
  status: 'active' | 'maintenance' | 'overloaded';
  averageDispatchMinutes: number;
  contactNumber: string;
}

export interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  hubId: string;
  quantity: number;
  binLocation: string; // e.g. "A02-R03-S01-B05"
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  unitCostBDT: number;
  sellingPriceBDT: number;
}
```
