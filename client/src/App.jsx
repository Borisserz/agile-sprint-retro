import { Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoute from './routes/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SprintsPage from './pages/SprintsPage';
import RetroPage from './pages/RetroPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from './context/AuthContext';
import './styles/part1.css';
import './App.css';

function BootScreen() {
  return (
    <div className="boot" role="status">
      <div className="boot-console">
        <div className="boot-copy">
          <p>Restoring session</p>
          <span>GET /profile…</span>
        </div>
      </div>
    </div>
  );
}

function HomeGate() {
  const { status } = useAuth();
  if (status === 'loading') return <BootScreen />;
  if (status === 'authenticated') return <Navigate to="/sprints" replace />;
  return <HomePage />;
}

export default function App() {
  return (
    <div className="viewport">
      <div className="viewport-bg" aria-hidden="true" />
      <Routes>
        <Route path="/" element={<HomeGate />} />
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
    </div>
  );
}
