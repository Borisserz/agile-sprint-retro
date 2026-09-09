const express = require('express');
const sprintsRouter = require('./routes/sprints');

const app = express();
const port = 3000;

app.use(express.json());
app.use('/sprints', sprintsRouter);

app.use((req, res, next) => {
  next({ status: 404, message: 'Not found' });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

app.listen(port, () => {
  console.log('Server running...');
});
