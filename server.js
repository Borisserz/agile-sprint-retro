require('dotenv').config({ quiet: true });

const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const { connectMongo } = require('./config/mongo');
const sprintsRouter = require('./routes/sprints');
const mongoSprintsRouter = require('./routes/mongoSprints');
const authRouter = require('./routes/auth');
const authController = require('./controllers/authController');
const { authenticate } = require('./middleware/auth');
const { attachSockets } = require('./socket');
// ПЗ1: middleware и SSR-роуты (EJS)
const { pz1Logger } = require('./middleware/pz1Logger');
const pz1ViewsRouter = require('./routes/pz1Views');

const app = express();
const port = process.env.PORT || 3000;

function isApiPath(reqPath) {
  return (
    reqPath.startsWith('/auth') ||
    reqPath.startsWith('/sprints') ||
    reqPath.startsWith('/mongo') ||
    reqPath.startsWith('/health') ||
    reqPath.startsWith('/profile') ||
    reqPath.startsWith('/socket.io')
  );
}

app.use(
  cors({
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'QUERY', 'OPTIONS'],
  }),
);
app.use(express.json());
// ПЗ1: разбор полей HTML-форм (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// ПЗ1: логирование всех запросов
app.use(pz1Logger);

// ПЗ1: шаблонизатор EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);
app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});
app.get('/profile', authenticate, authController.profile);
app.use('/sprints', sprintsRouter);
app.use('/mongo/sprints', mongoSprintsRouter);

// ПЗ1: страницы EJS (/, /item/:id, /add, /login)
app.use(pz1ViewsRouter);

// ПЗ1: 404 — для API JSON, для страниц EJS
app.use((req, res, next) => {
  next({ status: 404, message: 'Not found' });
});

// ПЗ1: обработка ошибок (включая 500 → 500.ejs)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  const user = req.user || { name: 'Гость' };

  if (status >= 500) {
    console.error('[ПЗ1] server error:', err);
  }

  if (isApiPath(req.path)) {
    return res.status(status).json({ error: message });
  }

  if (status === 404) {
    return res.status(404).render('404', { title: '404', user, message });
  }

  return res.status(status).render('500', { title: '500', user, message });
});

async function start() {
  await sequelize.authenticate();
  await connectMongo();

  const server = http.createServer(app);
  attachSockets(server);

  server.listen(port, () => {
    console.log('Server running...');
    // ПЗ1: подсказка для демо SSR
    console.log('ПЗ1 EJS: http://localhost:' + port + '/?auth=1');
  });
  server.on('error', (err) => {
    console.error('Unable to start server:', err.message);
    process.exit(1);
  });
}

if (require.main === module) {
  start().catch((err) => {
    console.error('Unable to connect to the database:', err.message);
    process.exit(1);
  });
}

module.exports = { app, start };
