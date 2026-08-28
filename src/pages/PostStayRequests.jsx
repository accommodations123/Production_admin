import React, { useEffect, useState, useCallback } from "react";
import {
  Home,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  DollarSign,
  IndianRupee,
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
  Ban,
  BadgeCheck,
  Trash2,
  RotateCcw
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const PostStayRequests = () => {
  const [activeTab, setActiveTab] = useState("pending"); // "pending" | "approved" | "rejected" | "all" | "reports"
  const [requests, setRequests] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectModalTarget, setRejectModalTarget] = useState(null); // { id, sourceTable }

  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 4000);
  };

  /* ═══════ CURRENCY BADGE HELPER ═══════ */
  const renderCurrencyAmount = (budget, currency = "INR", iconClass = "w-3.5 h-3.5") => {
    if (!budget && budget !== 0) return <span className="text-slate-400 font-normal">Flexible</span>;
    const curr = String(currency || "INR").toUpperCase().trim();
    const formattedNum = Number(budget).toLocaleString();

    if (curr === "INR" || curr === "₹" || curr === "RS" || curr === "RUPEE" || curr === "RUPEES") {
      return (
        <span className="inline-flex items-center gap-0.5">
          <IndianRupee className={`${iconClass} text-emerald-600 shrink-0 inline`} />
          <span>{formattedNum}</span>
        </span>
      );
    }

    if (curr === "USD" || curr === "$") {
      return (
        <span className="inline-flex items-center gap-0.5">
          <DollarSign className={`${iconClass} text-emerald-600 shrink-0 inline`} />
          <span>{formattedNum}</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1">
        <span className="text-xs font-semibold text-slate-500">{curr}</span>
        <span>{formattedNum}</span>
      </span>
    );
  };

  /* ═══════ NORMALIZE STAY REQUEST ═══════ */
  const normalizeStayRequest = (r, profiles = []) => {
    const parseJson = (val) => {
      if (!val) return {};
      if (typeof val === "object") return val;
      try { return JSON.parse(val); } catch { return {}; }
    };

    const notesObj = parseJson(r.notes);

    const targetUserId = String(r.user_id || r.userId || r.created_by || r.author_id || r.user?._id || r.user?.id || "");
    const targetEmail = (r.user_email || r.userEmail || r.email || r.contact_email || r.user?.email || "").toLowerCase().trim();
    const targetName = (notesObj?.seekerName || r.user_name || r.userName || r.username || r.name || r.fullName || r.full_name || r.user?.name || "").toLowerCase().trim();

    // Match profile from profiles list
    const matchedProfile = Array.isArray(profiles) ? profiles.find(p => {
      if (!p) return false;
      const pId = String(p.id || p._id || "");
      if (targetUserId && pId && targetUserId === pId) return true;
      const pEmail = (p.email || p.user_email || "").toLowerCase().trim();
      if (targetEmail && pEmail && targetEmail === pEmail) return true;
      const pFullName = (p.full_name || `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.name || "").toLowerCase().trim();
      if (targetName && pFullName && (targetName === pFullName || (targetName.length > 3 && pFullName.includes(targetName)))) return true;
      return false;
    }) : null;

    const pVerification = parseJson(matchedProfile?.verification);
    const pMeta = parseJson(matchedProfile?.metadata || matchedProfile?.meta || matchedProfile?.raw_user_meta_data);

    const userName =
      notesObj?.seekerName ||
      matchedProfile?.full_name ||
      `${matchedProfile?.firstName || ""} ${matchedProfile?.lastName || ""}`.trim() ||
      matchedProfile?.name ||
      matchedProfile?.displayName ||
      pVerification?.full_name ||
      pMeta?.full_name ||
      pMeta?.name ||
      r.user_name ||
      r.userName ||
      r.username ||
      r.name ||
      r.fullName ||
      r.full_name ||
      r.user?.name ||
      (targetEmail ? targetEmail.split("@")[0] : "Anonymous User");

    const userEmail =
      matchedProfile?.email ||
      matchedProfile?.user_email ||
      pMeta?.email ||
      r.user_email ||
      r.userEmail ||
      r.email ||
      r.contact_email ||
      r.user?.email ||
      "";

    const userPhone =
      notesObj?.whatsapp ||
      matchedProfile?.phone ||
      matchedProfile?.phone_number ||
      matchedProfile?.phoneNumber ||
      matchedProfile?.mobile ||
      pVerification?.phone ||
      r.user_phone ||
      r.userPhone ||
      r.phone ||
      r.contact_phone ||
      r.user?.phone ||
      "";

    const userAvatar =
      matchedProfile?.avatar_url ||
      matchedProfile?.avatar ||
      matchedProfile?.profile_picture ||
      matchedProfile?.image ||
      r.user_avatar ||
      r.userAvatar ||
      r.user?.avatar ||
      null;

    const rawStatus = String(r.status || (r.is_approved ? "approved" : "pending")).toLowerCase();
    const status = rawStatus === "active" || rawStatus === "open" || rawStatus === "submitted" || rawStatus === "draft" ? "pending" : rawStatus;

    const checkIn = r.check_in || r.checkIn || r.check_in_date || r.checkInDate || r.start_date || r.startDate || r.from_date || r.fromDate || r.from || null;
    const checkOut = r.check_out || r.checkOut || r.check_out_date || r.checkOutDate || r.end_date || r.endDate || r.to_date || r.toDate || r.to || null;
    const city = r.city || r.destination_city || r.destinationCity || r.target_city || r.location_city || "";
    const country = r.country || r.destination_country || r.destinationCountry || r.target_country || r.location_country || "";
    const stayType = r.stay_type || r.stayType || r.accommodation_type || r.accommodationType || r.room_type || r.roomType || r.property_type || r.propertyType || r.type || "Any Accommodation";
    const budget = r.budget || r.max_budget || r.maxBudget || r.price || r.price_range || r.priceRange || r.estimated_budget || r.estimatedBudget || null;

    const rawId = r.id || r._id || r.request_id || null;
    const _id = rawId != null ? String(rawId) : Math.random().toString(36).slice(2, 9);

    return {
      ...r,
      _id,
      id: rawId || _id,
      title: r.title || r.post_title || r.stay_title || (city ? `Stay in ${city}` : "Accommodation Request"),
      city,
      country,
      description: r.description || r.stay_description || r.stayDescription || (typeof r.notes === "string" && !r.notes.startsWith("{") ? r.notes : "") || "",
      notesObj,
      stayType,
      budget,
      currency: r.currency || r.currency_code || "INR",
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests: r.guests || r.guest_count || r.guestCount || r.numberOfGuests || r.number_of_guests || r.adults || 1,
      status,
      is_approved: status === "approved" || r.is_approved === true,
      rejectionReason: r.rejection_reason || r.rejectionReason || null,
      userName,
      userEmail,
      userPhone,
      userAvatar,
      user: {
        id: matchedProfile?.id || targetUserId,
        name: userName,
        email: userEmail,
        phone: userPhone,
        avatar: userAvatar,
        isVerified: Boolean(matchedProfile?.is_verified || matchedProfile?.is_approved),
      },
      createdAt: r.created_at || r.createdAt || new Date().toISOString(),
      _sourceTable: r._sourceTable || "stay_requests",
    };
  };

  /* ═══════ FETCH STAY REQUESTS VIA SUPABASE ═══════ */
  const fetchAllRequests = useCallback(async () => {
    try {
      setLoading(true);

      // Candidate table names that may store stay requests in Supabase
      const candidateTables = [
        "stay_requests",
        "post_stay_requests",
        "stay_posts",
        "accommodation_requests",
        "custom_stay_requests"
      ];

      const [profilesRes, ...tablesRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        ...candidateTables.map(tbl =>
          supabase.from(tbl).select("*").order("created_at", { ascending: false })
        )
      ]);

      const profilesList = Array.isArray(profilesRes.data) ? profilesRes.data : [];

      let mergedRaw = [];
      candidateTables.forEach((tbl, idx) => {
        const res = tablesRes[idx];
        if (res && Array.isArray(res.data) && res.data.length > 0) {
          res.data.forEach(item => {
            mergedRaw.push({ ...item, _sourceTable: tbl });
          });
        }
      });

      // Deduplicate by ID
      const seenIds = new Set();
      const uniqueRaw = mergedRaw.filter(item => {
        const itemId = String(item.id || item._id || item.request_id || Math.random());
        if (seenIds.has(itemId)) return false;
        seenIds.add(itemId);
        return true;
      });

      const formatted = uniqueRaw.map(r => normalizeStayRequest(r, profilesList));
      setRequests(formatted);

    } catch (err) {
      console.error("Fetch stay requests error:", err);
      showToast(err.message || "Failed to load stay requests", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ═══════ FETCH REPORTS ═══════ */
  const fetchReports = useCallback(async () => {
    try {
      setReportsLoading(true);
      const { data, error: fetchErr } = await supabase
        .from("stay_request_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchErr) {
        setReports([]);
      } else {
        setReports(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Fetch stay request reports error:", err);
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllRequests();
    fetchReports();
  }, [fetchAllRequests, fetchReports]);

  /* ═══════ APPROVE STAY REQUEST ═══════ */
  const handleApprove = async (id, sourceTable = "stay_requests") => {
    try {
      setActionLoading(`approve-${id}`);
      const targetTable = sourceTable || "stay_requests";
      const { error } = await supabase
        .from(targetTable)
        .update({ status: "approved", is_approved: true, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      showToast("Stay request approved successfully", "success");
      setRequests(prev => prev.map(r => (r._id === String(id) || r.id === id) ? { ...r, status: "approved", is_approved: true } : r));
      if (showModal && (selectedRequest?._id === String(id) || selectedRequest?.id === id)) {
        setShowModal(false);
      }
    } catch (err) {
      console.error("Approve error:", err);
      showToast(err.message || "Failed to approve request", "error");
    } finally {
      setActionLoading(null);
    }
  };

  /* ═══════ REVERT TO PENDING ═══════ */
  const handleSetPending = async (id, sourceTable = "stay_requests") => {
    try {
      setActionLoading(`pending-${id}`);
      const targetTable = sourceTable || "stay_requests";
      const { error } = await supabase
        .from(targetTable)
        .update({ status: "pending", is_approved: false, rejection_reason: null, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      showToast("Stay request marked as Pending", "success");
      setRequests(prev => prev.map(r => (r._id === String(id) || r.id === id) ? { ...r, status: "pending", is_approved: false, rejectionReason: null } : r));
      if (showModal && (selectedRequest?._id === String(id) || selectedRequest?.id === id)) {
        setShowModal(false);
      }
    } catch (err) {
      console.error("Set pending error:", err);
      showToast(err.message || "Failed to update status", "error");
    } finally {
      setActionLoading(null);
    }
  };

  /* ═══════ REJECT STAY REQUEST ═══════ */
  const handleReject = async (id, sourceTable = "stay_requests") => {
    try {
      setActionLoading(`reject-${id}`);
      const targetTable = sourceTable || "stay_requests";
      const reason = rejectReason.trim() || "Request does not meet quality/policy guidelines";

      const { error } = await supabase
        .from(targetTable)
        .update({
          status: "rejected",
          is_approved: false,
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      showToast("Stay request rejected", "success");
      setRequests(prev => prev.map(r => (r._id === String(id) || r.id === id) ? { ...r, status: "rejected", is_approved: false, rejectionReason: reason } : r));
      setRejectModalTarget(null);
      setRejectReason("");
      if (showModal && (selectedRequest?._id === String(id) || selectedRequest?.id === id)) {
        setShowModal(false);
      }
    } catch (err) {
      console.error("Reject error:", err);
      showToast(err.message || "Failed to reject request", "error");
    } finally {
      setActionLoading(null);
    }
  };

  /* ═══════ DELETE STAY REQUEST ═══════ */
  const handleDelete = async (id, sourceTable = "stay_requests") => {
    if (!window.confirm("Are you sure you want to permanently delete this stay request?")) return;
    try {
      setActionLoading(`delete-${id}`);
      const targetTable = sourceTable || "stay_requests";
      const { error } = await supabase
        .from(targetTable)
        .delete()
        .eq("id", id);

      if (error) throw error;

      showToast("Stay request deleted", "success");
      setRequests(prev => prev.filter(r => r._id !== String(id) && r.id !== id));
      if (showModal && (selectedRequest?._id === String(id) || selectedRequest?.id === id)) {
        setShowModal(false);
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast(err.message || "Failed to delete request", "error");
    } finally {
      setActionLoading(null);
    }
  };

  /* ═══════ COUNTS & STATS ═══════ */
  const pendingCount = requests.filter(r => r.status === "pending" || !r.status).length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;
  const totalCount = requests.length;
  const reportsCount = reports.length;

  const statCards = [
    { label: "Pending Approvals", value: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "from-amber-500 to-orange-500" },
    { label: "Approved Requests", value: approvedCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "from-emerald-500 to-teal-500" },
    { label: "Rejected Requests", value: rejectedCount, icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "from-red-500 to-rose-500" },
    { label: "Total Requests", value: totalCount, icon: Home, color: "text-blue-600", bg: "bg-blue-50", border: "from-blue-500 to-indigo-500" },
    { label: "Reports & Flags", value: reportsCount, icon: ShieldAlert, color: "text-purple-600", bg: "bg-purple-50", border: "from-purple-500 to-violet-500" },
  ];

  /* ═══════ FILTERING REQUESTS ═══════ */
  const filteredRequests = requests.filter((r) => {
    if (activeTab === "pending" && r.status !== "pending") return false;
    if (activeTab === "approved" && r.status !== "approved") return false;
    if (activeTab === "rejected" && r.status !== "rejected") return false;
    // if activeTab === "all", show everything

    const title = (r.title || "").toLowerCase();
    const city = (r.city || "").toLowerCase();
    const country = (r.country || "").toLowerCase();
    const userName = (r.userName || "").toLowerCase();
    const userEmail = (r.userEmail || "").toLowerCase();
    const desc = (r.description || "").toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = title.includes(query) || city.includes(query) || country.includes(query) || userName.includes(query) || userEmail.includes(query) || desc.includes(query);

    if (!matchesSearch) return false;
    if (typeFilter !== "all") {
      const stayType = (r.stayType || "").toLowerCase();
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
              fetchAllRequests();
              fetchReports();
            }}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "pending"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            Pending Approval ({pendingCount})
          </button>

          <button
            onClick={() => setActiveTab("approved")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "approved"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Approved ({approvedCount})
          </button>

          <button
            onClick={() => setActiveTab("rejected")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "rejected"
                ? "border-rose-600 text-rose-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <XCircle className="w-4 h-4 text-rose-500" />
            Rejected ({rejectedCount})
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "all"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Home className="w-4 h-4 text-blue-500" />
            All Requests ({totalCount})
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "reports"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-purple-500" />
            Stay Request Reports ({reportsCount})
          </button>
        </div>

        {/* ── TAB CONTENT: REQUESTS LIST ────────────── */}
        {activeTab !== "reports" && (
          <div className="space-y-4">
            {/* SEARCH & FILTERS */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by destination, city, country, requester name, email, description..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { key: "all", label: `All Types (${requests.length})` },
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
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status / Type</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {!loading && filteredRequests.map((r) => {
                      const id = r.id || r._id;
                      const locationStr = r.city || r.country ? `${r.city || ""}${r.city && r.country ? ", " : ""}${r.country || ""}` : (r.location || "Location not specified");

                      return (
                        <tr key={r._id || id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-4 max-w-xs">
                            <div className="font-semibold text-slate-900 text-sm truncate">
                              {r.title}
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                              {r.description || "No details provided"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{locationStr}</span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {r.userName?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-slate-800 truncate flex items-center gap-1">
                                  {r.userName}
                                  {r.user?.isVerified && (
                                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-500 inline shrink-0" />
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">{r.userEmail || "No email"}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-xs text-slate-600">
                            <div className="font-semibold text-slate-900">
                              {renderCurrencyAmount(r.budget, r.currency, "w-3.5 h-3.5")}
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>
                                {r.checkInDate ? new Date(r.checkInDate).toLocaleDateString() : "Flexible dates"}
                                {r.checkOutDate ? ` - ${new Date(r.checkOutDate).toLocaleDateString()}` : ""}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1 items-center">
                              {r.status === "pending" && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                  Pending
                                </span>
                              )}
                              {r.status === "approved" && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Approved
                                </span>
                              )}
                              {r.status === "rejected" && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                  Rejected
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                {r.stayType}
                              </span>
                              {r.guests && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                  {r.guests} Guests
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
                              {r.status !== "approved" && (
                                <button
                                  onClick={() => handleApprove(id, r._sourceTable)}
                                  disabled={actionLoading === `approve-${id}`}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 shadow-sm disabled:opacity-50"
                                  title="Approve Stay Request"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve
                                </button>
                              )}

                              {/* Revert to Pending Button */}
                              {r.status !== "pending" && (
                                <button
                                  onClick={() => handleSetPending(id, r._sourceTable)}
                                  disabled={actionLoading === `pending-${id}`}
                                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                                  title="Move to Pending"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" /> Pending
                                </button>
                              )}

                              {/* Reject Button */}
                              {r.status !== "rejected" && (
                                <button
                                  onClick={() => {
                                    setRejectModalTarget({ id, sourceTable: r._sourceTable });
                                    setRejectReason("");
                                  }}
                                  disabled={actionLoading === `reject-${id}`}
                                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                                  title="Reject Stay Request"
                                >
                                  <Ban className="w-3.5 h-3.5" /> Reject
                                </button>
                              )}

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDelete(id, r._sourceTable)}
                                disabled={actionLoading === `delete-${id}`}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Stay Request"
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
                  <p className="mt-4 text-sm text-slate-400">Loading stay requests…</p>
                </div>
              )}

              {!loading && filteredRequests.length === 0 && (
                <div className="p-12 text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 mb-1">
                    <Home className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-800">No {activeTab} stay requests found</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {activeTab === "pending"
                      ? "There are no stay requests currently pending review."
                      : `No stay requests match the "${activeTab}" filter or search query.`}
                  </p>
                  {requests.length === 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] text-slate-400">
                        Tip: Check that requests are submitted to the <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">stay_requests</code> table in Supabase.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: REPORTS ─────────────────────── */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Stay Request Reports</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Reported stay requests, spam postings, or guideline violations</p>
                </div>
                <button
                  onClick={fetchReports}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
                  title="Refresh reports"
                >
                  <RefreshCw className={`w-4 h-4 ${reportsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {reports.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reported Request</th>
                        <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reporter</th>
                        <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                        <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reports.map((rep) => {
                        const reqId = rep.stayRequestId || rep.targetRequestId || rep.target_id || rep._id;
                        return (
                          <tr key={rep._id || rep.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-5 py-4">
                              <div className="font-semibold text-slate-900 text-sm">{rep.stayTitle || `Request #${String(reqId).slice(0, 8)}`}</div>
                              <div className="text-xs text-slate-400">ID: {reqId}</div>
                            </td>
                            <td className="px-5 py-4 text-xs text-slate-700">
                              <div className="font-semibold">{rep.reporterName || "Anonymous"}</div>
                              <div className="text-slate-400">{rep.reporterEmail || "No email"}</div>
                            </td>
                            <td className="px-5 py-4 text-xs text-slate-600 max-w-xs truncate">
                              {rep.reason || rep.reportReason || "Violation of guidelines"}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                rep.resolved
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}>
                                {rep.resolved ? "Resolved" : "Pending Review"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                onClick={() => {
                                  const matchedReq = requests.find(r => r._id === String(reqId) || r.id === reqId);
                                  if (matchedReq) {
                                    setSelectedRequest(matchedReq);
                                    setShowModal(true);
                                  } else {
                                    showToast("Corresponding request details not found in active list", "error");
                                  }
                                }}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" /> View Request
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 mb-3">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">No active stay request reports</h3>
                  <p className="text-xs text-slate-400 mt-1">No reported stay requests found</p>
                </div>
              )}
            </div>
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
                  const id = r.id || r._id;
                  const locationStr = r.city || r.country ? `${r.city || ""}${r.city && r.country ? ", " : ""}${r.country || ""}` : "Location not specified";

                  return (
                    <>
                      {/* Header */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-slate-900">{r.title}</h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                            r.status === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                            r.status === "rejected" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                            "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {r.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {locationStr}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {r.checkInDate ? new Date(r.checkInDate).toLocaleDateString() : "Flexible dates"}
                            {r.checkOutDate ? ` - ${new Date(r.checkOutDate).toLocaleDateString()}` : ""}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-600 flex items-center">
                            {renderCurrencyAmount(r.budget, r.currency, "w-4 h-4")}
                          </span>
                        </div>
                      </div>

                      {/* Requester Info */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Requester Information</h4>
                          {r.user?.isVerified && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified User
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                          <div><span className="font-semibold text-slate-500">Name:</span> {r.userName}</div>
                          <div><span className="font-semibold text-slate-500">Email:</span> {r.userEmail || "N/A"}</div>
                          <div><span className="font-semibold text-slate-500">Phone:</span> {r.userPhone || "N/A"}</div>
                          <div><span className="font-semibold text-slate-500">Stay Type:</span> {r.stayType}</div>
                          <div><span className="font-semibold text-slate-500">Guests:</span> {r.guests} Guest(s)</div>
                          <div><span className="font-semibold text-slate-500">Source Table:</span> <code className="bg-white px-1 py-0.5 rounded text-slate-700 border">{r._sourceTable}</code></div>
                        </div>
                      </div>

                      {/* Additional Details & Notes */}
                      {r.notesObj && Object.keys(r.notesObj).length > 0 && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seeker Preferences & Details</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                            {r.notesObj.state && <div><span className="font-semibold text-slate-500">State:</span> {r.notesObj.state}</div>}
                            {r.notesObj.furnishing && <div><span className="font-semibold text-slate-500">Furnishing:</span> {r.notesObj.furnishing}</div>}
                            {r.notesObj.whatsapp && <div><span className="font-semibold text-slate-500">WhatsApp:</span> {r.notesObj.whatsapp}</div>}
                            {r.notesObj.linkedin && <div><span className="font-semibold text-slate-500">LinkedIn:</span> {r.notesObj.linkedin}</div>}
                            {r.notesObj.instagram && <div><span className="font-semibold text-slate-500">Instagram:</span> {r.notesObj.instagram}</div>}
                          </div>
                        </div>
                      )}

                      {/* Description & Notes */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description & Notes</h4>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                          {r.description || "No special description provided."}
                        </div>
                      </div>

                      {/* Rejection reason if rejected */}
                      {r.rejectionReason && (
                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-xs text-rose-800">
                          <span className="font-bold block mb-1">Rejection Reason:</span>
                          {r.rejectionReason}
                        </div>
                      )}

                      {/* Modal Actions */}
                      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {r.status !== "approved" && (
                            <button
                              onClick={() => handleApprove(id, r._sourceTable)}
                              disabled={actionLoading === `approve-${id}`}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" /> Approve Request
                            </button>
                          )}
                          {r.status !== "pending" && (
                            <button
                              onClick={() => handleSetPending(id, r._sourceTable)}
                              disabled={actionLoading === `pending-${id}`}
                              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                            >
                              <RotateCcw className="w-4 h-4" /> Move to Pending
                            </button>
                          )}
                          {r.status !== "rejected" && (
                            <button
                              onClick={() => {
                                setRejectModalTarget({ id, sourceTable: r._sourceTable });
                                setRejectReason("");
                              }}
                              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                            >
                              <Ban className="w-4 h-4" /> Reject Request
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(id, r._sourceTable)}
                            disabled={actionLoading === `delete-${id}`}
                            className="px-3 py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors"
                          >
                            Delete
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
        {rejectModalTarget && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl p-5 space-y-4 animate-scale-up">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Reject Stay Request</h3>
                <button
                  onClick={() => setRejectModalTarget(null)}
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
                  onClick={() => setRejectModalTarget(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(rejectModalTarget.id, rejectModalTarget.sourceTable)}
                  disabled={actionLoading === `reject-${rejectModalTarget.id}`}
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
