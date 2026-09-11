# KP Product Implementation Plan

> **Status (2026-09-11):** Tasks 1–9 implemented on branch `kp` and pushed to `origin/kp`. Task 10 live cloud deploy remains credential-blocked until Render/Atlas/Netlify accounts are available. Explanatory note is out of scope for this phase.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the coursework product “Сервис для планирования спринтов и ретроспектив в Agile-командах” with secure authentication, routed React UI, persistent sprint/action-item/retro data, automated tests, CI, deployment configuration, and—when credentials are available—working public URLs.

**Architecture:** Keep the existing Express CommonJS backend, PostgreSQL/Sequelize sprint data, MongoDB/Mongoose retro data, Socket.IO rooms, and cobalt daylight React UI from `origin/28`. Add security as shared middleware, use React Router plus an `AuthContext` backed by the real JWT API, expose PostgreSQL action-item endpoints, and persist retro cards/votes in MongoDB instead of replacing the product with the `pz23`/`pz24` catalog demonstration.

**Tech Stack:** Node.js 20, Express 5, PostgreSQL 16, Sequelize 6, MongoDB/Atlas, Mongoose 9, JWT, bcrypt, Helmet, CORS, Socket.IO, React 19, React Router 7, Axios, Vite 8, Vitest, React Testing Library, Supertest, GitHub Actions, Render, Netlify.

## Global Constraints
- Repository: `/Users/borisserzhanovich/университет/7semestr/ИТиВП/лабы/работа/agile-sprint-retro`.
- Branch `kp` must descend directly from `origin/28` at `0e72ea5`; never base it on `pz23` or `pz24`.
- Cherry-pick individual routing/context ideas only; never replace the product `App.jsx` with the catalog demonstration.
- Code only. Do not create or edit an explanatory note.
- Preserve the established CommonJS backend, JavaScript React code, lab lineage, and existing comment language.
- Domain entities remain `User`, PostgreSQL `Sprint`, `ActionItem`, MongoDB `MongoSprint`, `RetroMessage`, and new `RetroCard`.
- Do not introduce teams, projects, Trello integration, invitations, refresh tokens, or unrelated administration.
- Every behavior change follows RED → GREEN → REFACTOR, verification, and one focused commit.
- Never commit `.env`, credentials, deployment tokens, generated `client/dist`, or fabricated public URLs.
- Visual direction remains cobalt daylight: no purple gradients, cream/terracotta theme, serif decoration, emoji controls, glassmorphism, excessive cards, or glow.
- A credential-dependent deployment is reported as blocked only after code/config validation and an actual authentication or missing-secret check.
- Before every completion claim, use `verification-before-completion` and cite fresh command output.

## Planned File Map
- Security: `config/cors.js`, `config/jwt.js`, `server.js`, `middleware/auth.js`, route files, `socket/index.js`.
- Product routing/auth: `client/src/context/AuthContext.jsx`, `client/src/routes/PrivateRoute.jsx`, `client/src/pages/*`, `client/src/App.jsx`, `client/src/main.jsx`.
- Action items: `controllers/actionItemsController.js`, `routes/sprints.js`, `client/src/components/ActionItems.jsx`.
- Persistent retro: `models/mongo/RetroCard.js`, `socket/retroCardStore.js`, `socket/retroHandlers.js`, `client/src/components/RetroBoard.jsx`.
- Quality/deploy: `tests/*`, `client/src/**/*.test.jsx`, `.github/workflows/ci.yml`, `render.yaml`, `netlify.toml`, environment examples, `README.md`.

---

### Task 1: Establish `kp` lineage and truthful status

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: `origin/28` at `0e72ea5`.
- Produces: clean local branch `kp` and a truthful coursework-product status section.

- [ ] **Step 1: Verify the authoritative base**

```bash
cd "/Users/borisserzhanovich/университет/7semestr/ИТиВП/лабы/работа/agile-sprint-retro"
git fetch origin
test "$(git rev-parse origin/28)" = "0e72ea5f66b46c7dd2758135508d4ffb1682087f"
git status --short
```

Expected: the hash assertion succeeds and working tree output is empty. Stop if either condition fails.

- [ ] **Step 2: Select or create `kp` without resetting work**

```bash
git switch kp 2>/dev/null || git switch -c kp origin/28
test "$(git rev-parse HEAD)" = "0e72ea5f66b46c7dd2758135508d4ffb1682087f"
! git merge-base --is-ancestor b479250 HEAD
! git merge-base --is-ancestor d3d8713 HEAD
```

Expected: all commands exit successfully. Do not delete or reset a divergent `kp`; stop and report the mismatch.

- [ ] **Step 3: Add a truthful README product section**

Add near the top:

```markdown
## Coursework product

Branch `kp` develops the coursework product from Lab 8 (`origin/28`, commit `0e72ea5`).

Current status: implementation in progress. Public deployment URLs are recorded here only after successful smoke testing.
```

Keep the existing Lab 8 instructions below it.

- [ ] **Step 4: Verify README and lineage**

```bash
git diff --check
git diff -- README.md
git merge-base --is-ancestor origin/28 HEAD
```

