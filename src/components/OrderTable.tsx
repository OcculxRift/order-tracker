import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useState } from 'react';

export default function OrderTable() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ track_id: '', client_name: '', status: '' });

  // Получаем список заказов
  const { data: orders, isLoading, error } = useQuery(['orders'], async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  });

  // Мутация для обновления заказа
  const updateOrder = useMutation(async (updatedOrder: any) => {
    const { error } = await supabase
      .from('orders')
      .update(updatedOrder)
      .eq('id', updatedOrder.id);
    if (error) throw error;
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      setEditingId(null);
    }
  });

  // Мутация для удаления заказа
  const deleteOrder = useMutation(async (id: string) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    }
  });

  // Начало редактирования
  const handleEdit = (order: any) => {
    setEditingId(order.id);
    setEditData({
      track_id: order.track_id,
      client_name: order.client_name || '',
      status: order.status
    });
  };

  // Сохранение изменений
  const handleSave = () => {
    if (editingId) {
      updateOrder.mutate({
        id: editingId,
        ...editData
      });
    }
  };

  // Отмена редактирования
  const handleCancel = () => {
    setEditingId(null);
  };

  if (isLoading) return <div>Загрузка заказов...</div>;
  if (error) return <div>Ошибка загрузки: {(error as Error).message}</div>;
  if (!orders?.length) return <div>Нет заказов</div>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>Трек-номер</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Клиент</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Статус</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Дата</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>
                {editingId === order.id ? (
                  <input
                    type="text"
                    value={editData.track_id}
                    onChange={(e) => setEditData({...editData, track_id: e.target.value})}
                    style={{ width: '100%', padding: '6px' }}
                  />
                ) : (
                  order.track_id
                )}
              </td>
              <td style={{ padding: '12px' }}>
                {editingId === order.id ? (
                  <input
                    type="text"
                    value={editData.client_name}
                    onChange={(e) => setEditData({...editData, client_name: e.target.value})}
                    style={{ width: '100%', padding: '6px' }}
                  />
                ) : (
                  order.client_name || '-'
                )}
              </td>
              <td style={{ padding: '12px' }}>
                {editingId === order.id ? (
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({...editData, status: e.target.value})}
                    style={{ width: '100%', padding: '6px' }}
                  >
                    <option value="В обработке">В обработке</option>
                    <option value="Отправлен">Отправлен</option>
                    <option value="Доставлен">Доставлен</option>
                  </select>
                ) : (
                  order.status
                )}
              </td>
              <td style={{ padding: '12px' }}>
                {new Date(order.created_at).toLocaleString()}
              </td>
              <td style={{ padding: '12px' }}>
                {editingId === order.id ? (
                  <>
                    <button 
                      onClick={handleSave}
                      style={{ 
                        marginRight: '8px',
                        padding: '4px 8px',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Сохранить
                    </button>
                    <button 
                      onClick={handleCancel}
                      style={{ 
                        padding: '4px 8px',
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Отмена
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => handleEdit(order)}
                      style={{ 
                        marginRight: '8px',
                        padding: '4px 8px',
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Редакт.
                    </button>
                    <button 
                      onClick={() => deleteOrder.mutate(order.id)}
                      style={{ 
                        padding: '4px 8px',
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
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