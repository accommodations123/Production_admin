import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../lib/supabase";

const AdminContext = createContext(null);

const BASE_URL = import.meta.env.VITE_API_URL || "https://api.nextkinlife.live";

export function AdminProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            // 1. Check active Supabase session
            if (supabase) {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        const { data: profile } = await supabase
                            .from("profiles")
                            .select("*")
                            .eq("email", session.user.email)
                            .maybeSingle();

                        const role = profile?.role || session.user.user_metadata?.role || localStorage.getItem("admin-role") || "super_admin";
                        const adminData = profile || {
                            id: session.user.id,
                            email: session.user.email,
                            name: session.user.user_metadata?.name || "Admin",
                            role,
                        };

                        setAdmin(adminData);
                        localStorage.setItem("admin-role", role);
                        localStorage.setItem("admin-logged-in", "true");
                        if (session.access_token) {
                            localStorage.setItem("admin-auth", session.access_token);
                        }
                        setLoading(false);
                        return;
                    }
                } catch (supaErr) {
                    console.warn("Supabase session check skipped:", supaErr);
                }
            }

            // 2. Fallback to API Token verification
            const token = localStorage.getItem("admin-auth");
            if (!token) {
                setAdmin(null);
                setLoading(false);
                return;
            }

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
            } else {
                setAdmin(null);
                localStorage.removeItem("admin-role");
                localStorage.removeItem("admin-logged-in");
                localStorage.removeItem("admin-auth");
            }
        } catch (err) {
            setAdmin(null);
            localStorage.removeItem("admin-role");
            localStorage.removeItem("admin-logged-in");
            localStorage.removeItem("admin-auth");
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
