# agile-sprint-retro

Service for planning sprints and retrospectives in Agile teams.

Lab 6 (ITIVP): MongoDB + Mongoose parallel API. Branch `lab26`.

## Layout

- Backend (Labs 1–3, 6): project root (`npm run dev` → `http://localhost:3000`)
- Frontend (Labs 4–5): `client/` (Vite React → usually `http://localhost:5173`)
- PostgreSQL: Sequelize routes `/sprints`, `/auth`
- MongoDB: Mongoose routes `/mongo/sprints` (nested `actionItems`, `tags`)

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

Seed users for PG API (password `Password1!`):

- `facilitator@agile.local` — can `DELETE /sprints/:id`
- `member@agile.local` — JWT only; delete returns 403

### Mongo API (Lab 6)

Base: `http://localhost:3000/mongo/sprints`

| Method | Path | Notes |
|--------|------|--------|
| GET | `/mongo/sprints` | list documents |
| GET | `/mongo/sprints/:id` | by ObjectId |
| POST | `/mongo/sprints` | create (optional `tags`, `actionItems`) |
| PUT | `/mongo/sprints/:id` | update fields / nested arrays |
| DELETE | `/mongo/sprints/:id` | delete, returns document |
| POST | `/mongo/sprints/:id/action-items` | `$push` nested item |
| PATCH | `/mongo/sprints/:id/action-items/:itemId` | update one subdocument |
| DELETE | `/mongo/sprints/:id/action-items/:itemId` | `$pull` nested item |

Example create body:

```json
{
  "name": "Sprint Mongo",
  "goal": "Document store for action items",
  "startDate": "2026-09-10",
  "endDate": "2026-09-24",
  "status": "planned",
  "capacity": 40,
  "tags": ["retro", "mongo"],
  "actionItems": []
}
```

`MONGO_URI` defaults to local Docker. For Atlas, put the cluster connection string in `.env`.

## Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Lab 5 client still uses PostgreSQL `/sprints` (not `/mongo`).

## Compare PG vs Mongo

- PostgreSQL: tables `Sprints` + `ActionItems` (FK), Sequelize `include`
- MongoDB: one document with embedded `actionItems[]` — no JOIN
