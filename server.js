require('dotenv').config({ quiet: true });

const path = require('path');
const express = require('express');
const { sequelize } = require('./models');
const sprintsRouter = require('./routes/sprints');
const authRouter = require('./routes/auth');
const authController = require('./controllers/authController');
const { authenticate } = require('./middleware/auth');
const { pz1Logger } = require('./middleware/pz1Logger');
const pz1ViewsRouter = require('./routes/pz1Views');

const app = express();
const port = process.env.PORT || 3000;

function isApiPath(reqPath) {
  return (
    reqPath.startsWith('/auth') ||
    reqPath.startsWith('/sprints') ||
    reqPath.startsWith('/profile')
  );
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pz1Logger);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);
app.get('/profile', authenticate, authController.profile);
app.use('/sprints', sprintsRouter);
app.use(pz1ViewsRouter);

app.use((req, res, next) => {
  next({ status: 404, message: 'Not found' });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  const user = req.user || { name: 'Гость' };

  if (status >= 500) {
    console.error(err);
  }

  if (isApiPath(req.path)) {
    return res.status(status).json({ error: message });
  }

  const view = status === 404 ? '404' : '500';
  return res.status(status).render(view, {
    title: String(status),
    user,
    message,
  });
});

async function start() {
  await sequelize.authenticate();
  app.listen(port, () => {
    console.log('Server running...');
    console.log('ПЗ1: http://localhost:' + port + '/?auth=1');
  });
}

start().catch((err) => {
  console.error('Unable to connect to the database:', err.message);
  process.exit(1);
});
