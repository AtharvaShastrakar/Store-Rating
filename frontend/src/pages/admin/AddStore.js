import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminAddStore() {
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/users', { params: { role: 'store_owner' } })
      .then(r => setOwners(r.data))
      .catch(console.error);
  }, []);

  const validate = () => {
    const errs = {};
    if (form.name.length < 20 || form.name.length > 60) errs.name = 'Store name must be 20–60 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.address) errs.address = 'Address is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await api.post('/admin/stores', { ...form, ownerId: form.ownerId || null });
      toast.success('Store created!');
      navigate('/admin/stores');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  const f = (field) => ({
    value: form[field],
    onChange: (e) => setForm({ ...form, [field]: e.target.value }),
  });

  return (
    <div>
      <div className="page-header">
        <h1>Add Store</h1>
        <p>Register a new store on the platform</p>
      </div>

      <div className="card" style={{ maxWidth: 520 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Store Name <span style={{ color: 'var(--text-3)', fontSize: 11 }}>(20–60 chars)</span></label>
            <input type="text" {...f('name')} required />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" {...f('email')} required />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea rows={2} style={{ resize: 'vertical' }} {...f('address')} required />
            {errors.address && <p className="error-text">{errors.address}</p>}
          </div>
          <div className="form-group">
            <label>Assign Store Owner <span style={{ color: 'var(--text-3)', fontSize: 11 }}>(optional)</span></label>
            <select {...f('ownerId')}>
              <option value="">No owner</option>
              {owners.map(o => (
                <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Store'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin/stores')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
