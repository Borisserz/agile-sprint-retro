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

    const capacity = form.capacity === '' ? null : Number(form.capacity);
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
      <div className="board board--loading" role="status">
        <div className="loader">
          <span className="loader-dot" />
          <span className="loader-dot" />
          <span className="loader-dot" />
        </div>
        <p className="loader-text">Loading sprints from local storage...</p>
      </div>
    );
  }

  return (
    <div className="board board--ready">
      <header className="masthead">
        <p className="eyebrow">Agile sprint &amp; retro</p>
        <div className="masthead-row">
          <h1>Sprint desk</h1>
          <p className="lede">
            Plan capacity, track status, keep the board on this device.
          </p>
        </div>

        <dl className="meter">
          <div>
            <dt>Total</dt>
            <dd>{stats.total}</dd>
          </div>
          <div>
            <dt>Planned</dt>
            <dd>{stats.planned}</dd>
          </div>
          <div>
            <dt>Active</dt>
            <dd>{stats.active}</dd>
          </div>
          <div>
            <dt>Done</dt>
            <dd>{stats.done}</dd>
          </div>
        </dl>
      </header>

      <section className="compose" aria-labelledby="compose-title">
        <div className="section-label">
          <h2 id="compose-title">{editingId ? 'Edit sprint' : 'Add sprint'}</h2>
          <span>{editingId ? 'Update selected item' : 'New item on the board'}</span>
        </div>

        <form className="sprint-form" onSubmit={onSubmit}>
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
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Save changes' : 'Add sprint'}
            </button>
            {editingId !== null && (
              <button type="button" className="btn btn-ghost" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="board-list" aria-labelledby="list-title">
        <div className="list-bar">
          <div className="section-label">
            <h2 id="list-title">Board</h2>
            <span>
              Showing {visible.length} of {stats.total}
            </span>
          </div>
          <label className="filter">
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
          {visible.map((sprint, index) => (
            <li
              key={sprint.id}
              className={`sprint-card status-${sprint.status}`}
              style={{ '--i': index }}
            >
              <div className="sprint-main">
                <div className="sprint-top">
                  <h3>{sprint.name}</h3>
                  <span className={`badge badge-${sprint.status}`}>{sprint.status}</span>
                </div>
                <p className="goal">{sprint.goal}</p>
                <p className="capacity">
                  <span>Capacity</span>
                  <strong>
                    {sprint.capacity === null || sprint.capacity === undefined
                      ? '—'
                      : sprint.capacity}
                  </strong>
                </p>
              </div>
              <div className="card-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => onEdit(sprint)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => onDelete(sprint.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
