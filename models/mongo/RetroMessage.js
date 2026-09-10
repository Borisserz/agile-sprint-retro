const mongoose = require('mongoose');

const retroMessageSchema = new mongoose.Schema(
  {
    sprintId: { type: String, required: true, index: true },
    userId: { type: Number, required: true },
    email: { type: String, required: true, trim: true },
    role: { type: String, default: 'member' },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'retro_messages',
  },
);

const RetroMessage = mongoose.model('RetroMessage', retroMessageSchema);

module.exports = { RetroMessage };
