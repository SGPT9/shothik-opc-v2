# Docker deployment

## 1. This project (frontend + API gateway)

From the repo root, on Docker Desktop or the Hostinger VPS:

```sh
docker compose up --build
```

- App: http://localhost:3000 (or http://187.127.125.115:3000 on the VPS)
- `web` = Vite build of the Shothik frontend served by nginx; `/api/*` is proxied to
- `api` = the Express gateway, which forwards to the live backend (`CHAT_API_ORIGIN`, default https://www.shothikgpt.com)

Override env in a `.env` file next to `docker-compose.yml`:

```
CHAT_API_ORIGIN=https://www.shothikgpt.com
VITE_CONVEX_URL=https://dashing-mandrill-233.convex.cloud
```

## 2. Hermes engine (shothik-web Next.js repo)

Copy `deploy/hermes/Dockerfile` and `deploy/hermes/docker-compose.yml` into the root of the
`shothik-web` repo (Dockerfile at repo root, or fix the `dockerfile:` path). Create a `.env`
with at least `JWT_PRIVATE_KEY` (the key generated for Convex auth) and any model API keys,
then `docker compose up --build`.

On the Hostinger VPS, Hermes can use the services already running there:
- DeerFlow research backend → `http://host.docker.internal:8000`
- Ollama → `http://host.docker.internal:11434`

## VPS inventory (as of Aug 5, 2026)

- `deerflow-backend` on :8000, `ollama/ollama` on :11434, Hostinger's `hvps-hermes-agent`
  (VPS management, not Shothik's Hermes) on :32768. ~62 GB disk free, 8 GB RAM.
