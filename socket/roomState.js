const DEFAULT_CARDS = [
  { id: 'ww-1', column: 'went-well', text: 'Clear sprint goal' },
  { id: 'ww-2', column: 'went-well', text: 'Daily sync kept the team aligned' },
  { id: 'im-1', column: 'improve', text: 'Fewer mid-sprint priority flips' },
  { id: 'im-2', column: 'improve', text: 'Earlier code review turnaround' },
  { id: 'ac-1', column: 'action', text: 'Spike live updates for retro cards' },
  { id: 'ac-2', column: 'action', text: 'Write down owners on action items' },
];

function createEmptyRoom() {
  return {
    users: new Map(),
    votes: new Map(),
    cards: DEFAULT_CARDS.map((c) => ({ ...c })),
  };
}

const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, createEmptyRoom());
  }
  return rooms.get(roomId);
}

function roomKey(sprintId) {
  return `retro:${sprintId}`;
}

function pruneDeadUsers(roomId, isAlive) {
  const room = rooms.get(roomId);
  if (!room) return listUsers(roomId);
  for (const socketId of [...room.users.keys()]) {
    if (!isAlive(socketId)) {
      room.users.delete(socketId);
    }
  }
  if (room.users.size === 0) {
    rooms.delete(roomId);
  }
  return listUsers(roomId);
}

function addUser(roomId, user) {
  const room = getRoom(roomId);
  for (const [socketId, existing] of room.users) {
    if (existing.id === user.id && socketId !== user.socketId) {
      room.users.delete(socketId);
    }
  }
  room.users.set(user.socketId, {
    id: user.id,
    email: user.email,
    role: user.role,
    socketId: user.socketId,
  });
  return listUsers(roomId);
}

function removeUser(roomId, socketId) {
  const room = getRoom(roomId);
  const left = room.users.get(socketId) || null;
  room.users.delete(socketId);
  if (room.users.size === 0) {
    rooms.delete(roomId);
  }
  return left;
}

function listUsers(roomId) {
  const room = getRoom(roomId);
  return Array.from(room.users.values());
}

function getCardsWithVotes(roomId) {
  const room = getRoom(roomId);
  return room.cards.map((card) => {
    const entry = room.votes.get(card.id) || { count: 0, voterIds: [] };
    return {
      ...card,
      votes: entry.count,
      voterIds: [...entry.voterIds],
    };
  });
}

function toggleVote(roomId, cardId, userId) {
  const room = getRoom(roomId);
  const card = room.cards.find((c) => c.id === cardId);
  if (!card) {
    return { error: 'Card not found' };
  }

  let entry = room.votes.get(cardId);
  if (!entry) {
    entry = { count: 0, voterIds: [] };
    room.votes.set(cardId, entry);
  }

  const idx = entry.voterIds.indexOf(userId);
  if (idx >= 0) {
    entry.voterIds.splice(idx, 1);
    entry.count = entry.voterIds.length;
  } else {
    entry.voterIds.push(userId);
    entry.count = entry.voterIds.length;
  }

  return { cards: getCardsWithVotes(roomId) };
}

function resetRoomsForTests() {
  rooms.clear();
}

module.exports = {
  DEFAULT_CARDS,
  roomKey,
  addUser,
  removeUser,
  listUsers,
  pruneDeadUsers,
  getCardsWithVotes,
  toggleVote,
  resetRoomsForTests,
  getRoom,
};
