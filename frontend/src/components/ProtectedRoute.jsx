import { Navigate } from 'react-router-dom';
import { clearAuth, getToken, getStoredUser, isTokenValid } from '../utils/api';

const ProtectedRoute = ({ children, roles }) => {
  const token = getToken();
  const user = getStoredUser();

  if (!token || !isTokenValid(token)) {
    clearAuth();
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'master') return <Navigate to="/staff" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
