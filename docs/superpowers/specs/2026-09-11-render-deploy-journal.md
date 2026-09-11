# Развёртывание веб-приложения (материалы к §2.4 пояснительной записки)

Дата фиксации: 2026-09-11. Ветка продукта: `kp`. Вариант темы: 49.

## Цель этапа

Развернуть серверную часть приложения в облаке так, чтобы API был доступен по HTTPS,
подключался к PostgreSQL и MongoDB, выполнял миграции схемы и отвечал на проверку здоровья.

## Выбранные сервисы и назначение

| Компонент | Платформа | Назначение в архитектуре |
|-----------|-----------|--------------------------|
| Backend (Node.js / Express) | Render — Web Service | REST API, JWT, Socket.IO |
| Реляционная БД | Render — PostgreSQL | пользователи, спринты, action items (Sequelize) |
| Документная БД | MongoDB Atlas | сообщения и карточки ретроспективы (Mongoose) |
| Frontend (React) | Netlify (следующий шаг) | SPA, переменная `VITE_API_URL` |

Обоснование: связка Render + Atlas соответствует рекомендациям методических материалов
по доступным бесплатным (или условно-бесплатным) сервисам для деплоя учебного веб-приложения;
единый язык JavaScript на клиенте и сервере упрощает сопровождение.

## Порядок работ на Render

1. Подключение репозитория GitHub `Borisserz/agile-sprint-retro`, ветка `kp`.
2. Создание инфраструктуры по файлу `render.yaml` (Blueprint): Web Service и PostgreSQL.
3. Задание переменных окружения сервиса API:
   - `NODE_VERSION=20` — версия Node, совместимая со стеком курса и Vite 8;
   - `NODE_ENV=production`;
   - `DATABASE_URL` — строка подключения к PostgreSQL Render;
   - `DATABASE_SSL=true` — SSL для облачного Postgres;
   - `JWT_SECRET`, `JWT_EXPIRES_IN` — параметры аутентификации;
   - `MONGO_URI` — строка подключения к кластеру Atlas;
   - `CORS_ORIGINS` — разрешённые origins фронтенда.
4. Команда сборки: `npm ci`.
5. Команда запуска: `npm run db:migrate && npm start` (миграция схемы, затем HTTP-сервер).
6. Health check: путь `/health`.

## Настройка PostgreSQL

Для связи API с управляемой БД Render используется строка подключения из панели
базы данных (раздел Connect). В окружении сервиса задаётся `DATABASE_URL` и включается
`DATABASE_SSL=true`. После этого Sequelize CLI в режиме `production` применяет миграции
к облачной схеме (`No migrations were executed, database schema was already up to date`
при повторном запуске означает согласованность схемы).

## Настройка MongoDB Atlas

1. Создан кластер Atlas (Cluster1), пользователь БД и строка `mongodb+srv://…`.
2. В Network Access добавлен доступ для облачного backend: правило **Allow Access from Anywhere**
   (`0.0.0.0/0`), так как исходящий IP Render Free Instance не фиксирован.
3. В Environment сервиса Render задан `MONGO_URI` с именем БД `agile_sprint_retro`.

## Фиксация версии Node.js

В окружении сервиса указано `NODE_VERSION=20`. При деплое Render устанавливает
Node.js 20.x (в журнале: «Using Node.js version 20.20.2 via environment variable NODE_VERSION»),
что соответствует требованиям зависимостей проекта.

## Результат этапа (заполнить после Live)

- URL API: `https://________________.onrender.com`
- Проверка: `GET /health` → `{"ok":true}`
- Далее: деплой клиента на Netlify с `VITE_API_URL=<URL API>` и обновление `CORS_ORIGINS`.

## Что не включать в текст записки

Пароли, полные connection string с секретами, скриншоты Environment с открытыми ключами.
В листингах — маскирование (`postgresql://agile:***@…`, `mongodb+srv://user:***@…`).
