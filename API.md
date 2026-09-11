# API.md — Практическое занятие №2 (ветка `pz22`)

Предметная область: планирование спринтов и ретроспектив в Agile-командах.  
Хранилище: **массивы в памяти** (префикс `/api/*`). Лабораторные маршруты `/sprints`, `/auth` не затронуты.

Базовый URL: `http://localhost:3000`

## Ресурсы

1. `sprints` — спринт  
2. `action-items` — пункт действий  
3. `retrospectives` — ретроспектива  

Для каждого: `GET` список, `GET :id`, `POST`, `PUT` (полная замена), `PATCH` (частично), `DELETE` → **204**.

Общие ошибки: `400` `{ "error": "..." }`, `404` `{ "error": "Not found" }`.

---

## 1. Sprints — `/api/sprints`

### GET `/api/sprints`

Доп. фильтр: `?status=planned|active|done`

Ответ `200`:

```json
[
  { "id": 1, "name": "Sprint 1", "goal": "Ship backlog board", "status": "done", "capacity": 30 }
]
```

### GET `/api/sprints/:id`

Ответ `200` — объект спринта. `404` если нет.

### POST `/api/sprints`

Тело:

```json
{ "name": "Sprint 3", "goal": "Auth roles", "status": "planned", "capacity": 45 }
```

Ответ `201` — созданный объект. `400` если нет `name`/`goal` или неверный `status`/`capacity`.

### PUT `/api/sprints/:id`

Полная замена теми же полями, что у POST. `200` / `400` / `404`.

### PATCH `/api/sprints/:id`

Частичное обновление (любой набор полей). Пример:

```json
{ "status": "active" }
```

### DELETE `/api/sprints/:id`

Ответ `204` без тела. `404` если нет.

---

## 2. Action items — `/api/action-items`

### GET `/api/action-items`

Фильтр: `?sprintId=2`

### GET `/api/action-items/:id`

### POST `/api/action-items`

```json
{ "sprintId": 2, "title": "Prepare retro board", "done": false }
```

`201`. Обязательны `title`, `sprintId` (целое ≥ 1).

### PUT / PATCH / DELETE

Как у спринтов. PATCH может менять `title`, `sprintId`, `done`.

---

## 3. Retrospectives — `/api/retrospectives`

### GET `/api/retrospectives`

Фильтр: `?sprintId=1`

### GET `/api/retrospectives/:id`

### POST `/api/retrospectives`

```json
{ "sprintId": 2, "summary": "Need clearer DoD", "date": "2026-09-11" }
```

`date` в формате `YYYY-MM-DD`. `201` / `400` / `404` на остальных методах по тем же правилам.

### PUT / PATCH / DELETE

Аналогично.

---

## Примеры для Postman

1. `GET http://localhost:3000/api/sprints`  
2. `GET http://localhost:3000/api/sprints?status=active`  
3. `POST http://localhost:3000/api/sprints` + JSON тело  
4. `PATCH http://localhost:3000/api/sprints/2` + `{ "capacity": 50 }`  
5. `DELETE http://localhost:3000/api/action-items/1` → 204  

Запуск: `npm run dev` (нужны БД лабораторных работ для старта `server.js`; сами `/api/*` БД не используют).
