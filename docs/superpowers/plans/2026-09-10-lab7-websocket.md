# Lab 7 WebSocket Retro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Socket.IO retro room per sprint — chat, presence, typing, live votes — on branch `27`.

**Architecture:** `http.Server` + Socket.IO; JWT handshake; rooms `retro:{sprintId}`; Mongo chat history; React `RetroBoard` in existing client theme.

**Tech Stack:** Node, Express, socket.io, mongoose, React, socket.io-client, JWT

## Global Constraints

- Branch name exactly `27`
- No emoji in code/UI/commits
- No AI-slop comments; match existing style
- Keep PG `/sprints` and Mongo `/mongo/sprints` working
- Extend existing CSS tokens (cobalt desk), do not restyle whole app
- Report later: no control questions (user standing rule)

## File map

| File | Role |
|------|------|
| `server.js` | `http.createServer`, attach sockets |
| `socket/index.js` | create IO, auth middleware, wire handlers |
| `socket/retroHandlers.js` | join/leave/message/typing/vote/presence |
| `socket/roomState.js` | in-memory presence + vote tallies per room |
| `models/mongo/RetroMessage.js` | chat history schema |
| `tests/socket-retro.test.js` | node:test smoke for join + message |
| `client/src/socket.js` | singleton client factory |
| `client/src/components/RetroBoard.jsx` | UI |
| `client/src/App.css` | retro panel styles |
| `client/src/components/SprintList.jsx` | open/close retro |
| `README.md` | run + demo steps |
| `package.json` / `client/package.json` | deps + test script |

---

### Task 1: Branch + deps + failing test scaffold

- [ ] Create branch `27` from `lab26`
- [ ] `npm install socket.io`; `cd client && npm install socket.io-client`
- [ ] Add `node:test` script targeting `tests/socket-retro.test.js`
- [ ] Write failing test: connect with JWT, join room, emit message, expect receive
- [ ] Run test — expect fail (no socket yet)

### Task 2: HTTP server + Socket.IO auth

- [ ] Refactor `server.js` to `http.createServer(app)` then `listen`
- [ ] Implement `socket/index.js` with JWT verify from `handshake.auth.token`
- [ ] Export `attachSockets(server)`
- [ ] Minimal GREEN so test can connect (even if handlers stub)

### Task 3: Room handlers + Mongo history

- [ ] `RetroMessage` model
- [ ] `roomState.js` presence + votes + default cards
- [ ] `retroHandlers.js` full events
- [ ] Test passes for join + broadcast message + history

### Task 4: React RetroBoard

- [ ] `socket.js` connecting with token
- [ ] `RetroBoard.jsx`: columns, votes, chat, presence, typing
- [ ] Wire from SprintList; styles in App.css
- [ ] Manual: two windows same sprint

### Task 5: README + verify

- [ ] Document branch `27`, env, two-user demo
- [ ] Curl/node test green; server starts clean
- [ ] Push when user asks
