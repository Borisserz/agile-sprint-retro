# Lab 8 — Docker containerization (design)

**Branch:** `28`  
**Date:** 2026-09-10  
**Approved:** Compose layout **A** (backend + frontend nginx + postgres + mongo); extras **1** (`.env` + `GET /health` + healthcheck)

## Goal

`docker compose up --build` runs the full agile-sprint-retro stack: API, React static UI, PostgreSQL, MongoDB.

## Architecture

| Service | Image / build | Host ports | Notes |
|---------|---------------|------------|--------|
| `backend` | root `Dockerfile` | `3000:3000` | Node Express + Socket.IO |
| `frontend` | `client/Dockerfile` multi-stage → nginx | `80:80` | Vite `dist` |
| `db` | `postgres:16-alpine` | `5433:5432` | volume `pgdata` |
| `mongo` | `mongo:7` | `27017:27017` | volume `mongodata` |

Internal URLs (compose network):
- `DATABASE_URL=postgres://postgres:postgres@db:5432/agile_sprint_retro`
- `MONGO_URI=mongodb://mongo:27017/agile_sprint_retro`
- Frontend build arg `VITE_API_URL=http://localhost:3000` (browser → host-mapped API)

## Extras

1. `.env` / `.env.example` for compose + secrets  
2. `GET /health` → `{ ok: true }`  
3. Backend `healthcheck` in compose; `depends_on` db/mongo

## Non-goals

- Nginx reverse-proxy for API/WebSocket  
- pgAdmin / mongo-express  
- Redis  
- Control questions in report (standing rule)

## Belarus images

Prefer default Hub pulls; if blocked, document `mirror.gcr.io` / Timeweb in README and report.

## Success

- `docker compose up --build` healthy  
- Browser: `http://localhost` (UI), `http://localhost:3000/health`  
- `docker ps` shows 4 containers  
- README updated; pushed on branch `28`
