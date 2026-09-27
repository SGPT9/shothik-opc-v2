# Spec 0073: Autonomous Meta & TikTok Conversion API (CAPI) with Offline COD Attribution Engine

## Problem Statement
In South Asian social commerce (Bangladesh, Pakistan, India), 70%+ of consumer orders originate from Facebook & TikTok ads but conclude as Cash on Delivery (COD) 2 to 5 days later. Because standard browser pixels lose tracking on mobile webviews, browser ad blockers, and Apple iOS 14.5+ ATT privacy policies, merchants experience 40%+ under-reported ROAS. Furthermore, when an order is cancelled at the doorstep (RTO), ad algorithms erroneously optimize for junk leads unless an offline negative signal is dispatched.

## Solution Architecture
1. **Server-Side Dual CAPI Dispatcher (`meta-capi-engine.ts`)**:
   - Normalizes and dispatches server-side events (`Purchase`, `InitiateCheckout`, `Lead`, `AddPaymentInfo`) directly to Meta Graph API v20.0 and TikTok Events API v2.
   - Cryptographically hashes PII (phone number normalized to `+8801...` format, email to lowercase trimmed) using SHA-256 before transmission.
2. **Offline COD Re-Attribution & Postback**:
   - When Steadfast / Pathao / RedX marks a parcel as `delivered` or `returned`, the engine reconciles the delivery event with the stored `fbclid` / `ttclid` / `user_data` and fires an authentic offline `Purchase` or `COD_Cancelled` conversion event.
   - Deduplication: uses deterministic `event_id` hashes (`sha256(orderId + eventType)`) to prevent double-counting between browser pixel and server CAPI.
3. **Express REST Gateway**:
   - `POST /api/marketing/capi/event`: Dispatch realtime conversion event.
   - `POST /api/marketing/capi/offline-attribution`: Reconcile courier delivery webhook into offline CAPI purchase.
   - `GET /api/marketing/capi/pixel-health`: Match quality score, event deduplication stats, and ROAS lift.
4. **Frontend UI Cockpit**:
   - `MetaCapiModal.tsx`: Visual event match quality meter (8.5/10 target), real-time event stream inspector, and pixel configuration manager.
