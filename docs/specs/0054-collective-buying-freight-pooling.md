# Spec 0054: Autonomous Micro-Merchant B2B Collective Buying & Bulk Freight Pooling Engine

**Status**: Accepted

## 1. Context & Motivation
For Bangladeshi micro-merchants, F-Commerce solopreneurs, and small grocery/apparel retailers, importing raw materials from 1688/Yiwu or sourcing in bulk from major domestic wholesale hubs (Khatunganj Chittagong, Babu Bazar/Chawkbazar Dhaka) is often unviable due to high Minimum Order Quantities (MOQs) and prohibitive LCL (Less than Container Load) shipping rates.

This engine provides:
1. **Collective Order Pooling**: Groups multiple micro-merchants into single wholesale buying pools with automated countdown timers and minimum volume thresholds.
2. **Volumetric CBM & Freight Cost Allocator**: Calculates proportional freight charges based on Cubic Meters (CBM), actual weight, and customs duty allocation.
3. **Escrow Margin Lock & bKash Collection**: Locks merchant deposit shares in automated escrow, triggering collective order placement once the pool reaches 100% funding.
4. **Domestic Hub Distribution Router**: Automatically splits bulk consignments upon arrival into individual courier parcels (via Steadfast/Pathao/Paperfly) to respective micro-merchants.
5. **Cryptographic Pool Seal**: SHA-256 integrity hash guaranteeing transparent cost breakdowns and zero hidden markups.

## 2. Core Acceptance Criteria
- **AC-1 (Collective Buying Pool Lifecycle & Threshold Engine)**:
  - Manages pool states: `open_for_pooling`, `threshold_met`, `order_placed_at_source`, `in_customs_transit`, `dispatched_to_merchants`.
  - Enforces minimum funding and unit volume thresholds with automatic refund triggers if threshold is not reached.
- **AC-2 (CBM & Weight Freight Cost Allocator)**:
  - Calculates proportional international air/sea freight ($/CBM and $/kg), NBR tariff sharing, and domestic hub handling fees.
- **AC-3 (Merchant Escrow Margin & bKash Disbursal)**:
  - Tracks individual merchant commitments, locked deposit margins (e.g. 30%), and balance payments upon customs clearance.
- **AC-4 (Domestic Micro-Hub Parcel Splitter)**:
  - Generates individual Steadfast/Pathao consignment bookings once bulk container is unboxed at central Dhaka/Chittagong hub.
- **AC-5 (Frontend Twin Studio Modal `⌘P` / Palette)**:
  - 4-tab cockpit: Active Buying Pools, New Collective Pool Creator, CBM Freight & Tariff Allocator, and Hub Parcel Splitter.

## 3. Architecture & Interfaces
- Engine: `artifacts/api-server/src/lib/commerce/collective-buying-engine.ts`
- Routes: `artifacts/api-server/src/routes/collective-buying.ts`
- Endpoints:
  - `GET /api/v1/collective-buying/summary`
  - `GET /api/v1/collective-buying/pools`
  - `GET /api/v1/collective-buying/pools/:id`
  - `POST /api/v1/collective-buying/calculate-freight`
  - `POST /api/v1/collective-buying/join-pool`
  - `POST /api/v1/collective-buying/pools/create`
- Frontend: `artifacts/shothik/src/components/twin/CollectiveBuyingModal.tsx`
