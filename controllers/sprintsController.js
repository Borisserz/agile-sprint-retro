const { Op } = require('sequelize');
const { Sprint, ActionItem, Sequelize } = require('../models');

const STATUSES = ['planned', 'active', 'done'];

function parseSprintBody(body) {
  const { name, goal, startDate, endDate, status, capacity } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return { error: 'name is required' };
  }
  if (!goal || typeof goal !== 'string' || !goal.trim()) {
    return { error: 'goal is required' };
  }
  if (startDate === undefined || endDate === undefined) {
    return { error: 'startDate and endDate are required' };
  }
  if (!status || !STATUSES.includes(status)) {
    return { error: 'status must be planned, active or done' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: 'startDate and endDate must be valid dates' };
  }
  if (end < start) {
    return { error: 'endDate must be after startDate' };
  }

  let capacityValue = null;
  if (capacity !== undefined && capacity !== null && capacity !== '') {
    capacityValue = Number(capacity);
    if (!Number.isInteger(capacityValue) || capacityValue < 0) {
      return { error: 'capacity must be a non-negative integer' };
    }
  }

  return {
    data: {
      name: name.trim(),
      goal: goal.trim(),
      startDate: start,
      endDate: end,
      status,
      capacity: capacityValue,
    },
  };
}

async function getAll(req, res, next) {
  try {
    const sprints = await Sprint.findAll({
      include: [{ model: ActionItem, as: 'actionItems' }],
      order: [['id', 'ASC']],
    });
    res.status(200).json(sprints);
  } catch (err) {
    next(err);
  }
}

async function search(req, res, next) {
  try {
    const { search, status } = req.body || {};

    if (search !== undefined && (typeof search !== 'string' || !search.trim())) {
      return next({ status: 400, message: 'search must be a non-empty string' });
    }
    if (status !== undefined && !STATUSES.includes(status)) {
      return next({ status: 400, message: 'status must be planned, active or done' });
    }
    if (search === undefined && status === undefined) {
      return next({ status: 400, message: 'provide search and/or status in body' });
    }

    const where = {};
    if (status !== undefined) {
      where.status = status;
    }
    if (search !== undefined) {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { name: { [Op.iLike]: q } },
        { goal: { [Op.iLike]: q } },
      ];
    }

    const sprints = await Sprint.findAll({
      where,
      include: [{ model: ActionItem, as: 'actionItems' }],
      order: [['id', 'ASC']],
    });
    res.status(200).json(sprints);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const sprint = await Sprint.findByPk(req.params.id, {
      include: [{ model: ActionItem, as: 'actionItems' }],
    });

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
    const parsed = parseSprintBody(req.body);
    if (parsed.error) {
      return next({ status: 400, message: parsed.error });
    }

    const sprint = await Sprint.create(parsed.data);
    res.status(201).json(sprint);
  } catch (err) {
    if (err instanceof Sequelize.UniqueConstraintError) {
      return next({ status: 400, message: 'duplicate entry' });
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const sprint = await Sprint.findByPk(req.params.id);
    if (!sprint) {
      return next({ status: 404, message: 'Sprint not found' });
    }

    const parsed = parseSprintBody(req.body);
    if (parsed.error) {
      return next({ status: 400, message: parsed.error });
    }

    await sprint.update(parsed.data);
    res.status(200).json(sprint);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const sprint = await Sprint.findByPk(req.params.id);
    if (!sprint) {
      return next({ status: 404, message: 'Sprint not found' });
    }

    await sprint.destroy();
    res.status(200).json(sprint);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, search, getById, create, update, remove };
