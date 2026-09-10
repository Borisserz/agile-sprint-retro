import { useEffect, useState } from 'react';
import LoginForm from './components/LoginForm';
import SprintList from './components/SprintList';
import { fetchProfile, getErrorMessage } from './api';
import { disconnectSocket } from './socket';
import './App.css';

export default function App() {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem('token');
    return token ? { token, user: null } : null;
  });
  const [bootError, setBootError] = useState(null);

  useEffect(() => {
    if (!session) {
      document.title = 'Sprint Control | Sign in';
      return;
    }
    document.title = 'Sprint Control';
    if (session.user) return undefined;

    let cancelled = false;
    fetchProfile()
      .then(({ data }) => {
        if (!cancelled) setSession((prev) => (prev ? { ...prev, user: data } : prev));
      })
      .catch((err) => {
        if (cancelled) return;
        localStorage.removeItem('token');
        disconnectSocket();
        setSession(null);
        setBootError(getErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  function onLogout() {
    localStorage.removeItem('token');
    disconnectSocket();
    setSession(null);
  }

  if (session && !session.user) {
    return (
      <div className="viewport">
        <div className="viewport-bg" aria-hidden="true" />
        <div className="boot" role="status">
          <div className="boot-console">
            <div className="boot-copy">
              <p>Restoring session</p>
              <span>GET /profile…</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="viewport">
      <div className="viewport-bg" aria-hidden="true" />
      {session ? (
        <SprintList onLogout={onLogout} user={session.user} />
      ) : (
        <LoginForm
          onSuccess={(data) => {
            setBootError(null);
            setSession({ token: data.token, user: data.user });
          }}
        />
      )}
      {bootError && !session && (
        <p className="banner banner--error" style={{ position: 'fixed', bottom: 16, left: 16 }}>
          {bootError}
        </p>
      )}
    </div>
  );
}
