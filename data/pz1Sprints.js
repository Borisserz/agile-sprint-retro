// ПЗ1: массив в памяти (без БД)
let nextId = 3;

const sprints = [
  {
    id: 1,
    name: 'Sprint 1',
    goal: 'Plan backlog',
    capacity: 20,
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 2,
    name: 'Sprint 2',
    goal: 'Ship JWT auth',
    capacity: 30,
    createdAt: '2026-09-15T12:30:00.000Z',
  },
];

function listSprints() {
  return sprints;
}

function findSprint(id) {
  return sprints.find((item) => item.id === Number(id));
}

function addSprint({ name, goal, capacity }) {
  const sprint = {
    id: nextId,
    name,
    goal,
    capacity,
    createdAt: new Date().toISOString(),
  };
  nextId += 1;
  sprints.push(sprint);
  return sprint;
}

module.exports = { listSprints, findSprint, addSprint };
