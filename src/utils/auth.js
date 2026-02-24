/**
 * Auth utility — decodes the JWT token stored in localStorage
 * to extract admin role and ID without a network call.
 *
 * JWT structure: { id, role, iat, exp }
 * Roles: "super_admin" | "admin" | "recruiter"
 */

/**
 * Decode a JWT token payload (no signature verification — that's server-side).
 */
function decodeToken(token) {
    try {
        const payload = token.split(".")[1];
        const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

/**
 * Get the current admin's info from the JWT stored in localStorage.
 * Returns { id, role } or null if not authenticated.
 */
export function getAdminInfo() {
    const token = localStorage.getItem("admin-auth");
    if (!token) return null;

    const payload = decodeToken(token);
    if (!payload) return null;

    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("admin-auth");
        localStorage.removeItem("admin-role");
        return null;
    }

    return {
        id: payload.id,
        role: payload.role || "admin",
    };
}

/**
 * Get just the admin role. Returns "super_admin" | "admin" | "recruiter" | null.
 */
export function getAdminRole() {
    // First try the cached role (faster)
    const cached = localStorage.getItem("admin-role");
    if (cached) return cached;

    // Fallback: decode the JWT
    const info = getAdminInfo();
    return info?.role || null;
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
    localStorage.removeItem("admin-auth");
    localStorage.removeItem("admin-role");
}
