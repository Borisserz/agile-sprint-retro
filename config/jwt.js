const jwt = require('jsonwebtoken');

const TOKEN_OPTIONS = {
  issuer: 'agile-sprint-retro',
  audience: 'agile-sprint-retro-web',
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error('JWT_SECRET is not configured');
    err.status = 500;
    throw err;
  }
  return secret;
}

function assertJwtConfiguration() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
}

function signAccessToken(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    ...TOKEN_OPTIONS,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret(), TOKEN_OPTIONS);
}

module.exports = {
  TOKEN_OPTIONS,
  assertJwtConfiguration,
  signAccessToken,
  verifyAccessToken,
};
