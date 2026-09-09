const now = new Date();
const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

let nextId = 3;

const sprints = [
  {
    id: 1,
    name: 'Sprint 1',
    goal: 'Ship backlog board',
    startDate: monthAgo,
    endDate: twoWeeksAgo,
    status: 'done',
  },
  {
    id: 2,
    name: 'Sprint 2',
    goal: 'Retrospective notes and action items',
    startDate: now,
    endDate: inTwoWeeks,
    status: 'active',
  },
];

module.exports = { sprints, getNextId: () => nextId++ };
