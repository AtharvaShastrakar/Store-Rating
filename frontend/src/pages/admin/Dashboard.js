import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setStats(r.data)).catch(console.error);
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Platform overview at a glance</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card accent">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats?.totalUsers ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Stores</div>
          <div className="stat-value">{stats?.totalStores ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Ratings</div>
          <div className="stat-value">{stats?.totalRatings ?? '—'}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/users/add')}>
          <h3 style={{ marginBottom: 8 }}>Add User</h3>
          <p className="text-muted text-sm">Create a new normal user, admin, or store owner account.</p>
          <div style={{ marginTop: 16 }}>
            <span className="btn btn-primary btn-sm">Add User →</span>
          </div>
        </div>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/stores/add')}>
          <h3 style={{ marginBottom: 8 }}>Add Store</h3>
          <p className="text-muted text-sm">Register a new store on the platform.</p>
          <div style={{ marginTop: 16 }}>
            <span className="btn btn-primary btn-sm">Add Store →</span>
          </div>
        </div>
      </div>
    </div>
  );
}
