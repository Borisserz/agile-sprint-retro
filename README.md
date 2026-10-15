# agile-sprint-retro

Backend for planning sprints and retrospectives in Agile teams.

Practical 1 (ITIVP): EJS + middleware. Branch `pz21` (from `lab23`). Variant 49 (odd): request log to file.

## Stack

- Node.js / Express
- PostgreSQL / Sequelize (Labs 2–3 API)
- bcrypt / jsonwebtoken (Lab 3)
- EJS SSR (ПЗ1) — in-memory list; constraints in `config/pz1Constraints.json`
- Request log file: `logs/pz1-requests.log` (created automatically)

## Setup

```bash
npm install
npm run db:up
cp .env.example .env
# set JWT_SECRET in .env
npm run db:migrate
npm run db:seed
npm run dev
```

Server: `http://localhost:3000`

## Practical 1 — EJS pages

| URL | Page |
|-----|------|
| http://localhost:3000/?auth=1 | list |
| http://localhost:3000/item/1?auth=1 | detail |
| http://localhost:3000/add?auth=1 | add form |
| http://localhost:3000/demo-500?auth=1 | `500.ejs` demo |
| http://localhost:3000/no-such-page | `404.ejs` |
| http://localhost:3000/login | login hint |

Form checks (server + `config/pz1Constraints.json`): non-empty fields, string length limits, capacity ≥ 0. Each sprint has unique `createdAt`.

## Auth / sprint API (Labs 1–3)

See Lab 3 README routes: `/auth/*`, `/profile`, `/sprints`.
