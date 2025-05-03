import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useState } from 'react';
import { STATUS_OPTIONS } from '../constants/statuses';

export default function OrderTable() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    track_id: '',
    client_name: '',
    status: STATUS_OPTIONS[0]
  });

  // Запрос данных
  const { data: orders } = useQuery(['orders'], async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    return data;
  });

  // Мутации
  const updateMutation = useMutation(async () => {
    if (!editingId) return;
    await supabase
      .from('orders')
      .update(editData)
      .eq('id', editingId);
  });

  const deleteMutation = useMutation(async (id: string) => {
    await supabase.from('orders').delete().eq('id', id);
  });

  // Обработчики
  const startEdit = (order: any) => {
    setEditingId(order.id);
    setEditData({
      track_id: order.track_id,
      client_name: order.client_name || '',
      status: order.status
    });
  };

  const saveEdit = async () => {
    await updateMutation.mutateAsync();
    setEditingId(null);
  };

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
        {orders?.map(order => (
          <tr key={order.id}>
            <td>
              {editingId === order.id ? (
                <input
                  value={editData.track_id}
                  onChange={e => setEditData(prev => ({ 
                    ...prev, 
                    track_id: e.target.value 
                  }))}
                  className="form-control"
                />
              ) : (
                order.track_id
              )}
            </td>
            
            <td>
              {editingId === order.id ? (
                <input
                  value={editData.client_name}
                  onChange={e => setEditData(prev => ({ 
                    ...prev, 
                    client_name: e.target.value 
                  }))}
                  className="form-control"
                />
              ) : (
                order.client_name || '-'
              )}
            </td>

            <td>
              {editingId === order.id ? (
                <select
                  value={editData.status}
                  onChange={e => setEditData(prev => ({ 
                    ...prev, 
                    status: e.target.value 
                  }))}
                  className="form-control"
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
              {editingId === order.id ? (
                <>
                  <button onClick={saveEdit} className="btn-save">✅</button>
                  <button onClick={() => setEditingId(null)} className="btn-cancel">❌</button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(order)} className="btn-edit">✏️</button>
                  <button 
                    onClick={() => deleteMutation.mutate(order.id)} 
                    className="btn-delete"
                  >
                    🗑️
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}