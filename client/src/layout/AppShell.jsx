import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChangePasswordForm from '../components/ChangePasswordForm';

export default function AppShell({ children, mode = 'app' }) {
  const { user, status, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const authed = status === 'authenticated';

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="app-shell">
      <header className="site-nav" role="banner">
        <div className="site-nav-inner">
          <Link to={authed ? '/sprints' : '/'} className="site-brand" onClick={closeMenu}>
            <span className="brand-mark" aria-hidden="true" />
            <span className="site-brand-text">
              <span className="site-brand-kicker">Agile</span>
              <span className="site-brand-name">Sprint Retro</span>
            </span>
          </Link>

          <button
            type="button"
            className={`nav-toggle${menuOpen ? ' is-open' : ''}`}
            aria-expanded={menuOpen}
            aria-controls="site-nav-panel"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="visually-hidden">Menu</span>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>

          <div id="site-nav-panel" className={`site-nav-panel${menuOpen ? ' is-open' : ''}`}>
            <nav className="site-nav-links" aria-label="Main">
              {authed ? (
                <NavLink to="/sprints" className="site-nav-link" onClick={closeMenu}>
                  Sprints
                </NavLink>
              ) : (
                <>
                  <NavLink to="/" end className="site-nav-link" onClick={closeMenu}>
                    Home
                  </NavLink>
                  {mode === 'marketing' && (
                    <>
                      <a className="site-nav-link" href="#about" onClick={closeMenu}>
                        About
                      </a>
                      <a className="site-nav-link" href="#faq" onClick={closeMenu}>
                        FAQ
                      </a>
                    </>
                  )}
                  <NavLink to="/login" className="site-nav-link" onClick={closeMenu}>
                    Sign in
                  </NavLink>
                  <NavLink to="/register" className="site-nav-link" onClick={closeMenu}>
                    Register
                  </NavLink>
                </>
              )}
            </nav>

            {authed && (
              <div className="site-nav-session">
                <span className="session-user">
                  {user?.email || 'signed in'}
                  {user?.role ? ` · ${user.role}` : ''}
                </span>
                <ChangePasswordForm />
                <button type="button" className="btn btn-quiet" onClick={signOut}>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={`app-main app-main--${mode}`}>{children}</div>

      <footer className="site-footer" role="contentinfo">
        <div className="site-footer-inner">
          <p className="site-footer-title">
            Сервис планирования спринтов и ретроспектив в Agile-командах
          </p>
          <p className="site-footer-meta">
            ИТиВП · Labs 1–8 · гр. 320602 · Сержанович Б. А.
          </p>
        </div>
      </footer>
    </div>
  );
}
