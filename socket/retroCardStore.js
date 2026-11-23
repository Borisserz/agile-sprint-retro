const { DEFAULT_CARDS } = require('./roomState');
const { COLUMNS } = require('../models/mongo/RetroCard');

function serialize(card) {
  return {
    id: String(card._id),
    column: card.column,
    text: card.text,
    authorId: card.authorId,
    authorEmail: card.authorEmail,
    votes: Array.isArray(card.voterIds) ? card.voterIds.length : 0,
    voterIds: [...(card.voterIds || [])],
    templateKey: card.templateKey || null,
  };
}

function createRetroCardStore(Model) {
  async function listCards(sprintId) {
    let query = Model.find({ sprintId: String(sprintId) });
    if (query && typeof query.sort === 'function') {
      query = query.sort({ createdAt: 1 });
    }
    const rows = await query;
    return rows.map(serialize);
  }

  async function listOrSeed(sprintId, seedUser = { id: 0, email: 'system@local' }) {
    const key = String(sprintId);
    const existing = await Model.countDocuments({ sprintId: key });
    if (existing === 0) {
      await Promise.all(
        DEFAULT_CARDS.map((card) =>
          Model.updateOne(
            { sprintId: key, templateKey: card.id },
            {
              $setOnInsert: {
                sprintId: key,
                column: card.column,
                text: card.text,
                authorId: seedUser.id,
                authorEmail: seedUser.email,
                voterIds: [],
                templateKey: card.id,
              },
            },
            { upsert: true },
          ),
        ),
      );
    }
    return listCards(key);
  }

  async function create(sprintId, { column, text, authorId, authorEmail }) {
    const trimmed = typeof text === 'string' ? text.trim() : '';
    if (!COLUMNS.includes(column)) {
      return { error: 'invalid column' };
    }
    if (!trimmed) {
      return { error: 'text is required' };
    }
    if (trimmed.length > 500) {
      return { error: 'text is too long' };
    }
    await Model.create({
      sprintId: String(sprintId),
      column,
      text: trimmed,
      authorId,
      authorEmail,
      voterIds: [],
    });
    return { cards: await listCards(sprintId) };
  }

  async function remove(sprintId, cardId, actor) {
    const card = await Model.findById(cardId);
    if (!card || String(card.sprintId) !== String(sprintId)) {
      return { error: 'Card not found' };
    }
    const isAuthor = Number(card.authorId) === Number(actor.id);
    const isFacilitator = actor.role === 'facilitator';
    if (!isAuthor && !isFacilitator) {
      return { error: 'Forbidden' };
    }
    await card.deleteOne();
    return { cards: await listCards(sprintId) };
  }

  async function toggleVote(sprintId, cardId, userId) {
    const card = await Model.findById(cardId);
    if (!card || String(card.sprintId) !== String(sprintId)) {
      return { error: 'Card not found' };
    }
    const uid = Number(userId);
    const idx = card.voterIds.findIndex((id) => Number(id) === uid);
    if (idx >= 0) {
      card.voterIds.splice(idx, 1);
    } else {
      card.voterIds.push(uid);
    }
    await card.save();
    return { cards: await listCards(sprintId) };
  }

  return { listOrSeed, create, remove, toggleVote, listCards };
}

module.exports = { createRetroCardStore, serialize };
