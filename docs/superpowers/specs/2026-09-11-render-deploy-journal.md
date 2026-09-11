# Деплой Render: журнал для пояснительной записки

Дата: 2026-09-11. Ветка: `kp`. Тема КП: вариант 49 — сервис спринтов и ретроспектив.

## Стек облака

| Компонент | Сервис | Назначение |
|-----------|--------|------------|
| Frontend (позже) | Netlify / Cloudflare Pages | React SPA |
| Backend API | Render Web Service `agile-sprint-retro-api` | Express + JWT + Socket.IO |
| PostgreSQL | Render Postgres `agile-sprint-retro-db` | Sequelize (спринты, users, action items) |
| MongoDB | MongoDB Atlas Cluster1 | ретро-чат и карточки (`MONGO_URI`) |

## Хронология деплоя (факты)

1. Создан Blueprint из `render.yaml` на ветке `kp`.
2. Первая сборка: Node 24 по умолчанию, `npm ci` успешен.
3. Старт: `npm run db:migrate && npm start` → **FAIL**:
   `ERROR: getaddrinfo ENOTFOUND dpg-dai14he1egvs73do3ob0-a`
4. Причина: Web Service в регионе **Frankfurt**, Postgres в регионе **Oregon**.
   Internal hostname (`dpg-…-a` без суффикса `.….render.com`) резолвится только
   внутри **того же** региона Render Private Network.
5. В `render.yaml` добавлены `region: frankfurt` для БД и `NODE_VERSION=20`.
   Коммит `98370fb`. Повторный деплой снова FAIL: уже созданная БД **осталась в Oregon**;
   Blueprint не переносит существующую БД в другой регион.
6. Рабочий обход: вручную подставить **External Database URL** в `DATABASE_URL`
   сервиса API + `DATABASE_SSL=true`, затем Manual Deploy.

## Что писать в записке (§2.4 развёртывание)

- Описать Blueprint: web + managed Postgres + секреты `MONGO_URI`, `CORS_ORIGINS`.
- Указать проблему несовпадения регионов и различие Internal / External URL.
- Привести фрагмент лога с `ENOTFOUND` и решение (External URL / выравнивание региона).
- Указать Node 20 через `NODE_VERSION` (требование Vite 8 / стека курса).
- Не публиковать пароли Atlas и полный `DATABASE_URL` с credentials — только маскированные примеры.

## Чеклист после успешного Live

- [ ] `GET https://<api>.onrender.com/health` → `{"ok":true}`
- [ ] Netlify: `VITE_API_URL=<api-url>`
- [ ] Render: `CORS_ORIGINS=https://<site>.netlify.app`
- [ ] Скрин Deploys Live + health + Atlas (без секретов)
- [ ] URL зафиксировать в README только после smoke-теста

## Команды локально (для сравнения в записке)

```bash
docker compose up --build
curl http://localhost:3000/health
```
