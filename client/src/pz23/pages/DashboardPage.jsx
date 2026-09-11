import { Link } from 'react-router-dom';

export default function DashboardPage() {
  return (
    <>
      <h1>Личный кабинет</h1>
      <p>Защищённая страница (/dashboard). Доступна только после входа.</p>
      <ul>
        <li>
          <Link to="/catalog">Перейти к каталогу спринтов</Link>
        </li>
      </ul>
    </>
  );
}
