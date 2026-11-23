import { Link } from 'react-router-dom';
import AppShell from '../layout/AppShell';

export default function NotFoundPage() {
  return (
    <AppShell mode="auth">
      <main className="room login-room">
        <section className="rail login-panel" aria-labelledby="not-found-title">
          <div className="rail-head">
            <p className="rail-tag">404</p>
            <h1 id="not-found-title">Page not found</h1>
            <p>This route is not part of Sprint Retro.</p>
          </div>
          <Link className="btn btn-main" to="/sprints">
            Back to sprints
          </Link>
        </section>
      </main>
    </AppShell>
  );
}
