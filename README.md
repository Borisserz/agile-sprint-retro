# agile-sprint-retro

Backend for planning sprints and retrospectives in Agile teams.

Lab 3 (ITIVP): JWT auth, bcrypt, RBAC, change-password. Branch `lab23`.

## Stack

- Node.js / Express
- PostgreSQL / Sequelize
- bcrypt / jsonwebtoken
- Docker (local database)

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

## Auth routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | no | Register (role member) |
| POST | /auth/login | no | Login, returns JWT (1h) |
| POST | /auth/change-password | Bearer | Change password |
| GET | /profile | Bearer | Current user |

## Sprint routes

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
