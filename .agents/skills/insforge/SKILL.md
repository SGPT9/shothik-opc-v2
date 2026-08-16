---
name: insforge
description: Core InsForge TypeScript SDK integration guide for database CRUD, auth, storage, edge functions, and RAG memory.
globs: "*.*"
---

# InsForge SDK Integration Skill

InsForge is an all-in-one Postgres-based BaaS platform providing database CRUD, user authentication, RAG vector memory, file storage, edge functions, and AI gateway.

## Core Rules:
1. **Client Creation**:
   ```typescript
   import { createClient } from '@insforge/sdk';

   export const client = createClient({
     baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://ers8j28a.ap-southeast.insforge.app',
     anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'anon_09a9f554a6d1ef3abb1eb3691c0224e22c30b4bfe25809c6222a8301bfa80f7b'
   });
   ```

2. **Database Operations**:
   - Inserts require array payloads: `.insert([{ ... }])`.
   - Always wrap `auth.uid()` in `(SELECT auth.uid())` subqueries in RLS policies.

3. **Storage & RAG Vector Memory**:
   - Store RAG embeddings in `twin_knowledge_vectors`.
   - Store file upload URLs directly in Postgres records.

## 🧠 AI Twin RAG Memory & 3-Tier Caching Invariants

### 1. Vector Database Ingestion (pgvector)
- Always use `InsForgeTwinRagMemory.saveMemoryChunk()` to index knowledge chunks into `twin_knowledge_vectors`.
- Ensure chunks specify valid `contentType` (e.g. `research_paper`, `tonight_run`, `tool_registry`) and workspace `twinId`.

### 2. 3-Tier Caching Flow
- **Tier 1 (Client Mobile PWA)**: Service Worker stale-while-revalidate (48MB memory limit) for 2GB RAM phones.
- **Tier 2 (Server Semantic Cache)**: In-memory hash matching returning sub-5ms query responses.
- **Tier 3 (Database Query Cache)**: InsForge PostgreSQL cache targeting >99% hit rate for RLS policy verification.

