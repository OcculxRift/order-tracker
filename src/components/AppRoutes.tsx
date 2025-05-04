import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import AdminPage from '../pages/AdminPage';
import AuthAdmin from '../components/AuthAdmin';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/login" element={<AuthAdmin />} />
    </Routes>
  );
}
