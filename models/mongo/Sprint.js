const mongoose = require('mongoose');

const STATUSES = ['planned', 'active', 'done'];

const actionItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
    owner: { type: String, default: '', trim: true },
  },
  { _id: true },
);

const sprintSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    goal: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: STATUSES,
      default: 'planned',
    },
    capacity: { type: Number, default: null },
    tags: [{ type: String, trim: true }],
    actionItems: [actionItemSchema],
  },
  {
    timestamps: true,
    collection: 'sprints',
  },
);

const MongoSprint = mongoose.model('MongoSprint', sprintSchema);

module.exports = { MongoSprint, STATUSES };
