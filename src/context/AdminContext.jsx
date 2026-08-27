import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    const extractRole = (user) => {
        if (!user) return null;
        const metaRole =
            user.user_metadata?.role ||
            user.app_metadata?.role ||
            user.user_metadata?.user_role;

        if (metaRole) {
            return String(metaRole).toLowerCase();
        }

        // Supabase internal user.role is 'authenticated'. For admin dashboard users, default to 'super_admin'
        if (user.role && user.role !== "authenticated") {
            return String(user.role).toLowerCase();
        }

        return "super_admin";
    };

    const syncAdminState = (user) => {
        if (!user) {
            setAdmin(null);
            localStorage.removeItem("admin-role");
            localStorage.removeItem("admin-logged-in");
            localStorage.removeItem("admin-auth");
            return;
        }

        const role = extractRole(user);

        const adminData = {
            id: user.id,
            email: user.email,
            role: role,
            name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin",
            ...user.user_metadata,
        };

        setAdmin(adminData);
        localStorage.setItem("admin-role", role);
        localStorage.setItem("admin-logged-in", "true");
    };

    const checkAuth = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error || !session?.user) {
                syncAdminState(null);
            } else {
                syncAdminState(session.user);
            }
        } catch (err) {
            console.error("Auth check failed:", err);
            syncAdminState(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (session?.user) {
                    syncAdminState(session.user);
                } else {
                    syncAdminState(null);
                }
                setLoading(false);
            }
        );

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error("Logout request failed:", err);
        } finally {
            syncAdminState(null);
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

export default AdminContext;
