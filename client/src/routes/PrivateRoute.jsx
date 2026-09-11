import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Blocks anonymous users; waits while /profile restores a stored JWT. */
export default function PrivateRoute({ children }) {
  const { status } = useAuth();
  const location = useLocation();

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

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
