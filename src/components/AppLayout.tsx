import { Outlet } from 'react-router-dom';
import Navigation from './components/Navigation';

export default function AppLayout() {
  return (
    <div className="app-container">
      <Navigation />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}