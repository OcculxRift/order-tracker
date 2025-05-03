import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function OrderTracker() {
  const [trackId, setTrackId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!trackId.trim()) return;
    setLoading(true);
    
    const { data } = await supabase
      .from('orders')
      .select('track_id, status, client_name')
      .ilike('track_id', trackId.trim())
      .single();

    setOrder(data || null);
    setLoading(false);
  };

  return (
    <div className="tracker">
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Отслеживание заказа</h2>
      <div className="search-box">
        <input
          value={trackId}
          onChange={(e) => setTrackId(e.target.value.toUpperCase())}
          placeholder="Введите трек-номер"
          disabled={loading}
        />
        <button 
          onClick={handleSearch} 
          disabled={loading || !trackId.trim()}
        >
          {loading ? 'Поиск...' : 'Найти'}
        </button>
      </div>

      {order && (
        <div style={{ 
          background: 'white',
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{ display: 'grid', gap: '12px' }}>
            <p><strong>Трек-номер:</strong> {order.track_id}</p>
            <p><strong>Статус:</strong> {order.status}</p>
            {order.client_name && <p><strong>Фирма:</strong> {order.client_name}</p>}
          </div>
        </div>
      )}
    </div>
  );
}