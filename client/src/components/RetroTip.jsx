import { useCallback, useEffect, useState } from 'react';
import { fetchRetroTip } from '../services/tipsCache';

export default function RetroTip() {
  const [tip, setTip] = useState(null);
  const [meta, setMeta] = useState({ loading: true, online: true });

  const load = useCallback(async (force = false) => {
    setMeta((m) => ({ ...m, loading: true }));
    const result = await fetchRetroTip({ force });
    setTip(result);
    setMeta({
      loading: false,
      online: typeof navigator === 'undefined' ? true : navigator.onLine,
    });
  }, []);

  useEffect(() => {
    load(false);
    function onOnline() {
      setMeta((m) => ({ ...m, online: true }));
    }
    function onOffline() {
      setMeta((m) => ({ ...m, online: false }));
    }
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [load]);

  return (
    <aside className="retro-tip" aria-labelledby="retro-tip-title">
      <div className="retro-tip__head">
        <p className="retro-tip__tag" id="retro-tip-title">
          Retro tip
        </p>
        <button
          type="button"
          className="btn btn-quiet retro-tip__refresh"
          onClick={() => load(true)}
          disabled={meta.loading}
        >
          {meta.loading ? 'Loading…' : 'New tip'}
        </button>
      </div>
      <p className="retro-tip__text">{tip?.tip || '…'}</p>
      <p className="retro-tip__meta">
        {meta.online ? 'Online' : 'Offline'}
        {tip?.fromCache ? ' · from cache' : ''}
        {tip?.source ? ` · ${tip.source}` : ''}
      </p>
    </aside>
  );
}
