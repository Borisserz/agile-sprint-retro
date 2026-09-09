const { sprints, getNextId } = require('../models/sprints');

const STATUSES = ['planned', 'active', 'done'];

function parseSprintBody(body) {
  const { name, goal, startDate, endDate, status } = body;

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

  return {
    data: {
      name: name.trim(),
      goal: goal.trim(),
      startDate: start,
      endDate: end,
      status,
    },
  };
}

function getAll(req, res) {
  res.status(200).json(sprints);
}

function getById(req, res, next) {
  const id = Number(req.params.id);
  const sprint = sprints.find((item) => item.id === id);

  if (!sprint) {
    return next({ status: 404, message: 'Sprint not found' });
  }

  res.status(200).json(sprint);
}

function create(req, res, next) {
  const parsed = parseSprintBody(req.body);
  if (parsed.error) {
    return next({ status: 400, message: parsed.error });
  }

  const sprint = { id: getNextId(), ...parsed.data };
  sprints.push(sprint);
  res.status(201).json(sprint);
}

function update(req, res, next) {
  const id = Number(req.params.id);
  const index = sprints.findIndex((item) => item.id === id);

  if (index === -1) {
    return next({ status: 404, message: 'Sprint not found' });
  }

  const parsed = parseSprintBody(req.body);
  if (parsed.error) {
    return next({ status: 400, message: parsed.error });
  }

  sprints[index] = { id, ...parsed.data };
  res.status(200).json(sprints[index]);
}

function remove(req, res, next) {
  const id = Number(req.params.id);
  const index = sprints.findIndex((item) => item.id === id);

  if (index === -1) {
    return next({ status: 404, message: 'Sprint not found' });
  }

  const [deleted] = sprints.splice(index, 1);
  res.status(200).json(deleted);
}

module.exports = { getAll, getById, create, update, remove };
