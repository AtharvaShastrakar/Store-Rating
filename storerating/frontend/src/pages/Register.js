import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const validate = (form) => {
  const errors = {};
  if (form.name.length < 20 || form.name.length > 60) errors.name = 'Name must be 20–60 characters';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email';
  if (form.address.length > 400) errors.address = 'Address max 400 characters';
  if (form.password.length < 8 || form.password.length > 16) errors.password = 'Password must be 8–16 characters';
  else if (!/[A-Z]/.test(form.password)) errors.password = 'Must include an uppercase letter';
  else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) errors.password = 'Must include a special character';
  return errors;
};

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.user, data.token);
      toast.success('Account created!');
      navigate('/stores');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const f = (field) => ({
    value: form[field],
    onChange: (e) => setForm({ ...form, [field]: e.target.value }),
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="subtitle">Join to start rating stores</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name <span style={{ color: 'var(--text-3)', fontSize: 11 }}>(20–60 chars)</span></label>
            <input type="text" placeholder="Your full name" {...f('name')} required />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" {...f('email')} required />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea rows={2} placeholder="Your address" {...f('address')} style={{ resize: 'vertical' }} required />
            {errors.address && <p className="error-text">{errors.address}</p>}
          </div>
          <div className="form-group">
            <label>Password <span style={{ color: 'var(--text-3)', fontSize: 11 }}>(8–16 chars, uppercase + special char)</span></label>
            <input type="password" placeholder="••••••••" {...f('password')} required />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className="divider" />
        <p className="text-sm text-muted text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-accent">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
