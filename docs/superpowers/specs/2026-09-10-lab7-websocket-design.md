# Lab 7 — WebSocket Retro Board (design)

**Branch:** `27` (as required by СЭО; not `lab27`)  
**Theme:** Agile sprint / retrospective planning service  
**Approved extras:** **A** room chat + **C** live dot-voting on retro cards  
**Date:** 2026-09-10

## Goal

Real-time retrospective room per sprint: presence, chat (with Mongo history), typing, and live votes — Socket.IO server + React client.

## Architecture

1. Switch Express boot to `http.createServer(app)` and attach `socket.io` with CORS for the Vite origin.
2. Auth on handshake: JWT from `handshake.auth.token` (same secret as REST). Reject unauthenticated sockets.
3. Room key: `retro:{sprintId}` (PG sprint id from the board).
4. On `retro:join`: `socket.join(room)`, broadcast presence, send chat history + current card votes.
5. Events (server ↔ client):
   - `retro:join` / `retro:leave`
   - `retro:presence` — `{ users: [{ id, email, role, socketId }] }`
   - `user:joined` / `user:left` — system notices for UI
   - `retro:message` — chat text
   - `retro:typing` — `{ email, isTyping }`
   - `retro:vote` — `{ cardId, delta: +1|-1 }` → broadcast tallies
6. Persist chat messages in Mongo (`RetroMessage`). Votes held in memory per room (and mirrored to clients); optional seed cards if room empty.
7. UI: `RetroBoard` panel opened from a sprint row; two-column layout — cards+votes | chat+presence. Extend existing cobalt desk tokens (no new purple/cream theme).

## Non-goals

- Replacing REST sprint CRUD
- Redis multi-server scale
- Private DMs (can answer in report theory)
- Control questions in PDF (standing lab report rule)

## Success criteria

- Two browser sessions (facilitator + member) in same sprint room see messages, join/leave, typing, and vote counts update live
- README documents how to run and demo
- Code on GitHub branch `27`
