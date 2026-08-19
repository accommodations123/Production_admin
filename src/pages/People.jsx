import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Star,
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Globe,
  Briefcase,
  X,
  UserMinus,
  Ban,
  ThumbsUp,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://35.153.223.230:5000";

const REJECTION_REASONS = [
  "Missing portfolio",
  "Incomplete profile details",
  "Invalid or unverified contact information",
  "Low quality avatar or inappropriate photo",
  "Guidelines non-compliance",
  "Duplicate profile"
];

const BLOCKING_REASONS = [
  "Spam activity",
  "Fraudulent or impersonation profile",
  "Harassment or policy violation",
  "Repeated user reports",
  "Suspicious transaction or activity"
];

const People = () => {
  const [activeTab, setActiveTab] = useState("profiles"); // "profiles" | "reports"
  const [profiles, setProfiles] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileDetails, setProfileDetails] = useState(null);

  const [loading, setLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | approved | rejected | blocked | verified | featured
  const [showViewModal, setShowViewModal] = useState(false);

  // Moderation Dialog States
  const [rejectDialog, setRejectDialog] = useState({ show: false, profileId: null, name: "", reason: "" });
  const [blockDialog, setBlockDialog] = useState({ show: false, profileId: null, name: "", reason: "" });
  const [deleteDialog, setDeleteDialog] = useState({ show: false, profileId: null, name: "" });

  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("admin-auth");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  }, []);

  const showToast = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 4000);
  };

  /* ═══════ FETCH PROFILES ═══════ */
  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const url = statusFilter !== "all" && ["pending", "approved", "rejected", "blocked"].includes(statusFilter)
        ? `${BASE_URL}/admin/people?status=${statusFilter}`
        : `${BASE_URL}/admin/people`;

      const res = await axios.get(url, getHeaders());
      const data = res.data?.profiles || res.data?.data?.items || res.data?.data || res.data || [];
      setProfiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch profiles error:", err);
      showToast(err.response?.data?.message || "Failed to load profiles", "error");
    } finally {
      setLoading(false);
    }
  }, [getHeaders, statusFilter]);

  /* ═══════ FETCH ANALYTICS ═══════ */
  const fetchAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      const res = await axios.get(`${BASE_URL}/admin/people/analytics`, getHeaders());
      setAnalytics(res.data?.analytics || res.data?.data || res.data || null);
    } catch (err) {
      console.error("Fetch people analytics error:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [getHeaders]);

  /* ═══════ FETCH REPORTS ═══════ */
  const fetchReports = useCallback(async () => {
    try {
      setReportsLoading(true);
      const res = await axios.get(`${BASE_URL}/admin/people/reports`, getHeaders());
      const data = res.data?.reports || res.data?.data || res.data || [];
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch reports error:", err);
      showToast(err.response?.data?.message || "Failed to load reports", "error");
    } finally {
      setReportsLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    fetchAnalytics();
    fetchReports();
  }, [fetchAnalytics, fetchReports]);

  /* ═══════ FETCH SINGLE PROFILE DETAILS ═══════ */
  const handleViewProfile = async (profile) => {
    setSelectedProfile(profile);
    setShowViewModal(true);
    const profileId = profile._id || profile.id;
    if (!profileId) return;

    try {
      setDetailsLoading(true);
      const res = await axios.get(`${BASE_URL}/admin/people/${profileId}`, getHeaders());
      setProfileDetails(res.data?.profile || res.data?.data || res.data);
    } catch (err) {
      console.error("Fetch profile details error:", err);
      setProfileDetails(profile);
    } finally {
      setDetailsLoading(false);
    }
  };

  /* ═══════ MODERATION ACTIONS ═══════ */
  const handleApprove = async (id) => {
    try {
      setActionLoading(`${id}-approve`);
      await axios.post(`${BASE_URL}/admin/people/${id}/approve`, {}, getHeaders());
      showToast("Profile approved and cache purged successfully", "success");
      fetchProfiles();
      fetchAnalytics();
      if (selectedProfile && (selectedProfile._id === id || selectedProfile.id === id)) {
        handleViewProfile({ ...selectedProfile, id });
      }
    } catch (err) {
      console.error("Approve error:", err);
      showToast(err.response?.data?.message || "Failed to approve profile", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async () => {
    const { profileId, reason } = rejectDialog;
    if (!profileId) return;
    try {
      setActionLoading(`${profileId}-reject`);
      await axios.post(
        `${BASE_URL}/admin/people/${profileId}/reject`,
        { reason: reason.trim() || "Rejected by administrator" },
        getHeaders()
      );
      showToast("Profile rejected successfully", "success");
      setRejectDialog({ show: false, profileId: null, name: "", reason: "" });
      fetchProfiles();
      fetchAnalytics();
      if (selectedProfile && (selectedProfile._id === profileId || selectedProfile.id === profileId)) {
        handleViewProfile({ ...selectedProfile, id: profileId });
      }
    } catch (err) {
      console.error("Reject error:", err);
      showToast(err.response?.data?.message || "Failed to reject profile", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlockConfirm = async () => {
    const { profileId, reason } = blockDialog;
    if (!profileId) return;
    try {
      setActionLoading(`${profileId}-block`);
      await axios.post(
        `${BASE_URL}/admin/people/${profileId}/block`,
        { reason: reason.trim() || "Blocked by administrator" },
        getHeaders()
      );
      showToast("Profile blocked successfully", "success");
      setBlockDialog({ show: false, profileId: null, name: "", reason: "" });
      fetchProfiles();
      fetchAnalytics();
      if (selectedProfile && (selectedProfile._id === profileId || selectedProfile.id === profileId)) {
        handleViewProfile({ ...selectedProfile, id: profileId });
      }
    } catch (err) {
      console.error("Block error:", err);
      showToast(err.response?.data?.message || "Failed to block profile", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async (id) => {
    try {
      setActionLoading(`${id}-unblock`);
      await axios.post(`${BASE_URL}/admin/people/${id}/unblock`, {}, getHeaders());
      showToast("Profile unblocked and restored to approved", "success");
      fetchProfiles();
      fetchAnalytics();
      if (selectedProfile && (selectedProfile._id === id || selectedProfile.id === id)) {
        handleViewProfile({ ...selectedProfile, id });
      }
    } catch (err) {
      console.error("Unblock error:", err);
      showToast(err.response?.data?.message || "Failed to unblock profile", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleFeatureToggle = async (id, currentFeatured) => {
    try {
      setActionLoading(`${id}-feature`);
      const res = await axios.post(
        `${BASE_URL}/admin/people/${id}/feature`,
        { is_featured: !currentFeatured },
        getHeaders()
      );
      showToast(res.data?.message || (!currentFeatured ? "Profile featured" : "Profile unfeatured"), "success");
      fetchProfiles();
      fetchAnalytics();
      if (selectedProfile && (selectedProfile._id === id || selectedProfile.id === id)) {
        handleViewProfile({ ...selectedProfile, id });
      }
    } catch (err) {
      console.error("Feature error:", err);
      showToast(err.response?.data?.message || "Failed to update featured status", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    const { profileId } = deleteDialog;
    if (!profileId) return;
    try {
      setActionLoading(`${profileId}-delete`);
      await axios.delete(`${BASE_URL}/admin/people/${profileId}`, getHeaders());
      showToast("Profile permanently deleted", "success");
      setDeleteDialog({ show: false, profileId: null, name: "" });
      if (showViewModal && selectedProfile && (selectedProfile._id === profileId || selectedProfile.id === profileId)) {
        setShowViewModal(false);
      }
      fetchProfiles();
      fetchAnalytics();
    } catch (err) {
      console.error("Delete error:", err);
      showToast(err.response?.data?.message || "Failed to delete profile", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      setActionLoading(`report-${reportId}`);
      await axios.post(`${BASE_URL}/admin/people/reports/${reportId}/resolve`, {}, getHeaders());
      showToast("Report resolved successfully", "success");
      fetchReports();
    } catch (err) {
      console.error("Resolve report error:", err);
      showToast(err.response?.data?.message || "Failed to resolve report", "error");
    } finally {
      setActionLoading(null);
    }
  };

  /* ═══════ STAT CARDS DATA ═══════ */
  const totalCount = analytics?.totalProfiles ?? profiles.length;
  const pendingCount = analytics?.pendingProfiles ?? profiles.filter(p => p.status === "pending" || (!p.status && !p.is_approved)).length;
  const approvedCount = analytics?.approvedProfiles ?? profiles.filter(p => p.status === "approved" || p.is_approved === true).length;
  const rejectedCount = analytics?.rejectedProfiles ?? profiles.filter(p => p.status === "rejected").length;
  const blockedCount = analytics?.blockedProfiles ?? profiles.filter(p => p.status === "blocked" || p.is_blocked === true).length;
  const reportsCount = reports.filter(r => !r.resolved && r.status !== "resolved").length;

  const statCards = [
    { label: "Total Profiles", value: totalCount, icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "from-blue-500 to-indigo-500" },
    { label: "Pending Approval", value: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "from-amber-500 to-yellow-500" },
    { label: "Approved / Active", value: approvedCount, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50", border: "from-emerald-500 to-teal-500" },
    { label: "Rejected Profiles", value: rejectedCount, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", border: "from-rose-500 to-pink-500" },
    { label: "Blocked Profiles", value: blockedCount, icon: Ban, color: "text-red-600", bg: "bg-red-50", border: "from-red-500 to-rose-600" },
    { label: "Pending Reports", value: reportsCount, icon: ShieldAlert, color: "text-orange-600", bg: "bg-orange-50", border: "from-orange-500 to-amber-500" },
  ];

  /* ═══════ FILTERING PROFILES ═══════ */
  const filteredProfiles = profiles.filter((p) => {
    const name = `${p.firstName || ""} ${p.lastName || ""} ${p.name || ""}`.toLowerCase();
    const email = (p.email || "").toLowerCase();
    const city = (p.city || p.location?.city || "").toLowerCase();
    const occupation = (p.occupation || p.headline || p.profession || "").toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = name.includes(query) || email.includes(query) || city.includes(query) || occupation.includes(query);

    const isBlocked = Boolean(p.is_blocked || p.isBlocked || p.blocked || p.status === "blocked");
    const isApproved = Boolean(p.is_approved || p.status === "approved");
    const isRejected = p.status === "rejected";
    const isPending = p.status === "pending" || (!p.status && !isApproved);
    const isVerified = Boolean(p.is_verified || p.isVerified || p.verified);
    const isFeatured = Boolean(p.is_featured || p.isFeatured || p.featured);

    if (!matchesSearch) return false;

    if (statusFilter === "pending") return isPending;
    if (statusFilter === "approved") return isApproved && !isBlocked;
    if (statusFilter === "rejected") return isRejected;
    if (statusFilter === "blocked") return isBlocked;
    if (statusFilter === "verified") return isVerified;
    if (statusFilter === "featured") return isFeatured;

    return true;
  });

  return (
    <div className="p-6 lg:p-8 animate-fade-in space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── TOAST NOTIFICATION ────────────────────────── */}
        {notification.show && (
          <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all ${
            notification.type === "error"
              ? "bg-red-600 text-white"
              : "bg-emerald-600 text-white"
          }`}>
            {notification.type === "error" ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* ── HEADER ──────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">People & Moderation Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">Accept, reject, block, feature, and moderate user profiles with real-time cache purging</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchProfiles();
                fetchAnalytics();
                fetchReports();
              }}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading || analyticsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── STAT CARDS ──────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 relative overflow-hidden hover:shadow-md transition-all group"
            >
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${stat.border}`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <stat.icon className={`${stat.color}`} size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── NAVIGATION TABS ─────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("profiles")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "profiles"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Users className="w-4 h-4" />
            Profiles Management ({profiles.length})
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all relative ${
              activeTab === "reports"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Reports & Flags
            {reportsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                {reportsCount}
              </span>
            )}
          </button>
        </div>

        {/* ── TAB CONTENT: PROFILES ───────────────────── */}
        {activeTab === "profiles" && (
          <div className="space-y-4">
            {/* SEARCH & FILTERS */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, city, headline, or keywords..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {[
                  { key: "all", label: `All Profiles (${profiles.length})` },
                  { key: "pending", label: `Pending (${pendingCount})`, badgeColor: "bg-amber-100 text-amber-800" },
                  { key: "approved", label: `Approved (${approvedCount})`, badgeColor: "bg-emerald-100 text-emerald-800" },
                  { key: "rejected", label: `Rejected (${rejectedCount})`, badgeColor: "bg-rose-100 text-rose-800" },
                  { key: "blocked", label: `Blocked (${blockedCount})`, badgeColor: "bg-red-100 text-red-800" },
                  { key: "featured", label: `Featured` },
                  { key: "verified", label: `Verified` },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStatusFilter(f.key)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      statusFilter === f.key
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Profile</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Contact / Location</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Profession / Bio</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Moderation Status</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Moderation Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {!loading && filteredProfiles.map((p) => {
                      const id = p._id || p.id;
                      const name = p.name || `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Anonymous User";
                      const isBlocked = Boolean(p.is_blocked || p.isBlocked || p.blocked || p.status === "blocked");
                      const isApproved = Boolean(p.is_approved || p.status === "approved");
                      const isRejected = p.status === "rejected";
                      const isPending = p.status === "pending" || (!p.status && !isApproved);
                      const isVerified = Boolean(p.is_verified || p.isVerified || p.verified);
                      const isFeatured = Boolean(p.is_featured || p.isFeatured || p.featured);
                      const avatar = p.avatar || p.profileImage || p.photoUrl || p.image;

                      return (
                        <tr key={id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {avatar ? (
                                <img
                                  src={avatar}
                                  alt={name}
                                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
                                  {name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-semibold text-slate-900 text-sm truncate">{name}</p>
                                  {isVerified && (
                                    <span title="Verified Profile">
                                      <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                                    </span>
                                  )}
                                  {isFeatured && (
                                    <span title="Featured Profile">
                                      <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400 truncate">ID: {id?.slice?.(0, 12)}...</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="space-y-0.5 text-xs text-slate-500">
                              {p.email && (
                                <div className="flex items-center gap-1.5 truncate">
                                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{p.email}</span>
                                </div>
                              )}
                              {(p.city || p.country || p.location) && (
                                <div className="flex items-center gap-1.5 truncate text-slate-400">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{p.city || p.location?.city || p.country || p.location?.country || "N/A"}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4 max-w-[220px]">
                            <div className="text-xs text-slate-700 truncate font-medium">
                              {p.occupation || p.headline || p.profession || "Not specified"}
                            </div>
                            <p className="text-xs text-slate-400 truncate line-clamp-1">
                              {p.bio || p.about || "No bio added"}
                            </p>
                          </td>

                          {/* Moderation Status */}
                          <td className="px-5 py-4">
                            <div className="space-y-1">
                              {isBlocked && (
                                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1">
                                  <Ban className="w-3.5 h-3.5" /> Blocked
                                </span>
                              )}
                              {!isBlocked && isApproved && (
                                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5" /> Approved
                                </span>
                              )}
                              {!isBlocked && isRejected && (
                                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5" /> Rejected
                                </span>
                              )}
                              {!isBlocked && isPending && (
                                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" /> Pending
                                </span>
                              )}

                              {/* Rejection / Block reason note */}
                              {p.rejection_reason && (
                                <p className="text-[11px] text-slate-500 line-clamp-1 italic max-w-[180px]" title={p.rejection_reason}>
                                  Reason: {p.rejection_reason}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Moderation Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Details */}
                              <button
                                onClick={() => handleViewProfile(p)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Approve Button */}
                              {(!isApproved || isRejected) && !isBlocked && (
                                <button
                                  onClick={() => handleApprove(id)}
                                  disabled={actionLoading === `${id}-approve`}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 shadow-sm"
                                  title="Approve / Accept Profile"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" /> Approve
                                </button>
                              )}

                              {/* Reject Button */}
                              {!isRejected && !isBlocked && (
                                <button
                                  onClick={() => setRejectDialog({ show: true, profileId: id, name, reason: "" })}
                                  disabled={actionLoading === `${id}-reject`}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                                  title="Reject Profile"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                </button>
                              )}

                              {/* Feature Button */}
                              <button
                                onClick={() => handleFeatureToggle(id, isFeatured)}
                                disabled={actionLoading === `${id}-feature`}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isFeatured
                                    ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300"
                                    : "bg-slate-100 hover:bg-amber-50 hover:text-amber-600 text-slate-600"
                                }`}
                                title={isFeatured ? "Unfeature Profile" : "Feature Profile"}
                              >
                                <Star className={`w-4 h-4 ${isFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
                              </button>

                              {/* Block / Unblock */}
                              {isBlocked ? (
                                <button
                                  onClick={() => handleUnblock(id)}
                                  disabled={actionLoading === `${id}-unblock`}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm inline-flex items-center gap-1"
                                  title="Unblock Profile"
                                >
                                  <UserCheck className="w-3.5 h-3.5" /> Unblock
                                </button>
                              ) : (
                                <button
                                  onClick={() => setBlockDialog({ show: true, profileId: id, name, reason: "" })}
                                  disabled={actionLoading === `${id}-block`}
                                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                                  title="Block Profile"
                                >
                                  <Ban className="w-3.5 h-3.5" /> Block
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                onClick={() => setDeleteDialog({ show: true, profileId: id, name })}
                                disabled={actionLoading === `${id}-delete`}
                                className="p-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-lg transition-colors"
                                title="Delete Profile"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {loading && (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto" />
                  <p className="mt-4 text-sm text-slate-400">Loading profiles…</p>
                </div>
              )}

              {!loading && filteredProfiles.length === 0 && (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 mb-3">
                    <Users className="w-7 h-7 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">No profiles found</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your filters or search terms"
                      : "No user profiles currently registered"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: REPORTS & FLAGS ────────────── */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Reported Profiles & Violations</h3>
                  <p className="text-xs text-slate-400 mt-0.5">User-submitted flags, spam reports, or community guideline violations</p>
                </div>
                <button
                  onClick={fetchReports}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 text-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${reportsLoading ? 'animate-spin' : ''}`} /> Refresh Reports
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/30">
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reported Profile</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reported By</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reason / Description</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {!reportsLoading && reports.map((r) => {
                      const reportId = r._id || r.id;
                      const isResolved = r.resolved || r.status === "resolved";
                      const reportedPerson = r.reportedUser || r.profile || r.targetProfile || {};
                      const reportedId = reportedPerson._id || reportedPerson.id || r.reported_profile_id;

                      return (
                        <tr key={reportId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-900 text-sm">
                              {reportedPerson.name || reportedPerson.firstName ? `${reportedPerson.firstName || ""} ${reportedPerson.lastName || ""}` : r.targetProfileId || r.reported_profile_id || "Unknown Profile"}
                            </div>
                            <div className="text-xs text-slate-400">ID: {(reportedId || "").slice?.(0, 12)}...</div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-xs font-medium text-slate-700">
                              {r.reporterName || r.reporter?.name || r.reporter_user_id || "Anonymous"}
                            </div>
                            <div className="text-xs text-slate-400">{r.reporterEmail || r.reporter?.email || ""}</div>
                          </td>

                          <td className="px-5 py-4 max-w-xs">
                            <div className="text-xs font-bold text-red-600 capitalize">
                              {r.reason || "Guideline Violation"}
                            </div>
                            <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                              {r.description || r.details || "No additional comments provided."}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-xs text-slate-500">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A"}
                          </td>

                          <td className="px-5 py-4">
                            {isResolved ? (
                              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                Resolved
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                                Pending
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!isResolved && (
                                <button
                                  onClick={() => handleResolveReport(reportId)}
                                  disabled={actionLoading === `report-${reportId}`}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
                                </button>
                              )}
                              {reportedId && (
                                <button
                                  onClick={() => setBlockDialog({ show: true, profileId: reportedId, name: reportedPerson.name || "Reported User", reason: r.reason || "User report" })}
                                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                                >
                                  <Ban className="w-3.5 h-3.5" /> Block
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {reportsLoading && (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto" />
                  <p className="mt-4 text-sm text-slate-400">Loading reports…</p>
                </div>
              )}

              {!reportsLoading && reports.length === 0 && (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 mb-3">
                    <ShieldCheck className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">No active reports</h3>
                  <p className="text-xs text-slate-400 mt-1">All profile reports have been reviewed and resolved</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PROFILE DETAILS MODAL ───────────────────── */}
        {showViewModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl animate-scale-up">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-700" />
                  <h2 className="text-lg font-bold text-slate-900">User Profile & Moderation Details</h2>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {detailsLoading ? (
                  <div className="py-16 text-center">
                    <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto" />
                    <p className="mt-3 text-xs text-slate-400">Fetching profile details…</p>
                  </div>
                ) : (
                  (() => {
                    const p = profileDetails || selectedProfile || {};
                    const id = p._id || p.id;
                    const name = p.name || `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Anonymous User";
                    const avatar = p.avatar || p.profileImage || p.photoUrl || p.image;
                    const isBlocked = Boolean(p.is_blocked || p.isBlocked || p.blocked || p.status === "blocked");
                    const isApproved = Boolean(p.is_approved || p.status === "approved");
                    const isRejected = p.status === "rejected";
                    const isPending = p.status === "pending" || (!p.status && !isApproved);
                    const isVerified = Boolean(p.is_verified || p.isVerified || p.verified);
                    const isFeatured = Boolean(p.is_featured || p.isFeatured || p.featured);
                    const isPublished = !(p.isPublished === false || p.published === false);

                    return (
                      <div className="space-y-6">
                        {/* Hero Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={name}
                              className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-2xl border-2 border-white shadow-md">
                              {name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-xl font-bold text-slate-900">{name}</h3>
                              {isVerified && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-md flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                                </span>
                              )}
                              {isFeatured && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-md flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 fill-amber-500" /> Featured
                                </span>
                              )}
                              {isBlocked && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-md flex items-center gap-1">
                                  <Ban className="w-3.5 h-3.5" /> Blocked
                                </span>
                              )}
                              {!isBlocked && isApproved && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-md flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5" /> Approved
                                </span>
                              )}
                              {!isBlocked && isRejected && (
                                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-semibold rounded-md flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5" /> Rejected
                                </span>
                              )}
                              {!isBlocked && isPending && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-md flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" /> Pending Approval
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-slate-600">{p.occupation || p.headline || p.profession || "No headline"}</p>
                            <p className="text-xs text-slate-400 mt-1">Profile ID: {id}</p>
                          </div>
                        </div>

                        {/* Rejection / Blocking Notice */}
                        {p.rejection_reason && (
                          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                            isBlocked ? "bg-red-50 border-red-200 text-red-800" : "bg-rose-50 border-rose-200 text-rose-800"
                          }`}>
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-xs uppercase tracking-wide">
                                {isBlocked ? "Blocking Reason" : "Rejection Reason"}
                              </p>
                              <p className="text-sm mt-0.5">{p.rejection_reason}</p>
                            </div>
                          </div>
                        )}

                        {/* Bio Section */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About / Bio</h4>
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                            {p.bio || p.about || p.description || "No biography provided by this user."}
                          </div>
                        </div>

                        {/* Contact & Location Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Details</h4>
                            <div className="space-y-2 text-xs text-slate-700">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="font-semibold text-slate-500 w-16">Email:</span>
                                <span>{p.email || "N/A"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="font-semibold text-slate-500 w-16">Phone:</span>
                                <span>{p.phone || p.phoneNumber || "N/A"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="font-semibold text-slate-500 w-16">Website:</span>
                                <span>{p.website || p.socialLink || "N/A"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location & Meta</h4>
                            <div className="space-y-2 text-xs text-slate-700">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="font-semibold text-slate-500 w-16">Location:</span>
                                <span>{p.city || p.location?.city || "N/A"}, {p.country || p.location?.country || ""}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="font-semibold text-slate-500 w-16">Joined:</span>
                                <span>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="font-semibold text-slate-500 w-16">Public:</span>
                                <span className={isPublished ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                                  {isPublished ? "Publicly Visible" : "Unpublished / Hidden"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Skills / Interests / Topics */}
                        {(p.skills?.length > 0 || p.interests?.length > 0 || p.tags?.length > 0) && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Skills & Interests</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {(p.skills || p.interests || p.tags || []).map((item, idx) => (
                                <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                                  {typeof item === "string" ? item : item.name || JSON.stringify(item)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Admin Action Buttons in Modal */}
                        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Approve */}
                            {(!isApproved || isRejected) && !isBlocked && (
                              <button
                                onClick={() => handleApprove(id)}
                                disabled={actionLoading === `${id}-approve`}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" /> Approve Profile
                              </button>
                            )}

                            {/* Reject */}
                            {!isRejected && !isBlocked && (
                              <button
                                onClick={() => setRejectDialog({ show: true, profileId: id, name, reason: "" })}
                                disabled={actionLoading === `${id}-reject`}
                                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject Profile
                              </button>
                            )}

                            {/* Block / Unblock */}
                            {isBlocked ? (
                              <button
                                onClick={() => handleUnblock(id)}
                                disabled={actionLoading === `${id}-unblock`}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                              >
                                <UserCheck className="w-3.5 h-3.5" /> Unblock Profile
                              </button>
                            ) : (
                              <button
                                onClick={() => setBlockDialog({ show: true, profileId: id, name, reason: "" })}
                                disabled={actionLoading === `${id}-block`}
                                className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                              >
                                <Ban className="w-3.5 h-3.5" /> Block Profile
                              </button>
                            )}

                            {/* Feature */}
                            <button
                              onClick={() => handleFeatureToggle(id, isFeatured)}
                              disabled={actionLoading === `${id}-feature`}
                              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                            >
                              <Star className="w-3.5 h-3.5" /> {isFeatured ? "Unfeature" : "Feature Profile"}
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setDeleteDialog({ show: true, profileId: id, name })}
                              className="px-3.5 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                            <button
                              onClick={() => setShowViewModal(false)}
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── REJECT MODERATION MODAL ───────────────────── */}
        {rejectDialog.show && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-up">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Reject Profile</h3>
                  <p className="text-xs text-slate-500">Rejecting {rejectDialog.name}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Select Rejection Reason</label>
                <div className="flex flex-wrap gap-1.5">
                  {REJECTION_REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRejectDialog(prev => ({ ...prev, reason: r }))}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        rejectDialog.reason === r
                          ? "bg-rose-600 text-white border-rose-600 font-semibold"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Or enter custom rejection reason..."
                  value={rejectDialog.reason}
                  onChange={(e) => setRejectDialog(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-rose-400 h-24 mt-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setRejectDialog({ show: false, profileId: null, name: "", reason: "" })}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={actionLoading === `${rejectDialog.profileId}-reject`}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── BLOCK MODERATION MODAL ───────────────────── */}
        {blockDialog.show && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-up">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Block User Profile</h3>
                  <p className="text-xs text-slate-500">Blocking {blockDialog.name}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Select Blocking Reason</label>
                <div className="flex flex-wrap gap-1.5">
                  {BLOCKING_REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setBlockDialog(prev => ({ ...prev, reason: r }))}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        blockDialog.reason === r
                          ? "bg-red-600 text-white border-red-600 font-semibold"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Or enter custom blocking reason..."
                  value={blockDialog.reason}
                  onChange={(e) => setBlockDialog(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-red-400 h-24 mt-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setBlockDialog({ show: false, profileId: null, name: "", reason: "" })}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockConfirm}
                  disabled={actionLoading === `${blockDialog.profileId}-block`}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Confirm Block
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRMATION MODAL ───────────────── */}
        {deleteDialog.show && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-up">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Delete Profile?</h3>
                  <p className="text-xs text-slate-500">Permanently delete {deleteDialog.name}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                This will permanently delete this profile from the database and clear all associated caches. This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setDeleteDialog({ show: false, profileId: null, name: "" })}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={actionLoading === `${deleteDialog.profileId}-delete`}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default People;
