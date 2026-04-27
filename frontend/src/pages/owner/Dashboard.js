import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/stores/owner/dashboard').then(r => setData(r.data)).catch(console.error);
  }, []);

  if (!data) return <div style={{ padding: 40, color: 'var(--text-2)' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>{data.store.name}</h1>
        <p>Your store dashboard</p>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr', maxWidth: 480, marginBottom: 32 }}>
        <div className="stat-card accent">
          <div className="stat-label">Average Rating</div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            {data.avgRating ?? '—'}
            {data.avgRating && <span style={{ fontSize: 18, color: 'var(--yellow)' }}>★</span>}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Reviews</div>
          <div className="stat-value">{data.ratings.length}</div>
        </div>
      </div>

      <h2 style={{ marginBottom: 16, fontSize: 18 }}>Rating Submissions</h2>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Rating</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.ratings.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-3)' }}>
                  No ratings yet
                </td>
              </tr>
            ) : data.ratings.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500, color: 'var(--text)' }}>{r.userName}</td>
                <td>{r.userEmail}</td>
                <td>
                  <span className="stars">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`star ${s <= r.rating ? 'filled' : 'empty'}`} style={{ cursor: 'default' }}>★</span>
                    ))}
                  </span>
                </td>
                <td style={{ color: 'var(--text-3)', fontSize: 13 }}>
                  {new Date(r.submittedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
