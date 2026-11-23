import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import RetroBoard from '../components/RetroBoard';
import AppShell from '../layout/AppShell';
import { fetchSprint, getErrorMessage } from '../api';
import { useAuth } from '../context/AuthContext';

export default function RetroPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const store = searchParams.get('store') === 'mongo' ? 'mongo' : 'pg';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sprint, setSprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchSprint(id, store)
      .then(({ data }) => {
        if (!cancelled) setSprint(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, store]);

  if (loading) {
    return (
      <AppShell mode="app">
        <div className="boot" role="status">
          <div className="boot-console">
            <div className="boot-copy">
              <p>Loading sprint</p>
              <span>
                GET {store === 'mongo' ? '/mongo/sprints' : '/sprints'}/{id}…
              </span>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !sprint) {
    return (
      <AppShell mode="auth">
        <main className="room login-room">
          <section className="rail login-panel">
            <h1>Sprint not found</h1>
            <p className="banner banner--error" role="alert">
              {error || 'Missing sprint'}
            </p>
            <Link className="btn btn-main" to="/sprints">
              Back to sprints
            </Link>
          </section>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell mode="app">
      <RetroBoard sprint={sprint} user={user} onClose={() => navigate('/sprints')} />
    </AppShell>
  );
}
