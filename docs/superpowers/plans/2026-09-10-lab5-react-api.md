# Lab 5 React ↔ API Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Connect Sprint Control client to Express `/sprints` + JWT with optimistic CRUD and QUERY debounce search.

**Architecture:** axios service layer + login gate + SprintList owns server state; CORS on Express.

**Tech:** Vite React, axios, Express cors, existing Sequelize API.

---

### Task 1: Branch + CORS + axios env

**Files:** `server.js`, `package.json`, `client/package.json`, `client/.env`, `client/.env.example`, `README.md`

- [ ] Create `lab25` from `lab24`
- [ ] `npm install cors` (root); `app.use(cors())` before routes
- [ ] `cd client && npm install axios`
- [ ] Add `VITE_API_URL=http://localhost:3000`
- [ ] Update README run instructions (db, server, client, seed users)
- [ ] Commit

### Task 2: `client/src/api.js`

**Files:** `client/src/api.js`

- [ ] axios.create({ baseURL: import.meta.env.VITE_API_URL })
- [ ] request interceptor: Bearer from localStorage `token`
- [ ] `login`, `fetchSprints`, `searchSprints` (method QUERY), `addSprint`, `updateSprint`, `deleteSprint`
- [ ] Commit

### Task 3: LoginForm + App gate

**Files:** `client/src/components/LoginForm.jsx`, `client/src/App.jsx`

- [ ] Login form email/password; on success save token + optional user
- [ ] App: if no token show LoginForm else SprintList; logout control
- [ ] Commit

### Task 4: SprintList server CRUD

**Files:** `client/src/components/SprintList.jsx`, CSS as needed

- [ ] Remove useLocalStorage for list; states: sprints, loading, error, form, editingId, search, filter
- [ ] Mount: GET list; loading spinner; error + Retry
- [ ] Form with dates; POST/PUT/DELETE optimistic + rollback
- [ ] Debounced QUERY when search or status filter active; GET when clear
- [ ] Commit

### Task 5: Verify + push

- [ ] Server + client up; login facilitator; CRUD + search + stop-server error UI
- [ ] `npm run build` in client
- [ ] Push `origin lab25`
