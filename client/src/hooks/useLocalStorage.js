import { useState, useEffect } from 'react';

const STORAGE_KEY = 'agile-sprints';

function readStorage(fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function useLocalStorage(initialValue, debounceMs = 500) {
  const [value, setValue] = useState(() => readStorage(initialValue));

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs]);

  return [value, setValue];
}
