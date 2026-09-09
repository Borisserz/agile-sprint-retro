# agile-sprint-retro

Backend for planning sprints and retrospectives in Agile teams.

Lab 2 (ITIVP): PostgreSQL + Sequelize ORM. Branch `lab12`.

## Stack

- Node.js
- Express
- PostgreSQL
- Sequelize
- Docker (local database)

## Database

Local Postgres via Docker (port 5433 on host):

```bash
npm run db:up
cp .env.example .env
npm run db:migrate
npm run db:seed
```

Cloud alternative from the course: Neon or Supabase.
Put the connection string into `.env` as `DATABASE_URL`.
For Neon/Supabase also set `DATABASE_SSL=true`.

## Run

```bash
npm install
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

Server: `http://localhost:3000`

## Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | /sprints | List sprints (with action items) |
| QUERY | /sprints | Filter by search and/or status |
| GET | /sprints/:id | Get sprint by id |
| POST | /sprints | Create sprint |
| PUT | /sprints/:id | Replace sprint |
| DELETE | /sprints/:id | Delete sprint |

### Sprint body

```json
{
  "name": "Sprint 3",
  "goal": "Auth flow",
  "startDate": "2026-09-24T00:00:00.000Z",
  "endDate": "2026-10-07T00:00:00.000Z",
  "status": "planned",
  "capacity": 35
}
```

`capacity` was added by migration `add-capacity-to-sprints`.

### Models

- `Sprint` has many `ActionItem`
- `ActionItem` belongs to `Sprint`
