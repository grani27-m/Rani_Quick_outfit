import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export function RequireAuth() {
  const { isLoggedIn } = useAuthStore();
  if (!isLoggedIn()) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function RequireRole({ role }) {
  const { user, isLoggedIn } = useAuthStore();
  if (!isLoggedIn()) return <Navigate to="/" replace />;
  if (user?.role !== role && user?.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
