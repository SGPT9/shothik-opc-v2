# Spec 0078: Autonomous Multi-Channel Real-Time Inventory Matrix & Flash-Sale Reservation Lock Engine

## 1. Problem Statement & Domain Reality
During major high-velocity sales campaigns in Bangladesh (Eid-ul-Fitr, Eid-ul-Adha, 11.11, Pahela Baishakh, and Facebook Live Selling broadcasts), merchants face catastrophic overselling and double-allocation:
1. **The Multi-Channel Race Condition**: A merchant selling simultaneously on Daraz, WooCommerce, Facebook Shop, and WhatsApp Business maintains separate or lagging channel stock. When a popular product gets 50 orders on Facebook Live while 30 orders are placed on Daraz for a 60-unit inventory, 20 customers receive out-of-stock cancellations.
2. **Channel Penalties & Reputational Damage**: On Daraz, high cancellation rates result in merchant tier demotions, search ranking suppression, and financial penalties. On social media, unfulfilled COD orders trigger public customer backlash.
3. **Cart Abandonment Stock Hijacking**: Static stock deduction without time-limited lease locks causes unsold carts to lock inventory indefinitely.
4. **Solution**: A distributed **Leased Flash-Sale Reservation Lock Engine** that reserves stock atomically with an expiring TTL (e.g., 15 minutes). When payment or COD confirmation completes, the stock is permanently committed; if the checkout is abandoned or times out, the lock automatically releases the units back to the universal pool.

---

## 2. Core Architectural Pillars & Acceptance Criteria

### AC-1: Atomic Leased Stock Reservation with Millisecond TTL
- Provides atomic reservation method: `reserveStock({ sku, quantity, channel, orderRef, customerPhone?, ttlSeconds })`.
- Assigns unique `reservationId` with cryptographic audit signature.
- Sets expiring lease lock ($T_{\text{expire}} = \text{now} + \text{ttlSeconds} \cdot 1000$).
- Ensures `availableStock = totalStock - activeReservations - committedSold` is never negative.
- Returns reservation token, remaining available stock, and expiration timestamp.

### AC-2: Two-Phase Commit & Automatic Garbage-Collection Release
- **Commit Phase**: `commitReservation(reservationId)` permanently deducts units from `totalStock` and transitions status to `COMMITTED`.
- **Release Phase**: `releaseReservation(reservationId, reason)` restores units immediately to `availableStock` and transitions status to `RELEASED`.
- **Automatic TTL GC**: Background eviction loop or lazy sweep that identifies expired reservations ($T_{\text{expire}} < \text{now}$) and automatically restores stock to the available pool without merchant intervention.

### AC-3: Dynamic Multi-Channel Quota Allocator & Panic Freeze
- Dynamic channel quotas across:
  - **Daraz Marketplace**
  - **WooCommerce / Shopify Direct Store**
  - **Facebook / TikTok Live Stream Cart**
  - **WhatsApp Business Catalog**
- Real-time stock sync webhook payloads for third-party connector broadcast.
- **Emergency Panic Freeze**: 1-tap merchant override that instantly freezes channel reservations and sets all external channels to 0 available stock during catalog emergencies or inventory discrepancies.

### AC-4: Flash Campaign Manager (Eid / 11.11 Ticker)
- Manages high-intensity campaigns with dedicated quota fences:
  - `campaignId`, `title`, `discountPercent`, `dedicatedQuota`, `maxPerCustomer`, `startsAt`, `endsAt`.
  - Enforces per-phone rate limits to prevent reseller bots from hoarding stock.
  - Generates live campaign telemetry: total reserved, total committed, remaining stock velocity, and burnout run-rate.

### AC-5: REST API Endpoints (`@workspace/api-server`)
- `POST /api/v1/inventory/reserve`: Atomically reserve items with 15-minute lease lock.
- `POST /api/v1/inventory/commit`: Commit reserved stock on order confirmation.
- `POST /api/v1/inventory/release`: Release reserved stock on cancellation or timeout.
- `GET /api/v1/inventory/reservations`: List active leased reservations with remaining TTL.
- `POST /api/v1/inventory/sync-channels`: Push real-time stock balances across Daraz, WooCommerce, and WhatsApp.
- `POST /api/v1/inventory/panic-freeze`: Emergency global or channel inventory freeze.
- `POST /api/v1/inventory/campaigns`: Create or update flash sale campaign.
- `GET /api/v1/inventory/campaigns/active`: Query active flash campaigns and live reservation metrics.

### AC-6: Frontend Twin Modal (`FlashSaleInventoryModal.tsx`)
- Registered in `TwinCommandPalette.tsx` under `flash-inventory` / `reservation-lock` with keyboard shortcut `⌥I`.
- Real-time interactive UI:
  - Live stock burnout gauge and remaining available units.
  - Multi-channel balance bars (Daraz, WooCommerce, Facebook Live, WhatsApp).
  - Active Leased Reservations table with live countdown timers.
  - Interactive test simulator: Simulate simultaneous 11.11 checkout surge with instant conflict detection.
  - Prominent red "Emergency Panic Freeze" switch with confirmation safeguards.
