import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AuthAdmin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        navigate('/admin');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        navigate('/admin');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        console.error('Ошибка входа:', err);
      } finally {
        setLoading(false);
      }
    },
    [email, password, navigate]
  );

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '500px', margin: '40px auto' }}>
        <h2>Вход для администратора</h2>

        {error && (
          <div style={{
            color: 'var(--accent)',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Email"
            className="form-control"
            required
            autoFocus
          />
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Пароль"
            className="form-control"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}
