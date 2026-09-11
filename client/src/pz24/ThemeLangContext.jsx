// ПЗ4: Theme + language Context (без prop drilling)
import { createContext, useContext, useMemo, useState } from 'react';

const ThemeLangContext = createContext(null);

const TEXTS = {
  ru: {
    home: 'Главная',
    catalog: 'Каталог',
    about: 'О проекте',
    dashboard: 'Кабинет',
    login: 'Вход',
    logout: 'Выйти',
    guest: 'Гость',
    signedIn: 'Вход выполнен',
    theme: 'Тема',
    lang: 'Язык',
  },
  en: {
    home: 'Home',
    catalog: 'Catalog',
    about: 'About',
    dashboard: 'Dashboard',
    login: 'Login',
    logout: 'Log out',
    guest: 'Guest',
    signedIn: 'Signed in',
    theme: 'Theme',
    lang: 'Lang',
  },
};

export function ThemeLangProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('ru');

  const value = useMemo(
    () => ({
      theme,
      lang,
      t: TEXTS[lang],
      toggleTheme: () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light')),
      toggleLang: () => setLang((prev) => (prev === 'ru' ? 'en' : 'ru')),
    }),
    [theme, lang],
  );

  return <ThemeLangContext.Provider value={value}>{children}</ThemeLangContext.Provider>;
}

export function useThemeLang() {
  const ctx = useContext(ThemeLangContext);
  if (!ctx) throw new Error('useThemeLang outside ThemeLangProvider');
  return ctx;
}
