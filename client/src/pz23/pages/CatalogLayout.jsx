// ПЗ3: вложенный layout каталога — дочерние маршруты через Outlet
import { Outlet } from 'react-router-dom';

export default function CatalogLayout() {
  return (
    <>
      <h1>Каталог спринтов</h1>
      <Outlet />
    </>
  );
}
