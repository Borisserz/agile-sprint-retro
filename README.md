# agile-sprint-retro

Backend for planning sprints and retrospectives in Agile teams.

Practical 1 (ITIVP): EJS + middleware. Branch `pz21` (from `lab23`).

## Stack

- Node.js / Express
- PostgreSQL / Sequelize (Labs 2–3 API)
- bcrypt / jsonwebtoken (Lab 3)
- EJS SSR (ПЗ1) — in-memory list, separate from DB

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

Seed users (password `Password1!`):

- `member@agile.local` — role `member`
- `facilitator@agile.local` — role `facilitator`

## Practical 1 — EJS pages

In-memory sprints (no DB for the HTML pages). Auth imitation: add `?auth=1` or open `/login`.

| URL | Page |
|-----|------|
| http://localhost:3000/?auth=1 | list (`index.ejs`) |
| http://localhost:3000/item/1?auth=1 | detail (`item.ejs`) |
| http://localhost:3000/add?auth=1 | add form (`add.ejs`) |
| http://localhost:3000/login | login hint |
| http://localhost:3000/no-such-page | `404.ejs` |

Code marked with `// ПЗ1:` / `<%# ПЗ1: %>` — logger, auth imitation, views, in-memory data.

## Auth routes (Lab 3)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | no | Register (role member) |
| POST | /auth/login | no | Login, returns JWT (1h) |
| POST | /auth/change-password | Bearer | Change password |
| GET | /profile | Bearer | Current user |

## Sprint routes (Labs 1–3)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /sprints | no | List |
| QUERY | /sprints | no | Search |
| GET | /sprints/:id | no | By id |
| POST | /sprints | no | Create |
| PUT | /sprints/:id | no | Update |
| DELETE | /sprints/:id | Bearer + facilitator | Delete |

Header: `Authorization: Bearer <token>`

JWT payload: `{ id, email, role }`.
