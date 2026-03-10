import { Navigate } from "react-router-dom";
import { getAdminRole } from "./utils/auth";

/**
 * ProtectedRoute — ensures the user is authenticated.
 * Optionally restricts access by role.
 *
 * Usage:
 *   <ProtectedRoute>              → any authenticated admin
 *   <ProtectedRoute roles={["super_admin"]}>  → super_admin only
 */
export default function ProtectedRoute({ children, roles }) {
    const isAuth = localStorage.getItem("admin-auth");

    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }

    // If roles are specified, check the admin's role
    if (roles && roles.length > 0) {
        const currentRole = getAdminRole();
        if (!currentRole || !roles.includes(currentRole)) {
            // Recruiters → redirect to career page
            // Others → redirect to dashboard
            const fallback = currentRole === "recruiter" ? "/dashboard/career" : "/dashboard";
            return <Navigate to={fallback} replace />;
        }
    }

    return children;
}
