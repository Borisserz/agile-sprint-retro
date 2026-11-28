// ПЗ1: страницы EJS. Данные берутся из массива в памяти.
const express = require('express');
const { pz1Auth } = require('../middleware/pz1Auth');
const { STATUS, listSprints, findSprint, addSprint } = require('../data/pz1Sprints');

const router = express.Router();

const LIMITS = {
  name: 80,
  goal: 200,
};

function clip(value, max) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.slice(0, max);
}

function parseSprintId(raw) {
  if (typeof raw !== 'string' || !/^[1-9]\d{0,5}$/.test(raw)) {
    return null;
  }
  return Number(raw);
}

function readForm(body) {
  const source = body && typeof body === 'object' ? body : {};
  const name = typeof source.name === 'string' ? source.name.trim() : '';
  const goal = typeof source.goal === 'string' ? source.goal.trim() : '';
  const capacityRaw = typeof source.capacity === 'string' ? source.capacity.trim() : '';
  const status = typeof source.status === 'string' ? source.status : '';
  const startDate = typeof source.startDate === 'string' ? source.startDate : '';
  const endDate = typeof source.endDate === 'string' ? source.endDate : '';
  const errors = [];

  if (!name) {
    errors.push('Укажите название спринта.');
  } else if (name.length > LIMITS.name) {
    errors.push(`Название длиннее ${LIMITS.name} символов.`);
  }

  if (!goal) {
    errors.push('Укажите цель спринта.');
  } else if (goal.length > LIMITS.goal) {
    errors.push(`Цель длиннее ${LIMITS.goal} символов.`);
  }

  if (!/^\d+$/.test(capacityRaw)) {
    errors.push('Ёмкость должна быть целым числом не меньше нуля.');
  }

  if (!Object.prototype.hasOwnProperty.call(STATUS, status)) {
    errors.push('Выберите статус спринта.');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    errors.push('Укажите дату начала.');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    errors.push('Укажите дату окончания.');
  }

  if (startDate && endDate && endDate < startDate) {
    errors.push('Дата окончания не может быть раньше даты начала.');
  }

  const values = {
    name: clip(typeof source.name === 'string' ? source.name : '', LIMITS.name),
    goal: clip(typeof source.goal === 'string' ? source.goal : '', LIMITS.goal),
    capacity: clip(capacityRaw, 6),
    status,
    startDate,
    endDate,
  };

  if (errors.length > 0) {
    return { errors, values };
  }

  return {
    values,
    sprint: {
      name,
      goal,
      capacity: Number(capacityRaw),
      status,
      startDate,
      endDate,
    },
  };
}

router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Вход',
    user: { name: 'Гость' },
  });
});

router.get('/', pz1Auth, (req, res) => {
  res.render('index', {
    title: 'Спринты',
    user: req.user,
    sprints: listSprints(),
  });
});

router.get('/item/:id', pz1Auth, (req, res, next) => {
  const sprintId = parseSprintId(req.params.id);
  const sprint = sprintId === null ? null : findSprint(sprintId);
  if (!sprint) {
    return next({ status: 404, message: 'Спринт с таким номером не найден.' });
  }
  res.render('item', {
    title: sprint.name,
    user: req.user,
    sprint,
  });
});

router.get('/add', pz1Auth, (req, res) => {
  res.render('add', {
    title: 'Добавить спринт',
    user: req.user,
    statuses: STATUS,
    limits: LIMITS,
  });
});

router.post('/add', pz1Auth, (req, res) => {
  const result = readForm(req.body);
  if (result.errors) {
    return res.status(400).render('add', {
      title: 'Добавить спринт',
      user: req.user,
      statuses: STATUS,
      limits: LIMITS,
      errors: result.errors,
      values: result.values,
    });
  }

  addSprint(result.sprint);
  res.redirect('/?auth=1');
});

module.exports = router;
