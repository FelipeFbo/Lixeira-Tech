import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  if (!adminOnly && isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}
