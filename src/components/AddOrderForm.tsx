import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useQueryClient } from '@tanstack/react-query';
import { STATUS_OPTIONS } from '../constants/statuses';

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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('orders')
        .insert([{ 
          track_id: formData.track_id.trim().toUpperCase(),
          client_name: formData.client_name.trim(),
          status: formData.status
        }]);

      if (error) throw error;

      await queryClient.invalidateQueries(['orders']);
      setFormData({ track_id: '', client_name: '', status: STATUS_OPTIONS[0] });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-order-form">
      <h3>Добавить новый заказ</h3>
      
      {error && <div className="form-error">{error}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label>Трек-номер *</label>
          <input
            type="text"
            name="track_id"
            value={formData.track_id}
            onChange={handleInputChange}
            className="form-control"
            placeholder="ABC123456789"
            required
          />
        </div>

        <div className="form-group">
          <label>Наименование фирмы</label>
          <input
            type="text"
            name="client_name"
            value={formData.client_name}
            onChange={handleInputChange}
            className="form-control"
            placeholder="ООО 'Ромашка'"
          />
        </div>

        <div className="form-group">
          <label>Статус</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="form-control"
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <button 
        type="submit" 
        className="submit-btn"
        disabled={loading}
      >
        {loading ? 'Добавление...' : 'Добавить заказ'}
      </button>
    </form>
  );
}