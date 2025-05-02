import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';

export default function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  };

  useEffect(() => {
    checkAuth();

    // Подписка на изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // После выхода перепроверяем статус
    await checkAuth();
  };

  return (
    <nav className="nav fade-in">
      <div className="nav-container">
        <div className="nav-links">
          <Link to="/order-tracker/" className="nav-link">Главная</Link>
          {isAuthenticated && (
            <Link to="/admin" className="nav-link">Админ</Link>
          )}
        </div>
        {isAuthenticated ? (
          <button 
            onClick={handleLogout}
            className="btn btn-outline"
          >
            Выйти
          </button>
        ) : (
          <Link to="/login" className="btn btn-primary">
            Войти
          </Link>
        )}
      </div>
    </nav>
  );
}
