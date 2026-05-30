import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../services/auth';

export default function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role: UserRole;
}) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== role) return <Navigate to="/" replace />;

  return <>{children}</>;
}
