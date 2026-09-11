// ПЗ3: имитация входа + программная навигация на /dashboard
import { useNavigate } from 'react-router-dom';
import { isAuth, login } from '../auth';

export default function LoginPage() {
  const navigate = useNavigate();

  function onSubmit(event) {
    event.preventDefault();
    login();
    navigate('/dashboard');
  }

  if (isAuth()) {
    return (
      <>
        <h1>Вход</h1>
        <p>Вы уже вошли. Можно открыть кабинет.</p>
        <button type="button" onClick={() => navigate('/dashboard')}>
          Перейти в кабинет
        </button>
      </>
    );
  }

  return (
    <>
      <h1>Вход</h1>
      <p>Имитация авторизации для защищённого маршрута (localStorage).</p>
      <form onSubmit={onSubmit} className="pz23-form">
        <button type="submit">Войти и открыть кабинет</button>
      </form>
    </>
  );
}
