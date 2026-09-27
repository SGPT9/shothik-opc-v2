# Spec 0070: Nagad Sheba Direct PGW Tokenized Checkout & MFS Clearing Engine

## 1. Overview
Direct Nagad PGW client supporting payment session initialization, callback URL redirection, transaction verification, and SHA-256 cryptographic state seals.

## 2. Acceptance Criteria
- **AC-1**: Initialize Nagad tokenized checkout sessions with orderId, amountBDT, and customerPhone.
- **AC-2**: Verify payment callback tokens with transaction ID generation and verification seals.
- **AC-3**: Support zero-downtime offline mock fallback during test runs.

## 3. Implementation
- Engine: `artifacts/api-server/src/lib/mfs/nagad-pgw-client.ts`
- Routes: `artifacts/api-server/src/routes/mfs.ts`
- Tests: `artifacts/api-server/src/routes/__tests__/nagad-pgw.test.ts`
