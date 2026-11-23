# agile-sprint-retro

Service for planning sprints and retrospectives in Agile teams.

Coursework product on branch `kp`: Labs 1–8 + ПЗ3/ПЗ4 patterns (Router, AuthContext), dual-store from Lab 7, Docker from Lab 8. No CI/cloud deploy in this baseline.

## Product routes

| Path | Access |
|------|--------|
| `/login`, `/register` | guest |
| `/sprints` | JWT — board, PG\|Mongo toggle, action items |
| `/sprints/:id/retro?store=pg\|mongo` | JWT — live Socket.IO retro |
| `*` | 404 |

Shell: sticky navbar + footer on every page.

## Layout

- Backend: Express + JWT + Sequelize (PostgreSQL) + Mongoose (MongoDB) + Socket.IO
- Frontend: Vite React + react-router-dom + AuthContext
- Docker Compose: `backend`, `frontend` (nginx), `db`, `mongo`

## Docker — full stack

```bash
cp .env.example .env
# set JWT_SECRET (≥32 chars recommended)
docker compose up --build
```

| URL | What |
|-----|------|
| http://localhost | React UI |
| http://localhost:3000/health | API health |
| http://localhost:3000 | REST + Socket.IO |

## Local backend

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

## Local frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

1. Sign in (or register).
2. Switch **PostgreSQL | MongoDB** on the board.
3. Manage action items on a sprint card.
4. Open retro — chat, cards, votes sync live.

## Tests

```bash
npm test
```

## Stack (curriculum)

Express · PostgreSQL/Sequelize · JWT/bcrypt · React · Axios · MongoDB · Socket.IO · Docker · React Router · Context API · adaptive CSS.
