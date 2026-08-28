import React, { useEffect, useState, useCallback } from "react";
import {
  Home,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Users,
  Search,
  RefreshCw,
  Eye,
  AlertTriangle,
  FileText,
  Mail,
  Phone,
  X,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Building,
  Check,
  Ban
} from "lucide-react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://api.nextkinlife.live";

const PostStayRequests = () => {
  const [activeTab, setActiveTab] = useState("pending"); // "pending" | "reports"
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectModalId, setRejectModalId] = useState(null);

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

  /* ═══════ FETCH PENDING STAY REQUESTS ═══════ */
  const fetchPendingRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/admin/stay-request/pending`, getHeaders());
      const data = res.data?.requests || res.data?.data || res.data?.stayRequests || res.data || [];
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch stay requests error:", err);
      showToast(err.response?.data?.message || "Failed to load stay requests", "error");
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  /* ═══════ FETCH STATISTICS ═══════ */
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await axios.get(`${BASE_URL}/admin/stay-request/statistics`, getHeaders());
      setStats(res.data?.stats || res.data?.data || res.data?.statistics || res.data || null);
    } catch (err) {
      console.error("Fetch stay request stats error:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [getHeaders]);

  /* ═══════ FETCH REPORTS ═══════ */
  const fetchReports = useCallback(async () => {
    try {
      setReportsLoading(true);
      const res = await axios.get(`${BASE_URL}/admin/stay-request/reports`, getHeaders());
      const data = res.data?.reports || res.data?.data || res.data || [];
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch stay request reports error:", err);
    } finally {
      setReportsLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchPendingRequests();
    fetchStats();
    fetchReports();
  }, [fetchPendingRequests, fetchStats, fetchReports]);

  /* ═══════ APPROVE STAY REQUEST ═══════ */
  const handleApprove = async (id) => {
    try {
      setActionLoading(`approve-${id}`);
      await axios.put(`${BASE_URL}/admin/stay-request/approve/${id}`, {}, getHeaders());
      showToast("Stay request approved successfully", "success");
      fetchPendingRequests();
      fetchStats();
      if (showModal && selectedRequest?._id === id) {
        setShowModal(false);
      }
    } catch (err) {
      console.error("Approve error:", err);
      showToast(err.response?.data?.message || "Failed to approve request", "error");
    } finally {
      setActionLoading(null);
    }
  };

  /* ═══════ REJECT STAY REQUEST ═══════ */
  const handleReject = async (id) => {
    try {
      setActionLoading(`reject-${id}`);
      await axios.put(
        `${BASE_URL}/admin/stay-request/reject/${id}`,
        { reason: rejectReason || "Request does not meet quality/policy guidelines" },
        getHeaders()
      );
      showToast("Stay request rejected", "success");
      setRejectModalId(null);
      setRejectReason("");
      fetchPendingRequests();
      fetchStats();
      if (showModal && selectedRequest?._id === id) {
        setShowModal(false);
      }
    } catch (err) {
      console.error("Reject error:", err);
      showToast(err.response?.data?.message || "Failed to reject request", "error");
    } finally {
      setActionLoading(null);
    }
  };

  /* ═══════ STAT CARDS DATA ═══════ */
  const pendingCount = stats?.pendingRequests ?? stats?.pending ?? requests.length;
  const approvedCount = stats?.approvedRequests ?? stats?.approved ?? 0;
  const rejectedCount = stats?.rejectedRequests ?? stats?.rejected ?? 0;
  const totalCount = stats?.totalRequests ?? stats?.total ?? (pendingCount + approvedCount + rejectedCount);
  const reportsCount = reports.length;

  const statCards = [
    { label: "Pending Approvals", value: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "from-amber-500 to-orange-500" },
    { label: "Approved Requests", value: approvedCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "from-emerald-500 to-teal-500" },
    { label: "Rejected Requests", value: rejectedCount, icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "from-red-500 to-rose-500" },
    { label: "Total Requests", value: totalCount, icon: Home, color: "text-blue-600", bg: "bg-blue-50", border: "from-blue-500 to-indigo-500" },
    { label: "Reports & Flags", value: reportsCount, icon: ShieldAlert, color: "text-purple-600", bg: "bg-purple-50", border: "from-purple-500 to-violet-500" },
  ];

  /* ═══════ FILTERING ═══════ */
  const filteredRequests = requests.filter((r) => {
    const title = (r.title || r.location || "").toLowerCase();
    const city = (r.city || r.destinationCity || r.location?.city || "").toLowerCase();
    const country = (r.country || r.destinationCountry || r.location?.country || "").toLowerCase();
    const userName = (r.userName || r.user?.name || `${r.user?.firstName || ""} ${r.user?.lastName || ""}`).toLowerCase();
    const desc = (r.description || r.stayDescription || "").toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = title.includes(query) || city.includes(query) || country.includes(query) || userName.includes(query) || desc.includes(query);

    if (!matchesSearch) return false;
    if (typeFilter !== "all") {
      const stayType = (r.stayType || r.accommodationType || r.roomType || "").toLowerCase();
      return stayType.includes(typeFilter.toLowerCase());
    }

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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Post Stay Requests</h1>
            <p className="text-sm text-slate-400 mt-1">Review, approve, and moderate user accommodation stay requests</p>
          </div>
          <button
            onClick={() => {
              fetchPendingRequests();
              fetchStats();
              fetchReports();
            }}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading || statsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* ── STAT CARDS ──────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "pending"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            Pending Approval ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "reports"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-purple-500" />
            Stay Request Reports ({reports.length})
          </button>
        </div>

        {/* ── TAB CONTENT: PENDING REQUESTS ────────────── */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            {/* SEARCH & FILTERS */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by city, country, user name, description..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { key: "all", label: `All Requests (${requests.length})` },
                  { key: "apartment", label: "Apartment" },
                  { key: "villa", label: "Villa / House" },
                  { key: "room", label: "Private Room" },
                  { key: "studio", label: "Studio" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setTypeFilter(f.key)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      typeFilter === f.key
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* REQUESTS LIST / TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Stay Request</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Target Location</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Requested By</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Dates & Budget</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Guests / Type</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {!loading && filteredRequests.map((r) => {
                      const id = r._id || r.id;
                      const user = r.user || r.userId || {};
                      const userName = r.userName || user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
                      const locationStr = r.city || r.destinationCity ? `${r.city || r.destinationCity}, ${r.country || r.destinationCountry || ""}` : (r.location || "Location not specified");
                      const budget = r.budget || r.maxBudget || r.priceRange || r.estimatedBudget;
                      const checkIn = r.checkInDate || r.startDate || r.from;
                      const checkOut = r.checkOutDate || r.endDate || r.to;
                      const stayType = r.stayType || r.accommodationType || r.propertyType || "Any Accommodation";

                      return (
                        <tr key={id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-4 max-w-xs">
                            <div className="font-semibold text-slate-900 text-sm truncate">
                              {r.title || `Stay in ${r.city || "Destination"}`}
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                              {r.description || r.notes || "No details provided"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{locationStr}</span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-xs font-semibold text-slate-800">{userName}</div>
                            <div className="text-xs text-slate-400 truncate">{user.email || r.userEmail || "No email"}</div>
                          </td>

                          <td className="px-5 py-4 text-xs text-slate-600">
                            <div className="flex items-center gap-1 font-semibold text-slate-800">
                              <DollarSign className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{budget ? `${budget} ${r.currency || "USD"}` : "Flexible"}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>
                                {checkIn ? new Date(checkIn).toLocaleDateString() : "Flexible dates"}
                                {checkOut ? ` - ${new Date(checkOut).toLocaleDateString()}` : ""}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                {stayType}
                              </span>
                              {(r.guests || r.numberOfGuests || r.adults) && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                  {r.guests || r.numberOfGuests || r.adults} Guests
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Details */}
                              <button
                                onClick={() => {
                                  setSelectedRequest(r);
                                  setShowModal(true);
                                }}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                title="View Stay Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Approve Button */}
                              <button
                                onClick={() => handleApprove(id)}
                                disabled={actionLoading === `approve-${id}`}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 shadow-sm disabled:opacity-50"
                                title="Approve Stay Request"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve
                              </button>

                              {/* Reject Button */}
                              <button
                                onClick={() => {
                                  setRejectModalId(id);
                                  setRejectReason("");
                                }}
                                disabled={actionLoading === `reject-${id}`}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                                title="Reject Stay Request"
                              >
                                <Ban className="w-3.5 h-3.5" /> Reject
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
                  <p className="mt-4 text-sm text-slate-400">Loading pending requests…</p>
                </div>
              )}

              {!loading && filteredRequests.length === 0 && (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 mb-3">
                    <CheckCircle className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">No pending stay requests</h3>
                  <p className="text-xs text-slate-400 mt-1">All user stay requests have been reviewed</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: REPORTS ─────────────────────── */}
        {activeTab === "reports" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Stay Request Reports</h3>
                <p className="text-xs text-slate-400 mt-0.5">Reported stay requests, spam postings, or guideline violations</p>
              </div>
              <button
                onClick={fetchReports}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 text-slate-700"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${reportsLoading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/30">
                    <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Stay Request</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reported By</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {!reportsLoading && reports.map((r) => {
                    const reqId = r.stayRequestId || r.targetRequestId || r._id;
                    return (
                      <tr key={r._id || r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900 text-sm">
                            {r.requestTitle || `Request #${(reqId || "").slice?.(0, 8)}`}
                          </div>
                          <div className="text-xs text-slate-400">ID: {(reqId || "").slice?.(0, 12)}</div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-xs font-medium text-slate-700">{r.reporterName || r.reporter?.name || "User"}</div>
                          <div className="text-xs text-slate-400">{r.reporterEmail || r.reporter?.email || ""}</div>
                        </td>

                        <td className="px-5 py-4 max-w-xs">
                          <div className="text-xs font-bold text-red-600 capitalize">{r.reason || "Suspicious Listing"}</div>
                          <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">{r.description || r.details || "No comments"}</div>
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-500">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A"}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {reqId && (
                              <button
                                onClick={() => {
                                  setRejectModalId(reqId);
                                  setRejectReason(`Reported for: ${r.reason || "Policy Violation"}`);
                                }}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors"
                              >
                                Reject Request
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
                  <ShieldAlert className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">No active stay request reports</h3>
                <p className="text-xs text-slate-400 mt-1">No reported stay requests found</p>
              </div>
            )}
          </div>
        )}

        {/* ── STAY REQUEST DETAIL MODAL ────────────────── */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl animate-scale-up">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-slate-700" />
                  <h2 className="text-lg font-bold text-slate-900">Stay Request Details</h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {(() => {
                  const r = selectedRequest;
                  const id = r._id || r.id;
                  const user = r.user || r.userId || {};
                  const userName = r.userName || user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Anonymous User";
                  const checkIn = r.checkInDate || r.startDate || r.from;
                  const checkOut = r.checkOutDate || r.endDate || r.to;

                  return (
                    <>
                      {/* Header */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">{r.title || `Accommodation in ${r.city || "Destination"}`}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {r.city || r.destinationCity || ""}, {r.country || r.destinationCountry || ""}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {checkIn ? new Date(checkIn).toLocaleDateString() : "Flexible"} - {checkOut ? new Date(checkOut).toLocaleDateString() : ""}</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-600 flex items-center"><DollarSign className="w-3.5 h-3.5" /> {r.budget || "Budget flexible"}</span>
                        </div>
                      </div>

                      {/* Requester Info */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Requester Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                          <div><span className="font-semibold text-slate-500">Name:</span> {userName}</div>
                          <div><span className="font-semibold text-slate-500">Email:</span> {user.email || r.userEmail || "N/A"}</div>
                          <div><span className="font-semibold text-slate-500">Phone:</span> {user.phone || r.phone || "N/A"}</div>
                          <div><span className="font-semibold text-slate-500">User ID:</span> {(user._id || user.id || r.userId || "").slice?.(0, 10)}...</div>
                        </div>
                      </div>

                      {/* Request Description & Requirements */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description & Notes</h4>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                          {r.description || r.stayDescription || r.notes || "No special description provided."}
                        </div>
                      </div>

                      {/* Amenities or Preferences */}
                      {(r.amenities?.length > 0 || r.preferences?.length > 0 || r.tags?.length > 0) && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Preferences & Amenities</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {(r.amenities || r.preferences || r.tags || []).map((item, idx) => (
                              <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                                {typeof item === "string" ? item : item.name || JSON.stringify(item)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Modal Actions */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(id)}
                            disabled={actionLoading === `approve-${id}`}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <Check className="w-4 h-4" /> Approve Request
                          </button>
                          <button
                            onClick={() => {
                              setRejectModalId(id);
                              setRejectReason("");
                            }}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                          >
                            <Ban className="w-4 h-4" /> Reject Request
                          </button>
                        </div>
                        <button
                          onClick={() => setShowModal(false)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ── REJECTION REASON PROMPT MODAL ───────────── */}
        {rejectModalId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl p-5 space-y-4 animate-scale-up">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Reject Stay Request</h3>
                <button
                  onClick={() => setRejectModalId(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Reason for rejection (sent to user):
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Inappropriate description, invalid dates, violates community rules..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setRejectModalId(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(rejectModalId)}
                  disabled={actionLoading === `reject-${rejectModalId}`}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PostStayRequests;
