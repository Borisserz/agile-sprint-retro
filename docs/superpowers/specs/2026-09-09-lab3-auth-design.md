# Lab 3 Auth + RBAC + Change Password — Design

Date: 2026-09-09  
Branch: `lab23`  
Base: `lab22` (PostgreSQL + Sequelize sprints)

## Goal

JWT auth (register/login/profile) + bcrypt, protect routes, RBAC (member/facilitator) aligned with Agile theme, plus change-password.

## API

- `POST /auth/register` — email, password → 201 `{ id, email, role }`
- `POST /auth/login` — email, password → `{ token, user }`
- `POST /auth/change-password` — Bearer + oldPassword, newPassword → 200
- `GET /profile` — Bearer → `{ id, email, role }`
- `DELETE /sprints/:id` — Bearer + role `facilitator`

## Model User

email unique, passwordHash, role ENUM(member, facilitator) default member

## Middleware

authenticate (Bearer JWT), requireRole(...roles)

## Env

JWT_SECRET required
