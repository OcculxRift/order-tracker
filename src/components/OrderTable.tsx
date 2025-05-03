import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export default function OrderTable() {
  const { data: orders, isLoading } = useQuery(['orders'], async () => {
    const { data } = await supabase
      .from('orders')
      .select('id, track_id, status, client_name')
      .order('created_at', { ascending: false });
    return data;
  });

  const deleteOrder = useMutation(async (id: string) => {
    await supabase.from('orders').delete().eq('id', id);
  });

  if (isLoading) return <div>Загрузка...</div>;
  if (!orders?.length) return <div>Нет заказов</div>;

  return (
    <table className="simple-table">
      <thead>
        <tr>
          <th>Трек</th>
          <th>Фирма</th>
          <th>Статус</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id}>
            <td>{order.track_id}</td>
            <td>{order.client_name || '-'}</td>
            <td>{order.status}</td>
            <td>
              <button 
                onClick={() => deleteOrder.mutate(order.id)}
                disabled={deleteOrder.isLoading}
              >
                Удалить
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}