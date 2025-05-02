import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AddOrderForm() {
  const [trackId, setTrackId] = useState('');
  const [clientName, setClientName] = useState('');
  const [status, setStatus] = useState('В обработке');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('orders')
        .insert([{ 
          track_id: trackId.toUpperCase(), 
          client_name: clientName,
          status 
        }]);
      
      if (error) throw error;
      
      // Очистка формы после успешного добавления
      setTrackId('');
      setClientName('');
      setStatus('В обработке');
      
    } catch (err) {
      console.error('Ошибка при добавлении заказа:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-container">
      <h2 className="admin-title">Новый заказ</h2>
      
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label className="admin-label">Трек-номер</label>
            <input
              type="text"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              placeholder="ABC123456789"
              className="admin-input"
              required
            />
          </div>
          
          <div className="admin-form-group">
            <label className="admin-label">Имя клиента</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Иван Иванов"
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
              <option value="В обработке">В обработке</option>
              <option value="Отправлен">Отправлен</option>
              <option value="Доставлен">Доставлен</option>
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
    </div>
  );
}