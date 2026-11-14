const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('sprintSource', () => {
  it('maps store to API base path', async () => {
    const { sprintBasePath } = await import('../client/src/sprintSource.js');
    assert.equal(sprintBasePath('pg'), '/sprints');
    assert.equal(sprintBasePath('mongo'), '/mongo/sprints');
    assert.equal(sprintBasePath('unknown'), '/sprints');
  });

  it('normalizes Mongo _id to string id', async () => {
    const { normalizeSprint } = await import('../client/src/sprintSource.js');
    const doc = normalizeSprint({
      _id: { toString: () => '507f1f77bcf86cd799439011' },
      name: 'Sprint Mongo',
    });
    assert.equal(doc.id, '507f1f77bcf86cd799439011');
    assert.equal(doc.name, 'Sprint Mongo');
  });

  it('keeps PostgreSQL numeric id as string-compatible value', async () => {
    const { normalizeSprint } = await import('../client/src/sprintSource.js');
    const doc = normalizeSprint({ id: 3, name: 'PG' });
    assert.equal(doc.id, 3);
  });

  it('filters sprints locally by search and status', async () => {
    const { filterSprintsLocal } = await import('../client/src/sprintSource.js');
    const list = [
      { id: 1, name: 'Alpha', goal: 'ship', status: 'planned' },
      { id: 2, name: 'Beta', goal: 'retro notes', status: 'active' },
      { id: 3, name: 'Gamma', goal: 'ship', status: 'done' },
    ];
    assert.deepEqual(
      filterSprintsLocal(list, { search: 'retro', status: 'all' }).map((s) => s.id),
      [2],
    );
    assert.deepEqual(
      filterSprintsLocal(list, { search: '', status: 'planned' }).map((s) => s.id),
      [1],
    );
  });
});
