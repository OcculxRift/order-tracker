import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useState, useCallback, useEffect } from 'react';
import { STATUS_OPTIONS, STATUS_COLORS } from '../constants/statuses';

type Order = {
  id: string;
  track_id: string;
  client_name: string;
  status: string;
};

export default function OrderTable() {
  const queryClient = useQueryClient();
  const [isMobile, setIsMobile] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Order>>({});

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 480);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: orders = [] } = useQuery(['orders'], async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Order[];
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingId) return;
      await supabase.from('orders').update(editData).eq('id', editingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('orders').delete().eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });

  const startEdit = useCallback((order: Order) => {
    setEditingId(order.id);
    setEditData({
      track_id: order.track_id,
      client_name: order.client_name || '',
      status: order.status,
    });
  }, []);

  const handleChange = useCallback(
    (field: keyof Order, value: string) => {
      setEditData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const saveEdit = useCallback(() => {
    updateMutation.mutate();
  }, [updateMutation]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  return isMobile ? (
    <div className="order-cards">
      {orders.map((order) => (
        <div key={order.id} className="order-card">
          {editingId === order.id ? (
            <>
              <input
                value={editData.track_id ?? ''}
                onChange={(e) => handleChange('track_id', e.target.value)}
                className="form-control"
              />
              <input
                value={editData.client_name ?? ''}
                onChange={(e) => handleChange('client_name', e.target.value)}
                className="form-control"
              />
              <select
                value={editData.status ?? STATUS_OPTIONS[0]}
                onChange={(e) => handleChange('status', e.target.value)}
                className="form-control"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="card-actions">
                <button onClick={saveEdit} className="btn-save">✅</button>
                <button onClick={cancelEdit} className="btn-cancel">❌</button>
              </div>
            </>
          ) : (
            <>
              <p><strong>Трек:</strong> {order.track_id}</p>
              <p><strong>Фирма:</strong> {order.client_name || '-'}</p>
              <p>
                <strong>Статус:</strong>{' '}
                <span style={{ color: STATUS_COLORS[order.status] }}>
                  {order.status}
                </span>
              </p>
              <div className="card-actions">
                <button onClick={() => startEdit(order)} className="btn-edit">✏️</button>
                <button onClick={() => deleteMutation.mutate(order.id)} className="btn-delete">🗑️</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  ) : (
    <div className="table-container">
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
          {orders.map((order) => (
            <tr key={order.id}>
              <td>
                {editingId === order.id ? (
                  <input
                    value={editData.track_id ?? ''}
                    onChange={(e) => handleChange('track_id', e.target.value)}
                    className="form-control"
                  />
                ) : (
                  order.track_id
                )}
              </td>
              <td>
                {editingId === order.id ? (
                  <input
                    value={editData.client_name ?? ''}
                    onChange={(e) => handleChange('client_name', e.target.value)}
                    className="form-control"
                  />
                ) : (
                  order.client_name || '-'
                )}
              </td>
              <td>
                {editingId === order.id ? (
                  <select
                    value={editData.status ?? STATUS_OPTIONS[0]}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="form-control"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span style={{ color: STATUS_COLORS[order.status] }}>
                    {order.status}
                  </span>
                )}
              </td>
              <td>
                {editingId === order.id ? (
                  <>
                    <button onClick={saveEdit} className="btn-save">✅</button>
                    <button onClick={cancelEdit} className="btn-cancel">❌</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(order)} className="btn-edit">✏️</button>
                    <button onClick={() => deleteMutation.mutate(order.id)} className="btn-delete">🗑️</button>
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
