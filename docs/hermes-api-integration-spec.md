# Hermes / Chat API Integration Spec

Source: analysis of `github.com/ahsanhab919-ux/shothik-web` (fork of the upstream shothik-web Next.js app), Aug 2026. This is the backend our gateway proxy (`artifacts/api-server/src/routes/proxy.ts`) forwards `/api/*` to (default origin `https://shothik.work`, overridable via `CHAT_API_ORIGIN`).

## Auth

- Most routes require a Clerk session: `Authorization: Bearer <clerk_token>`.
- Chat routes allow guest access via `x-chat-device-id` header (value prefixed `guest-`).
- `Content-Type: application/json`; `Accept: text/event-stream` for GET run streams.
- Engine requires Redis server-side for event sequencing (degrades to local sequencing when down).

## Endpoints

| Method | Path | Request body | Purpose / response |
| --- | --- | --- | --- |
| POST | `/api/chat` | `{ messages, conversationId?, surface?, modelHandle?, attachments?, sync?, privacy? }` | Main chat gateway; returns SSE stream |
| POST | `/api/hermes/runs` | `{ workspaceId, domain, sessionId?, config?, metadata? }` | Create run; returns `{ run, streamUrl }` |
| GET | `/api/hermes/runs/[runId]` | (SSE) | Connect to a run's event stream |
| POST | `/api/hermes/runs/[runId]` | `{ action: "pause" \| "resume" \| "cancel" }` | Control a run |
| POST | `/api/hermes/sessions` | `{ workspaceId, title, description?, settings? }` | Create session |
| GET | `/api/hermes/sessions/[sessionId]` | — | Session context (workspace, status, prior runs) |
| GET | `/api/chat/conversations` | `?surface=&limit=&query=` | List chat history |
| GET | `/api/chat/conversations/[id]/messages` | `?limit=` | Fetch messages |

## SSE event contract

Canonical Hermes events are wrapped in an envelope with `__hermes: true`:

```json
{
  "__hermes": true,
  "eventId": "uuid",
  "runId": "run_...",
  "sessionId": "session_...",
  "workspaceId": "ws_...",
  "domain": "chat|slides|research|...",
  "eventType": "...",
  "timestamp": "ISO8601",
  "sequence": 0,
  "payload": {},
  "metadata": { "source": "chat-orchestrator" }
}
```

Event types (payload highlights):
- `session_created` — `{ status, title }`
- `run_started` — `{ startedAt }`
- `plan_generated` — `{ intent, steps }`
- `progress_update` — `{ message, percentage?, step? }`
- `document_ingestion_started` — `{ sourceName, sourceId }`
- `document_ingestion_completed` — `{ status: "success"|"failed", artifactId? }`
- `artifact_ready` — `{ artifactId, domain, version }`
- `run_completed` — `{ completedAt, result? }`
- `run_failed` — `{ error, details }`

Legacy chat events (what our UI's `normalizeStreamEvent` also handles):
- `type: "conversation"` — conversation metadata (`conversationId`)
- `type: "message_start"` — assistant message id
- `type: "chunk"` — `{ content }` streamed text
- `type: "error"` — error payload
- `type: "done"` — end of stream

## Persistence

- Conversations persist server-side (Postgres/Convex); each chat conversation auto-syncs to a `hermes_session`.
- History fetched from `/api/chat/conversations/[id]/messages`.
- "Resume mode" (`resume_session` / `resume_run`) grounds new turns on prior session context.

## Implementation Status (Phase 1 Complete)

- **Backend Gateway APIs**: `/api/hermes/sessions` (POST, GET) and `/api/hermes/runs` (POST, GET SSE stream, POST control actions) implemented in `app/api/hermes/`.
- **Contracts**: Canonical `__hermes: true` envelope schema, session schemas, run schemas, and run control schemas implemented in `lib/hermes/contracts/core.ts`.
- **Thin Frontend Adapter**: `HermesClientAdapter` (`lib/hermes/client/adapter.ts`), React hooks (`lib/hermes/client/useHermes.ts`), and `HermesExecutionPanel` component (`components/hermes/HermesExecutionPanel.tsx`) implemented and verified.

