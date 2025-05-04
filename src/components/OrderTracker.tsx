import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { STATUS_COLORS } from '../constants/statuses';

export default function OrderTracker() {
  const [trackId, setTrackId] = useState('');
  const [orderResult, setOrderResult] = useState<{
    order: null | { track_id: string; client_name: string; status: string };
    error: string | null;
  }>({ order: null, error: null });
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    const query = trackId.trim().toUpperCase();
    if (!query) return;

    setLoading(true);
    setOrderResult({ order: null, error: null });

    const { data, error } = await supabase
      .from('orders')
      .select('track_id, status, client_name')
      .eq('track_id', query)
      .single();

    if (error || !data) {
      setOrderResult({ order: null, error: 'Заказ не найден' });
    } else {
      setOrderResult({ order: data, error: null });
    }

    setLoading(false);
  }, [trackId]);

  return (
    <div className="tracker">
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        Отслеживание заказа
      </h2>

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

      {orderResult.error && (
        <div style={{ color: 'red', margin: '1rem 0' }}>
          {orderResult.error}
        </div>
      )}

      {orderResult.order && (
        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)',
            marginTop: '1rem',
          }}
        >
          <div style={{ display: 'grid', gap: '12px' }}>
            <p>
              <strong>Трек-номер:</strong> {orderResult.order.track_id}
            </p>
            <p>
              <strong>Статус:</strong>{' '}
              <span style={{ color: STATUS_COLORS[orderResult.order.status] }}>
                {orderResult.order.status}
              </span>
            </p>
            {orderResult.order.client_name && (
              <p>
                <strong>Фирма:</strong> {orderResult.order.client_name}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
