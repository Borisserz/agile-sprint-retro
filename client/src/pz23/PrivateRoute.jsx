// ПЗ3: защищённый маршрут — без isAuth редирект на /login
import { Navigate, useLocation } from 'react-router-dom';
import { isAuth } from './auth';

export default function PrivateRoute({ children }) {
  const location = useLocation();
  if (!isAuth()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
