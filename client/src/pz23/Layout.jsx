// ПЗ3 layout + ПЗ4 theme/lang из Context
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { isAuth, logout } from './auth';
import { useThemeLang } from '../pz24/ThemeLangContext';
import './pz23.css';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authed, setAuthed] = useState(isAuth());
  const { theme, lang, t, toggleTheme, toggleLang } = useThemeLang();

  useEffect(() => {
    setAuthed(isAuth());
  }, [location]);

  function onLogout() {
    logout();
    setAuthed(false);
    navigate('/');
  }

  return (
    <div className={`pz23 theme-${theme}`}>
      <header className="pz23-top">
        <strong>Agile Sprint Retro — ПЗ3/ПЗ4</strong>
        <span>{authed ? t.signedIn : t.guest}</span>
      </header>
      <nav className="pz23-nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
          {t.home}
        </NavLink>
        <NavLink to="/catalog" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          {t.catalog}
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          {t.about}
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          {t.dashboard}
        </NavLink>
        <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          {t.login}
        </NavLink>
        <button type="button" className="pz23-linkbtn" onClick={toggleTheme}>
          {t.theme}: {theme}
        </button>
        <button type="button" className="pz23-linkbtn" onClick={toggleLang}>
          {t.lang}: {lang}
        </button>
        {authed && (
          <button type="button" className="pz23-linkbtn" onClick={onLogout}>
            {t.logout}
          </button>
        )}
      </nav>
      <main className="pz23-main">
        <Outlet />
      </main>
    </div>
  );
}
