import { useAddOrderForm } from '../hooks/useAddOrderForm';
import { STATUS_OPTIONS } from '../constants/statuses';

export default function AddOrderForm() {
  const {
    formData,
    loading,
    error,
    handleInputChange,
    handleSubmit,
  } = useAddOrderForm();

  return (
    <form onSubmit={handleSubmit} className="add-order-form">
      {error && <div className="form-error">{error}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="track_id">Трек-номер *</label>
          <input
            id="track_id"
            name="track_id"
            type="text"
            value={formData.track_id}
            onChange={handleInputChange}
            placeholder="ABC123456789"
            disabled={loading}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="client_name">Наименование фирмы</label>
          <input
            id="client_name"
            name="client_name"
            type="text"
            value={formData.client_name}
            onChange={handleInputChange}
            placeholder="ООО 'Ромашка'"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Статус</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            disabled={loading}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? (
          <>
            <span className="spinner" /> Добавление...
          </>
        ) : (
          'Добавить заказ'
        )}
      </button>
    </form>
  );
}
