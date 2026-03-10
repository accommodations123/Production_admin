import React, { useState, useEffect } from "react";
import {
    TrendingUp, Globe, Users, CheckCircle, Clock, XCircle,
    BarChart3, Activity, RefreshCw, AlertCircle
} from "lucide-react";

const AccomadationStats = () => {
    const BASE_URL = "https://api.nextkinlife.live/adminproperty";

    const [statusStats, setStatusStats] = useState(null);
    const [countryStats, setCountryStats] = useState([]);
    const [hostStats, setHostStats] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = async () => {
        if (!refreshing) setLoading(true);
        setError(null);

        const token = localStorage.getItem("admin-auth");

        if (!token) {
            setError("Token missing – Login again");
            setLoading(false);
            return;
        }

        try {
            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            };

            // -------------------- 1. STATUS API --------------------
            const statusRes = await fetch(`${BASE_URL}/stats/by-status`, { headers });
            const statusJson = await statusRes.json();

            // Convert your API → UI format
            const formattedStatus = {
                approved: statusJson.stats.find(s => s.status === "approved")?.total || 0,
                pending: statusJson.stats.find(s => s.status === "pending")?.total || 0,
                rejected: statusJson.stats.find(s => s.status === "rejected")?.total || 0,
            };

            setStatusStats(formattedStatus);

            // -------------------- 2. COUNTRY API --------------------
            const countryRes = await fetch(`${BASE_URL}/stats/by-country`, { headers });
            const countryJson = await countryRes.json();
            setCountryStats(countryJson.stats);

            // -------------------- 3. HOST API --------------------
            const hostRes = await fetch(`${BASE_URL}/stats/by-hosts`, { headers });
            const hostJson = await hostRes.json();
            setHostStats(hostJson.stats);

            // Set last updated time
            setLastUpdated(new Date());

        } catch (err) {
            console.error("API ERROR:", err);
            setError("Unable to load dashboard data");
        }

        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    if (loading && !refreshing) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-md">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-lg text-gray-600">Loading Dashboard…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-md">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <p className="text-lg text-red-600 mb-4">{error}</p>
                <button
                    onClick={fetchDashboardData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with refresh button */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Property Statistics</h2>
                    {lastUpdated && (
                        <p className="text-sm text-gray-500 mt-1">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* ---------------------- STATUS CARDS ---------------------- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statusStats && (
                    <>
                        <StatusCard
                            title="Approved"
                            count={statusStats.approved}
                            color="bg-green-500"
                            bgColor="bg-green-50"
                            icon={<CheckCircle size={24} />}
                        />

                        <StatusCard
                            title="Pending"
                            count={statusStats.pending}
                            color="bg-blue-500"
                            bgColor="bg-blue-50"
                            icon={<Clock size={24} />}
                        />

                        <StatusCard
                            title="Rejected"
                            count={statusStats.rejected}
                            color="bg-red-500"
                            bgColor="bg-red-50"
                            icon={<XCircle size={24} />}
                        />
                    </>
                )}
            </div>

            {/* ---------------------- COUNTRY STATS ---------------------- */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                    <Globe size={20} className="text-blue-600 mr-2" />
                    <h3 className="text-xl font-bold text-gray-800">Top Countries</h3>
                </div>

                {countryStats.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {countryStats.slice(0, 6).map((item, i) => (
                            <div key={i} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                    <Globe size={16} className="text-blue-600" />
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-semibold text-gray-800">{item.country}</h4>
                                    <p className="text-sm text-gray-600">{item.total} properties</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-gray-800">{item.total}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Globe size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No country data found</p>
                    </div>
                )}
            </div>

            {/* ---------------------- HOST STATS ---------------------- */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                    <Users size={20} className="text-blue-600 mr-2" />
                    <h3 className="text-xl font-bold text-gray-800">Host Statistics</h3>
                </div>

                {hostStats.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="pb-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                    <th className="pb-3 text-left text-sm font-semibold text-gray-700">Count</th>
                                    <th className="pb-3 text-left text-sm font-semibold text-gray-700">Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hostStats.map((host, index) => {
                                    const total = hostStats.reduce((sum, h) => sum + h.total, 0);
                                    const percentage = (host.total / total) * 100;

                                    return (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3">
                                                <div className="flex items-center">
                                                    {host.status === 'approved' && <CheckCircle size={16} className="text-green-500 mr-2" />}
                                                    {host.status === 'pending' && <Clock size={16} className="text-blue-500 mr-2" />}
                                                    {host.status === 'rejected' && <XCircle size={16} className="text-red-500 mr-2" />}
                                                    <span className="capitalize font-medium">{host.status}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 font-semibold">{host.total}</td>
                                            <td className="py-3">{percentage.toFixed(1)}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Users size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No host data found</p>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4">
                        <BarChart3 size={20} className="text-blue-600 mr-2" />
                        <h3 className="text-xl font-bold text-gray-800">Approval Rate</h3>
                    </div>
                    <div className="text-3xl font-bold text-gray-800">
                        {statusStats ?
                            ((statusStats.approved / (statusStats.approved + statusStats.pending + statusStats.rejected)) * 100).toFixed(1) :
                            0
                        }%
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Of total submissions</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4">
                        <Activity size={20} className="text-blue-600 mr-2" />
                        <h3 className="text-xl font-bold text-gray-800">Total Properties</h3>
                    </div>
                    <div className="text-3xl font-bold text-gray-800">
                        {statusStats ? statusStats.approved + statusStats.pending + statusStats.rejected : 0}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Across all countries</p>
                </div>
            </div>
        </div>
    );
};

// ---------------------- STATUS CARD COMPONENT ----------------------
const StatusCard = ({ title, count, color, bgColor, icon }) => (
    <div className={`${bgColor} rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1`}>
        <div className="p-6">
            <div className="flex items-center justify-between">
                <div className={`${color} text-white p-3 rounded-lg`}>
                    {icon}
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">{count}</div>
                    <div className="text-sm text-gray-600">{title}</div>
                </div>
            </div>
        </div>
    </div>
);

export default AccomadationStats;