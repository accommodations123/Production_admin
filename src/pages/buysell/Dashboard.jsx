import React, { useEffect, useState } from "react";
import {
    PackageOpen,
    CheckCircle,
    AlertCircle,
    Users,
    Eye,
    Edit,
    Trash2,
    XCircle,
    BarChart3,
    Activity,
    Clock,
    TrendingUp,
    MapPin,
    PieChart as PieChartIcon
} from "lucide-react";
import axios from "axios";
import LineChart from "../../components/charts/LineChart";
import BarChart from "../../components/charts/BarChart";
import PieChart from "../../components/charts/PieChart";

/* ==============================
   API CONFIG
================================ */
const API_BASE = import.meta.env.VITE_API_URL || "https://api.nextkinlife.live";

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("admin-auth");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/* ==============================
   MAIN COMPONENT
================================ */
const Dashboard = () => {
    const [listings, setListings] = useState([]);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [trendData, setTrendData] = useState(null);
    const [countryData, setCountryData] = useState(null);
    const [ratioData, setRatioData] = useState(null);
    const [dashboardTab, setDashboardTab] = useState("activity");
    const [loading, setLoading] = useState(true);

    const dashboardTabItems = [
        { id: "activity", label: "Recent Activity", icon: <Activity className="w-4 h-4" /> },
        { id: "listings", label: "Recent Listings", icon: <Clock className="w-4 h-4" /> }
    ];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [pendingRes, approvedRes] = await Promise.all([
                api.get("/buy-sell/admin/buy-sell/pending"),
                api.get("/buy-sell/get"),
            ]);

            const pending = pendingRes.data?.listings || [];
            const approved = approvedRes.data?.listings || approvedRes.data || [];
            const allListings = [...pending, ...approved];

            // Calculate users from listings
            const userMap = new Map();
            allListings.forEach((item) => {
                if (!userMap.has(item.user_id)) {
                    userMap.set(item.user_id, {
                        id: item.user_id,
                        name: item.name,
                        email: item.email,
                        phone: item.phone,
                        joinDate: new Date(item.createdAt).toLocaleDateString(),
                        listings: 1,
                        rating: 4.5,
                        status: "active",
                    });
                } else {
                    userMap.get(item.user_id).listings += 1;
                }
            });

            // Calculate categories from listings
            const categoryMap = new Set();
            allListings.forEach((item) => {
                if (item.category) {
                    categoryMap.add(item.category);
                }
            });

            setListings(allListings);
            setUsers([...userMap.values()]);
            setCategories([...categoryMap]);

            // Fetch Analytics
            try {
                const [trendRes, countryRes, ratioRes] = await Promise.all([
                    api.get("/buysellanalytics/trend?range=30d"),
                    api.get("/buysellanalytics/country"),
                    api.get("/buysellanalytics/ratio")
                ]);

                // Process Trend Data
                if (trendRes.data?.trend) {
                    const labelsSet = new Set();
                    const approvedMap = {};
                    const blockedMap = {};

                    trendRes.data.trend.forEach((item) => {
                        const d = item.date;
                        labelsSet.add(d);
                        const val = parseInt(item.count, 10);
                        if (item.event_type === "BUYSELL_LISTING_APPROVED") approvedMap[d] = val;
                        else if (item.event_type === "BUYSELL_LISTING_BLOCKED") blockedMap[d] = val;
                    });

                    const labels = Array.from(labelsSet).sort();
                    setTrendData({
                        labels,
                        datasets: [
                            {
                                label: "Approved",
                                data: labels.map(l => approvedMap[l] || 0),
                                borderColor: "#10B981",
                                backgroundColor: "rgba(16, 185, 129, 0.1)",
                            },
                            {
                                label: "Blocked",
                                data: labels.map(l => blockedMap[l] || 0),
                                borderColor: "#EF4444",
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                            },
                        ],
                    });
                }

                // Process Country Data
                if (countryRes.data?.data) {
                    const sorted = [...countryRes.data.data].sort((a, b) => parseInt(b.total) - parseInt(a.total)).slice(0, 10);
                    setCountryData({
                        labels: sorted.map(i => i.country || "Unknown"),
                        values: sorted.map(i => parseInt(i.total || 0, 10)),
                    });
                }

                // Process Ratio Data
                if (ratioRes.data?.stats) {
                    let approved = 0;
                    let blocked = 0;
                    ratioRes.data.stats.forEach((s) => {
                        if (s.event_type === "BUYSELL_LISTING_APPROVED") approved = parseInt(s.total);
                        if (s.event_type === "BUYSELL_LISTING_BLOCKED") blocked = parseInt(s.total);
                    });
                    setRatioData({
                        labels: ["Approved", "Blocked"],
                        values: [approved, blocked],
                    });
                }

            } catch (analyticsErr) {
                console.error("Failed to fetch analytics:", analyticsErr);
            }

        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats from actual data
    const totalListings = listings.length;
    const activeListings = listings.filter(l => l.status === 'active' || l.status === 'approved').length;
    const pendingListings = listings.filter(l => l.status === 'pending').length;
    const totalUsers = users.length;
    const totalCategories = categories.length;
    const totalRevenue = listings
        .filter(l => l.status === 'active' || l.status === 'approved')
        .reduce((sum, l) => sum + (parseFloat(l.price) * 0.05), 0);

    const StatCard = ({ title, value, icon }) => (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#00162d' }}>
                    <div className="w-6 h-6 text-white">{icon}</div>
                </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{loading ? '...' : value}</h3>
            <p className="text-gray-600 text-sm">{title}</p>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                    <p className="text-gray-600">Welcome to your admin dashboard</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Listings"
                        value={totalListings}
                        icon={<PackageOpen className="w-6 h-6" />}
                    />
                    <StatCard
                        title="Active Listings"
                        value={activeListings}
                        icon={<CheckCircle className="w-6 h-6" />}
                    />
                    <StatCard
                        title="Pending Listings"
                        value={pendingListings}
                        icon={<AlertCircle className="w-6 h-6" />}
                    />
                    <StatCard
                        title="Total Users"
                        value={totalUsers}
                        icon={<Users className="w-6 h-6" />}
                    />
                </div>

                {/* Analytics Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Trend Chart */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">30-Day Activity Trend</h3>
                            <TrendingUp className="text-gray-400 w-5 h-5" />
                        </div>
                        {trendData ? (
                            <LineChart data={trendData} title="Approvals vs Blocks" height={300} />
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400">No trend data</div>
                        )}
                    </div>

                    {/* Country & Ratio Charts */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Top Countries</h3>
                                <MapPin className="text-gray-400 w-5 h-5" />
                            </div>
                            {countryData ? (
                                <BarChart data={countryData} title="Listings by Country" height={200} />
                            ) : (
                                <div className="h-48 flex items-center justify-center text-gray-400">No country data</div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Approval Ratio</h3>
                                <PieChartIcon className="text-gray-400 w-5 h-5" />
                            </div>
                            {ratioData ? (
                                <PieChart data={ratioData} title="Approved vs Blocked" height={200} />
                            ) : (
                                <div className="h-48 flex items-center justify-center text-gray-400">No ratio data</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Dashboard Tab Navigation */}
                <div className="bg-white rounded-xl shadow-sm mb-6 border border-gray-100">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            {dashboardTabItems.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setDashboardTab(tab.id)}
                                    className={`py-3 px-6 text-sm font-medium border-b-2 flex items-center ${dashboardTab === tab.id
                                        ? 'border-blue-500 text-blue-600 bg-white'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Dashboard Tab Content */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    {dashboardTab === 'activity' && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {listings.slice(0, 5).map((listing, index) => (
                                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <div className={`w-2 h-2 rounded-full mr-3 ${listing.status === 'active' ? 'bg-green-500' :
                                            listing.status === 'pending' ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`}></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">New listing: {listing.title}</p>
                                            <p className="text-xs text-gray-500">{new Date(listing.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {listings.length === 0 && (
                                    <p className="text-center text-gray-500">No recent activity</p>
                                )}
                            </div>
                        </div>
                    )}

                    {dashboardTab === 'listings' && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Listings</h3>
                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    View All
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {listings.slice(0, 5).map(listing => (
                                            <tr key={listing.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <img className="h-10 w-10 rounded-lg object-cover mr-3" src={listing.images?.[0]} alt={listing.title} />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                                                            <div className="text-sm text-gray-500">{listing.category} • {listing.location}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{listing.name}</div>
                                                    <div className="text-sm text-gray-500">{listing.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ₹{listing.price.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${listing.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {listing.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex">
                                                        <Eye className="text-blue-600 hover:text-blue-900 mr-3" />
                                                        {listing.status === 'pending' && (
                                                            <>
                                                                <CheckCircle className="text-green-600 hover:text-green-900 mr-3" />
                                                                <XCircle className="text-red-600 hover:text-red-900" />
                                                            </>
                                                        )}
                                                        <Edit className="text-gray-600 hover:text-gray-900 mr-3" />
                                                        <Trash2 className="text-red-600 hover:text-red-900" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;