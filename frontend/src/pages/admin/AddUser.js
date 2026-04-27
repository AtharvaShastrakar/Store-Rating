import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const validate = (form) => {
  const errors = {};
  if (form.name.length < 20 || form.name.length > 60) errors.name = 'Name must be 20–60 characters';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email';
  if (form.address.length > 400) errors.address = 'Address max 400 characters';
  if (form.password.length < 8 || form.password.length > 16) errors.password = 'Must be 8–16 characters';
  else if (!/[A-Z]/.test(form.password)) errors.password = 'Must include an uppercase letter';
  else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) errors.password = 'Must include a special character';
  return errors;
};

export default function AdminAddUser() {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await api.post('/admin/users', form);
      toast.success('User created!');
      navigate('/admin/users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
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
        <h1>Add User</h1>
        <p>Create a new user account</p>
      </div>

      <div className="card" style={{ maxWidth: 520 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name <span style={{ color: 'var(--text-3)', fontSize: 11 }}>(20–60 chars)</span></label>
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
            <label>Password <span style={{ color: 'var(--text-3)', fontSize: 11 }}>(8–16 chars, uppercase + special char)</span></label>
            <input type="password" {...f('password')} required />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>
          <div className="form-group">
            <label>Role</label>
            <select {...f('role')}>
              <option value="user">Normal User</option>
              <option value="store_owner">Store Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin/users')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
