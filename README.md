# agile-sprint-retro

Service for planning sprints and retrospectives in Agile teams.

Coursework baseline (`kp`): Labs 1–8 combined — full product features from Lab 7 plus Docker Compose from Lab 8.

## Layout

- Backend (Labs 1–3, 6–7): project root (`npm run dev` → `http://localhost:3000`)
- Frontend (Labs 4–5, 7): `client/` (Vite React → usually `http://localhost:5173`; in Docker — nginx on `http://localhost`)
- PostgreSQL: Sequelize routes `/sprints`, `/auth`
- MongoDB: Mongoose `/mongo/sprints` + retro chat history (`retro_messages`)
- WebSocket: Socket.IO on the same HTTP server (JWT required)
- Docker (Lab 8): Compose stack `backend` + `frontend` + `db` + `mongo`

## Docker (Lab 8) — recommended full stack

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

Images use `node:20-alpine` (Vite 8 needs Node ≥20).

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

### Socket.IO retro (Lab 7)

Connect with `socket.io-client` and `auth: { token: <JWT from /auth/login> }`.

Room: `retro:{sprintId}`

| Event | Direction | Notes |
|-------|-----------|--------|
| `retro:join` | client → server | `{ sprintId }` → ack with users, cards, history |
| `retro:leave` | client → server | leave room |
| `retro:message` | both | chat text; persisted in Mongo |
| `retro:typing` | both | `{ isTyping }` |
| `retro:vote` | client → server | `{ cardId }` toggles your vote |
| `retro:votes` | server → room | updated card tallies |
| `retro:presence` | server → room | who is in the room |
| `user:joined` / `user:left` | server → room | join/leave notices |

## Frontend (Vite, local)

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

1. Sign in (two browsers or two profiles: facilitator + member).
2. Optionally switch **PostgreSQL | MongoDB** on the board (Lab 6 dual store: `/sprints` vs `/mongo/sprints`). Auth stays on PostgreSQL.
3. Open the same sprint → **Open retro**.
4. Chat, watch presence/typing, click vote buttons — tallies sync live.

## Tests

```bash
npm test
```

## Compare PG vs Mongo

- PostgreSQL: tables `Sprints` + `ActionItems` (FK); search via HTTP `QUERY`
- MongoDB sprints: one document with embedded `actionItems[]`; board filters locally
- MongoDB retro: `retro_messages` collection for Socket.IO chat history