Expected: no whitespace errors; the README names the correct base and makes no deployment claim.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: mark kp coursework product baseline"
```

**Acceptance criteria:**
- `kp` starts at `0e72ea5`.
- Neither `pz23` nor `pz24` is an ancestor.
- README says deployment is in progress, not completed.
- Nothing has been pushed yet.

---

### Task 2: Harden JWT, Helmet, CORS, and mutation authorization

**Files:**
- Create: `config/cors.js`
- Create: `config/jwt.js`
- Create: `tests/security.test.js`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `server.js`
- Modify: `middleware/auth.js`
- Modify: `controllers/authController.js`
- Modify: `routes/sprints.js`
- Modify: `routes/mongoSprints.js`
- Modify: `socket/index.js`
- Modify: `.env.example`

**Interfaces:**
- Produces: `createCorsOptions()`, `signAccessToken(payload)`, `verifyAccessToken(token)`, `assertJwtConfiguration()`.
- Policy: reads remain public; all mutations require JWT; destructive sprint/Mongo operations additionally require `facilitator`.

- [ ] **Step 1: Install security and HTTP-test dependencies**

```bash
npm install helmet
npm install --save-dev supertest
```

Expected: manifests and lockfile contain `helmet` and `supertest`.

- [ ] **Step 2: Write failing security tests**

Create `tests/security.test.js` covering:

```js
process.env.DATABASE_URL ||= 'postgres://postgres:postgres@localhost:5433/agile_sprint_retro';
process.env.JWT_SECRET ||= 'test-secret-with-at-least-32-characters';
process.env.CORS_ORIGINS = 'http://localhost:5173';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app } = require('../server');

test('Helmet headers are enabled', async () => {
  const response = await request(app).get('/health');
  assert.equal(response.status, 200);
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
});

test('configured origin is allowed and an unknown origin is rejected', async () => {
  const allowed = await request(app)
    .get('/health')
    .set('Origin', 'http://localhost:5173');
  assert.equal(allowed.headers['access-control-allow-origin'], 'http://localhost:5173');

  const denied = await request(app)
    .get('/health')
    .set('Origin', 'https://unknown.example');
  assert.equal(denied.status, 403);
});

test('PostgreSQL and MongoDB mutations require a bearer token', async () => {
  const responses = await Promise.all([
    request(app).post('/sprints').send({}),
    request(app).put('/sprints/1').send({}),
    request(app).post('/mongo/sprints').send({}),
    request(app).patch('/mongo/sprints/507f1f77bcf86cd799439011/action-items/507f191e810c19729de860ea').send({ done: true }),
  ]);
  assert.deepEqual(responses.map((response) => response.status), [401, 401, 401, 401]);
});
```

- [ ] **Step 3: Run RED**

```bash
node --test tests/security.test.js
```

Expected: FAIL because Helmet, allowlisted CORS, and mutation guards are not implemented.

- [ ] **Step 4: Implement shared CORS and JWT configuration**

`config/cors.js` must:
- Parse comma-separated `CORS_ORIGINS`.
- Default locally to `http://localhost:5173,http://localhost`.
- Allow requests without an `Origin` header for CLI, health checks, and server-to-server calls.
- Return status `403` for unknown browser origins.
- Preserve `QUERY` in allowed methods.
- Export `createCorsOptions`.

`config/jwt.js` must centralize:

```js
const TOKEN_OPTIONS = {
  issuer: 'agile-sprint-retro',
  audience: 'agile-sprint-retro-web',
};

function signAccessToken(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    ...TOKEN_OPTIONS,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret(), TOKEN_OPTIONS);
}
```

`assertJwtConfiguration()` must reject a missing secret and reject secrets shorter than 32 characters when `NODE_ENV === 'production'`.

- [ ] **Step 5: Apply middleware and route policy**

In `server.js`:
1. Call `helmet()` before routes.
2. Call `cors(createCorsOptions())`.
3. Call `assertJwtConfiguration()` inside `start()` before database connections.

In `middleware/auth.js` and `socket/index.js`, replace direct `jwt.verify` calls with `verifyAccessToken`.

In `controllers/authController.js`, replace direct signing with `signAccessToken` and require passwords of at least eight characters.

Apply route policy:

```js
router.post('/', authenticate, controller.create);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, requireRole('facilitator'), controller.remove);
```

For Mongo routes:
- `GET` remains public.
- `POST`, `PUT`, `PATCH` require `authenticate`.
- `DELETE` requires `authenticate` and `requireRole('facilitator')`.

Use the same CORS origin policy in Socket.IO.

- [ ] **Step 6: Document local security variables**

Add to `.env.example`:

```dotenv
CORS_ORIGINS=http://localhost:5173,http://localhost
JWT_EXPIRES_IN=1h
```

Keep the existing long-random-secret instruction.

- [ ] **Step 7: Run GREEN**

```bash
node --test tests/security.test.js
npm test
```

