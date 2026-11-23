export function sprintBasePath(store) {
  return store === 'mongo' ? '/mongo/sprints' : '/sprints';
}

function normalizeActionItem(item) {
  if (!item || typeof item !== 'object') return item;
  if (item.id != null) return item;
  if (item._id == null) return item;
  return {
    ...item,
    id: typeof item._id === 'string' ? item._id : String(item._id),
  };
}

export function normalizeSprint(sprint) {
  if (!sprint || typeof sprint !== 'object') return sprint;
  const base =
    sprint.id != null
      ? sprint
      : sprint._id != null
        ? {
            ...sprint,
            id: typeof sprint._id === 'string' ? sprint._id : String(sprint._id),
          }
        : sprint;
  if (!Array.isArray(base.actionItems)) return base;
  return {
    ...base,
    actionItems: base.actionItems.map(normalizeActionItem),
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
