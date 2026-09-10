import SprintList from './components/SprintList';
import './App.css';

export default function App() {
  return (
    <div className="viewport">
      <div className="viewport-bg" aria-hidden="true" />
      <SprintList />
    </div>
  );
}
