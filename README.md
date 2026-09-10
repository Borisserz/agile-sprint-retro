# agile-sprint-retro

Service for planning sprints and retrospectives in Agile teams.

Lab 7 (ITIVP): Socket.IO live retro rooms. Branch `27`.

## Layout

- Backend (Labs 1–3, 6–7): project root (`npm run dev` → `http://localhost:3000`)
- Frontend (Labs 4–5, 7): `client/` (Vite React → usually `http://localhost:5173`)
- PostgreSQL: Sequelize routes `/sprints`, `/auth`
- MongoDB: Mongoose `/mongo/sprints` + retro chat history (`retro_messages`)
- WebSocket: Socket.IO on the same HTTP server (JWT required)

## Backend

```bash
npm install
npm run db:up
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

`db:up` starts PostgreSQL (`:5433`) and MongoDB (`:27017`).

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

## Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

1. Sign in (two browsers or two profiles: facilitator + member).
2. Open the same sprint → **Open retro**.
3. Chat, watch presence/typing, click vote buttons — tallies sync live.

## Tests

```bash
npm test
```

## Compare PG vs Mongo

- PostgreSQL: tables `Sprints` + `ActionItems` (FK)
- MongoDB sprints: one document with embedded `actionItems[]`
- MongoDB retro: `retro_messages` collection for Socket.IO chat history
