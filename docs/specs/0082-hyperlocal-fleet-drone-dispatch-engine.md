# Spec 0082: Autonomous Hyperlocal Delivery Fleet Coordination & Drone/Bike Micro-Dispatch Engine

## 1. Executive Summary & Objective
Integrate an autonomous hyperlocal urban delivery dispatch engine into **ShothikGPT (v2.8.0)**:
1. **Hybrid Urban Fleet Management**: Manage active fleet vehicles across Dhaka & Chittagong: Electric Cargo Bikes (up to 25kg, 35km range) and Express Autonomous Micro-Drones (sub-2kg payload, 8km radius, CAAB Civil Aviation Authority Bangladesh line-of-sight compliant).
2. **Geofenced Micro-Corridor Routing**: Route parcels across dense urban micro-corridors (Gulshan-Banani-Baridhara, Dhanmondi-Mohammadpur, Mirpur 1-10, Uttara Sectors 1-14, Old Dhaka Sadarghat-Chawkbazar, and Chittagong Agrabad-GEC) with traffic congestion multipliers ($1.0\times$ off-peak to $2.8\times$ Dhaka peak hours).
3. **Multi-Carrier Overflow Failover**: If own fleet is 100% capacity-constrained or destination is outside geofenced radius, automatically fall back and book dispatch via Pathao or Steadfast courier APIs.
4. **Safety & Telemetry Fail-Safe**: Real-time battery state-of-charge (SOC %) monitoring, gross payload weight validation, and automated Return-to-Base (RTB) triggers when SOC < 20% or weather conditions deteriorate.
5. **Frontend AG-UI Studio Modal**: Full interactive cockpit (`HyperlocalFleetModal.tsx`) with live corridor map, vehicle fleet status matrix, dispatch assignment simulator, and keyboard shortcut `⌘H` / `Ctrl+H`.

---

## 2. Mathematical Dispatch Scoring Model

The dispatch scoring engine selects the optimal vehicle $v \in V$ for parcel $p$:
$$S(v, p) = w_{\text{eta}} \cdot \left(1 - \frac{\text{ETA}(v, p)}{\text{MAX\_ETA}}\right) + w_{\text{cost}} \cdot \left(1 - \frac{\text{Cost}(v, p)}{\text{MAX\_COST}}\right) + w_{\text{soc}} \cdot \frac{\text{SOC}(v)}{100}$$

Where:
- $w_{\text{eta}} = 0.50$, $w_{\text{cost}} = 0.30$, $w_{\text{soc}} = 0.20$
- If $\text{Weight}(p) > \text{PayloadCapacity}(v)$, vehicle is disqualified ($S = -\infty$).
- If $\text{Distance}(p) > \text{MaxRange}(v) \times (\text{SOC}(v) / 100)$, vehicle is disqualified.
- If $v$ is a drone and $\text{Weight}(p) > 2000\,\text{g}$ or weather is $\text{rainy}$ or $\text{high\_winds}$, vehicle is disqualified.
- When no vehicle satisfies criteria, trigger **Overflow Courier Fallback** (Pathao / Steadfast).

---

## 3. Sprint Tickets & API Routes

### Ticket 82.1: Domain Engine (`hyperlocal-fleet-engine.ts`)
- Manages vehicle registry (Cargo Bikes, Drones, Hub Stations).
- Calculates distance matrix between Dhaka thanas and geofenced corridors.
- Computes vehicle assignment, estimated delivery time (with traffic multiplier), and battery depletion.
- Generates fallback consignment for 3rd-party couriers when capacity is exceeded.

### Ticket 82.2: Express Route Endpoints (`hyperlocal-fleet.ts`)
- `GET /api/v1/logistics/hyperlocal-fleet/vehicles` — List active fleet and statuses.
- `GET /api/v1/logistics/hyperlocal-fleet/corridors` — List active urban delivery corridors and congestion index.
- `POST /api/v1/logistics/hyperlocal-fleet/dispatch` — Calculate optimal dispatch route or failover.
- `POST /api/v1/logistics/hyperlocal-fleet/telemetry` — Update vehicle coordinates and battery SOC.
- `POST /api/v1/logistics/hyperlocal-fleet/rtb` — Trigger emergency Return-to-Base command.

### Ticket 82.3: Frontend AG-UI Cockpit (`HyperlocalFleetModal.tsx`)
- Standardized WAI-ARIA modal accessibility (`useModalA11y`, `role="dialog"`, `aria-modal="true"`, 36px touch targets).
- Keyboard shortcut `⌘H` / `Ctrl+H`.
- Real-time fleet overview (Bikes vs Drones, battery health, active deliveries).
- Interactive dispatch calculator with one-click Steadfast/Pathao overflow fallback.

---

## 4. Acceptance Criteria
- **AC-1**: Vehicle capacity enforcement: Disqualifies drones for parcels $> 2\,\text{kg}$ and bikes for parcels $> 25\,\text{kg}$.
- **AC-2**: Traffic congestion model correctly inflates ETA during Dhaka peak hours (08:30–11:00 & 17:00–20:30 BST).
- **AC-3**: Battery low-charge protection: Vehicles with $\text{SOC} < 20\%$ cannot be assigned and trigger RTB alert.
- **AC-4**: Automatic 3rd-party courier overflow: When all vehicles are busy or out of range, emits validated Steadfast/Pathao dispatch payload.
- **AC-5**: Zero TypeScript errors, 100% test pass rate on new route and component test suites.
