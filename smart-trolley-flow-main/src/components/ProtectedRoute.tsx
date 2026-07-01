import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
  /** Require admin role (ROLE_ADMIN only). */
  requireAdmin?: boolean;
  /** Require customer role (ROLE_CUSTOMER). Admins are redirected to admin. */
  requireCustomerRole?: boolean;
  /** Login path to redirect to when not authenticated or wrong role. */
  loginPath?: string;
};

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireCustomerRole = false,
  loginPath,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isCustomerRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const to = loginPath ?? (requireAdmin ? "/admin/login" : "/customer/login");
    return <Navigate to={to} state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to={loginPath ?? "/admin/login"} state={{ from: location }} replace />;
  }

  if (requireCustomerRole && !isCustomerRole) {
    if (isAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to={loginPath ?? "/customer/login"} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
