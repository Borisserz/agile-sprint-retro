import { Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoute from './routes/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SprintsPage from './pages/SprintsPage';
import RetroPage from './pages/RetroPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from './context/AuthContext';
import './App.css';

function HomeRedirect() {
  const { status } = useAuth();
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
  return <Navigate to={status === 'authenticated' ? '/sprints' : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/sprints"
        element={
          <PrivateRoute>
            <SprintsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/sprints/:id/retro"
        element={
          <PrivateRoute>
            <RetroPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
