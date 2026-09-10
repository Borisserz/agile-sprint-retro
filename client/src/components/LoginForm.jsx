import { useState } from 'react';
import { getErrorMessage, login } from '../api';

export default function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState('facilitator@agile.local');
  const [password, setPassword] = useState('Password1!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await login(email.trim(), password);
      localStorage.setItem('token', data.token);
      onSuccess(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="room login-room">
      <section className="rail login-panel" aria-labelledby="login-title">
        <div className="rail-head">
          <p className="rail-tag">Auth</p>
          <h1 id="login-title">Sprint Control</h1>
          <p>Sign in to sync with the API</p>
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
              autoComplete="current-password"
            />
          </label>
          {error && (
            <p className="banner banner--error" role="alert">
              {error}
            </p>
          )}
          <div className="compose-actions">
            <button type="submit" className="btn btn-main" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
          <p className="login-hint">
            Seed facilitator: <code>facilitator@agile.local</code> / <code>Password1!</code>
          </p>
        </form>
      </section>
    </main>
  );
}
