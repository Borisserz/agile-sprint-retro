const { Server } = require('socket.io');
const { createSocketCorsOptions } = require('../config/cors');
const { verifyAccessToken } = require('../config/jwt');
const { attachRetroHandlers } = require('./retroHandlers');

function attachSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: createSocketCorsOptions(),
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return next(new Error('Authorization token required'));
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.data.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      return next();
    } catch (err) {
      if (err.status === 500) {
        return next(err);
      }
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected', socket.id);
    attachRetroHandlers(io, socket);
  });

  return io;
}

module.exports = { attachSockets };
