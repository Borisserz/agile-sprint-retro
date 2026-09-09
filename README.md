# agile-sprint-retro

Service for planning sprints and retrospectives in Agile teams.

Lab 4 (ITIVP): React state (`useState` / `useEffect`) + `localStorage`. Branch `lab24`.

## Layout

- Backend (Labs 1–3): project root (`npm run dev` → `:3000`)
- Frontend (Lab 4): `client/` (Vite React)

## Frontend (Lab 4)

```bash
cd client
npm install
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`).

Features:

- Sprint list CRUD (add / edit / delete)
- Filter by status
- `useLocalStorage` with debounce 500 ms + cleanup
- Fake 1 s loading on mount
- `document.title` shows sprint count
- Stats: total / planned / active / done

Data key in `localStorage`: `agile-sprints`.

## Backend (Labs 1–3)

```bash
npm install
npm run db:up
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

Server: `http://localhost:3000`
