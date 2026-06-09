import React, { useState, useEffect, useRef } from "react";
import {
    UserPlus,
    Users,
    Shield,
    Briefcase,
    Eye,
    EyeOff,
    Loader2,
    Search,
    ChevronDown,
    X,
    AlertTriangle,
    CheckCircle,
    Clock,
    Lock,
    Mail,
    User,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════ */

const API_URL =
    import.meta.env.VITE_API_URL || "https://api.nextkinlife.live";

const ROLE_CONFIG = {
    super_admin: {
        label: "Super Admin",
        color: "bg-gradient-to-r from-amber-500 to-orange-600",
        textColor: "text-amber-600",
        bgLight: "bg-amber-50 border-amber-200",
        icon: Shield,
    },
    admin: {
        label: "Admin",
        color: "bg-gradient-to-r from-blue-500 to-indigo-600",
        textColor: "text-blue-600",
        bgLight: "bg-blue-50 border-blue-200",
        icon: Users,
    },
    recruiter: {
        label: "Recruiter",
        color: "bg-gradient-to-r from-emerald-500 to-teal-600",
        textColor: "text-emerald-600",
        bgLight: "bg-emerald-50 border-emerald-200",
        icon: Briefcase,
    },
};

const STATUS_CONFIG = {
    active: {
        label: "Active",
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
    },
    suspended: {
        label: "Suspended",
        color: "bg-amber-100 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
    },
    deactivated: {
        label: "Deactivated",
        color: "bg-red-100 text-red-700 border-red-200",
        dot: "bg-red-500",
    },
};

/* ═══════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

function getAuthHeaders() {
    const token = localStorage.getItem("admin-auth");
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/* ═══════════════════════════════════════════════════════════════════════
   TOAST COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

function Toast({ message, type, onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        success: "bg-emerald-50 border-emerald-400 text-emerald-800",
        error: "bg-red-50 border-red-400 text-red-800",
        info: "bg-blue-50 border-blue-400000 text-blue-800",
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-600" />,
        error: <AlertTriangle className="w-5 h-5 text-red-600" />,
        info: <CheckCircle className="w-5 h-5 text-blue-600" />,
    };

    return (
        <div
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl 
        animate-[slideIn_0.3s_ease-out] ${colors[type] || colors.info}`}
        >
            {icons[type]}
            <span className="font-medium text-sm">{message}</span>
            <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   CREATE ADMIN MODAL
   ═══════════════════════════════════════════════════════════════════════ */

function CreateAdminModal({ isOpen, onClose, onCreated }) {
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "admin" });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const modalRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        function handleClick(e) {
            if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
        }
        if (isOpen) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [isOpen, onClose]);

    // Close on ESC
    useEffect(() => {
        function handleEsc(e) {
            if (e.key === "Escape") onClose();
        }
        if (isOpen) document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Client-side validation
        if (!form.name.trim() || form.name.trim().length < 2) {
            setError("Name must be at least 2 characters"); return;
        }
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setError("Please enter a valid email address"); return;
        }
        if (form.password.length < 8) {
            setError("Password must be at least 8 characters"); return;
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(form.password)) {
            setError("Password must contain uppercase, lowercase, number, and special character"); return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/register`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to create admin");
                setLoading(false);
                return;
            }

            onCreated(data.data || data.admin);
            setForm({ name: "", email: "", password: "", role: "admin" });
            onClose();
        } catch (err) {
            setError("Network error. Please try again.");
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div
                ref={modalRef}
                className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Create New Account</h3>
                            <p className="text-xs text-slate-300">Admin or Recruiter</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                        <div className="flex items-center border border-gray-300 rounded-xl focus-within:border-[#cb2926] focus-within:ring-2 focus-within:ring-[#cb2926]/20 overflow-hidden transition-all">
                            <div className="bg-gray-50 p-3 border-r border-gray-200">
                                <User className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                className="flex-1 px-3 py-2.5 outline-none text-gray-900 text-sm"
                                placeholder="Enter full name"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                        <div className="flex items-center border border-gray-300 rounded-xl focus-within:border-[#cb2926] focus-within:ring-2 focus-within:ring-[#cb2926]/20 overflow-hidden transition-all">
                            <div className="bg-gray-50 p-3 border-r border-gray-200">
                                <Mail className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                className="flex-1 px-3 py-2.5 outline-none text-gray-900 text-sm"
                                placeholder="admin@nextkinlife.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                        <div className="flex items-center border border-gray-300 rounded-xl focus-within:border-[#cb2926] focus-within:ring-2 focus-within:ring-[#cb2926]/20 overflow-hidden transition-all">
                            <div className="bg-gray-50 p-3 border-r border-gray-200">
                                <Lock className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                                type={showPass ? "text" : "password"}
                                value={form.password}
                                onChange={(e) => handleChange("password", e.target.value)}
                                className="flex-1 px-3 py-2.5 outline-none text-gray-900 text-sm"
                                placeholder="Min 8 chars, mixed case + number + symbol"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="px-3 text-gray-400 hover:text-[#cb2926] transition"
                            >
                                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5 ml-1">
                            Must include uppercase, lowercase, number, and special character
                        </p>
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
                        <div className="grid grid-cols-2 gap-3">
                            {["admin", "recruiter"].map((role) => {
                                const config = ROLE_CONFIG[role];
                                const Icon = config.icon;
                                const isSelected = form.role === role;
                                return (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => handleChange("role", role)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${isSelected
                                            ? "border-[#cb2926] bg-red-50 shadow-md shadow-red-100"
                                            : "border-gray-200 hover:border-gray-300 bg-white"
                                            }`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? "bg-[#cb2926] text-white" : "bg-gray-100 text-gray-500"
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <span className={`text-sm font-semibold ${isSelected ? "text-[#cb2926]" : "text-gray-600"}`}>
                                            {config.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#cb2926] to-[#a71f1c] hover:from-[#a71f1c] hover:to-[#8b1916] 
              text-white font-semibold py-3 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/40 
              transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4" />
                                Create Account
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   ADMIN CARD COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

function AdminCard({ admin }) {
    const roleConfig = ROLE_CONFIG[admin.role] || ROLE_CONFIG.admin;
    const statusConfig = STATUS_CONFIG[admin.status] || STATUS_CONFIG.active;
    const RoleIcon = roleConfig.icon;

    const initials = (admin.name || "A")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300 overflow-hidden group">
            {/* Top color bar */}
            <div className={`h-1 ${roleConfig.color}`} />

            <div className="p-5">
                {/* Avatar + Info */}
                <div className="flex items-start gap-4">
                    <div
                        className={`w-12 h-12 rounded-xl ${roleConfig.color} flex items-center justify-center text-white 
              font-bold text-sm shadow-lg shrink-0 group-hover:scale-105 transition-transform`}
                    >
                        {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-gray-900 truncate">{admin.name}</h4>
                        <p className="text-sm text-gray-500 truncate">{admin.email}</p>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 mt-4">
                    {/* Role Badge */}
                    <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${roleConfig.bgLight} ${roleConfig.textColor}`}
                    >
                        <RoleIcon className="w-3 h-3" />
                        {roleConfig.label}
                    </span>

                    {/* Status Badge */}
                    <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                        {statusConfig.label}
                    </span>
                </div>

                {/* Meta info */}
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Joined {formatDate(admin.created_at || admin.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Login {admin.last_login_at ? formatDate(admin.last_login_at) : "Never"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export default function ManageAdmins() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    // ── Fetch admins ──────────────────────────────────────────────────
    const fetchAdmins = async (page = 1) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/admins?page=${page}&limit=20`, {
                headers: getAuthHeaders(),
            });

            if (!res.ok) {
                const data = await res.json();
                showToast(data.message || "Failed to fetch admins", "error");
                setLoading(false);
                return;
            }

            const data = await res.json();
            setAdmins(data.data || []);
            setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
        } catch (err) {
            showToast("Network error fetching admins", "error");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    // ── Toast helper ──────────────────────────────────────────────────
    const showToast = (message, type = "info") => {
        setToast({ message, type });
    };

    // ── On admin created ─────────────────────────────────────────────
    const handleAdminCreated = (newAdmin) => {
        showToast(`${newAdmin?.name || "Admin"} created successfully!`, "success");
        fetchAdmins(pagination.page);
    };

    // ── Filtering ─────────────────────────────────────────────────────
    const filtered = admins.filter((a) => {
        const matchesSearch =
            !search ||
            a.name?.toLowerCase().includes(search.toLowerCase()) ||
            a.email?.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "all" || a.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // ── Stats ─────────────────────────────────────────────────────────
    const stats = {
        total: admins.length,
        super_admins: admins.filter((a) => a.role === "super_admin").length,
        admins: admins.filter((a) => a.role === "admin").length,
        recruiters: admins.filter((a) => a.role === "recruiter").length,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Modal */}
            <CreateAdminModal isOpen={showModal} onClose={() => setShowModal(false)} onCreated={handleAdminCreated} />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* ── Page Header ──────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Team Management
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">
                            Create and manage admin & recruiter accounts
                        </p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#cb2926] to-[#a71f1c] 
              hover:from-[#a71f1c] hover:to-[#8b1916] text-white font-semibold px-5 py-2.5 rounded-xl 
              shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transition-all"
                    >
                        <UserPlus className="w-4 h-4" />
                        Create Account
                    </button>
                </div>

                {/* ── Stats Row ────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Accounts", value: stats.total, icon: Users, gradient: "from-slate-500 to-slate-700" },
                        { label: "Super Admins", value: stats.super_admins, icon: Shield, gradient: "from-amber-500 to-orange-600" },
                        { label: "Admins", value: stats.admins, icon: Users, gradient: "from-blue-500 to-indigo-600" },
                        { label: "Recruiters", value: stats.recruiters, icon: Briefcase, gradient: "from-emerald-500 to-teal-600" },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Search + Filters ─────────────────────────────────────── */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 
                focus:outline-none focus:border-[#cb2926] focus:ring-2 focus:ring-[#cb2926]/10 transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>

                    {/* Role filter */}
                    <div className="flex items-center gap-2">
                        {[
                            { key: "all", label: "All" },
                            { key: "super_admin", label: "Super Admin" },
                            { key: "admin", label: "Admin" },
                            { key: "recruiter", label: "Recruiter" },
                        ].map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setRoleFilter(f.key)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${roleFilter === f.key
                                    ? "bg-[#cb2926] text-white border-[#cb2926] shadow-md shadow-red-200"
                                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Admin Cards Grid ─────────────────────────────────────── */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[#cb2926] animate-spin" />
                        <span className="ml-3 text-gray-500 font-medium">Loading team members...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600">No accounts found</h3>
                        <p className="text-gray-400 text-sm mt-1">
                            {search || roleFilter !== "all"
                                ? "Try adjusting your search or filters"
                                : "Click 'Create Account' to add your first admin"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map((admin) => (
                            <AdminCard key={admin.id} admin={admin} />
                        ))}
                    </div>
                )}

                {/* ── Pagination ───────────────────────────────────────────── */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => fetchAdmins(page)}
                                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${pagination.page === page
                                    ? "bg-[#cb2926] text-white shadow-md"
                                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Custom Animations ──────────────────────────────────────── */}
            <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
        </div>
    );
}