Expected: all security tests and existing socket tests pass.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json config/cors.js config/jwt.js server.js middleware/auth.js controllers/authController.js routes/sprints.js routes/mongoSprints.js socket/index.js tests/security.test.js .env.example
git commit -m "feat: harden API authentication and CORS"
```

#### Milestone review: secure foundation
- [ ] СЭО: Express, JWT/RBAC, Helmet, and CORS allowlist are represented in real code.
- [ ] Works: unauthorized mutation tests and existing Socket.IO tests pass.
- [ ] No slop: no unrelated entities, refresh-token system, or security theater.
- [ ] No fake claims: README still reports deployment as in progress.

---

### Task 3: Add AuthContext and product React Router routes

**Files:**
- Create: `client/src/context/AuthContext.jsx`
- Create: `client/src/routes/PrivateRoute.jsx`
- Create: `client/src/pages/LoginPage.jsx`
- Create: `client/src/pages/SprintsPage.jsx`
- Create: `client/src/pages/RetroPage.jsx`
- Create: `client/src/pages/NotFoundPage.jsx`
- Create: `client/src/App.test.jsx`
- Create: `client/src/test/setup.js`
- Modify: `client/src/App.jsx`
- Modify: `client/src/main.jsx`
- Modify: `client/src/api.js`
- Modify: `client/src/components/LoginForm.jsx`
- Modify: `client/src/components/SprintList.jsx`
- Modify: `client/package.json`
- Modify: `client/package-lock.json`
- Modify: `client/vite.config.js`

**Interfaces:**
- `useAuth()` returns `{ user, token, status, signIn, signOut }`.
- `PrivateRoute` redirects unauthenticated users to `/login` with `state.from`.
- Product paths: `/login`, `/register`, `/sprints`, `/sprints/:id/retro`, wildcard 404.
- `fetchSprint(id)` calls `GET /sprints/:id`.

- [ ] **Step 1: Install routing and frontend-test dependencies**

```bash
npm --prefix client install react-router-dom@^7.18.3
npm --prefix client install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Add:

```json
"test": "vitest run"
```

Configure Vitest with `environment: 'jsdom'` and `setupFiles: './src/test/setup.js'`.

- [ ] **Step 2: Write failing route tests**

Test these cases in `client/src/App.test.jsx`:
1. `/sprints` without a token redirects to the real login page.
2. `/sprints/7/retro` with a restored profile renders the retro route.
3. Unknown paths render a 404 heading and a link to `/sprints`.

Mock only HTTP functions, not authentication state:

```jsx
vi.mock('./api', () => ({
  fetchProfile: vi.fn(),
  fetchSprint: vi.fn(),
  fetchSprints: vi.fn(),
  getErrorMessage: (error) => error.message,
}));

render(
  <MemoryRouter initialEntries={['/sprints']}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </MemoryRouter>,
);
```

- [ ] **Step 3: Run RED**

```bash
npm --prefix client test -- src/App.test.jsx
```

Expected: FAIL because product routes and `AuthProvider` do not exist.

- [ ] **Step 4: Implement real session context**

`AuthContext` must:
- Read `token` from `localStorage`.
- Use `fetchProfile()` before considering a stored session authenticated.
- Clear an invalid token and disconnect Socket.IO.
- Expose `status` as `loading`, `authenticated`, or `anonymous`.
- Store the token only after successful `POST /auth/login`.
- Clear token/socket state in `signOut`.
- Never infer authentication from catalog-demo flags.

- [ ] **Step 5: Build product routes**

`main.jsx` wraps the app once:

```jsx
<StrictMode>
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
</StrictMode>
```

`App.jsx` defines:
- `/` → `/sprints` if authenticated, otherwise `/login`.
- `/login` → `LoginPage`.
- `/register` → the Task 4 page.
- Protected `/sprints` → `SprintsPage`.
- Protected `/sprints/:id/retro` → `RetroPage`.
- `*` → `NotFoundPage`.

Do not import anything from `client/src/pz23` or `client/src/pz24`.

- [ ] **Step 6: Route the existing product components**

- `LoginForm` calls `signIn(email, password)` through context.
- `SprintsPage` renders the existing `SprintList`.
- `SprintList` uses `useNavigate()` to open `/sprints/${sprint.id}/retro` instead of modal state.
- `RetroPage` calls `fetchSprint(id)`, handles loading/404/error states, and renders `RetroBoard`.
- Closing a retro navigates back to `/sprints`.

- [ ] **Step 7: Run GREEN and static checks**

```bash
npm --prefix client test -- src/App.test.jsx
npm --prefix client run lint
npm --prefix client run build
```

Expected: route tests pass, lint exits 0, and Vite builds successfully.

- [ ] **Step 8: Commit**

```bash
git add client/package.json client/package-lock.json client/vite.config.js client/src
git commit -m "feat: add authenticated product routing"
```

**Acceptance criteria:**
- Direct URL refresh works for all required routes in local nginx.
- Private routes use a verified `/profile` response, not token presence alone.
- `/404` and arbitrary unknown paths show the product 404 page.
- Existing sprint and retro product components remain in use.

---

### Task 4: Add registration and change-password UI

**Files:**
- Create: `client/src/pages/RegisterPage.jsx`
- Create: `client/src/components/ChangePasswordForm.jsx`
- Create: `client/src/pages/AuthPages.test.jsx`
- Modify: `client/src/api.js`
- Modify: `client/src/App.jsx`
- Modify: `client/src/pages/LoginPage.jsx`
- Modify: `client/src/pages/SprintsPage.jsx`
- Modify: `client/src/App.css`

