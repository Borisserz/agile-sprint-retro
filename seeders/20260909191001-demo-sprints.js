'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    await queryInterface.bulkInsert('Sprints', [
      {
        name: 'Sprint 1',
        goal: 'Ship backlog board',
        startDate: monthAgo,
        endDate: twoWeeksAgo,
        status: 'done',
        capacity: 30,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Sprint 2',
        goal: 'Retrospective notes and action items',
        startDate: now,
        endDate: inTwoWeeks,
        status: 'active',
        capacity: 40,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const [sprints] = await queryInterface.sequelize.query(
      'SELECT id, name FROM "Sprints" ORDER BY id ASC;'
    );

    const sprint1 = sprints.find((item) => item.name === 'Sprint 1');
    const sprint2 = sprints.find((item) => item.name === 'Sprint 2');

    await queryInterface.bulkInsert('ActionItems', [
      {
        title: 'Clarify definition of done',
        done: true,
        sprintId: sprint1.id,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Prepare retro board columns',
        done: false,
        sprintId: sprint2.id,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Assign owners to action items',
        done: false,
        sprintId: sprint2.id,
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
