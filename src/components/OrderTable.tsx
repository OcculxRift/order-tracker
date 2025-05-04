import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useState, useCallback, memo } from 'react';
import { STATUS_OPTIONS } from '../constants/statuses';

type Order = {
  id: string;
  track_id: string;
  client_name: string;
  status: string;
};

export default function OrderTable() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Order>>({});

  const { data: orders = [], isLoading } = useQuery(['orders'], async () => {
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
      await supabase
        .from('orders')
        .update(editData)
        .eq('id', editingId);
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

  const saveEdit = useCallback(() => {
    updateMutation.mutate();
  }, [updateMutation]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleChange = useCallback(
    (field: keyof Order, value: string) => {
      setEditData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  if (isLoading) return <p>Загрузка заказов...</p>;

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
        {orders.map((order) => (
          <OrderRow
            key={order.id}
            order={order}
            isEditing={editingId === order.id}
            editData={editData}
            onChange={handleChange}
            onEdit={() => startEdit(order)}
            onCancel={cancelEdit}
            onSave={saveEdit}
            onDelete={() => deleteMutation.mutate(order.id)}
          />
        ))}
      </tbody>
    </table>
  );
}

type RowProps = {
  order: Order;
  isEditing: boolean;
  editData: Partial<Order>;
  onChange: (field: keyof Order, value: string) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
};

const OrderRow = memo(function OrderRow({
  order,
  isEditing,
  editData,
  onChange,
  onEdit,
  onCancel,
  onSave,
  onDelete,
}: RowProps) {
  return (
    <tr>
      <td>
        {isEditing ? (
          <input
            value={editData.track_id ?? ''}
            onChange={(e) => onChange('track_id', e.target.value)}
            className="form-control"
          />
        ) : (
          order.track_id
        )}
      </td>

      <td>
        {isEditing ? (
          <input
            value={editData.client_name ?? ''}
            onChange={(e) => onChange('client_name', e.target.value)}
            className="form-control"
          />
        ) : (
          order.client_name || '-'
        )}
      </td>

      <td>
        {isEditing ? (
          <select
            value={editData.status ?? STATUS_OPTIONS[0]}
            onChange={(e) => onChange('status', e.target.value)}
            className="form-control"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          order.status
        )}
      </td>

      <td>
        {isEditing ? (
          <>
            <button onClick={onSave} className="btn-save">✅</button>
            <button onClick={onCancel} className="btn-cancel">❌</button>
          </>
        ) : (
          <>
            <button onClick={onEdit} className="btn-edit">✏️</button>
            <button onClick={onDelete} className="btn-delete">🗑️</button>
          </>
        )}
      </td>
    </tr>
  );
});
