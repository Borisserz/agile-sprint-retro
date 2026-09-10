const mongoose = require('mongoose');
const { MongoSprint, STATUSES } = require('../models/mongo/Sprint');

function parseCapacity(capacity) {
  if (capacity === undefined || capacity === null || capacity === '') {
    return null;
  }
  const value = Number(capacity);
  if (!Number.isInteger(value) || value < 0) {
    return { error: 'capacity must be a non-negative integer' };
  }
  return value;
}

function parseTags(tags) {
  if (tags === undefined) return [];
  if (!Array.isArray(tags)) {
    return { error: 'tags must be an array of strings' };
  }
  if (!tags.every((t) => typeof t === 'string')) {
    return { error: 'tags must be an array of strings' };
  }
  return tags.map((t) => t.trim()).filter(Boolean);
}

function parseActionItems(items) {
  if (items === undefined) return [];
  if (!Array.isArray(items)) {
    return { error: 'actionItems must be an array' };
  }
  const parsed = [];
  for (const item of items) {
    if (!item || typeof item.title !== 'string' || !item.title.trim()) {
      return { error: 'each actionItem needs a non-empty title' };
    }
    parsed.push({
      title: item.title.trim(),
      done: Boolean(item.done),
      owner: typeof item.owner === 'string' ? item.owner.trim() : '',
    });
  }
  return parsed;
}

function parseSprintBody(body, { partial = false } = {}) {
  const result = {};

  if (!partial || body.name !== undefined) {
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return { error: 'name is required' };
    }
    result.name = body.name.trim();
  }

  if (!partial || body.goal !== undefined) {
    if (!body.goal || typeof body.goal !== 'string' || !body.goal.trim()) {
      return { error: 'goal is required' };
    }
    result.goal = body.goal.trim();
  }

  if (!partial || body.startDate !== undefined || body.endDate !== undefined) {
    if (body.startDate === undefined || body.endDate === undefined) {
      return { error: 'startDate and endDate are required' };
    }
    const start = new Date(body.startDate);
    const end = new Date(body.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return { error: 'startDate and endDate must be valid dates' };
    }
    if (end < start) {
      return { error: 'endDate must be after startDate' };
    }
    result.startDate = start;
    result.endDate = end;
  }

  if (!partial || body.status !== undefined) {
    if (!body.status || !STATUSES.includes(body.status)) {
      return { error: 'status must be planned, active or done' };
    }
    result.status = body.status;
  }

  if (body.capacity !== undefined) {
    const capacity = parseCapacity(body.capacity);
    if (capacity && typeof capacity === 'object' && capacity.error) {
      return capacity;
    }
    result.capacity = capacity;
  }

  if (body.tags !== undefined) {
    const tags = parseTags(body.tags);
    if (tags && typeof tags === 'object' && tags.error) {
      return tags;
    }
    result.tags = tags;
  }

  if (body.actionItems !== undefined) {
    const actionItems = parseActionItems(body.actionItems);
    if (actionItems && typeof actionItems === 'object' && actionItems.error) {
      return actionItems;
    }
    result.actionItems = actionItems;
  }

  return { data: result };
}

async function getAll(req, res, next) {
  try {
    const sprints = await MongoSprint.find().sort({ createdAt: 1 });
    res.status(200).json(sprints);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next({ status: 404, message: 'Sprint not found' });
    }
    const sprint = await MongoSprint.findById(req.params.id);
    if (!sprint) {
      return next({ status: 404, message: 'Sprint not found' });
    }
    res.status(200).json(sprint);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const parsed = parseSprintBody(req.body || {});
    if (parsed.error) {
      return next({ status: 400, message: parsed.error });
    }
    if (parsed.data.tags === undefined) parsed.data.tags = [];
    if (parsed.data.actionItems === undefined) parsed.data.actionItems = [];
    if (parsed.data.capacity === undefined) parsed.data.capacity = null;

    const sprint = await MongoSprint.create(parsed.data);
    res.status(201).json(sprint);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next({ status: 404, message: 'Sprint not found' });
    }
    const parsed = parseSprintBody(req.body || {});
    if (parsed.error) {
      return next({ status: 400, message: parsed.error });
    }

    const sprint = await MongoSprint.findByIdAndUpdate(req.params.id, parsed.data, {
      new: true,
      runValidators: true,
    });
    if (!sprint) {
      return next({ status: 404, message: 'Sprint not found' });
    }
    res.status(200).json(sprint);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next({ status: 404, message: 'Sprint not found' });
    }
    const sprint = await MongoSprint.findByIdAndDelete(req.params.id);
    if (!sprint) {
      return next({ status: 404, message: 'Sprint not found' });
    }
    res.status(200).json(sprint);
  } catch (err) {
    next(err);
  }
}

async function addActionItem(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next({ status: 404, message: 'Sprint not found' });
    }
    const { title, done, owner } = req.body || {};
    if (!title || typeof title !== 'string' || !title.trim()) {
      return next({ status: 400, message: 'title is required' });
    }

    const sprint = await MongoSprint.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          actionItems: {
            title: title.trim(),
            done: Boolean(done),
            owner: typeof owner === 'string' ? owner.trim() : '',
          },
        },
      },
      { new: true, runValidators: true },
    );
    if (!sprint) {
      return next({ status: 404, message: 'Sprint not found' });
    }
    res.status(201).json(sprint);
  } catch (err) {
    next(err);
  }
}

async function updateActionItem(req, res, next) {
  try {
    const { id, itemId } = req.params;
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(itemId)) {
      return next({ status: 404, message: 'Sprint or action item not found' });
    }

    const sprint = await MongoSprint.findById(id);
    if (!sprint) {
      return next({ status: 404, message: 'Sprint not found' });
    }

    const item = sprint.actionItems.id(itemId);
    if (!item) {
      return next({ status: 404, message: 'Action item not found' });
    }

    const { title, done, owner } = req.body || {};
    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return next({ status: 400, message: 'title must be a non-empty string' });
      }
      item.title = title.trim();
    }
    if (done !== undefined) {
      item.done = Boolean(done);
    }
    if (owner !== undefined) {
      if (typeof owner !== 'string') {
        return next({ status: 400, message: 'owner must be a string' });
      }
      item.owner = owner.trim();
    }

    await sprint.save();
    res.status(200).json(sprint);
  } catch (err) {
    next(err);
  }
}

async function removeActionItem(req, res, next) {
  try {
    const { id, itemId } = req.params;
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(itemId)) {
      return next({ status: 404, message: 'Sprint or action item not found' });
    }

    const sprint = await MongoSprint.findById(id);
    if (!sprint) {
      return next({ status: 404, message: 'Sprint not found' });
    }

    const item = sprint.actionItems.id(itemId);
    if (!item) {
      return next({ status: 404, message: 'Action item not found' });
    }

    item.deleteOne();
    await sprint.save();
    res.status(200).json(sprint);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  addActionItem,
  updateActionItem,
  removeActionItem,
};
