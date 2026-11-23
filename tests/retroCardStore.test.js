const test = require('node:test');
const assert = require('node:assert/strict');
const { createRetroCardStore } = require('../socket/retroCardStore');

function createFakeModel() {
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
      if (!exists) {
        docs.push(new Doc({ ...filter, ...update.$setOnInsert }));
      }
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
    _docs: docs,
  };
}

test('listOrSeed persists defaults once', async () => {
  const model = createFakeModel();
  const store = createRetroCardStore(model);
  const first = await store.listOrSeed('7');
  assert.equal(first.length, 6);
  const second = await store.listOrSeed('7');
  assert.equal(second.length, 6);
  assert.equal(model._docs.length, 6);
});

test('create trims text and validates column', async () => {
  const store = createRetroCardStore(createFakeModel());
  await store.listOrSeed('1');
  const bad = await store.create('1', {
    column: 'nope',
    text: 'x',
    authorId: 1,
    authorEmail: 'a@test',
  });
  assert.equal(bad.error, 'invalid column');

  const ok = await store.create('1', {
    column: 'went-well',
    text: '  Nice demo  ',
    authorId: 1,
    authorEmail: 'a@test',
  });
  assert.ok(ok.cards.some((c) => c.text === 'Nice demo'));
});

test('toggle vote survives store recreation', async () => {
  const model = createFakeModel();
  const store = createRetroCardStore(model);
  const cards = await store.listOrSeed('3');
  const cardId = cards[0].id;
  const voted = await store.toggleVote('3', cardId, 9);
  assert.equal(voted.cards.find((c) => c.id === cardId).votes, 1);

  const again = createRetroCardStore(model);
  const listed = await again.listCards('3');
  assert.equal(listed.find((c) => c.id === cardId).votes, 1);
  assert.deepEqual(listed.find((c) => c.id === cardId).voterIds, [9]);
});

test('member cannot delete another author card', async () => {
  const store = createRetroCardStore(createFakeModel());
  await store.listOrSeed('5', { id: 1, email: 'owner@test' });
  const cards = await store.listCards('5');
  const denied = await store.remove('5', cards[0].id, { id: 2, role: 'member' });
  assert.equal(denied.error, 'Forbidden');
  const allowed = await store.remove('5', cards[0].id, { id: 2, role: 'facilitator' });
  assert.equal(allowed.error, undefined);
  assert.equal(allowed.cards.length, 5);
});
