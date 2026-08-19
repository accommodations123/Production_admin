import React from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "./context/AdminContext";

/**
 * ProtectedRoute — ensures the user is authenticated.
 * Optionally restricts access by role.
 *
 * Usage:
 *   <ProtectedRoute>              → any authenticated admin
 *   <ProtectedRoute roles={["super_admin"]}>  → super_admin only
 */
export default function ProtectedRoute({ children, roles }) {
    const { admin, loading } = useAdmin();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
            </div>
        );
    }

    if (!admin) {
        return <Navigate to="/login" replace />;
    }

    // If roles are specified, check the admin's role
    if (roles && roles.length > 0) {
        const currentRole = admin.role;
        if (!roles.includes(currentRole)) {
            // Recruiters → redirect to career page
            // Others → redirect to dashboard
            const fallback = currentRole === "recruiter" ? "/dashboard/career" : "/dashboard";
            return <Navigate to={fallback} replace />;
        }
    }

    return children;
}
