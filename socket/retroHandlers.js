const { RetroMessage } = require('../models/mongo/RetroMessage');
const {
  roomKey,
  addUser,
  removeUser,
  listUsers,
  pruneDeadUsers,
  getCardsWithVotes,
  toggleVote,
} = require('./roomState');

const HISTORY_LIMIT = 50;

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    socketId: user.socketId,
  };
}

function attachRetroHandlers(io, socket) {
  socket.on('retro:join', async (payload = {}, ack) => {
    try {
      const sprintId = payload.sprintId != null ? String(payload.sprintId) : '';
      if (!sprintId) {
        if (typeof ack === 'function') ack({ error: 'sprintId is required' });
        return;
      }

      if (socket.data.retroRoom) {
        await leaveCurrentRoom(io, socket, 'left');
      }

      const roomId = roomKey(sprintId);
      pruneDeadUsers(roomId, (socketId) => io.sockets.sockets.has(socketId));

      socket.join(roomId);
      socket.data.retroRoom = roomId;
      socket.data.sprintId = sprintId;

      const users = addUser(roomId, {
        id: socket.data.user.id,
        email: socket.data.user.email,
        role: socket.data.user.role,
        socketId: socket.id,
      });

      const history = await RetroMessage.find({ sprintId })
        .sort({ createdAt: -1 })
        .limit(HISTORY_LIMIT)
        .lean();
      history.reverse();

      const snapshot = {
        sprintId,
        users,
        cards: getCardsWithVotes(roomId),
        history: history.map((m) => ({
          id: String(m._id),
          sprintId: m.sprintId,
          userId: m.userId,
          email: m.email,
          role: m.role,
          text: m.text,
          createdAt: m.createdAt,
        })),
      };

      if (typeof ack === 'function') ack(snapshot);

      socket.to(roomId).emit('user:joined', {
        user: publicUser({
          ...socket.data.user,
          socketId: socket.id,
        }),
        users,
      });
      io.to(roomId).emit('retro:presence', { users });
    } catch (err) {
      if (typeof ack === 'function') ack({ error: err.message || 'join failed' });
    }
  });

  socket.on('retro:leave', async () => {
    await leaveCurrentRoom(io, socket, 'left');
  });

  socket.on('retro:message', async (payload = {}, ack) => {
    try {
      const roomId = socket.data.retroRoom;
      const sprintId = socket.data.sprintId;
      if (!roomId || !sprintId) {
        if (typeof ack === 'function') ack({ error: 'Join a retro room first' });
        return;
      }

      const text = typeof payload.text === 'string' ? payload.text.trim() : '';
      if (!text) {
        if (typeof ack === 'function') ack({ error: 'text is required' });
        return;
      }
      if (text.length > 1000) {
        if (typeof ack === 'function') ack({ error: 'text is too long' });
        return;
      }

      const doc = await RetroMessage.create({
        sprintId,
        userId: socket.data.user.id,
        email: socket.data.user.email,
        role: socket.data.user.role,
        text,
      });

      const message = {
        id: String(doc._id),
        sprintId,
        userId: doc.userId,
        email: doc.email,
        role: doc.role,
        text: doc.text,
        createdAt: doc.createdAt,
      };

      io.to(roomId).emit('retro:message', message);
      if (typeof ack === 'function') ack({ ok: true, message });
    } catch (err) {
      if (typeof ack === 'function') ack({ error: err.message || 'send failed' });
    }
  });

  socket.on('retro:typing', (payload = {}) => {
    const roomId = socket.data.retroRoom;
    if (!roomId) return;
    socket.to(roomId).emit('retro:typing', {
      email: socket.data.user.email,
      isTyping: Boolean(payload.isTyping),
    });
  });

  socket.on('retro:vote', (payload = {}, ack) => {
    const roomId = socket.data.retroRoom;
    if (!roomId) {
      if (typeof ack === 'function') ack({ error: 'Join a retro room first' });
      return;
    }
    const cardId = payload.cardId;
    if (!cardId) {
      if (typeof ack === 'function') ack({ error: 'cardId is required' });
      return;
    }

    const result = toggleVote(roomId, cardId, socket.data.user.id);
    if (result.error) {
      if (typeof ack === 'function') ack({ error: result.error });
      return;
    }

    io.to(roomId).emit('retro:votes', { cards: result.cards });
    if (typeof ack === 'function') ack({ ok: true, cards: result.cards });
  });

  socket.on('disconnect', async () => {
    await leaveCurrentRoom(io, socket, 'disconnected');
  });
}

async function leaveCurrentRoom(io, socket, reason) {
  const roomId = socket.data.retroRoom;
  if (!roomId) return;

  const left = removeUser(roomId, socket.id);
  socket.leave(roomId);
  socket.data.retroRoom = null;
  socket.data.sprintId = null;

  if (left) {
    const users = listUsers(roomId);
    socket.to(roomId).emit('user:left', {
      user: publicUser(left),
      reason,
      users,
    });
    io.to(roomId).emit('retro:presence', { users });
  }
}

module.exports = { attachRetroHandlers };
