import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-[#F47A20] border-b-transparent animate-spin" />
          <p className="text-[#2B1D17]/40 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    // Preserve current path so we can redirect back after login
    const returnPath = location.pathname + location.search;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnPath)}`} replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/user/home" replace />;
  }

  return children;
};

export default ProtectedRoute;
