import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useState, useCallback } from 'react';
import { STATUS_OPTIONS, STATUS_COLORS } from '../constants/statuses';

interface Order {
  id: string;
  track_id: string;
  client_name: string;
  status: string;
  created_at: string;
}

export default function OrderTable() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    track_id: '',
    client_name: '',
    status: STATUS_OPTIONS[0]
  });

  // Запрос данных с обработкой ошибок
  const { 
    data: orders, 
    isLoading, 
    isError,
    error 
  } = useQuery(['orders'], async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data as Order[];
  }, {
    staleTime: 30000,
    retry: 1
  });

  // Общая конфигурация мутаций
  const queryConfig = {
    onError: (err: Error) => console.error('Ошибка операции:', err.message),
  };

  // Мутация для обновления
  const updateMutation = useMutation(async () => {
    if (!editingId || !editData.track_id.trim()) return;
    const { error } = await supabase
      .from('orders')
      .update(editData)
      .eq('id', editingId);
    if (error) throw new Error(error.message);
  }, {
    ...queryConfig,
    onSuccess: () => setEditingId(null),
  });

  // Мутация для удаления
  const deleteMutation = useMutation(async (id: string) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
  }, queryConfig);

  // Обработчики действий
  const handleEdit = useCallback((order: Order) => {
    setEditingId(order.id);
    setEditData({
      track_id: order.track_id,
      client_name: order.client_name || '',
      status: order.status
    });
  }, []);

  const handleSave = useCallback(() => updateMutation.mutate(), [updateMutation]);
  const handleDelete = useCallback((id: string) => deleteMutation.mutate(id), [deleteMutation]);

  // Состояния загрузки
  const isMutating = updateMutation.isLoading || deleteMutation.isLoading;

  // Состояния отображения
  if (isLoading) return <div className="loading">Загрузка заказов...</div>;
  if (isError) return <div className="error">Ошибка: {error instanceof Error ? error.message : 'Неизвестная ошибка'}</div>;
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
  <EditableCell
    isEditing={editingId === order.id}
    value={editData.track_id}
    onChange={e => setEditData(prev => ({ 
      ...prev, 
      track_id: e.target.value 
    }))} // Исправлено
    displayValue={order.track_id}
    disabled={isMutating}
  />
  
  <EditableCell
    isEditing={editingId === order.id}
    value={editData.client_name}
    onChange={e => setEditData(prev => ({ 
      ...prev, 
      client_name: e.target.value 
    }))} // Исправлено
    displayValue={order.client_name || '-'}
    disabled={isMutating}
  />

  <td style={{ color: STATUS_COLORS[order.status] }}>
    {editingId === order.id ? (
      <select
        value={editData.status}
        onChange={e => setEditData(prev => ({ 
          ...prev, 
          status: e.target.value 
        }))} // Исправлено
        className="form-control"
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

              <td>{new Date(order.created_at).toLocaleString()}</td>

              <td className="actions">
                {editingId === order.id ? (
                  <>
                    <ActionButton
                      onClick={handleSave}
                      disabled={isMutating}
                      label={updateMutation.isLoading ? 'Сохранение...' : 'Сохранить'}
                    />
                    <ActionButton
                      onClick={() => setEditingId(null)}
                      disabled={isMutating}
                      label="Отмена"
                    />
                  </>
                ) : (
                  <>
                    <ActionButton
                      onClick={() => handleEdit(order)}
                      disabled={isMutating}
                      label="Редактировать"
                    />
                    <ActionButton
                      onClick={() => handleDelete(order.id)}
                      disabled={isMutating}
                      label={deleteMutation.isLoading ? 'Удаление...' : 'Удалить'}
                      className="delete"
                    />
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

// Вспомогательные компоненты
const EditableCell: React.FC<{
  isEditing: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  displayValue: string;
  disabled?: boolean;
}> = ({ isEditing, value, onChange, displayValue, disabled }) => (
  <td>
    {isEditing ? (
      <input
        value={value}
        onChange={onChange}
        className="form-control"
        disabled={disabled}
      />
    ) : (
      displayValue
    )}
  </td>
);

const ActionButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  label: string;
  className?: string;
}> = ({ onClick, disabled, label, className }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`btn ${className || ''}`}
  >
    {label}
  </button>
);