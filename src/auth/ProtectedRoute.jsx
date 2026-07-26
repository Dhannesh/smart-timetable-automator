import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function ProtectedRoute({ requiredRole, children }) {
  const { session, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Checking session...
      </div>
    );
  }

  if (!session) {
    return (
      <Navigate
        to={requiredRole === "admin" ? "/admin/login" : "/faculty/login"}
        replace
      />
    );
  }

  if (requiredRole && role !== requiredRole) {
    return (
      <Navigate
        to={requiredRole === "admin" ? "/admin/login" : "/faculty/login"}
        replace
      />
    );
  }

  return children;
}
