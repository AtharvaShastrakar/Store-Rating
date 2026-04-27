import { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.newPassword.length < 8 || form.newPassword.length > 16) errs.newPassword = 'Must be 8–16 characters';
    else if (!/[A-Z]/.test(form.newPassword)) errs.newPassword = 'Must include an uppercase letter';
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.newPassword)) errs.newPassword = 'Must include a special character';
    if (form.newPassword !== form.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await api.put('/auth/password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password updated!');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Change Password</h1>
        <p>Update your account password</p>
      </div>

      <div className="card" style={{ maxWidth: 440 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>New Password <span style={{ color: 'var(--text-3)', fontSize: 11 }}>(8–16 chars, uppercase + special char)</span></label>
            <input type="password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} required />
            {errors.newPassword && <p className="error-text">{errors.newPassword}</p>}
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
            {errors.confirm && <p className="error-text">{errors.confirm}</p>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
