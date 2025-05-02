import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import AddOrderForm from '../components/AddOrderForm';
import OrderTable from '../components/OrderTable';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate('/login');
      else setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') navigate('/login');
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="container">
        <div className="card">Проверка авторизации...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="card">
        <h1>Панель администратора</h1>
        <AddOrderForm />
        <OrderTable />
      </div>
    </div>
  );
}