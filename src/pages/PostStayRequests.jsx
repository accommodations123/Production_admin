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
  Ban,
  RotateCcw,
  Sparkles,
  Layers
} from "lucide-react";
import axios from "axios";
import { supabase } from "../lib/supabase";
import { notifyStayRequestApproval, notifyStayRequestRejection } from "../services/notificationService";

const BASE_URL = import.meta.env.VITE_API_URL || "https://api.nextkinlife.live";


const PostStayRequests = () => {
  const [activeTab, setActiveTab] = useState("pending"); // "pending" | "approved" | "rejected" | "all" | "reports"
  const [allRequests, setAllRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
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

  /* ═══════ HELPER TO NORMALIZE STATUS ═══════ */
  const getNormalizedStatus = (item) => {
    if (!item) return 'pending';
    const s = (item.status || '').toLowerCase().trim();
    if (s === 'approved' || item.is_approved === true) return 'approved';
    if (s === 'rejected' || (item.is_approved === false && s === 'rejected')) return 'rejected';
    if (s === 'pending' || s === 'submitted' || s === 'open' || s === 'active' || s === 'new' || !s) {
      return 'pending';
    }
    return s;
  };

  /* ═══════ HELPER TO NORMALIZE STAY REQUEST ═══════ */
  const normalizeStayRequest = (item) => {
    if (!item) return {};
    let parsedMeta = {};

    // Parse title if it's a JSON string
    if (typeof item.title === 'string' && item.title.trim().startsWith('{')) {
      try {
        parsedMeta = { ...parsedMeta, ...JSON.parse(item.title) };
      } catch (e) {
        console.warn("Could not parse title JSON:", e);
      }
    }

    // Parse description if it's a JSON string
    if (typeof item.description === 'string' && item.description.trim().startsWith('{')) {
      try {
        parsedMeta = { ...parsedMeta, ...JSON.parse(item.description) };
      } catch (e) {
        console.warn("Could not parse description JSON:", e);
      }
    }

    // Parse notes if it's a JSON string
    if (typeof item.notes === 'string' && item.notes.trim().startsWith('{')) {
      try {
        parsedMeta = { ...parsedMeta, ...JSON.parse(item.notes) };
      } catch (e) {
        console.warn("Could not parse notes JSON:", e);
      }
    }

    const cleanTitle = parsedMeta.displayTitle ||
      parsedMeta.title ||
      (typeof item.title === 'string' && !item.title.trim().startsWith('{') ? item.title : null) ||
      `Stay in ${item.city || item.destination_city || parsedMeta.city || "Destination"}`;

    const cleanDescription = (typeof item.description === 'string' && !item.description.trim().startsWith('{') ? item.description : null) ||
      parsedMeta.description ||
      item.stay_description ||
      item.notes ||
      "";

    const stayType = item.stay_type ||
      item.stayType ||
      parsedMeta.stayType ||
      parsedMeta.propertyType ||
      parsedMeta.accommodationType ||
      item.accommodation_type ||
      item.property_type ||
      "Accommodation";

    const seekerName = item.userName ||
      item.user_name ||
      parsedMeta.seekerName ||
      parsedMeta.name ||
      item.name ||
      item.username ||
      "Anonymous User";

    const state = item.state || parsedMeta.state || "";
    const city = item.city || item.destination_city || parsedMeta.city || "";
    const country = item.country || item.destination_country || parsedMeta.country || "";
    const furnishing = item.furnishing || parsedMeta.furnishing || null;
    const whatsappNumber = item.whatsapp || item.whatsapp_number || parsedMeta.whatsappNumber || parsedMeta.whatsapp || null;

    return {
      ...item,
      parsedMeta,
      title: cleanTitle,
      displayTitle: cleanTitle,
      description: cleanDescription,
      stay_type: stayType,
      stayType,
      userName: seekerName,
      state,
      city,
      country,
      furnishing,
      whatsappNumber,
      whatsapp: whatsappNumber,
    };
  };

  /* ═══════ FETCH ALL STAY REQUESTS ═══════ */
  const fetchAllRequests = useCallback(async () => {
    try {
      setLoading(true);
      const { data: supaRequests, error: supaErr } = await supabase
        .from('stay_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (supaErr) {
        console.error("Fetch stay requests error:", supaErr);
        return;
      }

      let list = (supaRequests || []).map(normalizeStayRequest);

      // Hydrate profile info if user_id is provided
      const userIds = [...new Set(list.map(r => r.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, firstName, lastName, email, phone, avatar_url, profile_picture')
          .in('id', userIds);

        if (profiles && profiles.length > 0) {
          const profileMap = new Map(profiles.map(p => [p.id, p]));
          list = list.map(r => {
            const prof = profileMap.get(r.user_id);
            if (!prof) return r;
            const profName = prof.full_name || `${prof.firstName || ''} ${prof.lastName || ''}`.trim();
            return {
              ...r,
              userName: r.userName || profName || r.user_name || r.username,
              userEmail: r.user_email || r.email || prof.email,
              userPhone: r.user_phone || r.phone || prof.phone,
              userAvatar: prof.avatar_url || prof.profile_picture,
            };
          });
        }
      }

      setAllRequests(list);

      // Set counts
      const pendingCount = list.filter(r => getNormalizedStatus(r) === 'pending').length;
      const approvedCount = list.filter(r => getNormalizedStatus(r) === 'approved').length;
      const rejectedCount = list.filter(r => getNormalizedStatus(r) === 'rejected').length;

      setStats({
        total: list.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      });

    } catch (err) {
      console.error("Fetch stay requests error:", err);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }, []);


  /* ═══════ FETCH REPORTS ═══════ */
  const fetchReports = useCallback(async () => {
    try {
      setReportsLoading(true);
      let reportsList = [];

      if (supabase) {
        const { data: supaReports, error } = await supabase
          .from('stay_request_reports')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(supaReports)) {
          reportsList = supaReports;
        }
      }

      if (reportsList.length === 0) {
        try {
          const res = await axios.get(`${BASE_URL}/admin/stay-request/reports`, getHeaders());
          const data = res.data?.reports || res.data?.data || res.data || [];
          if (Array.isArray(data) && data.length > 0) reportsList = data;
        } catch {
          // ignore
        }
      }

      setReports(Array.isArray(reportsList) ? reportsList : []);
    } catch (err) {
      console.error("Fetch stay request reports error:", err);
    } finally {
      setReportsLoading(false);
    }
  }, [getHeaders]);

  /* ═══════ REALTIME SUBSCRIPTION FOR INSTANT UPDATES ═══════ */
  useEffect(() => {
    fetchAllRequests();
    fetchReports();

    if (!supabase) return;

    // Listen for new requests, updates, or deletes live
    const stayChannel = supabase
      .channel('public:stay_requests')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stay_requests' },
        (payload) => {
          console.log('Realtime stay_request event received:', payload);
          fetchAllRequests();
        }
      )
      .subscribe();

    const reportsChannel = supabase
      .channel('public:stay_request_reports')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stay_request_reports' },
        (payload) => {
          console.log('Realtime stay_request_reports event received:', payload);
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(stayChannel);
      supabase.removeChannel(reportsChannel);
    };
  }, [fetchAllRequests, fetchReports]);

  /* ═══════ APPROVE STAY REQUEST ═══════ */
  const handleApprove = async (id) => {
    try {
      setActionLoading(`approve-${id}`);
      const { error: supaErr } = await supabase
        .from('stay_requests')
        .update({
          status: 'approved',
          is_approved: true,
          rejection_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (supaErr) throw supaErr;

      // Dispatch in-app & email notification
      const req = allRequests.find(r => r.id === id || r._id === id);
      if (req) {
        notifyStayRequestApproval({
          userId: req.user_id,
          userEmail: req.userEmail || req.email,
          userName: req.userName || req.name || 'Traveler',
          title: req.displayTitle || req.title || 'Stay Request',
          requestId: id
        });
      }

      showToast("Stay request approved successfully", "success");
      fetchAllRequests();
      if (showModal && (selectedRequest?.id === id || selectedRequest?._id === id)) {
        setShowModal(false);
      }
    } catch (err) {
      console.error("Approve error:", err);
      showToast(err.message || "Failed to approve request", "error");
    } finally {
      setActionLoading(null);
    }
  };

  /* ═══════ REJECT STAY REQUEST ═══════ */
  const handleReject = async (id) => {
    try {
      setActionLoading(`reject-${id}`);
      const reason = rejectReason || "Request does not meet quality or policy guidelines";
      const { error: supaErr } = await supabase
        .from('stay_requests')
        .update({
          status: 'rejected',
          is_approved: false,
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (supaErr) throw supaErr;

      // Dispatch in-app & email notification
      const req = allRequests.find(r => r.id === id || r._id === id);
      if (req) {
        notifyStayRequestRejection({
          userId: req.user_id,
          userEmail: req.userEmail || req.email,
          userName: req.userName || req.name || 'Traveler',
          title: req.displayTitle || req.title || 'Stay Request',
          requestId: id,
          reason
        });
      }

      showToast("Stay request rejected", "success");
      setRejectModalId(null);
      setRejectReason("");
      fetchAllRequests();
      if (showModal && (selectedRequest?.id === id || selectedRequest?._id === id)) {
        setShowModal(false);
      }
    } catch (err) {
      console.error("Reject error:", err);
      showToast(err.message || "Failed to reject request", "error");
    } finally {
      setActionLoading(null);
    }
  };


  /* ═══════ RESTORE STAY REQUEST TO PENDING ═══════ */
  const handleRestore = async (id) => {
    try {
      setActionLoading(`restore-${id}`);
      const { error: supaErr } = await supabase
        .from('stay_requests')
        .update({
          status: 'pending',
          is_approved: false,
          rejection_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (supaErr) throw supaErr;
      showToast("Request restored to pending status", "success");
      fetchAllRequests();
      if (showModal && (selectedRequest?.id === id || selectedRequest?._id === id)) {
        setShowModal(false);
      }
    } catch (err) {
      console.error("Restore error:", err);
      showToast(err.message || "Failed to restore request", "error");
    } finally {
      setActionLoading(null);
    }
  };

  /* ═══════ STAT CARDS DATA ═══════ */
  const pendingCount = stats?.pending ?? allRequests.filter(r => getNormalizedStatus(r) === 'pending').length;
  const approvedCount = stats?.approved ?? allRequests.filter(r => getNormalizedStatus(r) === 'approved').length;
  const rejectedCount = stats?.rejected ?? allRequests.filter(r => getNormalizedStatus(r) === 'rejected').length;
  const totalCount = stats?.total ?? allRequests.length;
  const reportsCount = reports.length;

  const statCards = [
    { label: "Pending Approvals", value: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "from-amber-500 to-orange-500", tabKey: "pending" },
    { label: "Approved Requests", value: approvedCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "from-emerald-500 to-teal-500", tabKey: "approved" },
    { label: "Rejected Requests", value: rejectedCount, icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "from-red-500 to-rose-500", tabKey: "rejected" },
    { label: "Total Requests", value: totalCount, icon: Home, color: "text-blue-600", bg: "bg-blue-50", border: "from-blue-500 to-indigo-500", tabKey: "all" },
    { label: "Reports & Flags", value: reportsCount, icon: ShieldAlert, color: "text-purple-600", bg: "bg-purple-50", border: "from-purple-500 to-violet-500", tabKey: "reports" },
  ];

  /* ═══════ FILTERING REQUESTS ═══════ */
  const filteredRequests = allRequests.filter((r) => {
    const normStatus = getNormalizedStatus(r);

    // Tab Filter
    if (activeTab === "pending" && normStatus !== "pending") return false;
    if (activeTab === "approved" && normStatus !== "approved") return false;
    if (activeTab === "rejected" && normStatus !== "rejected") return false;
    // if activeTab === "all", show all

    // Search Query Filter
    const title = (r.title || r.location || "").toLowerCase();
    const city = (r.city || r.destination_city || r.destinationCity || r.location?.city || "").toLowerCase();
    const country = (r.country || r.destination_country || r.destinationCountry || r.location?.country || "").toLowerCase();
    const userName = (r.userName || r.user_name || r.user?.name || "").toLowerCase();
    const desc = (r.description || r.stay_description || r.stayDescription || r.notes || "").toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = title.includes(query) || city.includes(query) || country.includes(query) || userName.includes(query) || desc.includes(query);
    if (!matchesSearch) return false;

    // Accommodation Type Filter
    if (typeFilter !== "all") {
      const stayType = (r.stay_type || r.stayType || r.accommodation_type || r.accommodationType || r.room_type || "").toLowerCase();
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
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Post Stay Requests</h1>
                <p className="text-sm text-slate-400">Review, approve, and moderate user accommodation stay requests in real-time</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchAllRequests();
                fetchReports();
              }}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${loading || statsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── STAT CARDS ──────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              onClick={() => setActiveTab(stat.tabKey)}
              className={`bg-white rounded-2xl border p-4 relative overflow-hidden transition-all group cursor-pointer ${
                activeTab === stat.tabKey
                  ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                  : 'border-slate-200/80 hover:shadow-md hover:border-slate-300'
              }`}
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
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === "pending"
                ? "border-amber-500 text-amber-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            Pending Approval ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === "approved"
                ? "border-emerald-600 text-emerald-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === "rejected"
                ? "border-red-500 text-red-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <XCircle className="w-4 h-4 text-red-500" />
            Rejected ({rejectedCount})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === "all"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Layers className="w-4 h-4 text-blue-600" />
            All Requests ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === "reports"
                ? "border-purple-600 text-purple-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-purple-500" />
            Stay Request Reports ({reportsCount})
          </button>
        </div>

        {/* ── TAB CONTENT: REQUESTS LIST (Pending / Approved / Rejected / All) ────────────── */}
        {activeTab !== "reports" && (
          <div className="space-y-4">
            {/* SEARCH & FILTERS */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title, destination, city, country, applicant name, notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-slate-400 mr-1">Filter by Type:</span>
                {[
                  { key: "all", label: "All Types" },
                  { key: "apartment", label: "Apartment" },
                  { key: "villa", label: "Villa / House" },
                  { key: "room", label: "Private Room" },
                  { key: "studio", label: "Studio" },
                  { key: "hostel", label: "PG / Hostel" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setTypeFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type & Status</th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {!loading && filteredRequests.map((r) => {
                      const id = r.id || r._id;
                      const normStatus = getNormalizedStatus(r);
                      const userName = r.userName || r.user_name || r.name || "Anonymous User";
                      const userEmail = r.userEmail || r.user_email || r.email || "";
                      const locationStr = r.city || r.destination_city || r.destinationCity
                        ? `${r.city || r.destination_city || r.destinationCity}${r.country || r.destination_country ? `, ${r.country || r.destination_country}` : ''}`
                        : (r.location || "Flexible Location");
                      const budget = r.budget || r.max_budget || r.maxBudget || r.priceRange || r.estimatedBudget || r.price;
                      const checkIn = r.check_in || r.checkIn || r.checkInDate || r.check_in_date || r.startDate || r.start_date || r.from;
                      const checkOut = r.check_out || r.checkOut || r.checkOutDate || r.check_out_date || r.endDate || r.end_date || r.to;
                      const stayType = r.stay_type || r.stayType || r.accommodation_type || r.accommodationType || r.property_type || r.room_type || "Accommodation";
                      const guestsCount = r.guests || r.numberOfGuests || r.guest_capacity || r.adults || 1;

                      return (
                        <tr key={id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-4 max-w-xs">
                            <div className="font-semibold text-slate-900 text-sm truncate">
                              {r.title || `Stay in ${r.city || r.destination_city || "Destination"}`}
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                              {r.description || r.stay_description || r.stayDescription || r.notes || "No details provided"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[160px]">{locationStr}</span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                                {userName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-slate-800 truncate">{userName}</div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{userEmail || "No email"}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-xs text-slate-600">
                            <div className="flex items-center gap-1 font-semibold text-slate-800">
                              <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{budget ? `${budget} ${r.currency || "USD"}` : "Flexible"}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 mt-0.5 text-[11px]">
                              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>
                                {checkIn ? new Date(checkIn).toLocaleDateString() : "Flexible dates"}
                                {checkOut ? ` - ${new Date(checkOut).toLocaleDateString()}` : ""}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                                {stayType} • {guestsCount} {guestsCount === 1 ? 'Guest' : 'Guests'}
                              </span>

                              {normStatus === 'approved' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Check className="w-2.5 h-2.5" /> Approved
                                </span>
                              )}
                              {normStatus === 'rejected' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                                  <Ban className="w-2.5 h-2.5" /> Rejected
                                </span>
                              )}
                              {normStatus === 'pending' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <Clock className="w-2.5 h-2.5" /> Pending
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
                              {normStatus !== 'approved' && (
                                <button
                                  onClick={() => handleApprove(id)}
                                  disabled={actionLoading === `approve-${id}`}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 shadow-sm disabled:opacity-50"
                                  title="Approve Stay Request"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve
                                </button>
                              )}

                              {/* Reject Button */}
                              {normStatus !== 'rejected' && (
                                <button
                                  onClick={() => {
                                    setRejectModalId(id);
                                    setRejectReason("");
                                  }}
                                  disabled={actionLoading === `reject-${id}`}
                                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                                  title="Reject Stay Request"
                                >
                                  <Ban className="w-3.5 h-3.5" /> Reject
                                </button>
                              )}

                              {/* Restore to Pending */}
                              {normStatus !== 'pending' && (
                                <button
                                  onClick={() => handleRestore(id)}
                                  disabled={actionLoading === `restore-${id}`}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                  title="Restore to Pending"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
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

              {loading && (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto" />
                  <p className="mt-4 text-sm text-slate-400">Loading stay requests…</p>
                </div>
              )}

              {!loading && filteredRequests.length === 0 && (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 mb-3">
                    <Home className="w-7 h-7 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">No stay requests found</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {activeTab === 'pending'
                      ? "All pending stay requests have been moderated"
                      : "No stay requests match the active filter or search"}
                  </p>
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
                    const reqId = r.stay_request_id || r.stayRequestId || r.targetRequestId || r._id || r.id;
                    return (
                      <tr key={r.id || r._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900 text-sm">
                            {r.request_title || r.requestTitle || `Request #${(reqId || "").slice?.(0, 8)}`}
                          </div>
                          <div className="text-xs text-slate-400">ID: {(reqId || "").slice?.(0, 12)}</div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-xs font-medium text-slate-700">{r.reporter_name || r.reporterName || r.reporter?.name || "User"}</div>
                          <div className="text-xs text-slate-400">{r.reporter_email || r.reporterEmail || r.reporter?.email || ""}</div>
                        </td>

                        <td className="px-5 py-4 max-w-xs">
                          <div className="text-xs font-bold text-red-600 capitalize">{r.reason || "Suspicious Listing"}</div>
                          <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">{r.description || r.details || "No comments"}</div>
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-500">
                          {r.created_at || r.createdAt ? new Date(r.created_at || r.createdAt).toLocaleDateString() : "N/A"}
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl animate-scale-up">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Home className="w-4 h-4" />
                  </div>
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
                  const normStatus = getNormalizedStatus(r);
                  const userName = r.userName || r.user_name || r.name || "Anonymous User";
                  const userEmail = r.userEmail || r.user_email || r.email || "N/A";
                  const userPhone = r.userPhone || r.user_phone || r.phone || "N/A";
                  const checkIn = r.check_in || r.checkIn || r.checkInDate || r.check_in_date || r.startDate || r.start_date || r.from;
                  const checkOut = r.check_out || r.checkOut || r.checkOutDate || r.check_out_date || r.endDate || r.end_date || r.to;
                  const budget = r.budget || r.max_budget || r.maxBudget || r.priceRange || r.estimatedBudget || r.price;
                  const stayType = r.stay_type || r.stayType || r.accommodation_type || r.accommodationType || r.property_type || r.room_type || "Accommodation";
                  const guestsCount = r.guests || r.numberOfGuests || r.guest_capacity || r.adults || 1;
                  const locationStr = [r.city, r.state, r.country].filter(Boolean).join(', ') || "Flexible Location";
                  const displayTitle = r.displayTitle || r.title || `Accommodation in ${r.city || "Destination"}`;

                  return (
                    <>
                      {/* Header Card */}
                      <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl p-4 border border-slate-200/80">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">
                              {displayTitle}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                              <span className="flex items-center gap-1 font-medium text-slate-700">
                                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                {locationStr}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {checkIn ? new Date(checkIn).toLocaleDateString() : "Flexible"}
                                {checkOut ? ` - ${new Date(checkOut).toLocaleDateString()}` : ""}
                              </span>
                            </div>
                          </div>

                          <div>
                            {normStatus === 'approved' && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                Approved
                              </span>
                            )}
                            {normStatus === 'rejected' && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                Rejected
                              </span>
                            )}
                            {normStatus === 'pending' && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                Pending Review
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200/60 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Budget</span>
                            <span className="font-bold text-emerald-600 text-sm">
                              {budget ? `${budget} ${r.currency || "USD"}` : "Flexible"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Property Type</span>
                            <span className="font-semibold text-slate-800 capitalize">{stayType}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Furnishing</span>
                            <span className="font-semibold text-slate-800">{r.furnishing || "Not specified"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Guests</span>
                            <span className="font-semibold text-slate-800">{guestsCount} {guestsCount === 1 ? 'Guest' : 'Guests'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Requester Information */}
                      <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-600" /> Requester Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Full Name</span>
                            <span className="font-semibold text-slate-900">{userName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Email Address</span>
                            <span className="font-medium text-slate-700">{userEmail}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Phone Number</span>
                            <span className="font-medium text-slate-700">{userPhone}</span>
                          </div>
                          {r.whatsappNumber && (
                            <div>
                              <span className="text-slate-400 block text-[11px]">WhatsApp</span>
                              <span className="font-medium text-slate-700">{r.whatsappNumber}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-slate-400 block text-[11px]">User ID / Account</span>
                            <span className="font-mono text-slate-500">{r.user_id ? `${r.user_id.slice(0, 14)}...` : "Guest / Not Linked"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Description & Requirements */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Description & Specific Preferences
                        </h4>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {r.description || r.stay_description || r.stayDescription || r.notes || "No additional description provided by user."}
                        </div>
                      </div>


                      {/* Rejection Reason (if rejected) */}
                      {r.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs">
                          <span className="font-bold text-red-800 block mb-1">Rejection Reason:</span>
                          <span className="text-red-700">{r.rejection_reason}</span>
                        </div>
                      )}

                      {/* Modal Actions */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {normStatus !== 'approved' && (
                            <button
                              onClick={() => handleApprove(id)}
                              disabled={actionLoading === `approve-${id}`}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" /> Approve Request
                            </button>
                          )}

                          {normStatus !== 'rejected' && (
                            <button
                              onClick={() => {
                                setRejectModalId(id);
                                setRejectReason("");
                              }}
                              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                            >
                              <Ban className="w-4 h-4" /> Reject Request
                            </button>
                          )}

                          {normStatus !== 'pending' && (
                            <button
                              onClick={() => handleRestore(id)}
                              disabled={actionLoading === `restore-${id}`}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                            >
                              <RotateCcw className="w-4 h-4" /> Restore to Pending
                            </button>
                          )}
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
                  Reason for rejection (will be recorded and notified):
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Inappropriate description, budget unrealistic, violates community guidelines..."
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
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
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
