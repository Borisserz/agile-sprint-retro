# Lab 5 — React ↔ REST API (sprints)

Date: 2026-09-10  
Branch: `lab25` (from `lab24`)  
Theme: Agile sprint / retrospective planning service

## Goal

Wire the Lab 4 React client to the Lab 1–3 Express + PostgreSQL + JWT API with real HTTP CRUD, loading/error states, optimistic updates, and one extra: server search/filter with debounce.

## Decisions

- Auth UI: compact login; store JWT in `localStorage` under `token`; logout clears it.
- Delete requires facilitator JWT (seed `facilitator@agile.local` / `Password1!`).
- Extra: `QUERY /sprints` with `{ search?, status? }` + debounce ~400 ms (not pagination).
- `VITE_API_URL=http://localhost:3000` (routes are `/sprints`, `/auth` — no `/api` prefix).
- Drop sprint list persistence via `useLocalStorage`; keep localStorage only for token.
- Form fields: name, goal, status, capacity, startDate, endDate (API-required dates).
- Server: add `cors` middleware only (no API contract changes).

## Client modules

| File | Role |
|------|------|
| `client/src/api.js` | axios instance, Bearer interceptor, sprint + auth helpers |
| `client/src/components/LoginForm.jsx` | login → token |
| `client/src/components/SprintList.jsx` | list CRUD optimistic + QUERY debounce + loading/error |
| `client/.env` / `.env.example` | `VITE_API_URL` |

## Optimistic flows

- **POST:** insert temp row → POST → replace with server entity; on error remove temp + toast/message.
- **PUT:** patch local → PUT; on error restore snapshot.
- **DELETE:** remove local → DELETE; on error reinsert snapshot.
- **GET / QUERY:** set loading; on fail set error + Retry (no optimistic).

## Out of scope

Report PDF, control questions, pagination, FormData, Context/Redux.
