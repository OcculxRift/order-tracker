import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function OrderTracker() {
  const [trackId, setTrackId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!trackId.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      const { data, error: queryError } = await supabase
        .from('orders')
        .select('track_id, status, client_name')
        .ilike('track_id', trackId.trim())
        .single();

      if (queryError) throw queryError;
      setOrder(data);
    } catch (err) {
      setError('Заказ не найден');
      setOrder(null);
    } finally {
      setLoading(false);
    }
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

      {error && <div style={{ color: 'red', margin: '1rem 0' }}>{error}</div>}

      {order && (
        <div style={{ 
          background: 'white',
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)',
          marginTop: '1rem'
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