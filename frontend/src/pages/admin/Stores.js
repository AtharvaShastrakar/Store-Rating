import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const SortIcon = ({ field, sortBy, sortOrder }) => {
  if (sortBy !== field) return <span style={{ color: 'var(--text-3)', marginLeft: 4 }}>↕</span>;
  return <span style={{ color: 'var(--accent-2)', marginLeft: 4 }}>{sortOrder === 'ASC' ? '↑' : '↓'}</span>;
};

const Stars = ({ value }) => (
  <span className="stars">
    {[1,2,3,4,5].map(i => (
      <span key={i} className={`star ${i <= Math.round(value) ? 'filled' : 'empty'}`}>★</span>
    ))}
    <span style={{ marginLeft: 6, fontSize: 13, color: 'var(--text-2)' }}>
      {value ? parseFloat(value).toFixed(1) : 'N/A'}
    </span>
  </span>
);

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const navigate = useNavigate();

  const fetchStores = () => {
    const params = { ...filters, sortBy, sortOrder };
    api.get('/admin/stores', { params }).then(r => setStores(r.data)).catch(console.error);
  };

  useEffect(() => { fetchStores(); }, [sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(field); setSortOrder('ASC'); }
  };

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1>Stores</h1>
          <p>All registered stores</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/stores/add')}>+ Add Store</button>
      </div>

      <div className="filter-bar">
        {['name', 'email', 'address'].map(f => (
          <input key={f} placeholder={`Filter by ${f}`} value={filters[f]}
            onChange={e => setFilters({ ...filters, [f]: e.target.value })} />
        ))}
        <button className="btn btn-ghost" onClick={fetchStores}>Search</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {['name', 'email', 'address'].map(f => (
                <th key={f} onClick={() => handleSort(f)} style={{ textTransform: 'capitalize' }}>
                  {f} <SortIcon field={f} sortBy={sortBy} sortOrder={sortOrder} />
                </th>
              ))}
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {stores.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-3)' }}>No stores found</td></tr>
            ) : stores.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 500, color: 'var(--text)' }}>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.address}</td>
                <td><Stars value={s.avgRating} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
