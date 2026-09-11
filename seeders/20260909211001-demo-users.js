'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    const [[{ count }]] = await queryInterface.sequelize.query(
      `SELECT COUNT(*)::int AS count FROM "Users"
       WHERE email IN ('member@agile.local', 'facilitator@agile.local');`,
    );
    if (count >= 2) return;

    const now = new Date();
    const passwordHash = await bcrypt.hash('Password1!', 10);

    await queryInterface.bulkInsert('Users', [
      {
        email: 'member@agile.local',
        passwordHash,
        role: 'member',
        createdAt: now,
        updatedAt: now,
      },
      {
        email: 'facilitator@agile.local',
        passwordHash,
        role: 'facilitator',
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Users', {
      email: ['member@agile.local', 'facilitator@agile.local'],
    });
  },
};
