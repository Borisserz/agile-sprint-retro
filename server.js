const path = require('path');
const express = require('express');
const { pz1Logger } = require('./middleware/pz1Logger');
const pz1ViewsRouter = require('./routes/pz1Views');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(pz1Logger);
app.use(pz1ViewsRouter);

app.use((req, res, next) => {
  next({ status: 404, message: 'Страница не найдена.' });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const user = req.user || { name: 'Гость' };

  if (status >= 500) {
    console.error(err);
  }

  if (res.headersSent) {
    return next(err);
  }

  const view = status === 404 ? '404' : '500';
  const message = status === 404
    ? (err.message || 'Страница не найдена.')
    : 'Ошибка сервера. Запрос не выполнен.';

  res.status(status).render(view, {
    title: String(status),
    user,
    message,
  });
});

app.listen(port, () => {
  console.log('Server running...');
  console.log('ПЗ1: http://localhost:' + port + '/?auth=1');
});
