# agile-sprint-retro

Service for planning sprints and retrospectives in Agile teams.

## Coursework product

Branch `kp` develops the coursework product from Lab 8 (`origin/28`, commit `0e72ea5`).

Current status: product code ready for local/Compose run and CI. Public cloud URLs are recorded here only after successful smoke testing.

Lab 8 (ITIVP): Docker Compose full stack. Historical lab tip: branch `28`.

### Product routes

- `/login`, `/register` — public
- `/sprints`, `/sprints/:id/retro` — JWT via `AuthContext` + `PrivateRoute`
- unknown paths → 404

### Quality checks

```bash
npm run check
```

## Layout

- Backend (Labs 1–3, 6–8): project root (`http://localhost:3000`)
- Frontend (Labs 4–5, 7–8): `client/` — Vite; in Docker served by nginx on `http://localhost`
- PostgreSQL + MongoDB via Compose
- WebSocket: Socket.IO on the backend HTTP server (JWT)


## Persistence model

- PostgreSQL: users, sprints, and action items.
- MongoDB: comparison sprint documents, retro chat messages, retro cards, and voter identifiers.
- Socket.IO presence and typing indicators are intentionally transient.

## Docker (Lab 8) — recommended

```bash
cp .env.example .env
# set JWT_SECRET in .env
docker compose up --build
```

| URL | What |
|-----|------|
| http://localhost | React UI (nginx) |
| http://localhost:3000/health | backend health |
| http://localhost:3000 | REST + Socket.IO |

Containers: `backend`, `frontend`, `db`, `mongo`.

Extras: `.env` for secrets/URLs; `GET /health` + Compose healthchecks (`depends_on: service_healthy`).

Images use `node:20-alpine` (Vite 8 needs Node ≥20; methodical sample used 18).

Stop:

```bash
docker compose down
```

## Local backend (without app containers)

```bash
npm install
docker compose up -d db mongo
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

Seed users (password `Password1!`):

- `facilitator@agile.local`
- `member@agile.local`

## Frontend (Vite, local)

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

## Socket.IO retro (Lab 7)

Base: same origin as API (`VITE_API_URL`). Room: `retro:{sprintId}`.

## Compare PG vs Mongo

- PostgreSQL: tables `Sprints` + `ActionItems`
- MongoDB sprints: embedded `actionItems[]`
- MongoDB retro: `retro_messages` for Socket.IO chat history; `retro_cards` for board cards/votes

## Cloud deploy (coursework)

Prepared configs: `render.yaml` (API + managed Postgres), `netlify.toml` (SPA), Atlas for MongoDB.

1. Create MongoDB Atlas cluster; copy `MONGO_URI`.
2. Deploy Render Blueprint from branch `kp`; set secrets `MONGO_URI` and `CORS_ORIGINS` (final Netlify origin).
3. Create Netlify site from this repo / branch `kp`; set `VITE_API_URL` to the Render API URL.
4. Redeploy backend if the Netlify origin changes.
5. Smoke-test: `/health`, register/login, sprint CRUD, action items, live retro.

Live URLs: not recorded yet — deployment requires Render / Atlas / Netlify account credentials.
