import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useQueryClient } from '@tanstack/react-query';

const statusOptions = [
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
  const [trackId, setTrackId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [status, setStatus] = useState(statusOptions[0]);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('orders')
        .insert([{ 
          track_id: trackId.toUpperCase(),
          company_name: companyName,
          status 
        }]);

      if (error) throw error;
      
      await queryClient.invalidateQueries(['orders']);
      setTrackId('');
      setCompanyName('');
    } catch (err) {
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-form-grid">
        <div className="admin-form-group">
          <label className="admin-label">Трек-номер</label>
          <input
            type="text"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            className="admin-input"
            required
          />
        </div>
        
        <div className="admin-form-group">
          <label className="admin-label">Наименование фирмы</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="admin-input"
            required
          />
        </div>
        
        <div className="admin-form-group">
          <label className="admin-label">Статус</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="admin-select"
          >
            {statusOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
      
      <button 
        type="submit" 
        disabled={loading}
        className="admin-submit-btn"
      >
        {loading ? 'Добавление...' : 'Добавить заказ'}
      </button>
    </form>
  );
}