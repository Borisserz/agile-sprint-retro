import { Link } from 'react-router-dom';
import { CATALOG } from '../catalogData';

export default function CatalogListPage() {
  return (
    <ul className="pz23-list">
      {CATALOG.map((item) => (
        <li key={item.id}>
          <Link to={`/catalog/${item.id}`}>
            {item.name} — {item.goal} ({item.status})
          </Link>
        </li>
      ))}
    </ul>
  );
}
