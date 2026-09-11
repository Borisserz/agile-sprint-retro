// ПЗ1: данные в массиве в памяти (без БД), тематика — спринты Agile
let nextId = 3;

const sprints = [
  {
    id: 1,
    name: 'Sprint 1',
    goal: 'Ship backlog board',
    status: 'done',
  },
  {
    id: 2,
    name: 'Sprint 2',
    goal: 'Connect React to API',
    status: 'active',
  },
];

function listSprints() {
  return sprints;
}

function findSprint(id) {
  return sprints.find((item) => item.id === Number(id));
}

function addSprint({ name, goal, status }) {
  const sprint = {
    id: nextId,
    name,
    goal,
    status: status || 'planned',
  };
  nextId += 1;
  sprints.push(sprint);
  return sprint;
}

module.exports = { listSprints, findSprint, addSprint };
