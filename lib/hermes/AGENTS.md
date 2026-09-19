# lib/hermes/AGENTS.md
# Shothik Hermes Asynchronous Message Bus & Agent Dispatcher

This document specifies the messaging patterns, queue listeners, and telemetry channels for `@workspace/hermes`.

---

## 1. Stack & Architecture
- **Engine:** Redis Streams / in-memory event emitter with fallback persistence
- **Payload Protocol:** JSON event envelopes with unique `eventId`, `timestamp`, and `tenantId`
- **Consumer Pattern:** At-least-once delivery with exponential backoff and dead-letter queue (DLQ)

---

## 2. Key Conventions
- All financial, tax invoice, and courier events must be published with an `idempotencyKey`.
- Handlers must reject duplicate event IDs gracefully.