**Interfaces:**
- `register(email, password)` → `POST /auth/register`.
- `changePassword(oldPassword, newPassword)` → `POST /auth/change-password`.
- Registration succeeds by navigating to `/login` with a success notice; it does not fabricate a token.

- [ ] **Step 1: Write failing auth-page tests**

Cover:
- Registration submits normalized email/password and redirects to login.
- Password mismatch is rejected without an API call.
- Change-password form sends old/new passwords and clears both fields after success.
- Login and register pages link to each other.

- [ ] **Step 2: Run RED**

```bash
npm --prefix client test -- src/pages/AuthPages.test.jsx
```

Expected: FAIL because registration and password components are absent.

- [ ] **Step 3: Add API functions**

```js
export function register(email, password) {
  return api.post('/auth/register', { email, password });
}

export function changePassword(oldPassword, newPassword) {
  return api.post('/auth/change-password', { oldPassword, newPassword });
}
```

- [ ] **Step 4: Implement register page**

Fields:
- Email.
- Password with minimum length 8.
- Password confirmation.
- Inline server/validation error.
- Submit loading state.
- Link back to login.

On `201`, navigate to `/login` with:

```js
{ state: { notice: 'Account created. Sign in with your credentials.' } }
```

- [ ] **Step 5: Implement compact change-password form**

Place it in `SprintsPage` near authenticated session controls, not in a separate dashboard.

Requirements:
- Current password, new password, confirmation.
- Real authenticated API call.
- Error and success status with `role="alert"`/`role="status"`.
- No password values in logs or persistent storage.

- [ ] **Step 6: Run GREEN**

```bash
npm --prefix client test -- src/pages/AuthPages.test.jsx
npm --prefix client test
npm --prefix client run lint
```

Expected: all frontend tests pass.

- [ ] **Step 7: Commit**

```bash
git add client/src/api.js client/src/App.jsx client/src/pages client/src/components/ChangePasswordForm.jsx client/src/App.css
git commit -m "feat: add registration and password management"
```

---

### Task 5: Expose and edit PostgreSQL action items

**Files:**
- Create: `controllers/actionItemsController.js`
- Create: `tests/action-items.test.js`
- Create: `client/src/components/ActionItems.jsx`
- Create: `client/src/components/ActionItems.test.jsx`
- Modify: `routes/sprints.js`
- Modify: `client/src/api.js`
- Modify: `client/src/components/SprintList.jsx`
- Modify: `client/src/App.css`

**Interfaces:**
- `POST /sprints/:id/action-items` body `{ title }` → `201 ActionItem`.
- `PATCH /sprints/:id/action-items/:itemId` body `{ title?, done? }` → `200 ActionItem`.
- `DELETE /sprints/:id/action-items/:itemId` → `204`.
- All three routes require JWT.
- `ActionItems` props: `{ sprintId, items, onItemsChange }`.

- [ ] **Step 1: Write failing backend tests**

Use Supertest and temporary method stubs on imported Sequelize models. Cover:
- No token → `401`.
- Blank title → `400`.
- Missing sprint/action item → `404`.
- Creating an item binds `sprintId` from the URL.
- Patch changes only supplied `title`/`done`.
- Delete returns `204`.

Restore every model method with `t.after()`.

- [ ] **Step 2: Run backend RED**

```bash
node --test tests/action-items.test.js
```

Expected: FAIL with missing action-item routes.

- [ ] **Step 3: Implement focused controller and routes**

Controller validation:
- `title` must be a non-empty trimmed string and at most 255 characters.
- `done`, when present, must be boolean.
- Verify the parent sprint exists.
- Verify `item.sprintId === Number(req.params.id)` before patch/delete.
- Never accept `sprintId` from the request body.

Mount nested routes before `GET /:id`.

- [ ] **Step 4: Run backend GREEN**

```bash
node --test tests/action-items.test.js
npm test
```

Expected: new API tests and existing tests pass.

- [ ] **Step 5: Write failing React action-item tests**

Cover:
- Existing `sprint.actionItems` render.
- Add creates a visible item.
- Checkbox patches `done`.
- Editing title patches the item.
- Delete removes it.
- API failure keeps/restores the prior UI and shows a message.

- [ ] **Step 6: Run frontend RED**

```bash
npm --prefix client test -- src/components/ActionItems.test.jsx
```

Expected: FAIL because `ActionItems` is missing.

- [ ] **Step 7: Implement API and component**

Add Axios functions:

```js
export const addActionItem = (sprintId, title) =>
  api.post(`/sprints/${sprintId}/action-items`, { title });

export const updateActionItem = (sprintId, itemId, changes) =>
  api.patch(`/sprints/${sprintId}/action-items/${itemId}`, changes);

export const deleteActionItem = (sprintId, itemId) =>
  api.delete(`/sprints/${sprintId}/action-items/${itemId}`);
```

Render action items inside each sprint ticket using a compact list—not nested dashboard cards. Update the matching sprint in `SprintList` through `onItemsChange`.

- [ ] **Step 8: Run full GREEN**

```bash
npm test
npm --prefix client test
npm --prefix client run lint
npm --prefix client run build
```

Expected: all commands exit 0.

- [ ] **Step 9: Commit**

