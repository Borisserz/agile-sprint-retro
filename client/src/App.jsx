// ПЗ3 + ПЗ4: Router + Context providers
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeLangProvider } from './pz24/ThemeLangContext';
import { FavoritesProvider } from './pz24/FavoritesContext';
import Layout from './pz23/Layout';
import PrivateRoute from './pz23/PrivateRoute';
import HomePage from './pz23/pages/HomePage';
import CatalogLayout from './pz23/pages/CatalogLayout';
import CatalogListPage from './pz23/pages/CatalogListPage';
import CatalogItemPage from './pz23/pages/CatalogItemPage';
import AboutPage from './pz23/pages/AboutPage';
import LoginPage from './pz23/pages/LoginPage';
import DashboardPage from './pz23/pages/DashboardPage';
import NotFoundPage from './pz23/pages/NotFoundPage';

export default function App() {
  return (
    <ThemeLangProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="catalog" element={<CatalogLayout />}>
                <Route index element={<CatalogListPage />} />
                <Route path=":id" element={<CatalogItemPage />} />
              </Route>
              <Route path="about" element={<AboutPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route
                path="dashboard"
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FavoritesProvider>
    </ThemeLangProvider>
  );
}
