import React, { useEffect, useState } from "react";
import { Eye, CheckCircle, Ban, X, AlertCircle, Check, TrendingUp, Package, Users, Calendar, MapPin, Phone, Mail, Clock, Home, Tag, DollarSign } from "lucide-react";
import axios from "axios";

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
   NOTIFICATION
================================ */
const Notification = ({ type, message, onClose }) => {
    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    const Icon = type === 'success' ? Check : AlertCircle;

    return (
        <div className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center max-w-md animate-pulse`}>
            <Icon className="w-5 h-5 mr-2" />
            <span>{message}</span>
            <button onClick={onClose} className="ml-4">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

/* ==============================
   VIEW DETAILS MODAL
================================ */
const ViewDetailsModal = ({ listing, onClose }) => {
    if (!listing) return null;

    const statusStyle =
        listing.status === "active"
            ? "bg-green-100 text-green-800"
            : listing.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-6 pb-3 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Listing Details</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* IMAGES */}
                {listing.images?.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                        {listing.images.map((img, i) => (
                            <img
                                key={i}
                                src={img}
                                alt=""
                                className="h-40 w-full object-cover rounded-lg border"
                            />
                        ))}
                    </div>
                )}

                {/* LISTING INFO */}
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold mb-4">Listing Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                            <Package className="w-4 h-4 mr-2 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Listing ID</p>
                                <p className="font-medium">{listing.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">User ID</p>
                                <p className="font-medium">{listing.user_id}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="w-4 h-4 mr-2 text-gray-400">₹</span>
                            <div>
                                <p className="text-xs text-gray-500">Price</p>
                                <p className="font-medium">{listing.price}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Tag className="w-4 h-4 mr-2 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Category</p>
                                <p className="font-medium">{listing.category}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Tag className="w-4 h-4 mr-2 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Subcategory</p>
                                <p className="font-medium">{listing.subcategory}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Location</p>
                                <p className="font-medium">{listing.country || "—"}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">City</p>
                                <p className="font-medium">{listing.city || "—"}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Zip Code</p>
                                <p className="font-medium">{listing.zip_code || "—"}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Posted On</p>
                                <p className="font-medium">{new Date(listing.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Updated On</p>
                                <p className="font-medium">{new Date(listing.updatedAt).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusStyle}`}>
                                {listing.status}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
                        <p className="bg-white border rounded p-3 text-gray-700">{listing.description}</p>
                    </div>
                </div>

                {/* SELLER INFO */}
                <div className="bg-blue-50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Seller Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                            <span className="w-4 h-4 mr-2 text-gray-400">👤</span>
                            <div>
                                <p className="text-xs text-gray-500">Name</p>
                                <p className="font-medium">{listing.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="font-medium">{listing.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Phone</p>
                                <p className="font-medium">{listing.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ==============================
   DENY MODAL
================================ */
const DenyModal = ({ open, onClose, onSubmit }) => {
    const [reason, setReason] = useState("");

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                        <Ban className="h-5 w-5 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Deny Listing</h2>
                </div>

                <p className="text-gray-600 mb-4">Please provide a reason for denying this listing.</p>

                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter reason for denial..."
                    rows={4}
                />

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (reason.trim() === "") {
                                alert("Please provide a reason for denial");
                                return;
                            }
                            onSubmit(reason);
                            setReason("");
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Deny Listing
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ==============================
   MAIN COMPONENT
================================ */
const ManageListings = () => {
    const [pending, setPending] = useState([]);
    const [approved, setApproved] = useState([]);
    const [denied, setDenied] = useState([]);
    const [activeTab, setActiveTab] = useState("pending");
    const [viewListing, setViewListing] = useState(null);
    const [denyTarget, setDenyTarget] = useState(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchPending();
        fetchApproved();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await api.get("/buy-sell/admin/buy-sell/pending");
            setPending(res.data?.listings || []);
        } catch (err) {
            console.error("Failed to fetch pending listings:", err);
            showNotification("error", "Failed to fetch pending listings");
        }
    };

    const fetchApproved = async () => {
        try {
            const res = await api.get("/buy-sell/get");
            setApproved(res.data?.listings || res.data || []);
        } catch (err) {
            console.error("Failed to fetch approved listings:", err);
            showNotification("error", "Failed to fetch approved listings");
        }
    };

    const showNotification = (type, msg) => {
        setNotification({ type, message: msg });
        setTimeout(() => setNotification(null), 3000);
    };

    const approveListing = async (listing) => {
        try {
            await api.patch(`/buy-sell/admin/buy-sell/${listing.id}/approve`);
            setPending(p => p.filter(x => x.id !== listing.id));
            fetchApproved();
            showNotification("success", "Listing approved successfully");
        } catch (err) {
            console.error("Failed to approve listing:", err);
            showNotification("error", "Failed to approve listing");
        }
    };

    const denyListing = async (reason) => {
        try {
            const listing = pending.find(l => l.id === denyTarget);
            await api.patch(`/buy-sell/admin/buy-sell/${denyTarget}/block`, { reason });
            setPending(p => p.filter(x => x.id !== denyTarget));
            setDenied(d => [...d, { ...listing, status: "denied", reason }]);
            setDenyTarget(null);
            showNotification("success", "Listing denied successfully");
        } catch (err) {
            console.error("Failed to deny listing:", err);
            showNotification("error", "Failed to deny listing");
        }
    };

    const data = activeTab === "pending" ? pending : activeTab === "approved" ? approved : denied;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Listings Management</h1>
                    <p className="text-gray-600">Review and manage all marketplace listings</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Listings</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{pending.length}</p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ backgroundColor: '#00162d' }}>
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Approved Listings</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{approved.length}</p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ backgroundColor: '#00162d' }}>
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Denied Listings</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{denied.length}</p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ backgroundColor: '#00162d' }}>
                                <Ban className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm p-2 mb-6 inline-flex">
                    {["pending", "approved", "denied"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === tab
                                ? "bg-blue-600 text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                                {tab === "pending" ? pending.length :
                                    tab === "approved" ? approved.length :
                                        denied.length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.map((l) => (
                                    <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden shadow-sm">
                                                <img
                                                    src={l.images?.[0] || "/placeholder.png"}
                                                    className="w-full h-full object-cover"
                                                    alt=""
                                                />
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{l.title}</div>
                                            <div className="text-sm text-gray-500 mt-1">₹{l.price}</div>
                                        </td>
                                        <td className="p-4 text-gray-700">{l.name}</td>
                                        <td className="p-4 text-gray-700">{l.phone}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${l.status === "active" ? "bg-green-100 text-green-800" :
                                                l.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                                    "bg-red-100 text-red-800"
                                                }`}>
                                                {l.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                    onClick={() => setViewListing(l)}
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                {activeTab === "pending" && (
                                                    <>
                                                        <button
                                                            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                            onClick={() => approveListing(l)}
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                            onClick={() => setDenyTarget(l.id)}
                                                            title="Deny"
                                                        >
                                                            <Ban className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {data.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Package className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-lg font-medium">No listings found</p>
                            <p className="text-gray-400 text-sm mt-1">There are no {activeTab} listings at the moment.</p>
                        </div>
                    )}
                </div>

                {/* Modals */}
                <ViewDetailsModal
                    listing={viewListing}
                    onClose={() => setViewListing(null)}
                />

                <DenyModal
                    open={!!denyTarget}
                    onClose={() => setDenyTarget(null)}
                    onSubmit={denyListing}
                />

                {/* Notification */}
                {notification && (
                    <Notification
                        type={notification.type}
                        message={notification.message}
                        onClose={() => setNotification(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default ManageListings;