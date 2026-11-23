import { useEffect, useState } from 'react';

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** Generic localStorage hook (Lab 5–6 pattern from Digital Library). */
export function useLocalStorage(key, initialValue, debounceMs = 300) {
  const [value, setValue] = useState(() => readStorage(key, initialValue));

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* quota / private mode — ignore */
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [key, value, debounceMs]);

  return [value, setValue];
}
