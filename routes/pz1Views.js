// ПЗ1: маршруты EJS
const express = require('express');
const { pz1Auth } = require('../middleware/pz1Auth');
const { listSprints, findSprint, addSprint } = require('../data/pz1Sprints');

const router = express.Router();

router.get('/login', (req, res) => {
  req.user = { name: 'Гость' };
  res.render('login', { title: 'Вход', user: req.user });
});

router.get('/', pz1Auth, (req, res) => {
  res.render('index', {
    title: 'Спринты',
    user: req.user,
    sprints: listSprints(),
  });
});

router.get('/item/:id', pz1Auth, (req, res, next) => {
  const sprint = findSprint(req.params.id);
  if (!sprint) {
    return next({ status: 404, message: 'Sprint not found' });
  }
  res.render('item', { title: sprint.name, user: req.user, sprint });
});

router.get('/add', pz1Auth, (req, res) => {
  res.render('add', { title: 'Добавить', user: req.user });
});

router.post('/add', pz1Auth, (req, res) => {
  const name = String(req.body.name || '').trim();
  const goal = String(req.body.goal || '').trim();
  const status = String(req.body.status || 'planned').trim();

  if (!name || !goal) {
    return res.status(400).render('add', {
      title: 'Добавить',
      user: req.user,
      error: 'Укажите название и цель',
    });
  }

  addSprint({ name, goal, status });
  res.redirect('/?auth=1');
});

module.exports = router;
