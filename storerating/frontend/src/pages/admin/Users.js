import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const SortIcon = ({ field, sortBy, sortOrder }) => {
  if (sortBy !== field) return <span style={{ color: 'var(--text-3)', marginLeft: 4 }}>↕</span>;
  return <span style={{ color: 'var(--accent-2)', marginLeft: 4 }}>{sortOrder === 'ASC' ? '↑' : '↓'}</span>;
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const navigate = useNavigate();

  const fetchUsers = () => {
    const params = { ...filters, sortBy, sortOrder };
    api.get('/admin/users', { params }).then(r => setUsers(r.data)).catch(console.error);
  };

  useEffect(() => { fetchUsers(); }, [sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(field); setSortOrder('ASC'); }
  };

  const roleBadge = (role) => (
    <span className={`badge badge-${role === 'store_owner' ? 'owner' : role}`}>
      {role === 'store_owner' ? 'Store Owner' : role}
    </span>
  );

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1>Users</h1>
          <p>Manage all platform users</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/users/add')}>+ Add User</button>
      </div>

      <div className="filter-bar">
        {['name', 'email', 'address'].map(f => (
          <input key={f} placeholder={`Filter by ${f}`} value={filters[f]}
            onChange={e => setFilters({ ...filters, [f]: e.target.value })} />
        ))}
        <select value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="store_owner">Store Owner</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn btn-ghost" onClick={fetchUsers}>Search</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {['name', 'email', 'address', 'role'].map(f => (
                <th key={f} onClick={() => handleSort(f)} style={{ textTransform: 'capitalize' }}>
                  {f} <SortIcon field={f} sortBy={sortBy} sortOrder={sortOrder} />
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-3)' }}>No users found</td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 500, color: 'var(--text)' }}>{u.name}</td>
                <td>{u.email}</td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address}</td>
                <td>{roleBadge(u.role)}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/admin/users/${u.id}`)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
