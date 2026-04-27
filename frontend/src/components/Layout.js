import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  store: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16,17 21,12 16,7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const navItems = {
    admin: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: icons.dashboard },
      { label: 'Users', path: '/admin/users', icon: icons.users },
      { label: 'Stores', path: '/admin/stores', icon: icons.store },
      { label: 'Change Password', path: '/admin/password', icon: icons.lock },
    ],
    user: [
      { label: 'Browse Stores', path: '/stores', icon: icons.store },
      { label: 'Change Password', path: '/password', icon: icons.lock },
    ],
    store_owner: [
      { label: 'My Store', path: '/owner/dashboard', icon: icons.dashboard },
      { label: 'Change Password', path: '/owner/password', icon: icons.lock },
    ],
  };

  const items = navItems[user?.role] || [];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">SR</div>
          <div className="logo-text">StoreRating</div>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ padding: '8px 14px 12px', fontSize: 12, color: 'var(--text-3)' }}>
            <div style={{ fontWeight: 500, color: 'var(--text-2)', fontSize: 13, marginBottom: 2 }}>
              {user?.name?.split(' ')[0]}
            </div>
            <span className={`badge badge-${user?.role === 'store_owner' ? 'owner' : user?.role}`}>
              {user?.role === 'store_owner' ? 'Store Owner' : user?.role}
            </span>
          </div>
          <button className="nav-item" onClick={handleLogout}>
            {icons.logout}
            Logout
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
