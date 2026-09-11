// ПЗ3: данные каталога (спринты) для динамического маршрута /catalog/:id
export const CATALOG = [
  { id: '1', name: 'Sprint 1', goal: 'Ship backlog board', status: 'done' },
  { id: '2', name: 'Sprint 2', goal: 'Connect React to API', status: 'active' },
  { id: '3', name: 'Sprint 3', goal: 'Auth and team roles', status: 'planned' },
];

export function findCatalogItem(id) {
  return CATALOG.find((item) => item.id === String(id)) || null;
}