```bash
git add controllers/actionItemsController.js routes/sprints.js tests/action-items.test.js client/src/api.js client/src/components/SprintList.jsx client/src/components/ActionItems.jsx client/src/components/ActionItems.test.jsx client/src/App.css
git commit -m "feat: manage sprint action items in product UI"
```

#### Milestone review: complete product flow
- [ ] СЭО: Auth, Sprint CRUD, Action Items, and Retro are visible modules.
- [ ] Works: registration, login, sprint, action-item, and routed retro flows use the real APIs.
- [ ] No slop: action items reuse the existing PostgreSQL model and sprint UI.
- [ ] No fake claims: errors are rendered from actual responses.

---

### Task 6: Persist retro cards and votes in MongoDB

**Files:**
- Create: `models/mongo/RetroCard.js`
- Create: `socket/retroCardStore.js`
- Create: `tests/retroCardStore.test.js`
- Modify: `socket/roomState.js`
- Modify: `socket/retroHandlers.js`
- Modify: `tests/socket-retro.test.js`
- Modify: `client/src/components/RetroBoard.jsx`
- Modify: `client/src/App.css`
- Modify: `README.md`

**Interfaces:**
- `RetroCard`: `sprintId`, `column`, `text`, `authorId`, `authorEmail`, `voterIds`, optional `templateKey`, timestamps.
- Columns: `went-well`, `improve`, `action`.
- Store methods: `listOrSeed`, `create`, `remove`, `toggleVote`.
- Socket events: `retro:card:create`, `retro:card:delete`, `retro:vote`, broadcast `retro:cards`.

- [ ] **Step 1: Write failing store tests**

Construct the store with an injected model:

```js
const { createRetroCardStore } = require('../socket/retroCardStore');
const store = createRetroCardStore(fakeRetroCardModel);
```

Cover:
- First `listOrSeed('7')` persists the existing default cards.
- Repeated `listOrSeed('7')` does not duplicate defaults.
- Card creation trims text and validates column.
- A user vote toggles on and off and survives a new store instance.
- Facilitator deletion succeeds; member deletion returns a forbidden error.

- [ ] **Step 2: Run RED**

```bash
node --test tests/retroCardStore.test.js
```

Expected: FAIL because the model/store do not exist.

- [ ] **Step 3: Implement `RetroCard` schema**

Validation:
- `sprintId`: required string, indexed.
- `column`: required enum.
- `text`: trimmed, required, max 500.
- `authorId`: required number.
- `authorEmail`: required string.
- `voterIds`: array of numbers, default empty.
- `templateKey`: optional string.

Add a partial unique index on `{ sprintId, templateKey }` only when `templateKey` is a string. This makes concurrent default seeding idempotent without restricting user-created cards.

Serialize each card as:

```js
{
  id: String(card._id),
  column: card.column,
  text: card.text,
  authorId: card.authorId,
  authorEmail: card.authorEmail,
  votes: card.voterIds.length,
  voterIds: [...card.voterIds],
}
```

- [ ] **Step 4: Implement persistence store**

`listOrSeed` upserts each existing `DEFAULT_CARDS` entry using `templateKey`, then loads cards ordered by creation time. `toggleVote` verifies sprint ownership, adds/removes the numeric user ID, saves, and returns the full room card list.

Keep presence tracking in `roomState.js`; do not use its in-memory cards/votes in production handlers.

- [ ] **Step 5: Run store GREEN**

```bash
node --test tests/retroCardStore.test.js
```

Expected: all store tests pass.

- [ ] **Step 6: Update Socket.IO integration test before handlers**

Extend `tests/socket-retro.test.js` with a fake injected/patched `RetroCard` persistence layer and assertions that:
- Both clients receive a newly created card.
- A vote is visible to both.
- Rejoining returns the same card and vote.
- A member cannot delete another user’s card unless policy permits; facilitator can delete.

Run:

```bash
node --test tests/socket-retro.test.js
```

Expected: FAIL until handlers use persistent cards.

- [ ] **Step 7: Wire persistent socket handlers**

- `retro:join` awaits `listOrSeed(sprintId)`.
- `retro:card:create` requires joined room and broadcasts full cards.
- `retro:card:delete` permits the author or facilitator.
- `retro:vote` awaits persisted toggle and broadcasts full cards.
- Acknowledgements return `{ ok: true, cards }` or `{ error }`.
- Chat history remains in `RetroMessage`; presence/typing remain transient.

- [ ] **Step 8: Add card creation/deletion UI**

In each retro column:
- Add a compact text input and “Add” button.
- Disable mutation until socket status is `live`.
- Show delete only for the author or facilitator.
- Preserve `aria-pressed` for votes.
- Replace cards only from acknowledged/broadcast server snapshots.

No drag-and-drop, anonymous mode, timers, emoji reactions, or extra board taxonomy.

- [ ] **Step 9: Verify persistence behavior**

```bash
npm test
npm --prefix client test
npm --prefix client run build
```

Then locally:
1. Open a retro.
2. Add a card and vote.
3. Close/reopen the route.
4. Restart the backend.
5. Reopen and verify the card/vote remain.
6. Verify chat history also remains.

- [ ] **Step 10: Document actual persistence**

Add to README:

```markdown
## Persistence model

- PostgreSQL: users, sprints, and action items.
- MongoDB: comparison sprint documents, retro chat messages, retro cards, and voter identifiers.
- Socket.IO presence and typing indicators are intentionally transient.
```

