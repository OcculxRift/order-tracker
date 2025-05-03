import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';

export default function Navigation() {
  const [isAuth, setIsAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuth(!!user);
    };
    
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => checkAuth());
    return () => subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="nav">
      <Link to="/" className="nav-link">Главная</Link>
      {isAuth && <Link to="/admin" className="nav-link">Админ</Link>}
      {isAuth 
        ? <button onClick={handleLogout} className="nav-btn">Выйти</button>
        : <Link to="/login" className="nav-btn">Войти</Link>}
    </nav>
  );
}