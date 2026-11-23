import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AppShell from '../layout/AppShell';
import { useAuth } from '../context/AuthContext';

const FAQ = [
  {
    q: 'What is Sprint Retro?',
    a: 'A coursework web app for planning Agile sprints, tracking action items, and running live retrospectives with the team.',
  },
  {
    q: 'Which databases does it use?',
    a: 'PostgreSQL (Sequelize) for structured sprint data and MongoDB (Mongoose) for nested documents and retro history — switchable on the board.',
  },
  {
    q: 'How do live retros work?',
    a: 'After sign-in, open a sprint room over Socket.IO: chat, presence, cards, and votes sync in real time for facilitators and members.',
  },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Sprint Retro',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'Service for planning sprints and retrospectives in Agile teams — React client, Express API, PostgreSQL and MongoDB.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BYN',
  },
  author: {
    '@type': 'Person',
    name: 'Сержанович Б. А.',
  },
};

export default function HomePage() {
  const { status } = useAuth();

  useEffect(() => {
    document.title = 'Sprint Retro';
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.dataset.sprintRetroLd = '1';
    el.text = JSON.stringify(JSON_LD);
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  if (status === 'authenticated') {
    return <Navigate to="/sprints" replace />;
  }

  if (status === 'loading') {
    return (
      <AppShell mode="auth">
        <div className="boot" role="status">
          <div className="boot-console">
            <div className="boot-copy">
              <p>Restoring session</p>
              <span>GET /profile…</span>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell mode="marketing">
      <main className="landing" id="home">
        <header className="landing__hero">
          <p className="landing__eyebrow">ИТиВП · курсовой проект</p>
          <h1 className="landing__title">Sprint Retro</h1>
          <p className="landing__lead">
            Планируйте спринты, фиксируйте action items и проводите живые ретроспективы в одной
            команде — с PostgreSQL, MongoDB и Socket.IO.
          </p>
          <div className="landing__cta">
            <Link className="btn btn-main" to="/register">
              Create account
            </Link>
            <Link className="btn btn-quiet" to="/login">
              Sign in
            </Link>
          </div>
        </header>

        <section className="landing__section" id="about" aria-labelledby="about-title">
          <h2 id="about-title" className="landing__h2">
            About
          </h2>
          <p className="landing__copy">
            Product modules: authentication with JWT roles, sprint board with dual data stores, and
            a live retrospective room. Built with the stack from both semesters — semantic layout
            and adaptive CSS from part 1, Express and databases from part 2.
          </p>
          <ul className="landing__grid" role="list">
            <li className="landing__card">
              <h3 className="landing__h3">Auth</h3>
              <p>Register, login, profile, change password, facilitator / member roles.</p>
            </li>
            <li className="landing__card">
              <h3 className="landing__h3">Sprints</h3>
              <p>CRUD, search, action items, favorites and health rating stored locally.</p>
            </li>
            <li className="landing__card">
              <h3 className="landing__h3">Live retro</h3>
              <p>Socket.IO rooms with cards, votes, chat, and presence.</p>
            </li>
          </ul>
        </section>

        <section className="landing__section" id="faq" aria-labelledby="faq-title">
          <h2 id="faq-title" className="landing__h2">
            FAQ
          </h2>
          <div className="landing__faq">
            {FAQ.map((item) => (
              <details key={item.q} className="landing__faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section
          className="landing__section landing__section--cta"
          id="contact"
          aria-labelledby="cta-title"
        >
          <h2 id="cta-title" className="landing__h2">
            Ready to facilitate?
          </h2>
          <p className="landing__copy">
            Seed users: <code>facilitator@agile.local</code> / <code>Password1!</code>
          </p>
          <Link className="btn btn-main" to="/login">
            Open the board
          </Link>
        </section>
      </main>
    </AppShell>
  );
}
