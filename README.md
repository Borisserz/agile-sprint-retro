# agile-sprint-retro

Service for planning sprints and retrospectives in Agile teams.

Lab 5 (ITIVP): React client ↔ Express REST API (JWT). Branch `lab25`.

## Layout

- Backend (Labs 1–3): project root (`npm run dev` → `http://localhost:3000`)
- Frontend (Labs 4–5): `client/` (Vite React → usually `http://localhost:5173`)

## Backend

```bash
npm install
npm run db:up
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

Seed users (password `Password1!`):

- `facilitator@agile.local` — can `DELETE /sprints/:id`
- `member@agile.local` — JWT only; delete returns 403

## Frontend

```bash
cd client
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:3000
npm run dev
```

Features (Lab 5):

- Login → JWT in `localStorage` (`token`), axios Bearer interceptor
- Sprint CRUD via API with optimistic updates + rollback
- Loading / error + Retry
- Extra: server `QUERY /sprints` search + status filter with debounce (~400 ms)
- CORS enabled on Express

## API base

`VITE_API_URL` points at the server origin (no `/api` prefix). Paths: `/auth/login`, `/sprints`.
