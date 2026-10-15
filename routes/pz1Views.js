// ПЗ1: маршруты EJS
const fs = require('fs');
const path = require('path');
const express = require('express');
const { pz1Auth } = require('../middleware/pz1Auth');
const { listSprints, findSprint, addSprint } = require('../data/pz1Sprints');

const router = express.Router();
const constraintsPath = path.join(__dirname, '..', 'config', 'pz1Constraints.json');
const constraints = JSON.parse(fs.readFileSync(constraintsPath, 'utf8'));

function validateSprintBody(body) {
  const name = String(body.name || '').trim();
  const goal = String(body.goal || '').trim();
  const capacityRaw = String(body.capacity ?? '').trim();

  if (!name || !goal || capacityRaw === '') {
    return { error: 'Все поля обязательны' };
  }

  if (name.length < constraints.name.minLength || name.length > constraints.name.maxLength) {
    return {
      error: `Название: от ${constraints.name.minLength} до ${constraints.name.maxLength} символов`,
    };
  }

  if (goal.length < constraints.goal.minLength || goal.length > constraints.goal.maxLength) {
    return {
      error: `Цель: от ${constraints.goal.minLength} до ${constraints.goal.maxLength} символов`,
    };
  }

  const capacity = Number(capacityRaw);
  if (!Number.isFinite(capacity) || capacity < constraints.capacity.min || capacity > constraints.capacity.max) {
    return {
      error: `Ёмкость: число от ${constraints.capacity.min} до ${constraints.capacity.max}`,
    };
  }

  return { name, goal, capacity };
}

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
  res.render('add', {
    title: 'Добавить',
    user: req.user,
    constraints,
  });
});

router.post('/add', pz1Auth, (req, res) => {
  const result = validateSprintBody(req.body);
  if (result.error) {
    return res.status(400).render('add', {
      title: 'Добавить',
      user: req.user,
      error: result.error,
      constraints,
    });
  }

  addSprint(result);
  res.redirect('/?auth=1');
});

// ПЗ1: демонстрация страницы 500.ejs (не чёрный экран Express)
router.get('/demo-500', pz1Auth, (req, res, next) => {
  next({ status: 500, message: 'Демонстрация ошибки сервера' });
});

module.exports = router;
