'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
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
