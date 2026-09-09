import SprintList from './components/SprintList';
import './App.css';

export default function App() {
  return (
    <div className="shell">
      <div className="shell-glow" aria-hidden="true" />
      <main className="app">
        <SprintList />
      </main>
    </div>
  );
}