- [ ] **Step 11: Commit**

```bash
git add models/mongo/RetroCard.js socket/retroCardStore.js socket/roomState.js socket/retroHandlers.js tests/retroCardStore.test.js tests/socket-retro.test.js client/src/components/RetroBoard.jsx client/src/App.css README.md
git commit -m "feat: persist retrospective cards and votes"
```

---

### Task 7: Polish the cobalt daylight product UI

**Files:**
- Modify: `client/src/App.css`
- Modify: `client/src/index.css`
- Modify as needed: `client/src/pages/*.jsx`
- Modify as needed: `client/src/components/*.jsx`

**Interfaces:**
- No API/schema changes.
- Responsive targets: 1440 px, 1024 px, and 390 px widths.
- Keyboard-visible focus and reduced-motion behavior remain mandatory.

- [ ] **Step 1: Record a visual baseline**

```bash
docker compose up --build -d
npm run db:migrate
npm run db:seed
```

Inspect:
- `/login`
- `/register`
- `/sprints`
- `/sprints/1/retro`
- `/404`

Record observed clipping, overflow, contrast, focus, or hierarchy defects. Do not claim defects that were not observed.

- [ ] **Step 2: Make a surgical CSS pass**

Keep existing tokens and typography. Apply these limits:
- Cobalt remains the only dominant accent.
- Replace decorative button gradients/glows with solid cobalt and restrained hover states.
- Reduce panel shadow strength and nested borders.
- Keep panel radius at or below the existing 12 px.
- Action items remain list rows, not cards within cards.
- Retro columns remain visually distinct through headings/dividers, not pastel surfaces.
- Auth pages use the same rail/composer language as the sprint product.
- Keep status colors functional and accessible.

- [ ] **Step 3: Improve interaction/accessibility states**

Verify:
- Every input has a visible label.
- Icon-only controls have accessible names; prefer text controls.
- `:focus-visible` is clear against white and cobalt.
- Disabled/loading states do not rely only on opacity.
- Dialog/page headings follow one `h1` then ordered subsections.
- At `prefers-reduced-motion: reduce`, nonessential transitions/animations stop.

- [ ] **Step 4: Verify responsive layouts**

At 1440, 1024, and 390 px:
- No horizontal page scrolling.
- Sprint form, board, action items, and retro columns remain usable.
- Auth errors do not overlap controls.
- Retro chat stays reachable without fixed-height clipping.

- [ ] **Step 5: Run code checks**

```bash
npm --prefix client test
npm --prefix client run lint
npm --prefix client run build
git diff --check
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add client/src
git commit -m "style: polish cobalt product interface"
```

#### Milestone review: UX
- [ ] СЭО: required product routes/modules are visible and usable.
- [ ] Works: keyboard, narrow viewport, loading, error, and empty states were checked.
- [ ] No slop: no purple, emoji chrome, glass, cream/serif treatment, glow-heavy controls, or card nesting.
- [ ] No fake claims: only observed visual behavior is reported.

---

### Task 8: Complete API tests and GitHub Actions CI

**Files:**
- Create: `tests/auth-api.test.js`
- Create: `tests/sprints-api.test.js`
- Create: `.github/workflows/ci.yml`
- Modify: `package.json`
- Modify: `client/package.json`
- Modify existing tests as required for isolation.

**Interfaces:**
- Root `npm test` runs backend/API/socket tests.
- Root `npm run check` runs backend tests plus frontend test/lint/build.
- CI uses Node 20 and `npm ci`.

- [ ] **Step 1: Write failing authentication API tests**

Using Supertest plus restored model/bcrypt stubs, cover:
- Register rejects invalid email and password under 8 characters.
- Duplicate registration returns `400` with existing contract.
- Login rejects wrong credentials with `401`.
- Login returns `{ token, user }`.
- `/profile` rejects no/invalid token.
- `/profile` returns safe user data without `passwordHash`.
- Change password rejects incorrect old password.

- [ ] **Step 2: Write failing sprint API tests**

Cover:
- `GET /sprints` and `QUERY /sprints` include action items.
- Invalid status/date/capacity returns `400`.
- Authenticated create/update succeeds.
- Member delete returns `403`.
- Facilitator delete succeeds.
- Unknown sprint returns `404`.

Do not connect to a developer database; stub and restore model methods deterministically.

- [ ] **Step 3: Run RED**

```bash
node --test tests/auth-api.test.js tests/sprints-api.test.js
```

Expected: at least one assertion exposes missing or inconsistent behavior.

- [ ] **Step 4: Make minimal API corrections**

Only change controllers/middleware where tests reveal a real contract mismatch. Do not redesign response envelopes or add unrelated endpoints.

- [ ] **Step 5: Add aggregate check script**

Root `package.json`:

```json
"check": "npm test && npm --prefix client test && npm --prefix client run lint && npm --prefix client run build"
```

- [ ] **Step 6: Add CI workflow**

