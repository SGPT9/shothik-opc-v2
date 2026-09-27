# Slice 74: RedX & Paperfly Live Courier API Connectors with Multi-Carrier Fallback

## 1. Problem Statement & Context
Bangladeshi solopreneurs and D2C merchants depend heavily on Cash-on-Delivery (COD) logistics. Single-carrier reliance exposes merchants to operational bottlenecks when a courier's hub experiences peak delays or API downtime. While Steadfast and Pathao cover urban hubs, RedX and Paperfly provide critical coverage across 64 districts and remote upazilas.

## 2. Success Criteria & Core Capabilities
1. **RedX Client (`redx-client.ts`)**:
   - Authentication via Bearer tokens (`REDX_API_TOKEN`).
   - Standardized payload conversion (`customer_name`, `customer_phone`, `delivery_area`, `cash_collection_amount`, `weight`).
   - Tracking lookup & simulated fallback mode for local testing.
2. **Paperfly Client (`paperfly-client.ts`)**:
   - Authentication via API Key + Username (`PAPERFLY_API_KEY`, `PAPERFLY_USERNAME`, `PAPERFLY_PASSWORD`).
   - Standardized order registration (`merOrderRef`, `customerName`, `customerPhone`, `customerAddress`, `max_weight`, `price`).
   - Tracking code generation (`PAP_...`) and webhook receipt parsing.
3. **Unified Auto-Fallback Dispatcher (`courier-arbitrage-engine.ts`)**:
   - Dynamic carrier selection based on district DSR %, cost, and API health.
   - Transparent cascade fallback: if preferred carrier returns 4xx/5xx or timeout, immediately failover to next best carrier and log audit trail.
4. **Zero-Error Tests**:
   - Comprehensive unit test suite covering auth, parcel creation, tracking, and fallback failover.
