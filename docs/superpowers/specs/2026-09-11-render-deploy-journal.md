# Развёртывание веб-приложения (материалы к §2.4 пояснительной записки)

Дата фиксации: 2026-09-11. Ветка продукта: `kp`. Репозиторий: `https://github.com/Borisserz/agile-sprint-retro`. Вариант темы: 49.

Текст ниже рассчитан на перенос в пояснительную записку: пошаговое описание действий в панелях облачных сервисов, назначение каждой настройки и фрагменты журналов сборки/запуска. Секреты в листингах маскируются.

## Цель этапа

Развернуть серверную и клиентскую части приложения в облаке так, чтобы:

- API был доступен по HTTPS;
- PostgreSQL хранил пользователей, спринты и action items;
- MongoDB Atlas хранил сообщения и карточки ретроспективы;
- React-клиент обращался к облачному API через переменную сборки `VITE_API_URL`.

## Выбранные сервисы и назначение

| Компонент | Платформа | Назначение |
|-----------|-----------|------------|
| Backend (Node.js / Express) | Render — Web Service | REST API, JWT, Socket.IO |
| Реляционная БД | Render — PostgreSQL | Sequelize, миграции |
| Документная БД | MongoDB Atlas | Mongoose (чат и карточки ретро) |
| Frontend (React / Vite) | Netlify | статическая SPA из каталога `client/dist` |

Обоснование выбора: доступные учебные тарифы, HTTPS из коробки, интеграция с GitHub (автосборка по ветке `kp`), разделение backend и frontend по рекомендациям методических материалов.

Конфигурация инфраструктуры в репозитории: `render.yaml` (Blueprint Render), `netlify.toml` (база `client`, публикация `dist`, SPA-редирект).

---

## 1. Подготовка репозитория и ветки

1. Открыт GitHub: репозиторий `Borisserz/agile-sprint-retro`.
2. Для облачного деплоя выбрана ветка продукта `kp` (полный стек: Express, Sequelize, Mongoose, React Router, Socket.IO).
3. В корне репозитория проверены файлы деплоя: `render.yaml`, `netlify.toml`, раздел Deploy в `README.md`.

---

## 2. Создание кластера MongoDB Atlas

1. Вход на `https://cloud.mongodb.com`, организация проекта (Project 0).
2. Раздел **Database** → создание кластера (Cluster1) в облаке Atlas.
3. Раздел **Database Access** → пользователь БД с правами чтения/записи, пароль сохранён локально для строки подключения.
4. Кнопка **Connect** → тип подключения Drivers → скопирована строка вида  
   `mongodb+srv://<user>:***@cluster0.<id>.mongodb.net/agile_sprint_retro`.
5. Раздел **Network Access** → вкладка **IP Access List** → **Add IP Address**.
6. Для доступа облачного backend (Render Free Instance с динамическим исходящим IP) добавлено правило **Allow Access from Anywhere** (`0.0.0.0/0`) с комментарием о назначении для production API.
7. Статус правил в списке — Active.

Назначение: Atlas используется как облачный MongoDB; локальный Docker Mongo остаётся для разработки, в production приложение читает `MONGO_URI`.

---

## 3. Развёртывание backend на Render

### 3.1. Создание сервиса

1. Вход на `https://dashboard.render.com`.
2. Создание Web Service (или применение Blueprint по `render.yaml`) с привязкой к GitHub-репозиторию `agile-sprint-retro`.
3. Указана ветка `kp`.
4. Создана управляемая база PostgreSQL Render (сервис БД в панели Dashboard).
5. Имя Web Service: `agile-sprint-retro-api`.

### 3.2. Переменные окружения (Manage → Environment)

В панели сервиса открыт раздел **Environment**, заданы ключи:

| Ключ | Назначение | Пример значения (без секретов) |
|------|------------|--------------------------------|
| `NODE_VERSION` | версия Node при сборке и runtime | `20` |
| `NODE_ENV` | режим production | `production` |
| `DATABASE_URL` | подключение Sequelize к Postgres Render | `postgresql://agile:***@dpg-….oregon-postgres.render.com/agile_sprint_retro` |
| `DATABASE_SSL` | SSL к облачному Postgres | `true` |
| `MONGO_URI` | подключение Mongoose к Atlas | `mongodb+srv://…/agile_sprint_retro` |
| `JWT_SECRET` | подпись access-токенов | случайная строка (не в записке) |
| `JWT_EXPIRES_IN` | срок жизни JWT | `1h` |
| `CORS_ORIGINS` | разрешённые origins браузера | сначала localhost; после Netlify — URL сайта |

Источник `DATABASE_URL`: панель PostgreSQL → **Connect** → External Database URL (для связи Web Service с инстансом БД по публичному hostname с SSL).

После заполнения нажата кнопка **Save, rebuild, and deploy**.

### 3.3. Команды сборки и запуска

В настройках сервиса:

- **Build Command:** `npm ci`
- **Start Command:** `npm run db:migrate && npm start`
- **Health Check Path:** `/health`

Назначение start-команды: перед приёмом HTTP Sequelize CLI применяет миграции схемы в режиме `production`, затем запускается `node server.js`.

