// OrderTable.tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useState } from 'react';
import { STATUS_OPTIONS, STATUS_COLORS } from '../constants/statuses';

export default function OrderTable() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    track_id: '',
    client_name: '',
    status: STATUS_OPTIONS[0]
  });

  // Запрос данных
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
    { staleTime: 30000 }
  );

  // Мутация для обновления
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingId) return;
      const { error } = await supabase
        .from('orders')
        .update(editData)
        .eq('id', editingId);
      if (error) throw error;
    },
    onSuccess: () => setEditingId(null)
  });

  // Мутация для удаления
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  });

  // Обработчики действий
  const handleEdit = (order: any) => {
    setEditingId(order.id);
    setEditData({
      track_id: order.track_id,
      client_name: order.client_name || '',
      status: order.status
    });
  };

  const handleSave = () => updateMutation.mutate();
  const handleDelete = (id: string) => deleteMutation.mutate(id);

  // Состояния загрузки
  const isMutating = updateMutation.isLoading || deleteMutation.isLoading;

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
        onChange={(e) => setEditData(prev => ({
          ...prev,
          track_id: e.target.value
        }))}
        className="form-control"
        disabled={isMutating}
      />
    ) : (
      order.track_id
    )}
  </td>
  <td>
    {editingId === order.id ? (
      <input
        value={editData.client_name}  // Исправлено: client_name вместо company_name
        onChange={(e) => setEditData(prev => ({
          ...prev,
          client_name: e.target.value // Исправлено: client_name
        }))}
        className="form-control"
        disabled={isMutating}
      />
                ) : (
                  order.client_name || '-'
                )}
              </td>
              <td style={{ color: STATUS_COLORS[order.status] }}>
                {editingId === order.id ? (
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      status: e.target.value
                    }))}
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
                    <button 
                      onClick={handleSave} 
                      disabled={isMutating}
                    >
                      {updateMutation.isLoading ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button 
                      onClick={() => setEditingId(null)} 
                      disabled={isMutating}
                    >
                      Отмена
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => handleEdit(order)} 
                      disabled={isMutating}
                    >
                      Редактировать
                    </button>
                    <button 
                      onClick={() => handleDelete(order.id)} 
                      disabled={isMutating}
                      className="delete"
                    >
                      {deleteMutation.isLoading ? 'Удаление...' : 'Удалить'}
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