`.github/workflows/ci.yml` must:
- Trigger on pushes to `kp` and pull requests.
- Use `actions/checkout`.
- Use `actions/setup-node` with Node 20 and npm caching for both lockfiles.
- Run root `npm ci`.
- Set non-secret test values for `DATABASE_URL`, `MONGO_URI`, and a 32+ character `JWT_SECRET`.
- Run `npm test`.
- Run `npm --prefix client ci`.
- Run frontend tests, lint, and build.

No deployment secrets belong in CI.

- [ ] **Step 7: Run GREEN locally**

```bash
npm run check
```

Expected:
- Auth API tests pass.
- Sprint/action-item security tests pass.
- Socket chat/card/vote integration passes.
- Frontend route/component tests pass.
- Lint and Vite build pass.

- [ ] **Step 8: Commit**

```bash
git add package.json tests .github/workflows/ci.yml client/package.json client/package-lock.json controllers middleware
git commit -m "test: add API coverage and CI quality gate"
```

#### Milestone review: quality gate
- [ ] СЭО: integration is demonstrated through Supertest and real Socket.IO client/server tests.
- [ ] Works: one fresh `npm run check` exits 0.
- [ ] No slop: tests assert externally visible contracts instead of implementation trivia.
- [ ] No fake claims: do not report GitHub CI green until the pushed workflow actually completes.

---

### Task 9: Prepare and attempt Render, Atlas, and Netlify deployment

**Files:**
- Create: `render.yaml`
- Create: `netlify.toml`
- Modify: `.env.example`
- Modify: `client/.env.example`
- Modify: `README.md`
- Modify if needed: `server.js`
- Modify if needed: `config/config.js`

**Interfaces:**
- Backend production variables: `DATABASE_URL`, `DATABASE_SSL=true`, `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGINS`, `NODE_ENV=production`.
- Frontend build variable: `VITE_API_URL`.
- Health endpoint: `GET /health`.

- [ ] **Step 1: Write complete environment examples**

Root `.env.example` must contain safe local values/instructions for:
- `PORT=3000`
- `DATABASE_URL`
- `DATABASE_SSL=false`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN=1h`
- `CORS_ORIGINS=http://localhost:5173,http://localhost`
- `VITE_API_URL=http://localhost:3000` for Compose build compatibility.

`client/.env.example` remains:

```dotenv
VITE_API_URL=http://localhost:3000
```

- [ ] **Step 2: Add Render Blueprint**

`render.yaml` defines:
- One Node web service for the repository root.
- `npm ci` build.
- `npm run db:migrate` pre-deploy.
- `npm start` start command.
- `/health` health check.
- Managed Render PostgreSQL connection.
- `DATABASE_SSL=true`.
- Generated `JWT_SECRET`.
- Secret/manual `MONGO_URI`.
- Secret/manual `CORS_ORIGINS`.
- Node 20.

Do not run seeders automatically in production.

- [ ] **Step 3: Remove production auto-seeding**

If Docker currently executes `db:seed:all || true`, change it so production startup migrates but does not silently create known-password demo users. Keep explicit local `npm run db:seed` documentation.

Verify:

```bash
docker compose build backend
```

Expected: backend image builds without embedding secrets.

- [ ] **Step 4: Add Netlify SPA configuration**

`netlify.toml`:

