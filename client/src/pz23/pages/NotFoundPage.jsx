import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <>
      <h1>404 — страница не найдена</h1>
      <p>
        <Link to="/">На главную</Link>
      </p>
    </>
  );
}
