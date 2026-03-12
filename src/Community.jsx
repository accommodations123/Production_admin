import React, { useEffect, useState } from "react";
import {
  Plus, Users, MessageSquare, Calendar, MapPin, TrendingUp,
  Search, X, AlertCircle, Eye, Globe, Lock, Unlock, Clock, User, Hash,
} from "lucide-react";

const BASE_URL = "https://api.nextkinlife.live";

const Community = () => {
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "", description: "", city: "", state: "", topics: [],
    avatar_image: "", cover_image: "", visibility: "public", join_policy: "open", country: "", pincode: "",
  });

  const [newTopic, setNewTopic] = useState("");
  const token = localStorage.getItem("admin-auth");

  /* ═══════ FETCH ALL COMMUNITIES ═══════ */
  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const endpoints = [
        `${BASE_URL}/community/admin/communities/pending`,
        `${BASE_URL}/community/admin/communities/approved`,
        `${BASE_URL}/community/admin/communities/suspended`,
        `${BASE_URL}/community/admin/communities/rejected`
      ];
      const responses = await Promise.all(
        endpoints.map(url => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json().catch(() => ({ communities: [] }))))
      );
      const allCommunities = responses.flatMap(json => json.communities || []);
      const uniqueCommunities = Array.from(new Map(allCommunities.map(c => [c.id, c])).values());
      setCommunities(uniqueCommunities);
    } catch (err) {
      console.error("Fetch communities error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCommunities(); }, []);

  /* ═══════ FETCH SINGLE COMMUNITY ═══════ */
  const fetchCommunityDetails = async (id) => {
    try {
      setViewLoading(true);
      const res = await fetch(`${BASE_URL}/community/admin/communities/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) setSelectedCommunity(json.community);
    } catch (err) { console.error("Fetch community details error:", err); }
    finally { setViewLoading(false); }
  };

  /* ═══════ STATUS UPDATE ═══════ */
  const updateStatus = async (id, action) => {
    try {
      let method = "PUT";
      if (action === "activate") method = "POST";
      await fetch(`${BASE_URL}/community/admin/communities/${id}/${action}`, {
        method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      fetchCommunities();
    } catch (err) { console.error(`${action} error:`, err); }
  };

  /* ═══════ CREATE COMMUNITY ═══════ */
  const createCommunity = async () => {
    try {
      setCreateLoading(true); setError("");
      if (!formData.name || !formData.description || !formData.city || !formData.state) {
        setError("Please fill in all required fields"); setCreateLoading(false); return;
      }
      const res = await fetch(`${BASE_URL}/community/admin/communities`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create community");
      setFormData({ name: "", description: "", city: "", state: "", topics: [], avatar_image: "", cover_image: "", visibility: "public", join_policy: "open", country: "", pincode: "" });
      setShowCreateModal(false);
      fetchCommunities();
    } catch (err) { setError(err.message); }
    finally { setCreateLoading(false); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addTopic = () => {
    if (newTopic.trim() && !formData.topics.includes(newTopic.trim())) {
      setFormData((prev) => ({ ...prev, topics: [...prev.topics, newTopic.trim()] }));
      setNewTopic("");
    }
  };

  const removeTopic = (topic) => {
    setFormData((prev) => ({ ...prev, topics: prev.topics.filter((t) => t !== topic) }));
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "ACTIVE": return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "PENDING": return "bg-amber-50 text-amber-600 border-amber-200";
      case "SUSPENDED": return "bg-red-50 text-red-500 border-red-200";
      default: return "bg-slate-50 text-slate-500 border-slate-200";
    }
  };

  const handleViewCommunity = (community) => {
    setSelectedCommunity(community);
    setShowViewModal(true);
  };

  /* ═══════ STATISTICS ═══════ */
  const totalCommunities = communities.length;
  const activeCommunities = communities.filter(c => c.status === "active").length;
  const pendingCommunities = communities.filter(c => c.status === "pending").length;
  const suspendedCommunities = communities.filter(c => c.status === "suspended").length;
  const totalMembers = communities.reduce((sum, c) => sum + (c.members_count || 0), 0);
  const totalPosts = communities.reduce((sum, c) => sum + (c.posts_count || 0), 0);

  /* ═══════ FILTERING ═══════ */
  const filteredCommunities = communities.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.state?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  /* ═══════ STAT CARDS CONFIG ═══════ */
  const stats = [
    { icon: Users, label: "Communities", value: totalCommunities, tag: "Total", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: TrendingUp, label: "Active Communities", value: activeCommunities, tag: "Active", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: Users, label: "Total Members", value: totalMembers.toLocaleString(), tag: "Members", color: "text-amber-600", bg: "bg-amber-50" },
    { icon: MessageSquare, label: "Total Posts", value: totalPosts.toLocaleString(), tag: "Content", color: "text-violet-600", bg: "bg-violet-50" },
  ];

  const ACCENT_GRADIENTS = ['from-blue-500 to-indigo-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-violet-500 to-purple-500'];

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── HEADER ──────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Communities</h1>
            <p className="text-sm text-slate-400 mt-1">Manage all user communities and groups</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Community
          </button>
        </div>

        {/* ── STAT CARDS ──────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={stat.label} className="group bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${ACCENT_GRADIENTS[i]} opacity-80`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{stat.tag}</p>
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
                </div>
                <div className={`${stat.bg} w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`${stat.color}`} size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── SEARCH & FILTERS ────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search communities..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: `All (${totalCommunities})` },
              { key: "active", label: `Active (${activeCommunities})` },
              { key: "pending", label: `Pending (${pendingCommunities})` },
              { key: "suspended", label: `Suspended (${suspendedCommunities})` },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === f.key
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TABLE ───────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Community</th>
                  <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Location</th>
                  <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Members</th>
                  <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {!loading && filteredCommunities.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex gap-3">
                        <img src={c.avatar_image} alt={c.name} className="w-10 h-10 rounded-xl object-cover border border-slate-100" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-800 text-sm truncate">{c.name}</p>
                          <p className="text-xs text-slate-400 line-clamp-1">{c.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {c.city}, {c.state}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-700 font-medium">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {c.members_count}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${getStatusStyle(c.status.toUpperCase())}`}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleViewCommunity(c)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                          <Eye className="w-3 h-3" /> View
                        </button>
                        {c.status === "pending" && (
                          <>
                            <button onClick={() => updateStatus(c.id, "approve")} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs font-medium transition-colors">Approve</button>
                            <button onClick={() => updateStatus(c.id, "reject")} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-medium transition-colors">Reject</button>
                          </>
                        )}
                        {c.status === "active" && (
                          <button onClick={() => updateStatus(c.id, "suspend")} className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg text-xs font-medium transition-colors">Suspend</button>
                        )}
                        {c.status === "suspended" && (
                          <button onClick={() => updateStatus(c.id, "activate")} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-medium transition-colors">Activate</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loading && (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-[#cb2926] rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-sm text-slate-400">Loading communities…</p>
            </div>
          )}

          {!loading && filteredCommunities.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 mb-4">
                <Users className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1">No communities found</h3>
              <p className="text-xs text-slate-400">
                {searchTerm || statusFilter !== "all" ? "Try adjusting your search or filter criteria" : "There are no communities to display"}
              </p>
            </div>
          )}
        </div>

        {/* ── VIEW COMMUNITY MODAL ────────────────────── */}
        {showViewModal && selectedCommunity && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl animate-slide-up">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">Community Details</h2>
                <button onClick={() => setShowViewModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                {viewLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-slate-200 border-t-[#cb2926] rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Cover + Avatar */}
                    <div className="relative">
                      <div className="h-36 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl overflow-hidden">
                        {selectedCommunity.cover_image ? (
                          <img src={selectedCommunity.cover_image} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm">No Cover Image</div>
                        )}
                      </div>
                      <div className="absolute -bottom-8 left-5">
                        <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                          {selectedCommunity.avatar_image ? (
                            <img src={selectedCommunity.avatar_image} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100"><Users className="w-6 h-6 text-slate-400" /></div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-10">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{selectedCommunity.name}</h3>
                      <p className="text-sm text-slate-500 mb-4">{selectedCommunity.description}</p>

                      {selectedCommunity.topics?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {selectedCommunity.topics.map((topic, index) => (
                            <span key={index} className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">#{topic}</span>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                          <h4 className="text-sm font-semibold text-slate-700">Basic Information</h4>
                          {[
                            { icon: Hash, label: "Slug", value: selectedCommunity.slug },
                            { icon: Globe, label: "Visibility", value: selectedCommunity.visibility },
                            { icon: selectedCommunity.join_policy === "open" ? Unlock : Lock, label: "Join Policy", value: selectedCommunity.join_policy },
                            { icon: Clock, label: "Created", value: formatDate(selectedCommunity.createdAt) },
                          ].map((item) => (
                            <div key={item.label} className="flex items-center gap-3">
                              <item.icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-xs text-slate-400 w-20">{item.label}:</span>
                              <span className="text-sm text-slate-700 capitalize">{item.value}</span>
                            </div>
                          ))}
                        </div>

                        {/* Location */}
                        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                          <h4 className="text-sm font-semibold text-slate-700">Location</h4>
                          {[
                            { label: "Country", value: selectedCommunity.country },
                            { label: "State", value: selectedCommunity.state },
                            { label: "City", value: selectedCommunity.city },
                            { label: "Pincode", value: selectedCommunity.pincode || "N/A" },
                          ].map((item) => (
                            <div key={item.label} className="flex items-center gap-3">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-xs text-slate-400 w-20">{item.label}:</span>
                              <span className="text-sm text-slate-700">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 mt-6">
                        {[
                          { icon: Users, label: "Members", value: selectedCommunity.members_count, color: "text-blue-600", bg: "bg-blue-50" },
                          { icon: MessageSquare, label: "Posts", value: selectedCommunity.posts_count, color: "text-violet-600", bg: "bg-violet-50" },
                          // { icon: Calendar, label: "Events", value: selectedCommunity.events_count, color: "text-emerald-600", bg: "bg-emerald-50" },
                        ].map((s) => (
                          <div key={s.label} className="bg-slate-50 rounded-xl p-4 text-center">
                            <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
                            <div className="text-xl font-bold text-slate-900">{s.value}</div>
                            <div className="text-xs text-slate-400">{s.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Members */}
                      {/* <div className="mt-6">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Members</h4>
                        <div className="bg-slate-50 rounded-xl p-4">
                          {selectedCommunity.members?.length > 0 ? (
                            <div className="space-y-2">
                              {selectedCommunity.members.map((member, index) => (
                                <div key={index} className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                                    <User className="w-4 h-4 text-slate-400" />
                                  </div>
                                  <span className="text-sm text-slate-700">User ID: {member.user_id}</span>
                                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-medium capitalize">{member.role}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400 text-center py-4">No members found</p>
                          )}
                        </div>
                      </div> */}

                      {/* Status */}
                      <div className="mt-6 flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-700">Status:</span>
                        <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${getStatusStyle(selectedCommunity.status.toUpperCase())}`}>
                          {selectedCommunity.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-slate-100 flex justify-end">
                <button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE COMMUNITY MODAL ──────────────────── */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl animate-slide-up">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">Create New Community</h2>
                <button onClick={() => { setShowCreateModal(false); setError(""); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Community Name *" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter community name" />
                  <InputField label="Country *" name="country" value={formData.country} onChange={handleInputChange} placeholder="Enter country" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField label="City *" name="city" value={formData.city} onChange={handleInputChange} placeholder="Enter city" />
                  <InputField label="State *" name="state" value={formData.state} onChange={handleInputChange} placeholder="Enter state" />
                  <InputField label="Pincode *" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="Enter pincode" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Visibility</label>
                    <select name="visibility" value={formData.visibility} onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100">
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Join Policy</label>
                    <select name="join_policy" value={formData.join_policy} onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100">
                      <option value="open">Open</option>
                      <option value="approval">Approval Required</option>
                      <option value="invitation">Invitation Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
                    placeholder="Enter community description" />
                </div>

                {/* Topics */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Topics</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={newTopic} onChange={(e) => setNewTopic(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
                      placeholder="Add a topic" />
                    <button onClick={addTopic} className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.topics.map((topic, index) => (
                      <span key={index} className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium flex items-center gap-1">
                        {topic}
                        <button onClick={() => removeTopic(topic)} className="text-blue-400 hover:text-blue-600"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Avatar Image URL" name="avatar_image" value={formData.avatar_image} onChange={handleInputChange} placeholder="Enter avatar image URL" />
                  <InputField label="Cover Image URL" name="cover_image" value={formData.cover_image} onChange={handleInputChange} placeholder="Enter cover image URL" />
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
                <button onClick={() => { setShowCreateModal(false); setError(""); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={createCommunity} disabled={createLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50">
                  {createLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                  ) : (
                    <><Plus className="w-4 h-4" /> Create Community</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════ REUSABLE INPUT FIELD ═══════ */
const InputField = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <input type="text" name={name} value={value} onChange={onChange}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition-all"
      placeholder={placeholder} />
  </div>
);

export default Community;