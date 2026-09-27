# Spec 0077: Autonomous Steadfast & Pathao RTO Prediction, Delivery Success Scoring & Fraud Blacklist Sync Engine

## 1. Problem Statement & Domain Reality
In Bangladesh e-commerce, over 80% of consumer transactions rely on Cash on Delivery (COD). However, merchants face devastating Return-to-Origin (RTO) rates of 20% to 45% on unsecured social commerce orders (Facebook Pages, WhatsApp, TikTok Shop).
Key challenges:
1. **The RTO Financial Drain**: Every returned parcel costs the merchant double shipping (৳60–140 forward delivery + ৳30–40 return fee), dead inventory during transit (3–7 days), and damaged packaging.
2. **Serial Returners & Fake Orders**: Impulsive buyers or competitors place fake orders, give unverified addresses, or switch off phones upon delivery arrival.
3. **Siloed Courier Data**: While courier platforms (Steadfast, Pathao, RedX, Paperfly) track customer delivery history, individual merchants lack a unified, automated risk engine to query multi-carrier history before packing goods.
4. **Lack of Dynamic Mitigation**: Merchants either blindly ship high-risk orders or manually call every customer. A smart dynamic advance policy (requiring ৳80–150 bKash delivery fee advance only for high-risk buyers) dramatically reduces RTO while keeping checkout frictionless for trusted buyers.

---

## 2. Core Architectural Pillars & Acceptance Criteria

### AC-1: Multi-Carrier Fraud Intelligence & Unified DSR Calculation
- Normalizes Bangladeshi phone numbers across E.164 (`+8801XXXXXXXXX`), standard domestic (`01XXXXXXXXX`), and unformatted inputs.
- Synthesizes delivery performance metrics across major courier sources:
  - **Steadfast Courier**: Total parcels, delivered parcels, returned parcels, return ratio.
  - **Pathao Courier**: Total orders, successful deliveries, cancellations, disputed attempts.
  - **RedX & Paperfly**: Historic delivery reliability indices.
- Computes **Unified Buyer Credibility Score** ($0 - 100\%$):
  $$\text{Credibility} = w_{\text{dsr}} \cdot \text{DSR} + w_{\text{vol}} \cdot \min(1, \frac{N_{\text{success}}}{10}) \cdot 100 - \text{Penalty}_{\text{fraud}}$$
  where $w_{\text{dsr}} = 0.70$ and $w_{\text{vol}} = 0.30$.

### AC-2: Intelligent RTO Risk Prediction Model
- Calculates `rtoProbabilityPercent` ($0 - 100\%$) and maps orders to risk tiers:
  - `TIER_VERIFIED_LOW` (Credibility $\ge 85\%$, RTO $< 15\%$): Safe to dispatch automatically.
  - `TIER_MODERATE` (Credibility $65\% - 84\%$, RTO $15\% - 35\%$): Recommended voice or WhatsApp confirmation.
  - `TIER_HIGH_RISK` (Credibility $35\% - 64\%$, RTO $36\% - 65\%$): Requires partial bKash delivery fee advance.
  - `TIER_CRITICAL_BLOCKED` (Credibility $< 35\%$ or blacklisted, RTO $> 65\%$): Requires 100% pre-payment or manual override.
- Evaluates multidimensional risk factors:
  - Historical delivery return ratio.
  - Delivery destination risk (Dhaka metro vs. remote border upazilas).
  - COD ticket size ($> \text{৳}5,000$ increases buyer remorse risk).
  - Address clarity and structural validity (missing Thana/Ward/Road penalty).

### AC-3: Community Fraud Blacklist Store & Sync
- In-memory & persisted thread-safe blacklist registry supporting:
  - Phone number normalization and optional SHA-256 anonymized phone hashing.
  - Multiple report categories: `FAKE_ORDER`, `PHONE_SWITCHED_OFF`, `REFUSED_ON_ARRIVAL`, `HARASSMENT`, `DAMAGED_RETURN_FRAUD`.
  - Report count, merchant evidence notes, and timestamping.
- Community blacklist query and mutation APIs:
  - Add fraud report with merchant attribution.
  - Remove / whitelist verified false positives.
  - Blacklist status instantly overrides RTO calculation to `TIER_CRITICAL_BLOCKED`.

### AC-4: Dynamic bKash/Nagad Partial Advance Enforcement Policy
- Generates tailored advance requirements based on risk tier and delivery destination:
  - Inside Dhaka: ৳80 delivery fee advance.
  - Dhaka Suburbs: ৳100 advance.
  - Outside Dhaka: ৳150 advance.
  - High-Value Orders ($> \text{৳}10,000$): 20% advance or ৳500 security deposit.
- Generates bilingual (Bangla + Banglish) WhatsApp and SMS payment request templates with dynamic bKash/Nagad payment link and order details.

### AC-5: REST API Catalog (`@workspace/api-server`)
- `POST /api/v1/logistics/fraud/check`: Multi-carrier credibility & fraud lookup for phone number.
- `POST /api/v1/logistics/fraud/report`: Report a customer number to the community blacklist.
- `GET /api/v1/logistics/fraud/blacklist`: List or search blacklisted numbers.
- `DELETE /api/v1/logistics/fraud/blacklist/:phone`: Merchant whitelist or remove false positive.
- `POST /api/v1/logistics/rto/predict`: Evaluate RTO probability for specific order basket + destination.
- `POST /api/v1/logistics/rto/advance-policy`: Generate advance payment link, QR payload, and WhatsApp script.

### AC-6: Frontend Twin Modal (`RtoFraudShieldModal.tsx`)
- Registered in `TwinCommandPalette.tsx` under `fraud-shield` / `rto-predictor` with keyboard shortcut `Alt+F`.
- Interactive live phone number and order assessment interface:
  - Visual circular / gradient risk gauge (Emerald / Amber / Red / Crimson).
  - Multi-carrier breakdown cards (Steadfast, Pathao, RedX, Community Blacklist).
  - 1-click "Generate bKash Advance Request" modal with copyable Banglish WhatsApp message.
  - 1-click "Report to Blacklist" action with fraud category selection.
  - Fully responsive, accessible, and lightweight under 2GB RAM budget.
