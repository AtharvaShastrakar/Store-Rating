import { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function StarRating({ value, onChange, readonly }) {
  const [hover, setHover] = useState(0);
  return (
    <span className="stars">
      {[1,2,3,4,5].map(i => (
        <span
          key={i}
          className={`star ${i <= (hover || value) ? 'filled' : 'empty'}`}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
          onMouseEnter={() => !readonly && setHover(i)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => !readonly && onChange && onChange(i)}
        >★</span>
      ))}
    </span>
  );
}

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [pendingRatings, setPendingRatings] = useState({});

  const fetchStores = () => {
    const params = { ...filters, sortBy, sortOrder };
    api.get('/stores', { params }).then(r => setStores(r.data)).catch(console.error);
  };

  useEffect(() => { fetchStores(); }, [sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(field); setSortOrder('ASC'); }
  };

  const setPending = (storeId, val) => {
    setPendingRatings(prev => ({ ...prev, [storeId]: val }));
  };

  const submitRating = async (storeId) => {
    const rating = pendingRatings[storeId];
    if (!rating) return toast.error('Select a rating first');
    try {
      await api.post('/stores/rate', { storeId, rating });
      toast.success('Rating submitted!');
      setPendingRatings(prev => { const n = { ...prev }; delete n[storeId]; return n; });
      fetchStores();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span style={{ color: 'var(--text-3)', marginLeft: 4 }}>↕</span>;
    return <span style={{ color: 'var(--accent-2)', marginLeft: 4 }}>{sortOrder === 'ASC' ? '↑' : '↓'}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Browse Stores</h1>
        <p>Find and rate stores on the platform</p>
      </div>

      <div className="filter-bar">
        <input placeholder="Search by name" value={filters.name}
          onChange={e => setFilters({ ...filters, name: e.target.value })} />
        <input placeholder="Search by address" value={filters.address}
          onChange={e => setFilters({ ...filters, address: e.target.value })} />
        <button className="btn btn-ghost" onClick={fetchStores}>Search</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>Store Name <SortIcon field="name" /></th>
              <th onClick={() => handleSort('address')}>Address <SortIcon field="address" /></th>
              <th>Overall Rating</th>
              <th>Your Rating</th>
              <th>Submit</th>
            </tr>
          </thead>
          <tbody>
            {stores.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-3)' }}>No stores found</td></tr>
            ) : stores.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 500, color: 'var(--text)' }}>{s.name}</td>
                <td style={{ color: 'var(--text-2)' }}>{s.address}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <StarRating value={Math.round(s.avgRating || 0)} readonly />
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
                      {s.avgRating ? parseFloat(s.avgRating).toFixed(1) : 'No ratings'}
                    </span>
                  </div>
                </td>
                <td>
                  {s.userRating ? (
                    <div>
                      <StarRating
                        value={pendingRatings[s.id] ?? s.userRating}
                        onChange={(v) => setPending(s.id, v)}
                      />
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                        Current: {s.userRating} — click to modify
                      </div>
                    </div>
                  ) : (
                    <StarRating
                      value={pendingRatings[s.id] || 0}
                      onChange={(v) => setPending(s.id, v)}
                    />
                  )}
                </td>
                <td>
                  {(pendingRatings[s.id]) && (
                    <button className="btn btn-primary btn-sm" onClick={() => submitRating(s.id)}>
                      {s.userRating ? 'Update' : 'Submit'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
