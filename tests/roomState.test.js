const test = require('node:test');
const assert = require('node:assert/strict');
const {
  roomKey,
  addUser,
  removeUser,
  listUsers,
  toggleVote,
  getCardsWithVotes,
  resetRoomsForTests,
} = require('../socket/roomState');

test('roomKey prefixes sprint id', () => {
  assert.equal(roomKey(3), 'retro:3');
});

test('presence add and remove', () => {
  resetRoomsForTests();
  const roomId = roomKey(1);
  addUser(roomId, {
    id: 10,
    email: 'a@test.local',
    role: 'member',
    socketId: 's1',
  });
  addUser(roomId, {
    id: 11,
    email: 'b@test.local',
    role: 'facilitator',
    socketId: 's2',
  });
  assert.equal(listUsers(roomId).length, 2);
  const left = removeUser(roomId, 's1');
  assert.equal(left.email, 'a@test.local');
  assert.equal(listUsers(roomId).length, 1);
});

test('toggle vote once then remove', () => {
  resetRoomsForTests();
  const roomId = roomKey(2);
  const cards = getCardsWithVotes(roomId);
  const cardId = cards[0].id;
  let result = toggleVote(roomId, cardId, 10);
  assert.equal(result.cards.find((c) => c.id === cardId).votes, 1);
  result = toggleVote(roomId, cardId, 10);
  assert.equal(result.cards.find((c) => c.id === cardId).votes, 0);
});

test('same user id replaces previous socket in room', () => {
  resetRoomsForTests();
  const roomId = roomKey(3);
  addUser(roomId, {
    id: 10,
    email: 'a@test.local',
    role: 'member',
    socketId: 'old',
  });
  addUser(roomId, {
    id: 10,
    email: 'a@test.local',
    role: 'member',
    socketId: 'new',
  });
  const users = listUsers(roomId);
  assert.equal(users.length, 1);
  assert.equal(users[0].socketId, 'new');
});
