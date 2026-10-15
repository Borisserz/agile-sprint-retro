// ПЗ1: массив в памяти (без БД)
let nextId = 3;

const sprints = [
  { id: 1, name: 'Sprint 1', goal: 'Plan backlog', status: 'done' },
  { id: 2, name: 'Sprint 2', goal: 'Ship JWT auth', status: 'active' },
];

function listSprints() {
  return sprints;
}

function findSprint(id) {
  return sprints.find((item) => item.id === Number(id));
}

function addSprint({ name, goal, status }) {
  const sprint = { id: nextId, name, goal, status: status || 'planned' };
  nextId += 1;
  sprints.push(sprint);
  return sprint;
}

module.exports = { listSprints, findSprint, addSprint };
