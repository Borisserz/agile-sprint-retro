const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { attachRetroHandlers } = require('./retroHandlers');

function attachSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return next(new Error('Authorization token required'));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new Error('JWT_SECRET is not configured'));
    }

    try {
      const decoded = jwt.verify(token, secret);
      socket.data.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      return next();
    } catch (err) {
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
