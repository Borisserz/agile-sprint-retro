import { useEffect, useState } from 'react';
import LoginForm from './components/LoginForm';
import SprintList from './components/SprintList';
import './App.css';

export default function App() {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem('token');
    return token ? { token } : null;
  });

  useEffect(() => {
    if (!session) {
      document.title = 'Sprint Control | Sign in';
    }
  }, [session]);

  function onLogout() {
    localStorage.removeItem('token');
    setSession(null);
  }

  return (
    <div className="viewport">
      <div className="viewport-bg" aria-hidden="true" />
      {session ? (
        <SprintList onLogout={onLogout} user={session.user} />
      ) : (
        <LoginForm
          onSuccess={(data) => setSession({ token: data.token, user: data.user })}
        />
      )}
    </div>
  );
}
