# Lab 6 — MongoDB (Mongoose) parallel API for sprints

Date: 2026-09-10  
Branch: `lab26` (from `lab25`)  
Theme: Agile sprint / retrospective planning service

## Goal

Add a document-oriented storage path with MongoDB + Mongoose alongside the existing PostgreSQL + Sequelize stack. Demonstrate nested documents (sprint + embedded action items) and array updates, without breaking the Lab 5 React client that talks to `/sprints` on Postgres.

## Decisions

| Topic | Choice | Why |
|--------|--------|-----|
| Isolation | Parallel Mongo routes under `/mongo` | Methodical allows parallel API; PG React stays green |
| Hosting | Docker `mongo` for daily work; Atlas optional for report screenshots | Reliable offline; Atlas still available for dashboard shots |
| Collection | `sprints` (Mongoose model `MongoSprint`) | Same domain as PG; clear SQL vs NoSQL comparison |
| Nesting | `actionItems: [{ title, done, owner }]` + `tags: [String]` | Matches PG 1:N ActionItem; satisfies nested array + tags |
| Auth | No JWT on `/mongo/*` for Lab 6 | Methodical CRUD demo; keep focus on Mongoose (note in README) |
| Prefix | `/mongo/sprints` | Avoid clash with Sequelize `/sprints` |

## Document schema

```js
{
  name: String,          // required
  goal: String,          // required
  startDate: Date,       // required
  endDate: Date,         // required
  status: enum planned|active|done, // default planned
  capacity: Number,      // optional
  tags: [String],        // array (methodical)
  actionItems: [{        // nested subdocuments
    title: String,       // required
    done: Boolean,       // default false
    owner: String,       // optional (facilitator/member name)
  }],
  createdAt / updatedAt  // timestamps: true
}
```

**Contrast with PostgreSQL (for report):**

- PG: table `Sprints` + table `ActionItems` with FK `sprintId` (JOIN / Sequelize `include`).
- Mongo: one document; action items live inside the sprint; no JOIN to fetch the board.

## HTTP API

Base: `http://localhost:3000/mongo/sprints`

| Method | Path | Behavior |
|--------|------|----------|
| GET | `/mongo/sprints` | `find()` all |
| GET | `/mongo/sprints/:id` | `findById` |
| POST | `/mongo/sprints` | `create` (body may include `actionItems`, `tags`) |
| PUT | `/mongo/sprints/:id` | `findByIdAndUpdate` (replace top-level fields; may replace nested arrays) |
| DELETE | `/mongo/sprints/:id` | `findByIdAndDelete`, return deleted doc |
| POST | `/mongo/sprints/:id/action-items` | `$push` nested item |
| PATCH | `/mongo/sprints/:id/action-items/:itemId` | update one subdoc (`done` / `title` / `owner`) via `actionItems.$` or `id` |
| DELETE | `/mongo/sprints/:id/action-items/:itemId` | `$pull` by subdoc `_id` |

Errors: `{ error: "..." }` with 400 / 404 / 500, same style as existing Express error middleware.

## Project layout (additions)

```
docker-compose.yml          # + service mongo :27017
.env.example                # + MONGO_URI=
config/mongo.js             # mongoose.connect
models/mongo/Sprint.js      # schema + model export
controllers/mongoSprintsController.js
routes/mongoSprints.js
server.js                   # connect mongo; app.use('/mongo/sprints', ...)
README.md                   # Lab 6 run + Postman notes
```

Do **not** remove Sequelize, auth, or `client/`.

## Environment

```
MONGO_URI=mongodb://127.0.0.1:27017/agile_sprint_retro
```

Atlas alternative (report screenshots):

```
MONGO_URI=mongodb+srv://USER:PASS@cluster0....mongodb.net/agile_sprint_retro?retryWrites=true&w=majority
```

## Run (Lab 6)

```bash
npm run db:up          # postgres + mongo
npm install            # mongoose
npm run migrate        # PG still used by /sprints
npm run dev
# Postman → http://localhost:3000/mongo/sprints
```

## Testing checklist (Postman + Compass)

1. POST sprint with `tags` and empty `actionItems`
2. GET list / GET by id
3. POST action-item (nested)
4. PATCH action-item `done: true` (in-array update)
5. PUT sprint fields
6. DELETE action-item; DELETE sprint
7. Compass: open document, show nested `actionItems`

## Out of scope

- Rewiring React client to Mongo
- JWT on `/mongo` routes
- Retrospective board columns (went well / improve) — course project later
- Aggregation pipelines beyond what KV answers need in text
- Dropping PostgreSQL

## Report mapping (later)

- Theory: SQL vs NoSQL
- Screens: Atlas dashboard (optional if using Atlas), `.env` URI (redact password), schema listing, Postman CRUD + nested, Compass nested view
- KV: 16 questions
- Branch link: `lab26`
