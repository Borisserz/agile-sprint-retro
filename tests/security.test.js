process.env.JWT_SECRET ||= 'test-secret-with-at-least-32-characters';
process.env.CORS_ORIGINS = 'http://localhost:5173,http://localhost';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createCorsOptions, parseAllowedOrigins } = require('../config/cors');
const { signAccessToken, verifyAccessToken } = require('../config/jwt');

test('CORS allowlist parses env and accepts listed origins', () => {
  assert.deepEqual(parseAllowedOrigins(), ['http://localhost:5173', 'http://localhost']);

  const options = createCorsOptions();
  let allowedOrigin;
  options.origin('http://localhost:5173', (err, ok) => {
    assert.equal(err, null);
    assert.equal(ok, true);
    allowedOrigin = true;
  });
  assert.equal(allowedOrigin, true);

  let denied;
  options.origin('https://unknown.example', (err) => {
    denied = err;
  });
  assert.equal(denied.status, 403);
});

test('JWT sign and verify round-trip with issuer/audience', () => {
  const token = signAccessToken({ id: 1, email: 'a@test.local', role: 'member' });
  const decoded = verifyAccessToken(token);
  assert.equal(decoded.id, 1);
  assert.equal(decoded.email, 'a@test.local');
  assert.equal(decoded.role, 'member');
});
