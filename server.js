require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const sprintsRouter = require('./routes/sprints');
const authRouter = require('./routes/auth');
const authController = require('./controllers/authController');
const { authenticate } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'QUERY', 'OPTIONS'],
  }),
);
app.use(express.json());
app.use('/auth', authRouter);
app.get('/profile', authenticate, authController.profile);
app.use('/sprints', sprintsRouter);
app.use((req, res, next) => {
  next({ status: 404, message: 'Not found' });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

async function start() {
  await sequelize.authenticate();
  const server = app.listen(port, () => {
    console.log('Server running...');
  });
  server.on('error', (err) => {
    console.error('Unable to start server:', err.message);
    process.exit(1);
  });
}

start().catch((err) => {
  console.error('Unable to connect to the database:', err.message);
  process.exit(1);
});
