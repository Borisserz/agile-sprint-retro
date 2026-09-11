import { useState } from 'react';
import {
  addActionItem,
  deleteActionItem,
  getErrorMessage,
  updateActionItem,
} from '../api';

export default function ActionItems({ sprintId, items, onItemsChange }) {
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const list = Array.isArray(items) ? items : [];

  async function onAdd(e) {
    e.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) return;
    setBusy(true);
    setError(null);
    try {
      const { data } = await addActionItem(sprintId, nextTitle);
      onItemsChange([...list, data]);
      setTitle('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function onToggle(item) {
    const previous = list;
    const optimistic = list.map((row) =>
      row.id === item.id ? { ...row, done: !row.done } : row,
    );
    onItemsChange(optimistic);
    try {
      const { data } = await updateActionItem(sprintId, item.id, { done: !item.done });
      onItemsChange(optimistic.map((row) => (row.id === item.id ? data : row)));
    } catch (err) {
      onItemsChange(previous);
      setError(getErrorMessage(err));
    }
  }

  async function onDelete(item) {
    const previous = list;
    onItemsChange(list.filter((row) => row.id !== item.id));
    try {
      await deleteActionItem(sprintId, item.id);
    } catch (err) {
      onItemsChange(previous);
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="action-items">
      <p className="action-items-label">Action items</p>
      <ul className="action-items-list">
        {list.map((item) => (
          <li key={item.id} className={item.done ? 'is-done' : undefined}>
            <label>
              <input
                type="checkbox"
                checked={Boolean(item.done)}
                onChange={() => onToggle(item)}
              />
              <span>{item.title}</span>
            </label>
            <button type="button" className="btn btn-quiet" onClick={() => onDelete(item)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form className="action-items-form" onSubmit={onAdd}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New action item"
          maxLength={255}
          aria-label="New action item"
        />
        <button type="submit" className="btn btn-quiet" disabled={busy}>
          Add
        </button>
      </form>
      {error && (
        <p className="banner banner--error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
