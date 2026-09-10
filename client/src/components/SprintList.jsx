import { useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const STATUSES = ['planned', 'active', 'done'];
const FILTERS = ['all', ...STATUSES];

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
            : s,
        ),
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
      <div className="boot" role="status">
        <div className="boot-console">
          <div className="boot-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="boot-copy">
            <p>Initializing sprint control</p>
            <span>Syncing local board…</span>
          </div>
          <div className="boot-track" aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="room">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <p className="brand-kicker">Agile operations</p>
            <h1>Sprint Control</h1>
          </div>
        </div>
        <dl className="hud" aria-label="Sprint statistics">
          <div className="hud-cell">
            <dt>Total</dt>
            <dd>{stats.total}</dd>
          </div>
          <div className="hud-cell">
            <dt>Planned</dt>
            <dd>{stats.planned}</dd>
          </div>
          <div className="hud-cell hud-cell--live">
            <dt>Active</dt>
            <dd>{stats.active}</dd>
          </div>
          <div className="hud-cell">
            <dt>Done</dt>
            <dd>{stats.done}</dd>
          </div>
        </dl>
      </header>

      <div className="workspace">
        <aside className="rail" aria-labelledby="compose-title">
          <div className="rail-head">
            <p className="rail-tag">{editingId ? 'Edit mode' : 'Composer'}</p>
            <h2 id="compose-title">{editingId ? 'Edit sprint' : 'Compose sprint'}</h2>
            <p>{editingId ? 'Update selected sprint' : 'Add to the board'}</p>
          </div>

          <form className="compose" onSubmit={onSubmit}>
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
              Goal
              <textarea
                name="goal"
                value={form.goal}
                onChange={onChange}
                placeholder="Connect React to API"
                rows={3}
                required
              />
            </label>
            <div className="compose-row">
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
            <div className="compose-actions">
              <button type="submit" className="btn btn-main">
                {editingId ? 'Save changes' : 'Add sprint'}
              </button>
              {editingId !== null && (
                <button type="button" className="btn btn-quiet" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </aside>

        <section className="stage" aria-labelledby="board-title">
          <div className="stage-bar">
            <div>
              <h2 id="board-title">Sprint board</h2>
              <p>
                {visible.length} shown · {stats.total} total
              </p>
            </div>
            <div className="seg" role="group" aria-label="Filter by status">
              {FILTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`seg-btn${filter === s ? ' is-on' : ''}`}
                  aria-pressed={filter === s}
                  onClick={() => setFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <ul className="lanes">
            {visible.length === 0 && (
              <li className="empty">
                <strong>No sprints here</strong>
                <span>Try another filter or compose a new sprint.</span>
              </li>
            )}
            {visible.map((sprint, index) => {
              const cap =
                sprint.capacity === null || sprint.capacity === undefined
                  ? null
                  : sprint.capacity;
              const capPct = cap === null ? 0 : Math.min(100, Math.round((cap / 60) * 100));
              return (
                <li
                  key={sprint.id}
                  className={`ticket ticket--${sprint.status}${
                    editingId === sprint.id ? ' is-editing' : ''
                  }`}
                  data-index={String(index + 1).padStart(2, '0')}
                  style={{ '--delay': `${index * 45}ms` }}
                >
                  <div className="ticket-body">
                    <div className="ticket-meta">
                      <h3>{sprint.name}</h3>
                      <span className={`pill pill--${sprint.status}`}>{sprint.status}</span>
                    </div>
                    <p className="ticket-goal">{sprint.goal}</p>
                    <div className="ticket-cap">
                      <div className="ticket-cap-row">
                        <span>Capacity</span>
                        <b>{cap === null ? '—' : cap}</b>
                      </div>
                      <div className="cap-track" aria-hidden="true">
                        <span className="cap-fill" style={{ width: `${capPct}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="ticket-actions">
                    <button type="button" className="btn btn-quiet" onClick={() => onEdit(sprint)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-kill"
                      onClick={() => onDelete(sprint.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
