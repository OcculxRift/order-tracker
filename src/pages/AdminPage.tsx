import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import AddOrderForm from '../components/AddOrderForm';
import OrderTable from '../components/OrderTable';

export default function AdminPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate('/login');
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') navigate('/login');
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

  return (
    <div className="admin-wrapper">
      <h1 style={{ marginBottom: '1.5rem' }}>Панель администратора</h1>
      <AddOrderForm />
      <OrderTable />
    </div>
  );
}
