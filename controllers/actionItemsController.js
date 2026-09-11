const { ActionItem, Sprint } = require('../models');

function parseTitle(value) {
  if (!value || typeof value !== 'string' || !value.trim()) {
    return { error: 'title is required' };
  }
  const title = value.trim();
  if (title.length > 255) {
    return { error: 'title must be at most 255 characters' };
  }
  return { title };
}

async function create(req, res, next) {
  try {
    const sprintId = Number(req.params.id);
    if (!Number.isInteger(sprintId) || sprintId < 1) {
      return next({ status: 400, message: 'invalid sprint id' });
    }

    const parsed = parseTitle(req.body?.title);
    if (parsed.error) {
      return next({ status: 400, message: parsed.error });
    }

    const sprint = await Sprint.findByPk(sprintId);
    if (!sprint) {
      return next({ status: 404, message: 'Sprint not found' });
    }

    const item = await ActionItem.create({
      title: parsed.title,
      done: false,
      sprintId,
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const sprintId = Number(req.params.id);
    const itemId = Number(req.params.itemId);
    if (!Number.isInteger(sprintId) || sprintId < 1 || !Number.isInteger(itemId) || itemId < 1) {
      return next({ status: 400, message: 'invalid id' });
    }

    const item = await ActionItem.findByPk(itemId);
    if (!item || item.sprintId !== sprintId) {
      return next({ status: 404, message: 'Action item not found' });
    }

    if (req.body?.title !== undefined) {
      const parsed = parseTitle(req.body.title);
      if (parsed.error) {
        return next({ status: 400, message: parsed.error });
      }
      item.title = parsed.title;
    }
    if (req.body?.done !== undefined) {
      if (typeof req.body.done !== 'boolean') {
        return next({ status: 400, message: 'done must be a boolean' });
      }
      item.done = req.body.done;
    }

    await item.save();
    res.status(200).json(item);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const sprintId = Number(req.params.id);
    const itemId = Number(req.params.itemId);
    if (!Number.isInteger(sprintId) || sprintId < 1 || !Number.isInteger(itemId) || itemId < 1) {
      return next({ status: 400, message: 'invalid id' });
    }

    const item = await ActionItem.findByPk(itemId);
    if (!item || item.sprintId !== sprintId) {
      return next({ status: 404, message: 'Action item not found' });
    }

    await item.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { create, update, remove };
