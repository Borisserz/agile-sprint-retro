// ПЗ4: избранные спринты — useReducer + Context (+ localStorage)
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const FavoritesContext = createContext(null);
const STORAGE_KEY = 'pz24_favorites';

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function favoritesReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      if (state.some((row) => row.id === action.payload.id)) return state;
      return [...state, { id: action.payload.id, name: action.payload.name, votes: 1 }];
    }
    case 'REMOVE_ITEM':
      return state.filter((row) => row.id !== action.payload.id);
    case 'SET_VOTES': {
      const votes = Number(action.payload.votes);
      if (!Number.isFinite(votes) || votes < 0) return state;
      return state.map((row) =>
        row.id === action.payload.id ? { ...row, votes } : row,
      );
    }
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function FavoritesProvider({ children }) {
  const [favorites, dispatch] = useReducer(favoritesReducer, undefined, loadInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const value = useMemo(() => ({ favorites, dispatch }), [favorites]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites outside FavoritesProvider');
  return ctx;
}
