import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export const withRoleGuard = (Component: React.FC, allowedRoles: string[]) => {
  return () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    return allowedRoles.includes(user.role) ? <Component /> : <Navigate to="/unauthorized" />;
  };
};