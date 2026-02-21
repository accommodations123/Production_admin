import React, { useEffect, useState } from "react";
import {
    Search,
    Users,
    Star,
    Mail,
    Phone,
    Calendar,
    Filter,
    UserCheck,
    Package,
    TrendingUp,
    Activity,
    MoreVertical,
    Edit,
    Ban,
    Shield,
    UserX,
    ChevronDown
} from "lucide-react";
import axios from "axios";

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
   MAIN COMPONENT
================================ */
const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [userStatusFilter, setUserStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserDetails, setShowUserDetails] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const [pendingRes, approvedRes] = await Promise.all([
                api.get("/buy-sell/admin/buy-sell/pending"),
                api.get("/buy-sell/get"),
            ]);

            const pending = pendingRes.data?.listings || [];
            const approved = approvedRes.data?.listings || approvedRes.data || [];
            const allListings = [...pending, ...approved];

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
                        lastActive: new Date(item.createdAt).toLocaleDateString(),
                        avatar: item.name.charAt(0).toUpperCase(),
                    });
                } else {
                    userMap.get(item.user_id).listings += 1;
                }
            });

            setUsers([...userMap.values()]);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((u) => {
        const matchSearch =
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus =
            userStatusFilter === "all" || u.status === userStatusFilter;
        return matchSearch && matchStatus;
    });

    const updateUserStatus = (userId, newStatus) => {
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === userId ? { ...user, status: newStatus } : user
            )
        );

        // Update selected user if modal is open
        if (selectedUser && selectedUser.id === userId) {
            setSelectedUser(prev => ({ ...prev, status: newStatus }));
        }
    };

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
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Users Management</h1>
                    <p className="text-gray-600">Manage and monitor all platform users</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
                                <div className="flex items-center mt-2 text-xs text-green-600">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    <span>12% from last month</span>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg" style={{ backgroundColor: '#00162d' }}>
                                <Users className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Users</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {users.filter(u => u.status === 'active').length}
                                </p>
                                <div className="flex items-center mt-2 text-xs text-green-600">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    <span>8% from last month</span>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg" style={{ backgroundColor: '#00162d' }}>
                                <UserCheck className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Listings</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {users.reduce((acc, u) => acc + u.listings, 0)}
                                </p>
                                <div className="flex items-center mt-2 text-xs text-green-600">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    <span>15% from last month</span>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg" style={{ backgroundColor: '#00162d' }}>
                                <Package className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">4.5</p>
                                <div className="flex items-center mt-2 text-xs text-red-600">
                                    <TrendingUp className="w-3 h-3 mr-1 transform rotate-180" />
                                    <span>2% from last month</span>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg" style={{ backgroundColor: '#00162d' }}>
                                <Star className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                className="pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all"
                                value={userStatusFilter}
                                onChange={(e) => setUserStatusFilter(e.target.value)}
                            >
                                <option value="all">All Users</option>
                                <option value="active">Active</option>
                                <option value="deactivated">Deactivated</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Listings</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg mr-4">
                                                    {u.avatar}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{u.name}</p>
                                                    <p className="text-sm text-gray-500">ID: {u.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                                    {u.email}
                                                </div>
                                                {u.phone && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                                        {u.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                    {u.joinDate}
                                                </div>
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Activity className="w-3 h-3 mr-2 text-gray-400" />
                                                    Last active: {u.lastActive}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                    {u.listings}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                                <span className="font-medium text-gray-900">{u.rating}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${u.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                <span className={`w-2 h-2 rounded-full mr-2 ${u.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                                                    }`}></span>
                                                {u.status === 'active' ? 'Active' : 'Deactivated'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <button
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors mr-1"
                                                    onClick={() => {
                                                        setSelectedUser(u);
                                                        setShowUserDetails(true);
                                                    }}
                                                    title="View Details"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>

                {/* User Details Modal */}
                {showUserDetails && selectedUser && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6 pb-3 border-b">
                                <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
                                <button
                                    onClick={() => setShowUserDetails(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex items-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl mr-4">
                                    {selectedUser.avatar}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h3>
                                    <p className="text-gray-600">ID: {selectedUser.id}</p>
                                    <div className="flex items-center mt-2">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${selectedUser.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            <span className={`w-2 h-2 rounded-full mr-2 ${selectedUser.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                                                }`}></span>
                                            {selectedUser.status === 'active' ? 'Active' : 'Deactivated'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="text-sm text-gray-700">{selectedUser.email}</span>
                                        </div>
                                        {selectedUser.phone && (
                                            <div className="flex items-center">
                                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                                <span className="text-sm text-gray-700">{selectedUser.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">Account Information</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="text-sm text-gray-700">Joined: {selectedUser.joinDate}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Activity className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="text-sm text-gray-700">Last active: {selectedUser.lastActive}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">Activity</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <Package className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="text-sm text-gray-700">{selectedUser.listings} listings</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Star className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="text-sm text-gray-700">{selectedUser.rating} rating</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                                    <div className="space-y-2">
                                        <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit User
                                        </button>
                                        {selectedUser.status === 'active' ? (
                                            <button
                                                className="w-full flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                onClick={() => updateUserStatus(selectedUser.id, 'deactivated')}
                                            >
                                                <Ban className="w-4 h-4 mr-2" />
                                                Deactivate User
                                            </button>
                                        ) : (
                                            <button
                                                className="w-full flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                onClick={() => updateUserStatus(selectedUser.id, 'active')}
                                            >
                                                <UserCheck className="w-4 h-4 mr-2" />
                                                Activate User
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;