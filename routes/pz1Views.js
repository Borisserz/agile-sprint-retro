// ПЗ1: SSR-маршруты EJS (список / деталь / форма / login)
const express = require('express');
const { pz1Auth } = require('../middleware/pz1Auth');
const { listSprints, findSprint, addSprint } = require('../data/pz1Sprints');

const router = express.Router();

router.use(pz1Auth);

router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Вход (ПЗ1)',
    user: req.user,
  });
});

router.get('/', (req, res) => {
  res.render('index', {
    title: 'Спринты',
    user: req.user,
    sprints: listSprints(),
  });
});

router.get('/item/:id', (req, res, next) => {
  const sprint = findSprint(req.params.id);
  if (!sprint) {
    return next({ status: 404, message: 'Sprint not found' });
  }
  res.render('item', {
    title: sprint.name,
    user: req.user,
    sprint,
  });
});

router.get('/add', (req, res) => {
  res.render('add', {
    title: 'Добавить спринт',
    user: req.user,
  });
});

router.post('/add', (req, res) => {
  const name = String(req.body.name || '').trim();
  const goal = String(req.body.goal || '').trim();
  const status = String(req.body.status || 'planned').trim();

  if (!name || !goal) {
    return res.status(400).render('add', {
      title: 'Добавить спринт',
      user: req.user,
      error: 'Укажите название и цель спринта',
    });
  }

  addSprint({ name, goal, status });
  // после POST возвращаемся к списку с тем же ?auth=1
  res.redirect('/?auth=1');
});

module.exports = router;
