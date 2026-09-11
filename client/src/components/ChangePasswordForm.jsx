import { useState } from 'react';
import { changePassword, getErrorMessage } from '../api';

export default function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (newPassword !== confirm) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirm('');
      setNotice('Password updated');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <details className="password-panel">
      <summary>Change password</summary>
      <form className="compose" onSubmit={onSubmit}>
        <label>
          Current password
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <label>
          New password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <label>
          Confirm new password
          <input
            type="password"
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
        {notice && (
          <p className="banner banner--ok" role="status">
            {notice}
          </p>
        )}
        <div className="compose-actions">
          <button type="submit" className="btn btn-quiet" disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </form>
    </details>
  );
}
