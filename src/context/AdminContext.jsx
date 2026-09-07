import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../lib/supabase";

const AdminContext = createContext(null);

const BASE_URL = import.meta.env.VITE_API_URL || "https://api.nextkinlife.live";

export function AdminProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    const VALID_ADMIN_ROLES = ["super_admin", "admin", "recruiter"];

    const checkAuth = async () => {
        try {
            // 1. Check direct admin session stored from admin_users
            const storedAdminUser = localStorage.getItem("admin-user");
            const isAdminLoggedIn = localStorage.getItem("admin-logged-in") === "true";

            if (isAdminLoggedIn && storedAdminUser) {
                try {
                    const parsedAdmin = JSON.parse(storedAdminUser);
                    if (parsedAdmin && parsedAdmin.role && VALID_ADMIN_ROLES.includes(parsedAdmin.role)) {
                        // Background verification against admin_users
                        if (supabase && parsedAdmin.email) {
                            const { data: verifiedUser } = await supabase
                                .from("admin_users")
                                .select("*")
                                .ilike("email", parsedAdmin.email)
                                .maybeSingle();

                            if (verifiedUser) {
                                if (verifiedUser.status && verifiedUser.status !== "active") {
                                    logout();
                                    return;
                                }
                                parsedAdmin.role = verifiedUser.role || parsedAdmin.role;
                                parsedAdmin.name = verifiedUser.name || parsedAdmin.name;
                                localStorage.setItem("admin-role", parsedAdmin.role);
                                localStorage.setItem("admin-user", JSON.stringify(parsedAdmin));
                            }
                        }

                        setAdmin(parsedAdmin);
                        setLoading(false);
                        return;
                    }
                } catch (parseErr) {
                    console.warn("Failed to parse stored admin user:", parseErr);
                }
            }

            // 2. Check active Supabase session
            if (supabase) {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        const { data: profile } = await supabase
                            .from("profiles")
                            .select("*")
                            .eq("email", session.user.email)
                            .maybeSingle();

                        const role = profile?.role;
                        if (role && VALID_ADMIN_ROLES.includes(role)) {
                            const adminData = {
                                ...profile,
                                id: profile.id || session.user.id,
                                email: profile.email || session.user.email,
                                name: profile.full_name || profile.name || session.user.user_metadata?.name || "Admin",
                                role,
                            };

                            setAdmin(adminData);
                            localStorage.setItem("admin-role", role);
                            localStorage.setItem("admin-logged-in", "true");
                            localStorage.setItem("admin-user", JSON.stringify(adminData));
                            if (session.access_token) {
                                localStorage.setItem("admin-auth", session.access_token);
                            }
                            setLoading(false);
                            return;
                        } else {
                            // User is authenticated but does not possess an admin role in database
                            setAdmin(null);
                            localStorage.removeItem("admin-role");
                            localStorage.removeItem("admin-logged-in");
                            localStorage.removeItem("admin-auth");
                            localStorage.removeItem("admin-user");
                            setLoading(false);
                            return;
                        }
                    }
                } catch (supaErr) {
                    console.warn("Supabase session check skipped:", supaErr);
                }
            }

            // 3. Fallback to API Token verification
            const token = localStorage.getItem("admin-auth");
            if (!token) {
                setAdmin(null);
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${BASE_URL}/admin/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (response.data && response.data.success) {
                    const adminData = response.data.data || response.data.admin || response.data.user;
                    setAdmin(adminData);
                    if (adminData?.role) {
                        localStorage.setItem("admin-role", adminData.role);
                    }
                    localStorage.setItem("admin-logged-in", "true");
                    localStorage.setItem("admin-user", JSON.stringify(adminData));
                } else {
                    setAdmin(null);
                    localStorage.removeItem("admin-role");
                    localStorage.removeItem("admin-logged-in");
                    localStorage.removeItem("admin-auth");
                    localStorage.removeItem("admin-user");
                }
            } catch (apiErr) {
                // If token exists from admin-login without /admin/me endpoint, keep admin if admin-logged-in
                if (!isAdminLoggedIn) {
                    setAdmin(null);
                    localStorage.removeItem("admin-role");
                    localStorage.removeItem("admin-logged-in");
                    localStorage.removeItem("admin-auth");
                    localStorage.removeItem("admin-user");
                }
            }
        } catch (err) {
            setAdmin(null);
            localStorage.removeItem("admin-role");
            localStorage.removeItem("admin-logged-in");
            localStorage.removeItem("admin-auth");
            localStorage.removeItem("admin-user");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const logout = async () => {
        try {
            if (supabase) {
                await supabase.auth.signOut().catch(() => {});
            }
            const token = localStorage.getItem("admin-auth");
            await axios.post(`${BASE_URL}/admin/logout`, {}, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            }).catch(() => {});
        } catch (err) {
            console.error("Logout request error:", err);
        } finally {
            setAdmin(null);
            localStorage.removeItem("admin-role");
            localStorage.removeItem("admin-logged-in");
            localStorage.removeItem("admin-auth");
            localStorage.removeItem("admin-user");
        }
    };

    return (
        <AdminContext.Provider value={{ admin, loading, checkAuth, logout, setAdmin }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    return useContext(AdminContext);
}
