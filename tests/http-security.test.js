process.env.DATABASE_URL ||= 'postgres://postgres:postgres@localhost:5433/agile_sprint_retro';
process.env.JWT_SECRET ||= 'test-secret-with-at-least-32-characters';
process.env.CORS_ORIGINS = 'http://localhost:5173';
process.env.MONGO_URI ||= 'mongodb://127.0.0.1:27017/agile_sprint_retro_test';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app } = require('../server');

test('Helmet headers are enabled', async () => {
  const response = await request(app).get('/health');
  assert.equal(response.status, 200);
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
});

test('configured origin is allowed and an unknown origin is rejected', async () => {
  const allowed = await request(app)
    .get('/health')
    .set('Origin', 'http://localhost:5173');
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers['access-control-allow-origin'], 'http://localhost:5173');

  const denied = await request(app)
    .get('/health')
    .set('Origin', 'https://unknown.example');
  assert.equal(denied.status, 403);
});

test('PostgreSQL and MongoDB mutations require a bearer token', async () => {
  const responses = await Promise.all([
    request(app).post('/sprints').send({}),
    request(app).put('/sprints/1').send({}),
    request(app).post('/mongo/sprints').send({}),
    request(app)
      .patch('/mongo/sprints/507f1f77bcf86cd799439011/action-items/507f191e810c19729de860ea')
      .send({ done: true }),
  ]);
  assert.deepEqual(
    responses.map((response) => response.status),
    [401, 401, 401, 401],
  );
});
