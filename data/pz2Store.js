// ПЗ2: хранилище в массивах (без БД) — спринты, action items, ретроспективы
function createCollection(seed = []) {
  let items = seed.map((row) => ({ ...row }));
  let nextId = items.reduce((max, row) => Math.max(max, row.id), 0) + 1;

  return {
    list() {
      return items;
    },
    get(id) {
      return items.find((row) => row.id === Number(id)) || null;
    },
    create(data) {
      const row = { id: nextId, ...data };
      nextId += 1;
      items.push(row);
      return row;
    },
    replace(id, data) {
      const index = items.findIndex((row) => row.id === Number(id));
      if (index === -1) return null;
      items[index] = { id: Number(id), ...data };
      return items[index];
    },
    patch(id, data) {
      const row = this.get(id);
      if (!row) return null;
      Object.assign(row, data);
      return row;
    },
    remove(id) {
      const index = items.findIndex((row) => row.id === Number(id));
      if (index === -1) return false;
      items.splice(index, 1);
      return true;
    },
  };
}

const sprints = createCollection([
  {
    id: 1,
    name: 'Sprint 1',
    goal: 'Ship backlog board',
    status: 'done',
    capacity: 30,
  },
  {
    id: 2,
    name: 'Sprint 2',
    goal: 'Connect React to API',
    status: 'active',
    capacity: 40,
  },
]);

const actionItems = createCollection([
  { id: 1, sprintId: 1, title: 'Clarify DoD', done: true },
  { id: 2, sprintId: 2, title: 'Write API.md', done: false },
]);

const retrospectives = createCollection([
  {
    id: 1,
    sprintId: 1,
    summary: 'Good delivery pace',
    date: '2026-08-12',
  },
]);

module.exports = { sprints, actionItems, retrospectives };
