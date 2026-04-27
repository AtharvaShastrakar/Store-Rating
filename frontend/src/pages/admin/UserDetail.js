import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/admin/users/${id}`).then(r => setUser(r.data)).catch(console.error);
  }, [id]);

  if (!user) return <div style={{ padding: 40, color: 'var(--text-2)' }}>Loading...</div>;

  const roleBadge = (role) => (
    <span className={`badge badge-${role === 'store_owner' ? 'owner' : role}`}>
      {role === 'store_owner' ? 'Store Owner' : role}
    </span>
  );

  return (
    <div>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => navigate('/admin/users')}>
          ← Back to Users
        </button>
        <h1>{user.name}</h1>
        <p>User details</p>
      </div>

      <div className="card" style={{ maxWidth: 520 }}>
        <div style={{ display: 'grid', gap: 20 }}>
          <Row label="Name" value={user.name} />
          <Row label="Email" value={user.email} />
          <Row label="Address" value={user.address} />
          <Row label="Role" value={roleBadge(user.role)} />
          {user.role === 'store_owner' && (
            <>
              {user.store && <Row label="Store" value={user.store.name} />}
              <Row
                label="Store Rating"
                value={user.storeRating ? (
                  <span style={{ color: 'var(--yellow)', fontWeight: 600 }}>★ {user.storeRating}</span>
                ) : 'No ratings yet'}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
      <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ color: 'var(--text)', fontSize: 15 }}>{value}</div>
    </div>
  );
}
