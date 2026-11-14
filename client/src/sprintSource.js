export function sprintBasePath(store) {
  return store === 'mongo' ? '/mongo/sprints' : '/sprints';
}

export function normalizeSprint(sprint) {
  if (!sprint || typeof sprint !== 'object') return sprint;
  if (sprint.id != null) return sprint;
  if (sprint._id == null) return sprint;
  return {
    ...sprint,
    id: typeof sprint._id === 'string' ? sprint._id : String(sprint._id),
  };
}

export function normalizeSprints(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeSprint);
}

export function filterSprintsLocal(list, { search = '', status = 'all' } = {}) {
  const q = String(search || '')
    .trim()
    .toLowerCase();
  return (Array.isArray(list) ? list : []).filter((sprint) => {
    if (status && status !== 'all' && sprint.status !== status) return false;
    if (!q) return true;
    const hay = `${sprint.name || ''} ${sprint.goal || ''}`.toLowerCase();
    return hay.includes(q);
  });
}
