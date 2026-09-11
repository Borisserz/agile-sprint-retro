import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import RetroBoard from '../components/RetroBoard';
import { fetchSprint, getErrorMessage } from '../api';
import { useAuth } from '../context/AuthContext';

export default function RetroPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sprint, setSprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchSprint(id)
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
  }, [id]);

  if (loading) {
    return (
      <div className="viewport">
        <div className="viewport-bg" aria-hidden="true" />
        <div className="boot" role="status">
          <div className="boot-console">
            <div className="boot-copy">
              <p>Loading sprint</p>
              <span>GET /sprints/{id}…</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sprint) {
    return (
      <div className="viewport">
        <div className="viewport-bg" aria-hidden="true" />
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
      </div>
    );
  }

  return (
    <div className="viewport">
      <div className="viewport-bg" aria-hidden="true" />
      <RetroBoard sprint={sprint} user={user} onClose={() => navigate('/sprints')} />
    </div>
  );
}
