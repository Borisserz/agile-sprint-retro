// ПЗ2: валидация тел запросов для трёх ресурсов
function asString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateSprintCreate(body) {
  const name = asString(body.name);
  const goal = asString(body.goal);
  const status = asString(body.status) || 'planned';
  const capacity = Number(body.capacity);

  if (!name || !goal) return { error: 'name and goal are required strings' };
  if (!['planned', 'active', 'done'].includes(status)) {
    return { error: 'status must be planned|active|done' };
  }
  if (!Number.isFinite(capacity) || capacity < 0) {
    return { error: 'capacity must be a non-negative number' };
  }
  return { data: { name, goal, status, capacity } };
}

function validateSprintReplace(body) {
  return validateSprintCreate(body);
}

function validateSprintPatch(body) {
  const data = {};
  if (body.name !== undefined) {
    const name = asString(body.name);
    if (!name) return { error: 'name must be a non-empty string' };
    data.name = name;
  }
  if (body.goal !== undefined) {
    const goal = asString(body.goal);
    if (!goal) return { error: 'goal must be a non-empty string' };
    data.goal = goal;
  }
  if (body.status !== undefined) {
    const status = asString(body.status);
    if (!['planned', 'active', 'done'].includes(status)) {
      return { error: 'status must be planned|active|done' };
    }
    data.status = status;
  }
  if (body.capacity !== undefined) {
    const capacity = Number(body.capacity);
    if (!Number.isFinite(capacity) || capacity < 0) {
      return { error: 'capacity must be a non-negative number' };
    }
    data.capacity = capacity;
  }
  if (Object.keys(data).length === 0) return { error: 'no fields to update' };
  return { data };
}

function validateActionCreate(body) {
  const title = asString(body.title);
  const sprintId = Number(body.sprintId);
  const done = Boolean(body.done);
  if (!title) return { error: 'title is required' };
  if (!Number.isInteger(sprintId) || sprintId < 1) {
    return { error: 'sprintId must be a positive integer' };
  }
  return { data: { title, sprintId, done } };
}

function validateActionReplace(body) {
  return validateActionCreate({ ...body, done: body.done === true });
}

function validateActionPatch(body) {
  const data = {};
  if (body.title !== undefined) {
    const title = asString(body.title);
    if (!title) return { error: 'title must be a non-empty string' };
    data.title = title;
  }
  if (body.sprintId !== undefined) {
    const sprintId = Number(body.sprintId);
    if (!Number.isInteger(sprintId) || sprintId < 1) {
      return { error: 'sprintId must be a positive integer' };
    }
    data.sprintId = sprintId;
  }
  if (body.done !== undefined) data.done = Boolean(body.done);
  if (Object.keys(data).length === 0) return { error: 'no fields to update' };
  return { data };
}

function validateRetroCreate(body) {
  const sprintId = Number(body.sprintId);
  const summary = asString(body.summary);
  const date = asString(body.date);
  if (!Number.isInteger(sprintId) || sprintId < 1) {
    return { error: 'sprintId must be a positive integer' };
  }
  if (!summary) return { error: 'summary is required' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: 'date must be YYYY-MM-DD' };
  }
  return { data: { sprintId, summary, date } };
}

function validateRetroReplace(body) {
  return validateRetroCreate(body);
}

function validateRetroPatch(body) {
  const data = {};
  if (body.sprintId !== undefined) {
    const sprintId = Number(body.sprintId);
    if (!Number.isInteger(sprintId) || sprintId < 1) {
      return { error: 'sprintId must be a positive integer' };
    }
    data.sprintId = sprintId;
  }
  if (body.summary !== undefined) {
    const summary = asString(body.summary);
    if (!summary) return { error: 'summary must be a non-empty string' };
    data.summary = summary;
  }
  if (body.date !== undefined) {
    const date = asString(body.date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { error: 'date must be YYYY-MM-DD' };
    }
    data.date = date;
  }
  if (Object.keys(data).length === 0) return { error: 'no fields to update' };
  return { data };
}

module.exports = {
  validateSprintCreate,
  validateSprintReplace,
  validateSprintPatch,
  validateActionCreate,
  validateActionReplace,
  validateActionPatch,
  validateRetroCreate,
  validateRetroReplace,
  validateRetroPatch,
};
