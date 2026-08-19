import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AdminContext = createContext(null);

const BASE_URL = import.meta.env.VITE_API_URL || "https://api.nextkinlife.live";

export function AdminProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem("admin-auth");
            if (!token) {
                setAdmin(null);
                setLoading(false);
                return;
            }

            const response = await axios.get(`${BASE_URL}/admin/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true
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
            const token = localStorage.getItem("admin-auth");
            await axios.post(`${BASE_URL}/admin/logout`, {}, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                withCredentials: true
            });
        } catch (err) {
            console.error("Logout request failed:", err);
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
