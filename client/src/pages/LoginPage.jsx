import { Link, Navigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { status, bootError, clearBootError } = useAuth();
  const location = useLocation();
  const notice = location.state?.notice;

  if (status === 'authenticated') {
    return <Navigate to="/sprints" replace />;
  }

  if (status === 'loading') {
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
      <LoginForm onSignedIn={clearBootError} />
      {notice && (
        <p className="banner banner--ok auth-toast" role="status">
          {notice}
        </p>
      )}
      {bootError && (
        <p className="banner banner--error auth-toast" role="alert">
          {bootError}
        </p>
      )}
      <p className="auth-switch">
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
