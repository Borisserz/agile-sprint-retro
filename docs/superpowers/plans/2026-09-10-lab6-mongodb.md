# Lab 6 MongoDB Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Parallel Mongoose CRUD under `/mongo/sprints` with nested `actionItems`, Docker Mongo, branch `lab26`.

**Architecture:** Keep Sequelize `/sprints`; add `config/mongo.js`, `models/mongo/Sprint.js`, controller + routes; connect both DBs in `server.js`.

**Tech:** mongoose, docker mongo:7, curl smoke verification (no Jest in project).

### Task 1: Branch + deps + Docker + env

- [ ] Create `lab26` from `lab25`
- [ ] `npm install mongoose`
- [ ] Add `mongo` service to `docker-compose.yml` (27017)
- [ ] Add `MONGO_URI` to `.env` / `.env.example`
- [ ] `docker compose up -d` and verify mongo

### Task 2: Model + connect + routes

- [ ] `config/mongo.js` — `connectMongo()`
- [ ] `models/mongo/Sprint.js` — schema with tags + actionItems subdocs
- [ ] `controllers/mongoSprintsController.js` — CRUD + nested endpoints
- [ ] `routes/mongoSprints.js`
- [ ] Wire `server.js` — connect mongo after sequelize; mount `/mongo/sprints`
- [ ] Update README Lab 6 section

### Task 3: Verify + commit

- [ ] Curl: POST/GET/PUT/DELETE sprint; POST/PATCH/DELETE action-item
- [ ] Checklist vs methodical §3–4
- [ ] Commit + push `lab26`
