/**
 * Auth utility — checks the authentication state and role
 * stored in localStorage. Since JWT is stored in an httpOnly cookie,
 * the client-side relies on high-level login status flags.
 *
 * Roles: "super_admin" | "admin" | "recruiter"
 */

/**
 * Get the current admin's info from localStorage.
 * Returns { role } or null if not authenticated.
 */
export function getAdminInfo() {
    const isLoggedIn = localStorage.getItem("admin-logged-in") === "true";
    if (!isLoggedIn) return null;

    return {
        id: null,
        role: localStorage.getItem("admin-role") || "admin",
    };
}

/**
 * Get just the admin role. Returns "super_admin" | "admin" | "recruiter" | null.
 */
export function getAdminRole() {
    const isLoggedIn = localStorage.getItem("admin-logged-in") === "true";
    if (!isLoggedIn) return null;
    const role = localStorage.getItem("admin-role");
    if (!role || role === "authenticated") return "super_admin";
    return role;
}

/**
 * Check if the current admin has one of the allowed roles.
 */
export function hasRole(...allowedRoles) {
    const role = getAdminRole();
    return role ? allowedRoles.includes(role) : false;
}

/**
 * Store admin role in localStorage (call after login).
 */
export function setAdminRole(role) {
    if (role) localStorage.setItem("admin-role", role);
}

/**
 * Clear all admin auth data (call on logout).
 */
export function clearAdminAuth() {
    localStorage.removeItem("admin-logged-in");
    localStorage.removeItem("admin-role");
}
