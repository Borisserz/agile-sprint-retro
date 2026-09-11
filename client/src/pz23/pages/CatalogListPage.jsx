import { Link } from 'react-router-dom';
import { CATALOG } from '../catalogData';
import { useFavorites } from '../../pz24/FavoritesContext';

export default function CatalogListPage() {
  const { favorites, dispatch } = useFavorites();

  return (
    <>
      <ul className="pz23-list">
        {CATALOG.map((item) => {
          const fav = favorites.find((row) => row.id === item.id);
          return (
            <li key={item.id}>
              <Link to={`/catalog/${item.id}`}>
                {item.name} — {item.goal} ({item.status})
              </Link>{' '}
              {fav ? (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: { id: item.id } })}
                >
                  Убрать из избранного
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'ADD_ITEM',
                      payload: { id: item.id, name: item.name },
                    })
                  }
                >
                  В избранное
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <p className="pz24-muted">В избранном: {favorites.length}</p>
    </>
  );
}
