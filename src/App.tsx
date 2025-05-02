import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import './index.css'; // Убедитесь, что стили импортированы

const queryClient = new QueryClient();

function AppRouter() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      sessionStorage.removeItem('redirectPath');
      navigate(redirectPath.replace('/order-tracker', ''));
    }
  }, [navigate]);

  return (
    <>
      <Navigation />
      {/* ...остальной код... */}
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/order-tracker">
        <AppRouter />
      </BrowserRouter>
    </QueryClientProvider>
  );
}