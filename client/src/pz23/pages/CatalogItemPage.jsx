// ПЗ3: useParams + ПЗ4: избранное через Context/dispatch
import { Link, useParams } from 'react-router-dom';
import { findCatalogItem } from '../catalogData';
import NotFoundPage from './NotFoundPage';
import { useFavorites } from '../../pz24/FavoritesContext';

export default function CatalogItemPage() {
  const { id } = useParams();
  const item = findCatalogItem(id);
  const { favorites, dispatch } = useFavorites();

  if (!item) {
    return <NotFoundPage />;
  }

  const fav = favorites.find((row) => row.id === item.id);

  return (
    <article className="pz23-card">
      <h2>{item.name}</h2>
      <p>
        <strong>ID:</strong> {item.id}
      </p>
      <p>
        <strong>Цель:</strong> {item.goal}
      </p>
      <p>
        <strong>Статус:</strong> {item.status}
      </p>
      {fav ? (
        <div className="pz24-votes">
          <p>В избранном · голоса: {fav.votes}</p>
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: 'SET_VOTES',
                payload: { id: item.id, votes: fav.votes + 1 },
              })
            }
          >
            + голос
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: 'SET_VOTES',
                payload: { id: item.id, votes: Math.max(0, fav.votes - 1) },
              })
            }
          >
            − голос
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: { id: item.id } })}
          >
            Убрать
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            dispatch({ type: 'ADD_ITEM', payload: { id: item.id, name: item.name } })
          }
        >
          Добавить в избранное
        </button>
      )}
      <p>
        <Link to="/catalog">← К каталогу</Link>
      </p>
    </article>
  );
}
