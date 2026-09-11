import SprintList from '../components/SprintList';
import { useAuth } from '../context/AuthContext';

export default function SprintsPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="viewport">
      <div className="viewport-bg" aria-hidden="true" />
      <SprintList onLogout={signOut} user={user} />
    </div>
  );
}
