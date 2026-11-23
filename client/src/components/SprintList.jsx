import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  addSprint,
  deleteSprint,
  fetchSprints,
  getErrorMessage,
  searchSprints,
  updateSprint,
} from '../api';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ActionItems from './ActionItems';
import RetroTip from './RetroTip';
import SprintModal from './SprintModal';

function sprintKey(store, id) {
  return `${store}:${id}`;
}

const STATUSES = ['planned', 'active', 'done'];
const FILTERS = ['all', ...STATUSES];
const STORES = [
  { id: 'pg', label: 'PostgreSQL' },
  { id: 'mongo', label: 'MongoDB' },
];
const SEARCH_DEBOUNCE_MS = 400;

function sameId(a, b) {
  return String(a) === String(b);
}

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function plusDaysInput(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function toInputDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

const emptyForm = {
  name: '',
  goal: '',
  status: 'planned',
  capacity: '',
  startDate: todayInput(),
  endDate: plusDaysInput(14),
};

function toPayload(form) {
  return {
    name: form.name.trim(),
    goal: form.goal.trim(),
    status: form.status,
    capacity: form.capacity === '' ? null : Number(form.capacity),
    startDate: form.startDate,
    endDate: form.endDate,
  };
}

export default function SprintList() {
  const navigate = useNavigate();
  const [sprints, setSprints] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [store, setStore] = useState('pg');
  const [search, setSearch] = useState('');
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [detailSprint, setDetailSprint] = useState(null);
  const [favorites, setFavorites] = useLocalStorage('sprint-retro_favorites', []);
  const [healthMap, setHealthMap] = useLocalStorage('sprint-retro_health', {});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const requestId = useRef(0);
  const searchWrapRef = useRef(null);

  const loadList = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchSprints(store);
      if (id !== requestId.current) return;
      setSprints(Array.isArray(data) ? data : []);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(getErrorMessage(err));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [store]);

  // Load / QUERY with debounce when search or status filter is active
  useEffect(() => {
    const q = search.trim();
    const needsQuery = q !== '' || filter !== 'all';
    const delay = needsQuery ? SEARCH_DEBOUNCE_MS : 0;
    const timer = setTimeout(async () => {
      const id = ++requestId.current;
      setLoading(true);
      setError(null);
      try {
        const { data } = needsQuery
          ? await searchSprints({
              store,
              ...(q ? { search: q } : {}),
              ...(filter !== 'all' ? { status: filter } : {}),
            })
          : await fetchSprints(store);
        if (id !== requestId.current) return;
        setSprints(Array.isArray(data) ? data : []);
      } catch (err) {
        if (id !== requestId.current) return;
        setError(getErrorMessage(err));
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [search, filter, store]);

  function onStoreChange(next) {
    if (next === store) return;
    setStore(next);
    setEditingId(null);
    setForm({
      ...emptyForm,
      startDate: todayInput(),
      endDate: plusDaysInput(14),
    });
    setSprints([]);
    setError(null);
  }

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const visibleSprints = useMemo(() => {
    if (!favoritesOnly) return sprints;
    return sprints.filter((s) => favoriteSet.has(sprintKey(store, s.id)));
  }, [sprints, favoritesOnly, favoriteSet, store]);

  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 1) return [];
    return sprints
      .filter((s) => {
        const hay = `${s.name || ''} ${s.goal || ''}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 6);
  }, [search, sprints]);

  useEffect(() => {
    document.title = `Sprints (${visibleSprints.length}) | Agile Retro`;
  }, [visibleSprints.length]);

  useEffect(() => {
    function onDocClick(e) {
      if (!searchWrapRef.current?.contains(e.target)) setSuggestOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const stats = useMemo(() => {
    return {
      total: visibleSprints.length,
      planned: visibleSprints.filter((s) => s.status === 'planned').length,
      active: visibleSprints.filter((s) => s.status === 'active').length,
      done: visibleSprints.filter((s) => s.status === 'done').length,
    };
  }, [visibleSprints]);

  function toggleFavorite(id) {
    const key = sprintKey(store, id);
    setFavorites((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  function setHealth(id, value) {
    const key = sprintKey(store, id);
    setHealthMap((prev) => ({ ...prev, [key]: value }));
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm({
      ...emptyForm,
      startDate: todayInput(),
      endDate: plusDaysInput(14),
    });
    setEditingId(null);
  }

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3500);
  }

  async function onSubmit(e) {
    e.preventDefault();
    const payload = toPayload(form);
    if (!payload.name || !payload.goal) return;
    if (
      payload.capacity !== null &&
      (!Number.isInteger(payload.capacity) || payload.capacity < 0)
    ) {
      return;
    }

    if (editingId !== null) {
      const snapshot = sprints.find((s) => sameId(s.id, editingId));
      setSprints((prev) =>
        prev.map((s) => (sameId(s.id, editingId) ? { ...s, ...payload } : s)),
      );
      try {
        const { data } = await updateSprint(editingId, payload, store);
        setSprints((prev) =>
          prev.map((s) => (sameId(s.id, editingId) ? data : s)),
        );
        resetForm();
      } catch (err) {
        if (snapshot) {
          setSprints((prev) =>
            prev.map((s) => (sameId(s.id, editingId) ? snapshot : s)),
          );
        }
        showNotice(getErrorMessage(err));
      }
      return;
    }

    const tempId = Date.now();
    const optimistic = { id: tempId, ...payload, actionItems: [] };
    setSprints((prev) => [...prev, optimistic]);
    resetForm();
    try {
      const { data } = await addSprint(payload, store);
      setSprints((prev) => prev.map((s) => (sameId(s.id, tempId) ? data : s)));
    } catch (err) {
      setSprints((prev) => prev.filter((s) => !sameId(s.id, tempId)));
      showNotice(getErrorMessage(err));
    }
  }

  function onEdit(sprint) {
    setEditingId(sprint.id);
    setForm({
      name: sprint.name,
      goal: sprint.goal,
      status: sprint.status,
      capacity: sprint.capacity ?? '',
      startDate: toInputDate(sprint.startDate) || todayInput(),
      endDate: toInputDate(sprint.endDate) || plusDaysInput(14),
    });
  }

  async function onDelete(id) {
    const snapshot = sprints.find((s) => sameId(s.id, id));
    if (!snapshot) return;
    setSprints((prev) => prev.filter((s) => !sameId(s.id, id)));
    if (sameId(editingId, id)) resetForm();
    try {
      await deleteSprint(id, store);
    } catch (err) {
      setSprints((prev) => [...prev, snapshot]);
      showNotice(getErrorMessage(err));
    }
  }

  const storePath = store === 'mongo' ? '/mongo/sprints' : '/sprints';

  if (loading && sprints.length === 0 && !error) {
    return (
      <div className="boot" role="status">
        <div className="boot-console">
          <div className="boot-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="boot-copy">
            <p>Loading sprints from API</p>
            <span>GET {storePath}…</span>
          </div>
          <div className="boot-track" aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="room" id="main-content">
      <header className="topbar">
        <div className="brand">
          <div>
            <p className="brand-kicker">Board</p>
            <h1>Sprint Control</h1>
          </div>
        </div>
        <div className="topbar-right">
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
        </div>
      </header>

      <RetroTip />

      {notice && (
        <p className="banner banner--error room-banner" role="status">
          {notice}
        </p>
      )}

      <div className="workspace">
        <aside className="rail" aria-labelledby="compose-title">
          <div className="rail-head">
            <p className="rail-tag">{editingId ? 'Edit mode' : 'Composer'}</p>
            <h2 id="compose-title">{editingId ? 'Edit sprint' : 'Compose sprint'}</h2>
            <p>{editingId ? 'Update on server' : `POST to ${storePath}`}</p>
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
            <div className="compose-row">
              <label>
                Start
                <input
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={onChange}
                  required
                />
              </label>
              <label>
                End
                <input
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={onChange}
                  required
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
                {sprints.length} shown
                {loading ? ' · syncing…' : ''}
              </p>
            </div>
            <div className="stage-tools">
              <div className="seg" role="group" aria-label="Data store">
                {STORES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`seg-btn${store === s.id ? ' is-on' : ''}`}
                    aria-pressed={store === s.id}
                    onClick={() => onStoreChange(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="sprint-search" ref={searchWrapRef}>
                <label className="search sprint-search__label" htmlFor="sprint-search-input">
                  Search
                  <input
                    id="sprint-search-input"
                    type="search"
                    value={search}
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-controls="sprint-search-suggest"
                    aria-expanded={suggestOpen && suggestions.length > 0}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setSuggestOpen(true);
                    }}
                    onFocus={() => setSuggestOpen(true)}
                    placeholder="name or goal"
                  />
                </label>
                {suggestOpen && suggestions.length > 0 && (
                  <ul
                    id="sprint-search-suggest"
                    className="sprint-search__suggest"
                    role="listbox"
                    aria-label="Sprint suggestions"
                  >
                    {suggestions.map((s) => (
                      <li key={s.id} role="option">
                        <button
                          type="button"
                          className="sprint-search__option"
                          onClick={() => {
                            setSearch(s.name);
                            setSuggestOpen(false);
                            setDetailSprint(s);
                          }}
                        >
                          <strong>{s.name}</strong>
                          <span>{s.goal}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
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
              <button
                type="button"
                className={`seg-btn${favoritesOnly ? ' is-on' : ''}`}
                aria-pressed={favoritesOnly}
                onClick={() => setFavoritesOnly((v) => !v)}
              >
                Favorites
              </button>
            </div>
          </div>

          {error && (
            <div className="banner banner--error" role="alert">
              <span>{error}</span>
              <button type="button" className="btn btn-quiet" onClick={loadList}>
                Retry
              </button>
            </div>
          )}

          <ul className="lanes sprint-board__list">
            {!error && visibleSprints.length === 0 && (
              <li className="empty">
                <strong>No sprints here</strong>
                <span>
                  {favoritesOnly
                    ? 'Star a sprint to pin it in Favorites.'
                    : 'Try another filter or compose a new sprint.'}
                </span>
              </li>
            )}
            {visibleSprints.map((sprint, index) => {
              const cap =
                sprint.capacity === null || sprint.capacity === undefined
                  ? null
                  : sprint.capacity;
              const capPct =
                cap === null ? 0 : Math.min(100, Math.round((cap / 60) * 100));
              const fav = favoriteSet.has(sprintKey(store, sprint.id));
              const health = Number(healthMap[sprintKey(store, sprint.id)] || 0);
              return (
                <li
                  key={sprint.id}
                  className={`ticket ticket--${sprint.status}${
                    sameId(editingId, sprint.id) ? ' is-editing' : ''
                  }${fav ? ' ticket--fav' : ''}`}
                  data-index={String(index + 1).padStart(2, '0')}
                  style={{ '--delay': `${index * 45}ms` }}
                >
                  <div className="ticket-body">
                    <div className="ticket-meta">
                      <h3>{sprint.name}</h3>
                      <span className={`pill pill--${sprint.status}`}>{sprint.status}</span>
                      <button
                        type="button"
                        className={`ticket__fav${fav ? ' is-on' : ''}`}
                        aria-pressed={fav}
                        aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
                        onClick={() => toggleFavorite(sprint.id)}
                      >
                        ♥
                      </button>
                    </div>
                    <p className="ticket-goal">{sprint.goal}</p>
                    <p className="ticket-dates">
                      {toInputDate(sprint.startDate)} → {toInputDate(sprint.endDate)}
                      {health > 0 ? ` · health ${health}/5` : ''}
                    </p>
                    <div className="ticket-cap">
                      <div className="ticket-cap-row">
                        <span>Capacity</span>
                        <b>{cap === null ? '—' : cap}</b>
                      </div>
                      <div className="cap-track" aria-hidden="true">
                        <span className="cap-fill" style={{ width: `${capPct}%` }} />
                      </div>
                    </div>
                    <ActionItems
                      sprintId={sprint.id}
                      store={store}
                      items={sprint.actionItems || []}
                      onItemsChange={(next) => {
                        setSprints((prev) =>
                          prev.map((row) =>
                            sameId(row.id, sprint.id) ? { ...row, actionItems: next } : row,
                          ),
                        );
                      }}
                    />
                  </div>
                  <div className="ticket-actions">
                    <button
                      type="button"
                      className="btn btn-main"
                      onClick={() =>
                        navigate(`/sprints/${sprint.id}/retro?store=${store}`)
                      }
                    >
                      Open retro
                    </button>
                    <button
                      type="button"
                      className="btn btn-quiet"
                      onClick={() => setDetailSprint(sprint)}
                    >
                      Details
                    </button>
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

      {detailSprint && (
        <SprintModal
          sprint={detailSprint}
          health={Number(healthMap[sprintKey(store, detailSprint.id)] || 0)}
          onHealthChange={(value) => setHealth(detailSprint.id, value)}
          onClose={() => setDetailSprint(null)}
          onOpenRetro={() => {
            const id = detailSprint.id;
            setDetailSprint(null);
            navigate(`/sprints/${id}/retro?store=${store}`);
          }}
        />
      )}
    </main>
  );
}
