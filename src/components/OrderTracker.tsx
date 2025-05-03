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
      <h2>Отследить заказ</h2>
      <div className="search-box">
        <input
          value={trackId}
          onChange={(e) => setTrackId(e.target.value.toUpperCase())}
          placeholder="Введите трек-номер"
          disabled={loading}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? '...' : 'Найти'}
        </button>
      </div>

      {order && (
        <div className="order-info">
          <p>Трек: {order.track_id}</p>
          <p>Статус: {order.status}</p>
          {order.client_name && <p>Фирма: {order.client_name}</p>}
        </div>
      )}
    </div>
  );
}