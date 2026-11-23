const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const express = require('express');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { io: ioc } = require('socket.io-client');
const { attachRetroHandlers } = require('../socket/retroHandlers');
const { resetRoomsForTests } = require('../socket/roomState');
const { createRetroCardStore } = require('../socket/retroCardStore');

function createFakeCardModel() {
  const docs = [];
  let seq = 1;
  class Doc {
    constructor(data) {
      Object.assign(this, data);
      this._id = data._id || `c${seq++}`;
    }
    async save() {
      return this;
    }
    async deleteOne() {
      const idx = docs.findIndex((d) => d._id === this._id);
      if (idx >= 0) docs.splice(idx, 1);
    }
  }
  return {
    async countDocuments(query) {
      return docs.filter((d) => d.sprintId === query.sprintId).length;
    },
    async find(query) {
      const rows = docs.filter((d) => d.sprintId === query.sprintId);
      const promise = Promise.resolve(rows);
      promise.sort = async () => rows;
      return promise;
    },
    async updateOne(filter, update) {
      const exists = docs.find(
        (d) => d.sprintId === filter.sprintId && d.templateKey === filter.templateKey,
      );
      if (!exists) docs.push(new Doc({ ...filter, ...update.$setOnInsert }));
      return { upsertedCount: exists ? 0 : 1 };
    },
    async create(payload) {
      const doc = new Doc(payload);
      docs.push(doc);
      return doc;
    },
    async findById(id) {
      return docs.find((d) => String(d._id) === String(id)) || null;
    },
  };
}

test('two clients share chat and votes in a retro room', async (t) => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-with-at-least-32-characters';
  resetRoomsForTests();

  const originalCreate = require('../models/mongo/RetroMessage').RetroMessage.create;
  const originalFind = require('../models/mongo/RetroMessage').RetroMessage.find;

  const memory = [];
  require('../models/mongo/RetroMessage').RetroMessage.create = async (doc) => {
    const row = {
      ...doc,
      _id: `m${memory.length + 1}`,
      createdAt: new Date(),
    };
    memory.push(row);
    return row;
  };
  require('../models/mongo/RetroMessage').RetroMessage.find = () => ({
    sort() {
      return {
        limit() {
          return {
            lean: async () => [...memory],
          };
        },
      };
    },
  });

  t.after(() => {
    require('../models/mongo/RetroMessage').RetroMessage.create = originalCreate;
    require('../models/mongo/RetroMessage').RetroMessage.find = originalFind;
  });

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: true } });

  io.use((socket, next) => {
    try {
      const decoded = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(err);
    }
  });

  const cardStore = createRetroCardStore(createFakeCardModel());
  io.on('connection', (socket) => attachRetroHandlers(io, socket, { cardStore }));

  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  function clientFor(user) {
    // Isolated harness signs its own tokens; production uses config/jwt.js.
    const token = jwt.sign(user, process.env.JWT_SECRET, {
      issuer: 'agile-sprint-retro',
      audience: 'agile-sprint-retro-web',
      expiresIn: '1h',
    });
    return ioc(`http://127.0.0.1:${port}`, {
      auth: { token },
      transports: ['websocket'],
      forceNew: true,
    });
  }

  const a = clientFor({ id: 1, email: 'a@test.local', role: 'facilitator' });
  const b = clientFor({ id: 2, email: 'b@test.local', role: 'member' });

  await Promise.all([
    new Promise((resolve, reject) => {
      a.on('connect', resolve);
      a.on('connect_error', reject);
    }),
    new Promise((resolve, reject) => {
      b.on('connect', resolve);
      b.on('connect_error', reject);
    }),
  ]);

  const joinA = await new Promise((resolve) => {
    a.emit('retro:join', { sprintId: '9' }, resolve);
  });
  assert.ok(!joinA.error);
  assert.equal(joinA.cards.length > 0, true);

  const messageFromB = new Promise((resolve) => {
    a.on('retro:message', resolve);
  });

  await new Promise((resolve) => {
    b.emit('retro:join', { sprintId: '9' }, resolve);
  });

  const votesOnA = new Promise((resolve) => {
    a.on('retro:votes', resolve);
  });

  b.emit('retro:message', { text: 'Ship the board' }, () => {});
  const msg = await messageFromB;
  assert.equal(msg.text, 'Ship the board');

  const cardId = joinA.cards[0].id;
  b.emit('retro:vote', { cardId }, () => {});
  const votes = await votesOnA;
  assert.equal(votes.cards.find((c) => c.id === cardId).votes, 1);

  a.close();
  b.close();
  io.close();
  await new Promise((resolve) => server.close(resolve));
});
