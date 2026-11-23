# agile-sprint-retro

Service for planning sprints and retrospectives in Agile teams.

Coursework product on branch `kp`: Labs 1–8 (both semesters) + ПЗ3/ПЗ4 (Router, AuthContext), dual-store board, Docker, Helmet/CORS, cloud deploy (Render + Netlify + Atlas).

## Product routes

| Path | Access |
|------|--------|
| `/` | guest landing (About / FAQ / CTA + Schema.org) |
| `/login`, `/register` | guest |
| `/sprints` | JWT — board, PG\|Mongo, favorites, tips API, details modal |
| `/sprints/:id/retro?store=pg\|mongo` | JWT — live Socket.IO retro |
| `*` | 404 |

Shell: sticky navbar + footer. Part 1 patterns: semantic landmarks, BEM, `localStorage` favorites/health, autocomplete, Advice Slip tip cache.

## Layout

- Backend: Express + Helmet + JWT + Sequelize (PostgreSQL) + Mongoose (MongoDB) + Socket.IO
- Frontend: Vite React + react-router-dom + AuthContext
- Docker Compose: `backend`, `frontend` (nginx), `db`, `mongo`
- Cloud: Render (API + Postgres), MongoDB Atlas, Netlify (SPA)

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

## Quality checks

```bash
npm run check
```

Runs server `node:test` suite, client Vitest, oxlint, and production Vite build.

## Cloud deploy

1. Push branch `kp`.
2. Deploy Render Blueprint from `render.yaml`; set secrets `MONGO_URI` and `CORS_ORIGINS` (final Netlify origin).
3. Create/link Netlify site (`netlify.toml`); set `VITE_API_URL` to the Render API URL.
4. Redeploy backend if the Netlify origin changes.

Live (product):

- Frontend: https://agile-sprint-retro.netlify.app
- API: https://agile-sprint-retro-api.onrender.com
- Health: https://agile-sprint-retro-api.onrender.com/health

## Stack (curriculum)

Express · Helmet · CORS · PostgreSQL/Sequelize · JWT/bcrypt · React · Axios · MongoDB · Socket.IO · Docker · React Router · Context API · adaptive CSS / BEM · Schema.org · localStorage · external API + cache.
