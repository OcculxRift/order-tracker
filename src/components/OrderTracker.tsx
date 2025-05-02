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
      .select('*')
      .ilike('track_id', trackId.trim())
      .single();
    
    setOrder(data);
    setLoading(false);
  };

  return (
    <div className="tracker-container">
      <div className="tracker-card">
        <h2 className="tracker-title">Отследить заказ</h2>
        <p className="tracker-subtitle">Введите трек-номер для проверки статуса</p>
        
        <div className="tracker-input-group">
          <input
            type="text"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value.toUpperCase())}
            placeholder="Например: ABC123456789"
            className="tracker-input"
            disabled={loading}
          />
          <button 
            onClick={handleSearch} 
            disabled={loading || !trackId.trim()}
            className="tracker-button"
          >
            {loading ? (
              <span className="tracker-button-loader"></span>
            ) : (
              'Найти'
            )}
          </button>
        </div>

        {order && (
          <div className="tracker-result-card fade-in">
            <div className="tracker-result-grid">
              <div className="tracker-result-item">
                <p className="tracker-result-label">ТРЕК-НОМЕР</p>
                <p className="tracker-result-value">{order.track_id}</p>
              </div>
              <div className="tracker-result-item">
                <p className="tracker-result-label">СТАТУС</p>
                <p className="tracker-result-value" style={{ 
                  color: order.status === 'Доставлен' ? '#34c759' : 
                         order.status === 'Отправлен' ? '#0071e3' : '#ff9500'
                }}>
                  {order.status}
                </p>
              </div>
            </div>
            
            {order.client_name && (
              <div className="tracker-result-item">
                <p className="tracker-result-label">КЛИЕНТ</p>
                <p className="tracker-result-value">{order.client_name}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}