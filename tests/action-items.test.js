process.env.DATABASE_URL ||= 'postgres://postgres:postgres@localhost:5433/agile_sprint_retro';
process.env.JWT_SECRET ||= 'test-secret-with-at-least-32-characters';
process.env.CORS_ORIGINS = 'http://localhost:5173';
process.env.MONGO_URI ||= 'mongodb://127.0.0.1:27017/agile_sprint_retro_test';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app } = require('../server');
const { signAccessToken } = require('../config/jwt');
const { ActionItem, Sprint } = require('../models');

function authHeader(role = 'member') {
  const token = signAccessToken({ id: 9, email: 'tester@agile.local', role });
  return `Bearer ${token}`;
}

test('action item routes require auth and validate title', async (t) => {
  const originalSprintFind = Sprint.findByPk;
  const originalCreate = ActionItem.create;
  const originalFind = ActionItem.findByPk;

  t.after(() => {
    Sprint.findByPk = originalSprintFind;
    ActionItem.create = originalCreate;
    ActionItem.findByPk = originalFind;
  });

  const unauthorized = await request(app).post('/sprints/1/action-items').send({ title: 'x' });
  assert.equal(unauthorized.status, 401);

  Sprint.findByPk = async () => ({ id: 1 });
  ActionItem.create = async (payload) => ({
    id: 42,
    ...payload,
    toJSON() {
      return this;
    },
  });

  const blank = await request(app)
    .post('/sprints/1/action-items')
    .set('Authorization', authHeader())
    .send({ title: '   ' });
  assert.equal(blank.status, 400);

  const created = await request(app)
    .post('/sprints/1/action-items')
    .set('Authorization', authHeader())
    .send({ title: ' Follow up ' });
  assert.equal(created.status, 201);
  assert.equal(created.body.title, 'Follow up');
  assert.equal(created.body.sprintId, 1);

  ActionItem.findByPk = async () => ({
    id: 42,
    sprintId: 1,
    title: 'Follow up',
    done: false,
    async save() {
      return this;
    },
    async destroy() {},
    toJSON() {
      return this;
    },
  });

  const patched = await request(app)
    .patch('/sprints/1/action-items/42')
    .set('Authorization', authHeader())
    .send({ done: true });
  assert.equal(patched.status, 200);
  assert.equal(patched.body.done, true);

  const deleted = await request(app)
    .delete('/sprints/1/action-items/42')
    .set('Authorization', authHeader())
    .send();
  assert.equal(deleted.status, 204);
});
