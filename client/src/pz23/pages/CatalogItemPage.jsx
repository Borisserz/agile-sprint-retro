// ПЗ3: динамический сегмент /catalog/:id через useParams
import { Link, useParams } from 'react-router-dom';
import { findCatalogItem } from '../catalogData';
import NotFoundPage from './NotFoundPage';

export default function CatalogItemPage() {
  const { id } = useParams();
  const item = findCatalogItem(id);

  if (!item) {
    return <NotFoundPage />;
  }

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
      <p>
        <Link to="/catalog">← К каталогу</Link>
      </p>
    </article>
  );
}
