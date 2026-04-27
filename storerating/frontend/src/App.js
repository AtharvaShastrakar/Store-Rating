import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminStores from './pages/admin/Stores';
import AdminAddUser from './pages/admin/AddUser';
import AdminAddStore from './pages/admin/AddStore';
import AdminUserDetail from './pages/admin/UserDetail';
import UserStores from './pages/user/Stores';
import ChangePassword from './pages/ChangePassword';
import OwnerDashboard from './pages/owner/Dashboard';
import Layout from './components/Layout';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, color: 'var(--text-2)' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
  if (user.role === 'store_owner') return <Navigate to="/owner/dashboard" />;
  return <Navigate to="/stores" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }
        }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Admin */}
          <Route path="/admin" element={<PrivateRoute roles={['admin']}><Layout /></PrivateRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/add" element={<AdminAddUser />} />
            <Route path="users/:id" element={<AdminUserDetail />} />
            <Route path="stores" element={<AdminStores />} />
            <Route path="stores/add" element={<AdminAddStore />} />
            <Route path="password" element={<ChangePassword />} />
          </Route>

          {/* Normal user */}
          <Route path="/" element={<PrivateRoute roles={['user']}><Layout /></PrivateRoute>}>
            <Route path="stores" element={<UserStores />} />
            <Route path="password" element={<ChangePassword />} />
          </Route>

          {/* Store owner */}
          <Route path="/owner" element={<PrivateRoute roles={['store_owner']}><Layout /></PrivateRoute>}>
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="password" element={<ChangePassword />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
