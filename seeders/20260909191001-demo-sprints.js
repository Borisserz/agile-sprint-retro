'use strict';

module.exports = {
  async up(queryInterface) {
    const [[{ count }]] = await queryInterface.sequelize.query(
      'SELECT COUNT(*)::int AS count FROM "Sprints";',
    );
    // Avoid duplicating demo sprints on every Compose restart.
    if (count > 0) return;

    const now = new Date();
    const day = 24 * 60 * 60 * 1000;

    await queryInterface.bulkInsert('Sprints', [
      {
        name: 'Sprint 1',
        goal: 'Ship backlog board',
        startDate: new Date(now.getTime() - 42 * day),
        endDate: new Date(now.getTime() - 28 * day),
        status: 'done',
        capacity: 30,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Sprint 2',
        goal: 'Retrospective notes and action items',
        startDate: new Date(now.getTime() - 21 * day),
        endDate: new Date(now.getTime() - 7 * day),
        status: 'done',
        capacity: 35,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Sprint 3',
        goal: 'Connect PostgreSQL and Sequelize models',
        startDate: now,
        endDate: new Date(now.getTime() + 14 * day),
        status: 'active',
        capacity: 40,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Sprint 4',
        goal: 'Auth and team roles for retro board',
        startDate: new Date(now.getTime() + 14 * day),
        endDate: new Date(now.getTime() + 28 * day),
        status: 'planned',
        capacity: 45,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Sprint 5',
        goal: 'Realtime updates for retrospective cards',
        startDate: new Date(now.getTime() + 28 * day),
        endDate: new Date(now.getTime() + 42 * day),
        status: 'planned',
        capacity: 50,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const [sprints] = await queryInterface.sequelize.query(
      'SELECT id, name FROM "Sprints" ORDER BY id ASC;'
    );

    const byName = Object.fromEntries(sprints.map((item) => [item.name, item.id]));

    await queryInterface.bulkInsert('ActionItems', [
      {
        title: 'Clarify definition of done',
        done: true,
        sprintId: byName['Sprint 1'],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Split backlog into story points',
        done: true,
        sprintId: byName['Sprint 1'],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Prepare retro board columns',
        done: true,
        sprintId: byName['Sprint 2'],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Collect feedback from previous sprint',
        done: true,
        sprintId: byName['Sprint 2'],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Write Sequelize migrations for sprints',
        done: false,
        sprintId: byName['Sprint 3'],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Add seed data for demos',
        done: false,
        sprintId: byName['Sprint 3'],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Document DATABASE_URL setup',
        done: false,
        sprintId: byName['Sprint 3'],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Design JWT auth endpoints',
        done: false,
        sprintId: byName['Sprint 4'],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Map roles: member and facilitator',
        done: false,
        sprintId: byName['Sprint 4'],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Spike WebSocket for card moves',
        done: false,
        sprintId: byName['Sprint 5'],
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('ActionItems', null, {});
    await queryInterface.bulkDelete('Sprints', null, {});
  },
};
