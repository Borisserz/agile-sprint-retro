const mongoose = require('mongoose');

const COLUMNS = ['went-well', 'improve', 'action'];

const retroCardSchema = new mongoose.Schema(
  {
    sprintId: { type: String, required: true, index: true },
    column: { type: String, required: true, enum: COLUMNS },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    authorId: { type: Number, required: true },
    authorEmail: { type: String, required: true, trim: true },
    voterIds: { type: [Number], default: [] },
    templateKey: { type: String, default: null },
  },
  {
    timestamps: true,
    collection: 'retro_cards',
  },
);

// Seed defaults once per sprint without blocking user-created cards.
retroCardSchema.index(
  { sprintId: 1, templateKey: 1 },
  {
    unique: true,
    partialFilterExpression: { templateKey: { $type: 'string' } },
  },
);

const RetroCard = mongoose.models.RetroCard || mongoose.model('RetroCard', retroCardSchema);

module.exports = { RetroCard, COLUMNS };