```toml
[build]
  base = "client"
  command = "npm ci && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

`VITE_API_URL` is configured in Netlify’s environment, not committed.

- [ ] **Step 5: Document exact dashboard sequence**

README deployment section must state:
1. Create Atlas database user and cluster; obtain actual `MONGO_URI`.
2. Restrict Atlas access as supported by Render, using strong credentials.
3. Create Render Blueprint from `render.yaml`; set `MONGO_URI` and eventual Netlify origin in `CORS_ORIGINS`.
4. Create Netlify site from the repository with branch `kp`; set `VITE_API_URL` to the verified Render API URL.
5. Redeploy backend if the final Netlify origin changes.
6. Record URLs only after health, login, sprint, and retro smoke tests pass.

- [ ] **Step 6: Validate deployment configuration locally**

```bash
npm run check
docker compose config
docker compose up --build -d
curl --fail http://localhost:3000/health
curl --fail http://localhost
docker compose down
```

Expected: checks pass, Compose resolves, health returns `{"ok":true}`, and frontend returns HTML.

- [ ] **Step 7: Attempt credential checks without inventing success**

```bash
npx --yes netlify-cli status
```

If authenticated, create/select the intended Netlify site but do not publish a build with an unknown backend URL.

For Render/Atlas:
- Check whether the executor has access to the required accounts/secrets.
- If unavailable, record: “Configuration verified locally; live deployment requires Render/Atlas/Netlify credentials.”
- Do not write sample public URLs.

- [ ] **Step 8: Commit deployment preparation**

```bash
git add render.yaml netlify.toml .env.example client/.env.example README.md Dockerfile server.js config
git commit -m "chore: prepare Render and Netlify deployment"
```

**Acceptance criteria:**
- Production config contains no secrets.
- Production does not seed known demo passwords automatically.
- SPA fallback supports direct routed URLs.
- A live deployment is either attempted with credentials or accurately marked credential-blocked.

---

### Task 10: Final СЭО verification, deployment smoke test, and push

**Files:**
- Modify: `README.md` only if recording verified URLs or an exact credential blocker.

**Interfaces:**
- Produces: pushed `origin/kp`.
- Produces verified public API/frontend URLs when credentials permit.
- Does not produce the explanatory note or fabricated screenshots.

- [ ] **Step 1: Verify lineage and working tree**

```bash
git status --short
git merge-base --is-ancestor 0e72ea5 HEAD
! git merge-base --is-ancestor b479250 HEAD
! git merge-base --is-ancestor d3d8713 HEAD
git log --oneline --decorate origin/28..HEAD
```

Expected: clean tree, correct base, no `pz23`/`pz24` ancestry, and focused commits.

- [ ] **Step 2: Run final local verification**

```bash
npm ci
npm --prefix client ci
npm run check
docker compose config
git diff --check origin/28...HEAD
```

Expected: every command exits 0.

- [ ] **Step 3: Review against requirement 119**

Check actual code for:
- React product UI.
- Node/Express API.
- PostgreSQL/Sequelize.
- MongoDB/Mongoose.
- JWT authentication and RBAC.
- At least three visible modules: authentication, sprint planning/action items, live retrospective.
- REST and Socket.IO integration.
- Automated backend/frontend/socket tests.
- CI workflow.
- Deployment configuration and documented deployment process.

- [ ] **Step 4: Review requirement 120 code expectations**

Verify:
- React Router owns `/login`, `/register`, `/sprints`, `/sprints/:id/retro`, and 404.
- `AuthContext` validates stored JWT through `/profile`.
- `PrivateRoute` blocks anonymous access.
- Helmet is active.
- CORS is an allowlist for REST and Socket.IO.
- Register UI exists.
- Action items are visible/editable.
- Retro chat, cards, and votes persist in MongoDB.
- README has local run, test, persistence, and deployment instructions.
- Screenshots and explanatory-note text remain outside this implementation.

- [ ] **Step 5: Perform SolHi final review**

- [ ] Matches СЭО: each required capability points to a file and passing test.
- [ ] Works: fresh tests/build/Compose evidence exists.
- [ ] No slop: visual constraints and domain limits are respected.
- [ ] No fake claims: URLs, CI status, and persistence claims have direct evidence.

- [ ] **Step 6: Push the implementation branch for deployment**

```bash
git push -u origin kp
```

Expected: remote branch `origin/kp` is created from this verified history.

- [ ] **Step 7: Attempt live deployment when credentials exist**

1. Create/deploy the Render Blueprint from branch `kp`.
2. Set the real Atlas `MONGO_URI`.
3. Set `CORS_ORIGINS` to the real Netlify origin.
4. Set Netlify `VITE_API_URL` to the real Render URL.
5. Deploy Netlify production.

Example frontend command after environment configuration:

```bash
npx --yes netlify-cli deploy --build --prod
```

If credentials are unavailable, retain the exact credential-blocked README status and skip claims of a live deployment.

- [ ] **Step 8: Smoke-test actual public URLs**

With real values exported:

```bash
test -n "${API_URL:-}"
test -n "${WEB_URL:-}"
curl --fail "$API_URL/health"
curl --fail "$WEB_URL/"
curl --fail "$WEB_URL/login"
curl --fail "$WEB_URL/register"
curl --fail "$WEB_URL/sprints"
```

Then manually verify:
- Register or use a deliberately created deployment account.
- Login returns a real JWT.
- Create/edit a sprint.
- Add/edit/complete an action item.
- Open retro, add a card/message/vote.
- Refresh/rejoin and verify persistence.
- Anonymous `/sprints` redirects to `/login`.
- Unknown route renders 404.

- [ ] **Step 9: Record only verified deployment outcome**

If smoke tests pass, add actual Render and Netlify URLs to README.

If deployment cannot proceed without credentials, state exactly which credentials are missing and that local/deployment configuration checks pass. Do not state that the product is deployed.

- [ ] **Step 10: Commit and make the final push**

```bash
git add README.md
git diff --cached --quiet || git commit -m "docs: record verified deployment status"
git push origin kp
git status --short --branch
```

Expected: clean `kp`, tracking `origin/kp`, with no unpushed commits.

**Final acceptance criteria:**
- All required product routes and modules work through real APIs.
- Mutating routes are protected; facilitator-only destructive operations return `403` for members.
- Action items use PostgreSQL; retro messages/cards/votes use MongoDB.
- `npm run check` and Compose validation pass.
- CI exists and is not described as green until observed.
- Live URLs are smoke-tested or deployment is accurately credential-blocked.
- `kp` is pushed to origin.
- No explanatory note was written.

**Analyzing auth setup**

I'm considering the authentication context, which seems clear since I don’t need to decode the real JWT. For Task 2, the `AuthController` response doesn’t include a token, and I note the password must have a minimum of 8 characters. I wonder if I could combine the `config/security.js` file instead of keeping separate files for auth and CORS. Maybe it makes sense to just use `config/cors.js` and implement constants in the middleware for auth?
**Considering final review format**

I think I need to include a plan coverage matrix in the final self-review section, but I can't use tables since the system doesn't support it unless specifically requested. The system indicates no Canvas subagent deployment is necessary. The user prefers markdown, so I’ll draft without a table. I should ensure to use the exact "SolHi style" header, specifically starting with "> **For agentic workers:** REQUIRED SUB-SKILL." I'll be careful not to add an extra header.