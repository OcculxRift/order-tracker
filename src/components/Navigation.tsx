import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useEffect, useState, useCallback } from 'react';

export default function Navigation() {
  const [isAuth, setIsAuth] = useState(false);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (!error) {
      setIsAuth(!!data.user);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [checkAuth]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAuth(false); // Сброс состояния
    navigate('/'); // Переход на главную
  }, [navigate]);

  return (
    <nav className="nav">
      <Link to="/" className="nav-link">🏠 Главная</Link>
      {isAuth && (
        <Link to="/admin" className="nav-link">🔑 Админ</Link>
      )}
      {isAuth ? (
        <button onClick={handleLogout} className="nav-btn">🚪 Выйти</button>
      ) : (
        <Link to="/login" className="nav-btn">🔒 Войти</Link>
      )}
    </nav>
  );
}
