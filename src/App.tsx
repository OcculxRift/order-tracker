import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from './components/AppLayout';
import AppRoutes from './components/AppRoutes';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/order-tracker">
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
