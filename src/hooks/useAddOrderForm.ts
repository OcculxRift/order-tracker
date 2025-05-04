import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useQueryClient } from '@tanstack/react-query';
import { STATUS_OPTIONS } from '../constants/statuses';

export function useAddOrderForm() {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    track_id: '',
    client_name: '',
    status: STATUS_OPTIONS[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (error) setError(null); // очищаем ошибку при вводе
    },
    [error]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      if (!formData.track_id.trim()) {
        setError('Пожалуйста, введите трек-номер');
        setLoading(false);
        return;
      }

      try {
        const { error: insertError } = await supabase.from('orders').insert([
          {
            track_id: formData.track_id.trim().toUpperCase(),
            client_name: formData.client_name.trim(),
            status: formData.status,
          },
        ]);

        if (insertError) throw insertError;

        await queryClient.invalidateQueries(['orders']);
        setFormData({
          track_id: '',
          client_name: '',
          status: STATUS_OPTIONS[0],
        });
      } catch (err) {
        console.error('Ошибка при добавлении заказа:', err);
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    },
    [formData, queryClient]
  );

  return {
    formData,
    loading,
    error,
    handleInputChange,
    handleSubmit,
  };
}
