// Shared CORS allowlist for REST and Socket.IO (coursework security).

function parseAllowedOrigins() {
  const raw = process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost';
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function createCorsOptions() {
  const allowed = parseAllowedOrigins();

  return {
    origin(origin, callback) {
      // CLI / health / same-origin tools often omit Origin.
      if (!origin || allowed.includes(origin)) {
        return callback(null, true);
      }
      const err = new Error('Not allowed by CORS');
      err.status = 403;
      return callback(err);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'QUERY', 'OPTIONS'],
  };
}

function createSocketCorsOptions() {
  const allowed = parseAllowedOrigins();
  return {
    origin(origin, callback) {
      if (!origin || allowed.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST'],
  };
}

module.exports = {
  parseAllowedOrigins,
  createCorsOptions,
  createSocketCorsOptions,
};
