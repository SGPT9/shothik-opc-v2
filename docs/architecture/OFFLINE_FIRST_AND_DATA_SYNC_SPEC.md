# 📶 Offline-First Architecture & CRDT Data Sync Specification

> **Target Network**: 2G/3G/4G Flaky Connections & 100% Offline Rural Sessions  
> **Storage Engine**: Client-Side IndexedDB / SQLite with Yjs CRDT Synchronization  

---

## 1. Multi-Tier Offline Storage Topology

```
┌────────────────────────────────────────────────────────┐
│               Client Device (Browser / Android)        │
│                                                        │
│  ┌────────────────────────┐  ┌──────────────────────┐  │
│  │   UI Reactive State    │  │  Local IndexedDB /   │  │
│  │ (React Zustand Stores) │◄─┤  SQLite Local Cache  │  │
│  └───────────┬────────────┘  └──────────┬───────────┘  │
└──────────────┼──────────────────────────┼──────────────┘
               │ (Local Writes: 0ms)      │
               ▼                          ▼
┌────────────────────────────────────────────────────────┐
│             Conflict-Free Replicated Data Type (CRDT)  │
│                    Yjs State Delta Stream              │
└──────────────────────────────┬─────────────────────────┘
                               │ (Network Resumes)
                               ▼
┌────────────────────────────────────────────────────────┐
│           InsForge PostgreSQL + WebSocket Realtime     │
└────────────────────────────────────────────────────────┘
```

---

## 2. Sync Invariants & Conflict Resolution

1. **Local Writes Always Succeed (0ms Latency)**:
   - When an author edits a book chapter in the **Writing Studio** or a merchant records an order while offline, changes write instantly to local IndexedDB.
2. **Deterministic Merge via Yjs CRDT**:
   - Simultaneous edits across phone and laptop resolve deterministically using Lamport timestamps without data loss.
3. **Offline USSD Queue**:
   - Payment requests created while offline are queued locally and execute automatically when a cellular signal is re-acquired.
