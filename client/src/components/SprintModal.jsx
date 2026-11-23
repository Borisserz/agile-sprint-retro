import { useEffect } from 'react';
import { createPortal } from 'react-dom';

function toDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toISOString().slice(0, 10);
}

export default function SprintModal({ sprint, health = 0, onHealthChange, onClose, onOpenRetro }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!sprint) return null;

  const items = Array.isArray(sprint.actionItems) ? sprint.actionItems : [];

  return createPortal(
    <div className="sprint-modal" role="presentation" onClick={onClose}>
      <div
        className="sprint-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sprint-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sprint-modal__header">
          <div>
            <p className="sprint-modal__kicker">Sprint details</p>
            <h2 id="sprint-modal-title" className="sprint-modal__title">
              {sprint.name}
            </h2>
          </div>
          <button type="button" className="btn btn-quiet" onClick={onClose} aria-label="Close">
            Close
          </button>
        </header>

        <article
          className="sprint-modal__body"
          itemScope
          itemType="https://schema.org/CreativeWork"
        >
          <meta itemProp="name" content={sprint.name} />
          <p className="sprint-modal__goal" itemProp="description">
            {sprint.goal}
          </p>
          <dl className="sprint-modal__meta">
            <div>
              <dt>Status</dt>
              <dd>
                <span className={`pill pill--${sprint.status}`}>{sprint.status}</span>
              </dd>
            </div>
            <div>
              <dt>Dates</dt>
              <dd>
                {toDate(sprint.startDate)} → {toDate(sprint.endDate)}
              </dd>
            </div>
            <div>
              <dt>Capacity</dt>
              <dd>{sprint.capacity ?? '—'}</dd>
            </div>
          </dl>

          <section className="sprint-modal__health" aria-label="Sprint health rating">
            <p className="sprint-modal__health-label">Team health (local)</p>
            <div className="sprint-modal__stars" role="group" aria-label="Rate sprint health">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`sprint-modal__star${health >= n ? ' is-on' : ''}`}
                  aria-pressed={health >= n}
                  aria-label={`${n} of 5`}
                  onClick={() => onHealthChange(health === n ? 0 : n)}
                >
                  ★
                </button>
              ))}
            </div>
          </section>

          <section className="sprint-modal__actions" aria-labelledby="modal-actions-title">
            <h3 id="modal-actions-title">Action items</h3>
            {items.length === 0 ? (
              <p className="sprint-modal__empty">No action items yet.</p>
            ) : (
              <ul className="sprint-modal__list">
                {items.map((item) => (
                  <li key={item.id} className={item.done ? 'is-done' : undefined}>
                    {item.title}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </article>

        <footer className="sprint-modal__footer">
          <button type="button" className="btn btn-main" onClick={onOpenRetro}>
            Open retro
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
