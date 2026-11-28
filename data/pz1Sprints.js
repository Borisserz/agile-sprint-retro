// ПЗ1: массив в памяти. Поля совпадают с моделью Sprint лабораторных работ №2–3.
const STATUS = {
  planned: 'Запланирован',
  active: 'Активный',
  done: 'Завершён',
};

let nextId = 4;

const sprints = [
  {
    id: 1,
    name: 'Sprint 1',
    goal: 'Доска бэклога',
    startDate: '2026-09-01',
    endDate: '2026-09-14',
    status: 'done',
    capacity: 30,
  },
  {
    id: 2,
    name: 'Sprint 2',
    goal: 'Заметки ретроспективы и задачи',
    startDate: '2026-09-15',
    endDate: '2026-09-28',
    status: 'done',
    capacity: 35,
  },
  {
    id: 3,
    name: 'Sprint 3',
    goal: 'Модели спринта и пунктов действий',
    startDate: '2026-10-01',
    endDate: '2026-10-14',
    status: 'active',
    capacity: 40,
  },
];

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
}

function presentSprint(sprint) {
  return {
    ...sprint,
    statusLabel: STATUS[sprint.status],
    startLabel: formatDate(sprint.startDate),
    endLabel: formatDate(sprint.endDate),
  };
}

function listSprints() {
  return sprints.map(presentSprint);
}

function findSprint(id) {
  const sprint = sprints.find((item) => item.id === id);
  return sprint ? presentSprint(sprint) : null;
}

function addSprint(fields) {
  const sprint = { id: nextId, ...fields };
  nextId += 1;
  sprints.push(sprint);
  return presentSprint(sprint);
}

module.exports = {
  STATUS,
  listSprints,
  findSprint,
  addSprint,
};
