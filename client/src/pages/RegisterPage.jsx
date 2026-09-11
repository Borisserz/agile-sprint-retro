import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getErrorMessage, register } from '../api';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (status === 'authenticated') {
    return <Navigate to="/sprints" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password);
      navigate('/login', {
        replace: true,
        state: { notice: 'Account created. Sign in with your credentials.' },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="viewport">
      <div className="viewport-bg" aria-hidden="true" />
      <main className="room login-room">
        <section className="rail login-panel" aria-labelledby="register-title">
          <div className="rail-head">
            <p className="rail-tag">Auth</p>
            <h1 id="register-title">Create account</h1>
            <p>Register as a team member</p>
          </div>
          <form className="compose" onSubmit={onSubmit}>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </label>
            <label>
              Confirm password
              <input
                type="password"
                name="confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </label>
            {error && (
              <p className="banner banner--error" role="alert">
                {error}
              </p>
            )}
            <div className="compose-actions">
              <button type="submit" className="btn btn-main" disabled={loading}>
                {loading ? 'Creating…' : 'Register'}
              </button>
            </div>
            <p className="login-hint">
              Already registered? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}
