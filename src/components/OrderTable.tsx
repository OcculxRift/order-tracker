import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useState } from 'react';

// Константы для статусов
const STATUS_OPTIONS = [
  'Зарегистрирован',
  'Забрали со склада поставщика',
  'Прибыл на склад отправления',
  'Отправлен на границу РК',
  'Прибыл на границу РК',
  'Погрузка, ожидаем в Алматы в течении 2-3 дней', 
  'Прибыл в Алматы',
  'Доставлен'
];

const STATUS_COLORS: Record<string, string> = {
  'Зарегистрирован': '#6c757d',
  'Забрали со склада поставщика': '#6f42c1',
  'Прибыл на склад отправления': '#007bff',
  'Отправлен на границу РК': '#17a2b8',
  'Прибыл на границу РК': '#fd7e14',
  'Погрузка, ожидаем в Алматы в течении 2-3 дней': '#ffc107',
  'Прибыл в Алматы': '#28a745',
  'Доставлен': '#34c759'
};

export default function OrderTable() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    track_id: '',
    company_name: '',
    status: STATUS_OPTIONS[0]
  });

  // Оптимизированный запрос с пагинацией
  const { data: orders, isLoading, error } = useQuery(
    ['orders'],
    async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    {
      keepPreviousData: true,
      staleTime: 30000 // 30 секунд
    }
  );

  // Общая функция для мутаций
  const handleMutation = async (mutationFn: Promise<any>, action: string) => {
    try {
      await mutationFn;
      queryClient.invalidateQueries(['orders']);
      if (action === 'update') setEditingId(null);
    } catch (err) {
      console.error(`Ошибка при ${action} заказа:`, err);
    }
  };

  // Обработчики действий
  const handleEdit = (order: any) => {
    setEditingId(order.id);
    setEditData({
      track_id: order.track_id,
      company_name: order.company_name || '',
      status: order.status
    });
  };

  const handleSave = () => {
    if (!editingId) return;
    handleMutation(
      supabase
        .from('orders')
        .update(editData)
        .eq('id', editingId),
      'update'
    );
  };

  const handleDelete = (id: string) => {
    handleMutation(
      supabase
        .from('orders')
        .delete()
        .eq('id', id),
      'delete'
    );
  };

  // Состояние загрузки
  const isMutating = useMutation().isLoading;

  if (isLoading) return <div className="loading">Загрузка заказов...</div>;
  if (error) return <div className="error">Ошибка: {(error as Error).message}</div>;
  if (!orders?.length) return <div className="empty">Нет заказов</div>;

  return (
    <div className="table-container">
      <table className="orders-table">
        <thead>
          <tr>
            <th>Трек-номер</th>
            <th>Фирма</th>
            <th>Статус</th>
            <th>Дата</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>
                {editingId === order.id ? (
                  <input
                    value={editData.track_id}
                    onChange={(e) => setEditData({...editData, track_id: e.target.value})}
                    disabled={isMutating}
                  />
                ) : (
                  order.track_id
                )}
              </td>
              <td>
                {editingId === order.id ? (
                  <input
                    value={editData.company_name}
                    onChange={(e) => setEditData({...editData, company_name: e.target.value})}
                    disabled={isMutating}
                  />
                ) : (
                  order.company_name || '-'
                )}
              </td>
              <td style={{ color: STATUS_COLORS[order.status] }}>
                {editingId === order.id ? (
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({...editData, status: e.target.value})}
                    disabled={isMutating}
                  >
                    {STATUS_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  order.status
                )}
              </td>
              <td>
                {new Date(order.created_at).toLocaleString()}
              </td>
              <td className="actions">
                {editingId === order.id ? (
                  <>
                    <button onClick={handleSave} disabled={isMutating}>
                      {isMutating ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button onClick={() => setEditingId(null)} disabled={isMutating}>
                      Отмена
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(order)} disabled={isMutating}>
                      Редактировать
                    </button>
                    <button 
                      onClick={() => handleDelete(order.id)} 
                      disabled={isMutating}
                      className="delete"
                    >
                      Удалить
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}