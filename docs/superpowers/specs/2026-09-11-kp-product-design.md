# KP Product — Coursework Design

**Branch:** `kp` (from `origin/28`, commit `0e72ea5`)  
**Date:** 2026-09-11  
**Scope:** Code only — no explanatory note (пояснительная записка)

## Goal

Deliver the СЭО coursework product **«Сервис для планирования спринтов и ретроспектив в Agile-командах»**: a secure, routed React app backed by Express with PostgreSQL and MongoDB, automated tests, CI, and deployment-ready configuration.

## Base branch

Create `kp` directly from `origin/28` (`0e72ea5`). Never tip from `pz23` or `pz24`. Cherry-pick routing/context patterns from those branches only; do not replace the product `App.jsx` with the catalog demo.

## Three modules (СЭО requirement)

| Module | Stack | Responsibility |
|--------|-------|----------------|
| **Authentication** | JWT, bcrypt, RBAC | Register, login, profile, change password; `AuthContext` + `PrivateRoute` |
| **Sprints + action items** | PostgreSQL / Sequelize | Sprint CRUD, nested action-item CRUD, visible in sprint UI |
| **Live retrospective** | Socket.IO + MongoDB | Real-time board, chat, persisted cards/votes, presence/typing transient |

Supporting entities: `User`, `Sprint`, `ActionItem`, `MongoSprint`, `RetroMessage`, `RetroCard`.

## Approach

1. **Harden** — Helmet, CORS allowlist, JWT config, protect mutating routes, facilitator-only deletes.
2. **Router** — React Router product routes (`/login`, `/register`, `/sprints`, `/sprints/:id/retro`, 404) with real JWT session via `AuthContext`.
3. **Persist retro cards** — Move cards/votes from in-memory `roomState` to MongoDB `RetroCard`; keep chat in `RetroMessage`.
4. **Polish** — Surgical CSS pass on existing cobalt daylight design language.
5. **CI** — Supertest API coverage, keep socket tests green, GitHub Actions on `kp`.
6. **Deploy prep** — `render.yaml`, `netlify.toml`, `.env.example`, documented Render + Atlas + Netlify steps; record URLs only after smoke tests.

Each step: failing test → implement → verify → focused commit.

## Visual direction

**Cobalt daylight** — keep existing tokens and typography from Lab 8 product UI.

- Cobalt as sole dominant accent on white/light surfaces
- Solid buttons, restrained hover; no gradient glow
- List rows for action items; column headings for retro board
- Accessible focus, labels, reduced-motion support

**Forbidden:** purple AI-slop gradients, cream/serif terracotta, emoji chrome, glassmorphism, excessive nested cards, glow-heavy controls.

## Out of scope

- Пояснительная записка (structure 120 informs code expectations only)
- Teams, Trello, invitations, refresh tokens, admin dashboards
- Merging or basing on `pz23` / `pz24` branches
- Fabricated deployment URLs, screenshots, or test results

## Success criteria

- `kp` descends from `0e72ea5`; no `pz23`/`pz24` ancestry
- Three modules visible and working through real APIs
- `npm run check` passes; CI workflow exists
- Deployment config validated locally; live URLs recorded only when verified
- Branch pushed to `origin/kp`
