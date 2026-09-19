# 0033 — Autonomous Social Commerce Live-Selling & Viral Comment-to-Order Studio

## Status
- **Phase**: Implementation / Slice 33
- **Author**: Shothik Core Architecture Team
- **Date**: September 2026

---

## 1. Problem Statement & Bangladesh Commerce Context
In South Asian social commerce (particularly Bangladesh F-Commerce and TikTok Shop live streams), live-streaming is the dominant high-conversion channel for solo-entrepreneurs and micro-merchants (OPCs). During a 60-minute live session, a single merchant often receives 500–2,000 high-velocity comments in hybrid Banglish/Bengali containing intent to buy:
- *"Black XL lagbe, 01711223344, Dhanmondi"*
- *"TWS Earbuds 2 ta nibo, bKash korbo"*
- *"Panjabi size 42 ache? COD Sylhet pathan"*

Manual order tracking during a live session results in $>40\%$ lost sales, stock overselling, and delayed customer checkout.

---

## 2. Architectural Solution
Slice 33 introduces the **Autonomous Social Commerce Live-Selling Engine**:
1. **Deterministic Banglish Comment Intent Parser**:
   - Extracts: SKU/Product keyword, Variation (Size/Color/Qty), Bangladeshi 11-digit Phone (`013-019`), Delivery District, and Payment Mode (`bKash` / `COD`).
   - Confidence scoring ($0.0 - 1.0$) for automated checkout routing vs. human escalation.
2. **Real-Time Live Stock Reservation & Lock Engine**:
   - Atomic reservation with a 15-minute TTL (Time-to-Live) lock to prevent overselling while the customer completes payment.
   - Automatic lock expiration and stock replenishment if checkout is abandoned.
3. **Instant 1-Tap Checkout Link & SMS/WhatsApp Ingestion**:
   - Generates automated bKash PGW dynamic payment URL with pre-filled amount and reference.
   - Generates Steadfast/Pathao automated COD draft payload.
4. **Live Stream Telemetry & Velocity Dashboard**:
   - Live GMV counter, active viewer count, orders captured per minute (CPM), top converting SKUs, and auto-reply dispatch log.

---

## 3. Data Structures & Interfaces

```typescript
export interface LiveSellingSession {
  sessionId: string;
  channel: "facebook_live" | "tiktok_live" | "instagram_live" | "youtube_live";
  sessionTitle: string;
  merchantId: string;
  status: "live" | "paused" | "ended";
  startedAt: string;
  totalCommentsIngested: number;
  ordersCapturedCount: number;
  totalGmvCapturedBdt: number;
  activeViewerCount: number;
  activeSkuLocks: Record<string, number>; // SKU -> locked quantity
}

export interface LiveCommentParsedOrder {
  commentId: string;
  sessionId: string;
  rawComment: string;
  authorName: string;
  extractedSku?: string;
  extractedQuantity: number;
  extractedSize?: string;
  extractedColor?: string;
  extractedPhone?: string;
  extractedDistrict?: string;
  paymentMethod: "bkash" | "cod" | "nagad" | "unspecified";
  confidenceScore: number;
  status: "order_drafted" | "payment_link_sent" | "confirmed" | "low_confidence_review";
  orderId?: string;
  checkoutUrl?: string;
  expiresAt: string; // 15-min TTL
  ingestedAt: string;
}
```

---

## 4. API Endpoints (`/api/v1/live-selling/*`)
- `POST /api/v1/live-selling/sessions/create`: Initialize a live selling stream.
- `GET /api/v1/live-selling/sessions/active`: Retrieve current live stream state, locked inventory, and real-time velocity.
- `POST /api/v1/live-selling/comments/parse`: Ingest raw live comments and produce structured draft orders with bKash checkout links.
- `POST /api/v1/live-selling/orders/confirm`: Mark a drafted live order as confirmed/paid and permanently decrement inventory.
- `GET /api/v1/live-selling/sessions/:sessionId/orders`: Retrieve real-time feed of captured orders.

---

## 5. Acceptance Criteria
- [x] **AC-1**: Deterministic extraction of SKU, phone number, size, and district from Banglish comments with $>90\%$ precision.
- [x] **AC-2**: Atomic inventory locking with 15-minute TTL countdown timer.
- [x] **AC-3**: Instant generation of dynamic bKash 1-tap checkout URLs and Steadfast COD booking drafts.
- [x] **AC-4**: Frontend Twin Live-Selling Studio (`LiveSellingStudioModal.tsx`) with real-time comment feed, live GMV ticker, and keyboard shortcut **`⌘L`**.
- [x] **AC-5**: 100% test coverage with automated unit tests for parser and reservation lifecycle.
