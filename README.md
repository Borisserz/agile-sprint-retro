# agile-sprint-retro

Backend for a service that helps Agile teams plan sprints and retrospectives.

Lab 1 (ITIVP): REST API on Node.js and Express. Data is stored in memory.

## Stack

- Node.js
- Express
- nodemon (dev)

## Run

```bash
npm install
npm run dev
```

Server: `http://localhost:3000`

## Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | /sprints | List all sprints |
| GET | /sprints/:id | Get sprint by id |
| POST | /sprints | Create sprint |
| PUT | /sprints/:id | Replace sprint |
| DELETE | /sprints/:id | Delete sprint |

### Sprint body

```json
{
  "name": "Sprint 1",
  "goal": "Ship backlog board",
  "startDate": "2026-09-01T00:00:00.000Z",
  "endDate": "2026-09-14T00:00:00.000Z",
  "status": "planned"
}
```

`status`: `planned` | `active` | `done`

Dates are parsed with JavaScript `Date`.

### Example

```bash
curl -X POST http://localhost:3000/sprints \
  -H "Content-Type: application/json" \
  -d '{"name":"Sprint 1","goal":"API skeleton","startDate":"2026-09-01","endDate":"2026-09-14","status":"planned"}'
```
