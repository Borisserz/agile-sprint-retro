import { useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const STATUSES = ['planned', 'active', 'done'];

const INITIAL_SPRINTS = [
  {
    id: 1,
    name: 'Sprint 1',
    goal: 'Ship backlog board',
    status: 'done',
    capacity: 30,
  },
  {
    id: 2,
    name: 'Sprint 2',
    goal: 'Retrospective notes and action items',
    status: 'active',
    capacity: 35,
  },
];

const emptyForm = {
  name: '',
  goal: '',
  status: 'planned',
  capacity: '',
};

export default function SprintList() {
  const [sprints, setSprints] = useLocalStorage(INITIAL_SPRINTS, 500);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = `Sprints (${sprints.length}) | Agile Retro`;
  }, [sprints.length]);

  const visible = useMemo(() => {
    if (filter === 'all') return sprints;
    return sprints.filter((s) => s.status === filter);
  }, [sprints, filter]);

  const stats = useMemo(() => {
    return {
      total: sprints.length,
      planned: sprints.filter((s) => s.status === 'planned').length,
      active: sprints.filter((s) => s.status === 'active').length,
      done: sprints.filter((s) => s.status === 'done').length,
    };
  }, [sprints]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function onSubmit(e) {
    e.preventDefault();
    const name = form.name.trim();
    const goal = form.goal.trim();
    if (!name || !goal) return;

    const capacity =
      form.capacity === '' ? null : Number(form.capacity);
    if (capacity !== null && (!Number.isInteger(capacity) || capacity < 0)) {
      return;
    }

    if (editingId !== null) {
      setSprints((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? { ...s, name, goal, status: form.status, capacity }
            : s
        )
      );
    } else {
      setSprints((prev) => [
        ...prev,
        {
          id: Date.now(),
          name,
          goal,
          status: form.status,
          capacity,
        },
      ]);
    }
    resetForm();
  }

  function onEdit(sprint) {
    setEditingId(sprint.id);
    setForm({
      name: sprint.name,
      goal: sprint.goal,
      status: sprint.status,
      capacity: sprint.capacity ?? '',
    });
  }

  function onDelete(id) {
    setSprints((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) resetForm();
  }

  if (loading) {
    return (
      <div className="panel loading">
        <p>Loading sprints from local storage...</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <header className="panel-header">
        <div>
          <h1>Sprint planner</h1>
          <p className="muted">
            Local state + localStorage (Lab 4). Ready for API in Lab 5.
          </p>
        </div>
        <div className="stats">
          <span>Total: {stats.total}</span>
          <span>Planned: {stats.planned}</span>
          <span>Active: {stats.active}</span>
          <span>Done: {stats.done}</span>
        </div>
      </header>

      <form className="sprint-form" onSubmit={onSubmit}>
        <h2>{editingId ? 'Edit sprint' : 'Add sprint'}</h2>
        <div className="grid">
          <label>
            Name
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Sprint 3"
              required
            />
          </label>
          <label>
            Status
            <select name="status" value={form.status} onChange={onChange}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="full">
            Goal
            <input
              name="goal"
              value={form.goal}
              onChange={onChange}
              placeholder="Connect React to API"
              required
            />
          </label>
          <label>
            Capacity
            <input
              name="capacity"
              type="number"
              min="0"
              step="1"
              value={form.capacity}
              onChange={onChange}
              placeholder="40"
            />
          </label>
        </div>
        <div className="actions">
          <button type="submit">{editingId ? 'Save' : 'Add'}</button>
          {editingId !== null && (
            <button type="button" className="secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="toolbar">
        <label>
          Filter by status
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">all</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="sprint-list">
        {visible.length === 0 && (
          <li className="empty">No sprints for this filter.</li>
        )}
        {visible.map((sprint) => (
          <li key={sprint.id} className="sprint-card">
            <div>
              <strong>{sprint.name}</strong>
              <span className={`badge ${sprint.status}`}>{sprint.status}</span>
              <p>{sprint.goal}</p>
              <p className="muted">
                Capacity:{' '}
                {sprint.capacity === null || sprint.capacity === undefined
                  ? '—'
                  : sprint.capacity}
              </p>
            </div>
            <div className="card-actions">
              <button type="button" className="secondary" onClick={() => onEdit(sprint)}>
                Edit
              </button>
              <button type="button" className="danger" onClick={() => onDelete(sprint.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
