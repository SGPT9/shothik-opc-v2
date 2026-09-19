# 0028. WhatsApp Commerce and Automated Merchant Agent Hub

**Date**: 2026-09-18  
**Status**: Proposed

## Summary

This specification defines the conversational commerce engine connecting WhatsApp Business messaging directly into the Shothik OPC Twin platform. It enables Bangladeshi merchants to ingest raw customer inquiries in Bangla or Banglish, automatically parse item selections into structured cart drafts, compute delivery and tax charges, and queue orders for fulfillment. High value transactions over 10000 BDT trigger the Supervised Autonomy gatekeeper before payment links or courier bookings are dispatched.

## Context

Over 80 percent of conversational commerce for Bangladeshi solo entrepreneurs occurs over WhatsApp and Facebook Messenger. Customers communicate using mixed Romanized Bangla (Banglish) or phonetic voice notes, asking for pricing, size availability, delivery charges outside Dhaka, and bKash payment numbers. 

Manually tracking these conversations causes high lead leakage, missed followups, and pricing errors. Furthermore, attempting full unconstrained AI automation risks accidental discounts, unauthorized commitments, or booking bogus Cash on Delivery (COD) shipments to fraudulent addresses. The Shothik platform requires an automated yet strictly supervised conversational commerce hub that translates informal customer chats into structured orders while protecting merchant capital.

## Requirements

**User stories**:
- As a solo merchant, I want WhatsApp customer messages to be automatically parsed into cart items and delivery addresses so that I can close sales faster without manual data entry.
- As a merchant, I want high value orders or custom discount requests to require my manual confirmation so that the AI cannot commit unauthorized funds.
- As a customer, I want immediate answers in natural Banglish regarding stock availability, delivery timelines, and payment options with instant checkout links.

**Acceptance criteria**:
- **AC-1**: Webhook endpoint verifies incoming WhatsApp payload signatures and ingests customer messages (text, image, audio) within 500ms.
- **AC-2**: Banglish NLP parser extracts item quantities, size/color variations, and delivery districts (Inside Dhaka vs Outside Dhaka) using incremental session slot-filling.
- **AC-3**: Confidence-Gated Resolution: High confidence (p >= 0.85) auto-binds cart; Medium confidence (0.40 <= p < 0.85) dispatches interactive WhatsApp MPM quick-selection buttons; Low confidence (p < 0.40) routes to Merchant Twin Copilot inbox.
- **AC-4**: Tax and delivery calculations apply statutory Mushak-6.3 VAT and standard Pathao/Steadfast logistics rates based on destination.
- **AC-5**: Orders exceeding 10000 BDT or requesting custom discounts greater than 15 percent transition to `pending_merchant_approval` rather than auto confirming.
- **AC-6**: Twin UI displays a real-time WhatsApp Conversation Studio with 1-click approval, interactive catalog sharing, and bKash payment link generation.
- **AC-7**: System handles duplicate webhook deliveries idempotently using WhatsApp message IDs.


## Options considered

### Option 1: Direct WhatsApp Cloud API with Webhook Receiver and Local NLP Engine

Direct integration with Meta WhatsApp Cloud API webhooks using HMAC-SHA256 signature verification, paired with Shothik native Banglish intent classification and local OPFS caching.

**Pros**:
- Official enterprise SLA, compliance with Meta policies, zero ban risk for merchant numbers.
- Sub-50ms latency using Shothik speculative router.

**Cons**:
- Requires Meta Business verification and API access tokens for production numbers.

### Option 2: Headless Baileys / Multi-Device Web Socket Scraping

Running headless Chromium or WhatsApp Web protocol emulation via Baileys to connect personal WhatsApp numbers without Meta Cloud verification.

**Pros**:
- Works instantly with any regular personal SIM card.

**Cons**:
- High risk of number bans by WhatsApp automated security.
- Fragile connection lifecycle requiring continuous QR re-authentication.

## Decision

**Chosen option**: Option 1: Direct WhatsApp Cloud API with Webhook Receiver and Local NLP Engine

We will build standard Meta Cloud API webhook handlers with an interchangeable mock adapter for zero-credential local development and testing.

**Implementation skills**: `shothik-interface-design`, `demography-aware-tech-team`

## Rationale

Solo entrepreneurs in Bangladesh need a reliable system that will not get their primary customer communication phone number banned. Using the official webhook architecture with local simulation enables seamless developer testing while ensuring production deployments comply with telecom and enterprise standards.

## Feature design

