import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="viewport">
      <div className="viewport-bg" aria-hidden="true" />
      <main className="room login-room">
        <section className="rail login-panel" aria-labelledby="not-found-title">
          <div className="rail-head">
            <p className="rail-tag">404</p>
            <h1 id="not-found-title">Page not found</h1>
            <p>This route is not part of Sprint Control.</p>
          </div>
          <Link className="btn btn-main" to="/sprints">
            Back to sprints
          </Link>
        </section>
      </main>
    </div>
  );
}
