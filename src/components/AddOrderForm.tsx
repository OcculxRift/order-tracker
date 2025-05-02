import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useQueryClient } from '@tanstack/react-query';

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

export default function AddOrderForm() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    track_id: '',
    client_name: '',
    status: STATUS_OPTIONS[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Валидация трек-номера
    if (!formData.track_id.trim()) {
      setError('Пожалуйста, введите трек-номер');
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('orders')
        .insert([{ 
          track_id: formData.track_id.trim().toUpperCase(),
          client_name: formData.client_name.trim(),
          status: formData.status
        }])
        .select();

      if (insertError) throw insertError;

      // Инвалидация кэша и сброс формы
      await queryClient.invalidateQueries(['orders']);
      setFormData({
        track_id: '',
        client_name: '',
        status: STATUS_OPTIONS[0]
      });

    } catch (err) {
      console.error('Ошибка при добавлении заказа:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-order-form">
      {error && <div className="form-error">{error}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="track_id">Трек-номер *</label>
          <input
            id="track_id"
            name="track_id"
            type="text"
            value={formData.track_id}
            onChange={handleInputChange}
            placeholder="ABC123456789"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="client_name">Наименование фирмы</label>
          <input
            id="client_name"
            name="client_name"
            type="text"
            value={formData.client_name}
            onChange={handleInputChange}
            placeholder="ООО 'Ромашка'"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Статус</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            disabled={loading}
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="submit-btn"
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Добавление...
          </>
        ) : (
          'Добавить заказ'
        )}
      </button>
    </form>
  );
}