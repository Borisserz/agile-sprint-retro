process.env.DATABASE_URL ||= 'postgres://postgres:postgres@localhost:5433/agile_sprint_retro';
process.env.JWT_SECRET ||= 'test-secret-with-at-least-32-characters';
process.env.CORS_ORIGINS = 'http://localhost:5173';
process.env.MONGO_URI ||= 'mongodb://127.0.0.1:27017/agile_sprint_retro_test';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { Op } = require('sequelize');
const { app } = require('../server');
const { Sprint } = require('../models');

test('GET /sprints applies status and search query params', async (t) => {
  const originalFindAll = Sprint.findAll;
  const calls = [];

  t.after(() => {
    Sprint.findAll = originalFindAll;
  });

  Sprint.findAll = async (options = {}) => {
    calls.push(options);
    return [];
  };

  const byStatus = await request(app).get('/sprints').query({ status: 'active' });
  assert.equal(byStatus.status, 200);
  assert.equal(calls.at(-1).where.status, 'active');

  const bySearch = await request(app).get('/sprints').query({ search: 'деплой' });
  assert.equal(bySearch.status, 200);
  assert.ok(calls.at(-1).where[Op.or]);

  const both = await request(app).get('/sprints').query({ status: 'planned', search: 'спринт' });
  assert.equal(both.status, 200);
  assert.equal(calls.at(-1).where.status, 'planned');
  assert.ok(calls.at(-1).where[Op.or]);

  const plain = await request(app).get('/sprints');
  assert.equal(plain.status, 200);
  assert.equal(calls.at(-1).where, undefined);
});