**Data model sketch**:
- `WhatsAppSession`: `id` (string, PK), `merchantId` (string), `customerPhone` (string, E.164), `customerName` (string, optional), `state` (enum), `lastActivity` (timestamp).
- `WhatsAppMessage`: `id` (string, PK, wamid), `sessionId` (string, FK), `direction` (`inbound` | `outbound`), `type` (`text` | `audio` | `template` | `interactive`), `content` (string), `rawPayload` (json), `createdAt` (timestamp).
- `CartDraft`: `id` (string, PK), `sessionId` (string, FK), `items` (array of `{ productId, sku, name, qty, unitPrice, vatRate }`), `deliveryArea` (`inside_dhaka` | `outside_dhaka`), `deliveryFee` (number), `subtotal` (number), `vatTotal` (number), `grandTotal` (number), `isSupervised` (boolean), `status` (`building` | `pending_approval` | `confirmed` | `cancelled`).

**State transitions**:
`inquiry` -> `catalog_shared` -> `cart_building` -> `draft_order` -> `supervised_review` (if > 10000 BDT) -> `confirmed_mfs_or_cod` -> `dispatched`.

**API surface**:
| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `/api/v1/whatsapp/webhook` | GET | `hub.mode`, `hub.verify_token`, `hub.challenge` | challenge string | Webhook Token | 403 Forbidden |
| `/api/v1/whatsapp/webhook` | POST | `object`, `entry` array, `X-Hub-Signature-256` | `{ success: true }` | HMAC-SHA256 | 401 Invalid Sig |
| `/api/v1/whatsapp/sessions` | GET | `status`, `limit`, `offset` | list of active chat sessions | Bearer JWT | 401 Unauthorized |
| `/api/v1/whatsapp/cart/extract`| POST | `sessionId`, `rawText`, `languageHint` | extracted cart draft object | Bearer JWT | 422 Unprocessable |
| `/api/v1/whatsapp/orders/approve`| POST| `cartId`, `merchantNotes`, `paymentMethod`| confirmed order and tracking | Bearer JWT | 400 Invalid State |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Ingest Message | `customerPhone`, `content` | WhatsApp webhook payload (`entry[0].changes[0].value.messages[0]`) |
| Cart Extraction | `items[].qty`, `size`, `color` | Banglish NLP parser extracting regex & keyword tokens from raw text |
| Price Calculation | `items[].unitPrice` | Product catalog DB lookup by matched SKU/Name |
| VAT Calculation | `vatTotal` | NBR Mushak-6.3 tax engine (`artifacts/api-server/src/lib/tax/mushak-tax-engine.ts`) |
| Delivery Fee | `deliveryFee` (60 BDT / 120 BDT) | Delivery district matrix (`inside_dhaka` = 60, `outside_dhaka` = 120) |
| Supervised Gate | `isSupervised: true` | Evaluation check: `grandTotal > 10000` or custom discount applied |

**Security model**:
- Inbound webhooks validated via `crypto.createHmac('sha256', appSecret)`.
- Replay attack mitigation with 5 minute timestamp drift rejection.
- Role-based merchant isolation: merchants only access their own customer chat sessions.

**Configuration required**:
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`: Verification secret for Meta webhook handshake.
- `WHATSAPP_APP_SECRET`: App secret used to compute HMAC SHA256 signatures.
- `WHATSAPP_ACCESS_TOKEN`: Cloud API system user access token for outbound messaging.

**Critical test scenarios**:
- Webhook signature verification succeeds with valid HMAC and fails with invalid token (verifies **AC-1**).
- Banglish text parsing correctly extracts 2 Panjabi XL and delivery to Chittagong into a 120 BDT outside Dhaka cart (verifies **AC-2**, **AC-3**).
- Cart totaling 14500 BDT marks `isSupervised: true` and halts automated checkout until merchant signs off (verifies **AC-4**).
- Idempotency check ignores duplicated incoming `wamid` payloads (verifies **AC-6**).

## Build plan

1. Build WhatsApp webhook router and HMAC signature validator with simulated adapter in `artifacts/api-server/src/routes/whatsapp.ts`, satisfies **AC-1**, **AC-6**.
2. Implement conversational Banglish cart extraction and Mushak tax/delivery pricing in `artifacts/api-server/src/lib/commerce/whatsapp-cart-engine.ts`, satisfies **AC-2**, **AC-3**.
3. Implement Supervised Autonomy gatekeeper routing for high-value transactions (> 10000 BDT) in `artifacts/api-server/src/routes/whatsapp.ts`, satisfies **AC-4**.
4. Build frontend Twin WhatsApp Live Chat & Cart Approval Studio Modal in `artifacts/shothik/src/components/twin/WhatsAppCommerceModal.tsx`, satisfies **AC-5**.
5. Author complete Vitest suite with 100% test coverage for webhook handling, extraction, and supervisory gates, satisfies **AC-1..6**.

## Consequences

**Positive**:
- Converts high-friction manual customer messaging into automated structured orders in seconds.
- Protects merchants from rogue AI commitments with programmatic supervision rules.
- Fully adheres to NBR statutory tax rules and local courier pricing conventions.

**Negative / tradeoffs**:
- Meta Cloud API rate limits and messaging template approvals apply in production environments.
