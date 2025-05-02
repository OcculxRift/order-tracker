import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';

export default function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  };

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      checkAuth();
      if (event === 'SIGNED_OUT') {
        navigate('/');
      }
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="nav fade-in">
      <div className="nav-container">
        <div className="nav-links">
          <Link to="/" className="nav-link">Главная</Link>
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