### 3.4. Журнал успешного деплоя (фрагмент)

Коммит ветки `kp` (пример из журнала Render): `f9f2ce4934f1a0c48e9b144fcd84f84c72a27337`.

```text
==> Cloning from https://github.com/Borisserz/agile-sprint-retro
==> Checking out commit f9f2ce4… in branch kp
==> Requesting Node.js version 20
==> Using Node.js version 20.20.2 via environment variable NODE_VERSION
==> Installing Node.js version 20.20.2...
==> Running build command 'npm ci'...
added 158 packages, and audited 159 packages in 2s
==> Uploading build...
==> Build successful
==> Deploying...
==> Setting WEB_CONCURRENCY=1 by default, based on available CPUs in the instance
==> Running 'npm run db:migrate && npm start'
> agile-sprint-retro@1.0.0 db:migrate
> npx sequelize-cli db:migrate
Sequelize CLI [Node: 20.20.2, CLI: 6.6.5, ORM: 6.37.8]
Loaded configuration file "config/config.js".
Using environment "production".
No migrations were executed, database schema was already up to date.
> agile-sprint-retro@1.0.0 start
> node server.js
MongoDB connected
Server running...
==> Your service is live
==> Available at your primary URL https://agile-sprint-retro-api.onrender.com
```

Пояснения к строкам журнала для записки:

- `NODE_VERSION` / `20.20.2` — зафиксирована версия runtime, совместимая со стеком курса;
- `npm ci` — воспроизводимая установка зависимостей по `package-lock.json`;
- `Using environment "production"` — Sequelize читает `config/config.js` и `DATABASE_URL`;
- `database schema was already up to date` — схема Postgres согласована с миграциями репозитория;
- `MongoDB connected` — Mongoose установил сессию с Atlas по `MONGO_URI`;
- `Your service is live` — процесс слушает порт, назначенный платформой.

### 3.5. Проверка API

Первичный URL:

`https://agile-sprint-retro-api.onrender.com`

Проверка здоровья:

`GET https://agile-sprint-retro-api.onrender.com/health` → ожидаемый ответ `{"ok":true}`.

---

## 4. Развёртывание frontend на Netlify

### 4.1. Создание сайта из GitHub

1. Вход на `https://app.netlify.com`.
2. **Add new site** → **Import an existing project** → GitHub → репозиторий `agile-sprint-retro`.
3. Экран **Review configuration**:
   - Team: команда владельца аккаунта;
   - Project name: например `agile-sprint-retro` (или имя по умолчанию Netlify);
   - **Branch to deploy:** `kp`;
   - **Base directory:** `client` (каталог Vite-приложения; соответствует `netlify.toml`);
   - **Build command:** `npm ci && npm run build`;
   - **Publish directory:** `dist` (относительно base → артефакт `client/dist`).

Файл `netlify.toml` в корне репозитория дополнительно задаёт `NODE_VERSION=20` и SPA-редирект `/* → /index.html` (status 200) для React Router.

### 4.2. Переменная окружения сборки

До нажатия Deploy:

1. Раздел **Environment variables** → **Add environment variables**.
2. Ключ: `VITE_API_URL`.
3. Значение: `https://agile-sprint-retro-api.onrender.com` (без завершающего `/`).
4. Scope: Builds (переменная должна быть доступна на этапе `vite build`).

Назначение: axios и Socket.IO в `client/src` читают `import.meta.env.VITE_API_URL`; без неё клиент остался бы на `http://localhost:3000`.

### 4.3. Запуск деплоя

Кнопка **Deploy agile-sprint-retro** (или аналог с именем проекта).  
После успеха в панели сайта фиксируется публичный HTTPS URL вида `https://<site>.netlify.app`.

### 4.4. Связка CORS на Render после появления URL Netlify

1. Render → `agile-sprint-retro-api` → **Environment**.
2. Обновление `CORS_ORIGINS`:  
   `https://<site>.netlify.app`  
   (при необходимости через запятую оставить и локальные origins для отладки).
3. **Save, rebuild, and deploy** API, чтобы allowlist применился в runtime.

---

## 5. Сводный результат облачного контура

| Роль | URL / ресурс |
|------|----------------|
| API | `https://agile-sprint-retro-api.onrender.com` |
| Health | `https://agile-sprint-retro-api.onrender.com/health` |
| Frontend | `https://agile-sprint-retro.netlify.app` |
| Postgres | Render PostgreSQL, SSL, миграции Sequelize |
| MongoDB | Atlas Cluster1, Network Access для облачного API |

Сценарий ручной проверки после полного деплоя: регистрация / вход → список спринтов → поиск и фильтр по статусу → action items → комната ретроспективы (чат и карточки).

Поиск и фильтр на клиенте вызывают `GET /sprints?search=…&status=…` (параметры query). Метод HTTP `QUERY` сохранён на API для лабораторной демонстрации; в облаке через CDN браузерный `QUERY` недоступен, поэтому production-клиент использует GET.

---

## Что не включать в текст пояснительной записки

Пароли, полные connection string с секретами, скриншоты панели Environment с открытыми ключами и JWT.  
В листингах — маскирование: `postgresql://agile:***@…`, `mongodb+srv://user:***@…`.
