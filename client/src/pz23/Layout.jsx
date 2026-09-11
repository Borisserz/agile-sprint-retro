// ПЗ3: общий layout с NavLink и Outlet (вложенные маршруты)
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { isAuth, logout } from './auth';
import './pz23.css';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authed, setAuthed] = useState(isAuth());

  useEffect(() => {
    setAuthed(isAuth());
  }, [location]);

  function onLogout() {
    logout();
    setAuthed(false);
    navigate('/');
  }

  return (
    <div className="pz23">
      <header className="pz23-top">
        <strong>Agile Sprint Retro — ПЗ3 (Router)</strong>
        <span>{authed ? 'Вход выполнен' : 'Гость'}</span>
      </header>
      <nav className="pz23-nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Главная
        </NavLink>
        <NavLink to="/catalog" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Каталог
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          О проекте
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Кабинет
        </NavLink>
        <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Вход
        </NavLink>
        {authed && (
          <button type="button" className="pz23-linkbtn" onClick={onLogout}>
            Выйти
          </button>
        )}
      </nav>
      <main className="pz23-main">
        <Outlet />
      </main>
    </div>
  );
}
