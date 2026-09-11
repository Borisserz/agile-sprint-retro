import { Link } from 'react-router-dom';
import { useFavorites } from '../../pz24/FavoritesContext';

export default function DashboardPage() {
  const { favorites, dispatch } = useFavorites();

  return (
    <>
      <h1>Личный кабинет</h1>
      <p>Защищённая страница. Избранные спринты (useReducer + Context):</p>
      {favorites.length === 0 ? (
        <p>Пока пусто — добавьте спринты в каталоге.</p>
      ) : (
        <ul>
          {favorites.map((row) => (
            <li key={row.id}>
              {row.name} (голоса: {row.votes}){' '}
              <button
                type="button"
                onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: { id: row.id } })}
              >
                удалить
              </button>
            </li>
          ))}
        </ul>
      )}
      {favorites.length > 0 && (
        <button type="button" onClick={() => dispatch({ type: 'CLEAR' })}>
          Очистить избранное
        </button>
      )}
      <p>
        <Link to="/catalog">К каталогу</Link>
      </p>
    </>
  );
}
