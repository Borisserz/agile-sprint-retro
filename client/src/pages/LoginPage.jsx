import { Navigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import AppShell from '../layout/AppShell';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { status, bootError, clearBootError } = useAuth();
  const location = useLocation();
  const notice = location.state?.notice;

  if (status === 'authenticated') {
    return <Navigate to="/sprints" replace />;
  }

  return (
    <AppShell mode="auth">
      {status === 'loading' ? (
        <div className="boot" role="status">
          <div className="boot-console">
            <div className="boot-copy">
              <p>Restoring session</p>
              <span>GET /profile…</span>
            </div>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </AppShell>
  );
}
