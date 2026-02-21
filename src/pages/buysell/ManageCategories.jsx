import React, { useEffect, useState } from "react";
import axios from "axios";
import { Package, TrendingUp } from "lucide-react";

/* ==============================
   API CONFIG
================================ */
const API_BASE = "https://api.nextkinlife.live";

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("admin-auth");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/* ==============================
   COMPONENT
================================ */
const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const [pendingRes, approvedRes] = await Promise.all([
                api.get("/buy-sell/admin/buy-sell/pending"),
                api.get("/buy-sell/get"),
            ]);

            const pending = pendingRes.data?.listings || [];
            const approved = approvedRes.data?.listings || approvedRes.data || [];
            const allListings = [...pending, ...approved];

            const categoryMap = {};
            allListings.forEach((item) => {
                if (!item.category) return;

                if (!categoryMap[item.category]) {
                    categoryMap[item.category] = {
                        id: item.category,
                        name: item.category,
                        count: 0,
                        icon: <Package />,
                        color: "bg-blue-100",
                        subcategories: {},
                    };
                }

                categoryMap[item.category].count += 1;

                const sub = item.subcategory || "Others";
                if (!categoryMap[item.category].subcategories[sub]) {
                    categoryMap[item.category].subcategories[sub] = {
                        id: sub,
                        name: sub,
                        count: 0,
                    };
                }
                categoryMap[item.category].subcategories[sub].count += 1;
            });

            setCategories(
                Object.values(categoryMap).map((c) => ({
                    ...c,
                    subcategories: Object.values(c.subcategories),
                }))
            );
        } catch (err) {
            console.error("Failed to fetch categories", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-48 bg-gray-100 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const totalListings = categories.reduce((acc, cat) => acc + cat.count, 0);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories Management</h1>
                    <p className="text-gray-600">Overview of all product categories and their performance</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-6 text-white" style={{ background: 'linear-gradient(to right, #00162d, #002451)' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Categories</p>
                                <p className="text-3xl font-bold mt-2">{categories.length}</p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-lg">
                                <Package className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-6 text-white" style={{ background: 'linear-gradient(to right, #00162d, #002451)' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Listings</p>
                                <p className="text-3xl font-bold mt-2">{totalListings}</p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-lg">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-6 text-white" style={{ background: 'linear-gradient(to right, #00162d, #002451)' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Avg per Category</p>
                                <p className="text-3xl font-bold mt-2">
                                    {categories.length ? Math.round(totalListings / categories.length) : 0}
                                </p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-lg">
                                <Package className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat) => (
                        <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                            <div className="p-6" style={{ backgroundColor: '#f0f5ff' }}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-white rounded-lg" style={{ color: '#00162d' }}>
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">{cat.count}</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">{cat.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">Active listings</p>
                            </div>

                            <div className="p-4 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Subcategories</p>
                                <div className="space-y-2">
                                    {cat.subcategories.slice(0, 3).map((s) => (
                                        <div key={s.id} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">{s.name}</span>
                                            <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: '#f0f5ff', color: '#00162d' }}>
                                                {s.count}
                                            </span>
                                        </div>
                                    ))}
                                    {cat.subcategories.length > 3 && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            +{cat.subcategories.length - 3} more
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {categories.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
                        <p className="text-gray-500">Start by adding some listings to create categories</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageCategories;