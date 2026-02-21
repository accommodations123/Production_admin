import React, { useEffect, useState } from "react";
import {
  Plus,
  Users,
  MessageSquare,
  Calendar,
  MapPin,
  TrendingUp,
  Search,
  X,
  AlertCircle,
  Eye,
  Globe,
  Lock,
  Unlock,
  Clock,
  User,
  Hash,
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
    name: "",
    description: "",
    city: "",
    state: "",
    topics: [],
    avatar_image: "",
    cover_image: "",
    visibility: "public",
    join_policy: "open",
    country: "",
  });

  const [newTopic, setNewTopic] = useState("");

  const token = localStorage.getItem("admin-auth");

  /* =========================
     FETCH ALL COMMUNITIES
     ========================= */
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
        endpoints.map(url =>
          fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => res.json().catch(err => ({ communities: [] })))
        )
      );

      // Aggregate all communities from the responses
      const allCommunities = responses.flatMap(json => json.communities || []);

      // Remove duplicates just in case (by id)
      const uniqueCommunities = Array.from(
        new Map(allCommunities.map(c => [c.id, c])).values()
      );

      setCommunities(uniqueCommunities);
    } catch (err) {
      console.error("Fetch communities error:", err);
      // Ensure we don't leave it in loading state if something catastrophic fails
      // though Promise.all above catches individual fetch json errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  /* =========================
     FETCH SINGLE COMMUNITY DETAILS
     ========================= */
  const fetchCommunityDetails = async (id) => {
    try {
      setViewLoading(true);
      const res = await fetch(
        `${BASE_URL}/community/admin/communities/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      if (json.success) {
        setSelectedCommunity(json.community);
      }
    } catch (err) {
      console.error("Fetch community details error:", err);
    } finally {
      setViewLoading(false);
    }
  };

  /* =========================
     STATUS UPDATE
     ========================= */
  const updateStatus = async (id, action) => {
    try {
      let method = "PUT";

      // Backend requires POST only for activate
      if (action === "activate") {
        method = "POST";
      }

      await fetch(
        `${BASE_URL}/community/admin/communities/${id}/${action}`,
        {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      fetchCommunities();
    } catch (err) {
      console.error(`${action} error:`, err);
    }
  };

  /* =========================
     CREATE COMMUNITY
     ========================= */
  const createCommunity = async () => {
    try {
      setCreateLoading(true);
      setError("");

      if (!formData.name || !formData.description || !formData.city || !formData.state) {
        setError("Please fill in all required fields");
        setCreateLoading(false);
        return;
      }

      const res = await fetch(
        `${BASE_URL}/community/admin/communities`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create community");
      }

      setFormData({
        name: "",
        description: "",
        city: "",
        state: "",
        topics: [],
        avatar_image: "",
        cover_image: "",
        visibility: "public",
        join_policy: "open",
        country: "",
      });

      setShowCreateModal(false);
      fetchCommunities();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addTopic = () => {
    if (newTopic.trim() && !formData.topics.includes(newTopic.trim())) {
      setFormData((prev) => ({
        ...prev,
        topics: [...prev.topics, newTopic.trim()],
      }));
      setNewTopic("");
    }
  };

  const removeTopic = (topic) => {
    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.filter((t) => t !== topic),
    }));
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "SUSPENDED":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const handleViewCommunity = (community) => {
    setSelectedCommunity(community);
    setShowViewModal(true);
  };

  /* =========================
     CALCULATE STATISTICS
     ========================= */
  const totalCommunities = communities.length;
  const activeCommunities = communities.filter(c => c.status === "active").length;
  const pendingCommunities = communities.filter(c => c.status === "pending").length;
  const suspendedCommunities = communities.filter(c => c.status === "suspended").length;
  const totalMembers = communities.reduce((sum, c) => sum + (c.members_count || 0), 0);
  const totalPosts = communities.reduce((sum, c) => sum + (c.posts_count || 0), 0);
  const totalEvents = communities.reduce((sum, c) => sum + (c.events_count || 0), 0);

  /* =========================
     FILTERING
     ========================= */
  const filteredCommunities = communities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.state?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /* =========================
     FORMAT DATE
     ========================= */
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-[#00162d] text-white p-6 lg:p-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Communities</h1>
          <p className="text-slate-400 mt-2">
            Manage all user communities and groups
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#cb2926] to-[#a71f1c] px-6 py-3 rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Community
        </button>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#001f3d] rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs text-slate-400">Total</span>
          </div>
          <div className="text-2xl font-bold">{totalCommunities}</div>
          <div className="text-sm text-slate-400 mt-1">Communities</div>
        </div>

        <div className="bg-[#001f3d] rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-xs text-slate-400">Active</span>
          </div>
          <div className="text-2xl font-bold">{activeCommunities}</div>
          <div className="text-sm text-slate-400 mt-1">Active Communities</div>
        </div>

        <div className="bg-[#001f3d] rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Users className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-xs text-slate-400">Members</span>
          </div>
          <div className="text-2xl font-bold">{totalMembers.toLocaleString()}</div>
          <div className="text-sm text-slate-400 mt-1">Total Members</div>
        </div>

        <div className="bg-[#001f3d] rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-xs text-slate-400">Content</span>
          </div>
          <div className="text-2xl font-bold">{totalPosts.toLocaleString()}</div>
          <div className="text-sm text-slate-400 mt-1">Total Posts</div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-[#001f3d] rounded-xl p-4 mb-6 border border-slate-700">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search communities..."
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#cb2926]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* FILTER OPTIONS - ALWAYS VISIBLE */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-lg transition-colors ${statusFilter === "all"
              ? "bg-[#cb2926] text-white"
              : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
              }`}
          >
            All ({totalCommunities})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-4 py-2 rounded-lg transition-colors ${statusFilter === "active"
              ? "bg-green-600 text-white"
              : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
              }`}
          >
            Active ({activeCommunities})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 rounded-lg transition-colors ${statusFilter === "pending"
              ? "bg-yellow-600 text-white"
              : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
              }`}
          >
            Pending ({pendingCommunities})
          </button>
          <button
            onClick={() => setStatusFilter("suspended")}
            className={`px-4 py-2 rounded-lg transition-colors ${statusFilter === "suspended"
              ? "bg-red-600 text-white"
              : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
              }`}
          >
            Suspended ({suspendedCommunities})
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#001f3d] rounded-2xl overflow-hidden border border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#002547] text-slate-400 text-xs">
              <tr>
                <th className="px-6 py-4">Community</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Members</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {!loading && filteredCommunities.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  {/* COMMUNITY */}
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <img
                        src={c.avatar_image}
                        alt={c.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">{c.name}</p>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {c.description}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {c.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* LOCATION */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {c.city}, {c.state}
                    </div>
                  </td>

                  {/* MEMBERS */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-500" />
                      {c.members_count}
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusStyle(
                        c.status.toUpperCase()
                      )}`}
                    >
                      {c.status.toUpperCase()}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewCommunity(c)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>

                      {c.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(c.id, "approve")}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-md text-xs font-medium transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(c.id, "reject")}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-md text-xs font-medium transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {c.status === "active" && (
                        <button
                          onClick={() => updateStatus(c.id, "suspend")}
                          className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded-md text-xs font-medium transition-colors"
                        >
                          Suspend
                        </button>
                      )}

                      {c.status === "suspended" && (
                        <button
                          onClick={() => updateStatus(c.id, "activate")}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md text-xs font-medium transition-colors"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#cb2926]"></div>
            <p className="mt-4 text-slate-400">
              Loading communities…
            </p>
          </div>
        )}

        {!loading && filteredCommunities.length === 0 && (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
              <Users className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No communities found</h3>
            <p className="text-slate-400">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "There are no communities to display"}
            </p>
          </div>
        )}
      </div>

      {/* VIEW COMMUNITY MODAL */}
      {showViewModal && selectedCommunity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#001f3d] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Community Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {viewLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#cb2926]"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* HEADER SECTION */}
                  <div className="relative">
                    <div className="h-32 bg-slate-700 rounded-lg overflow-hidden">
                      {selectedCommunity.cover_image ? (
                        <img
                          src={selectedCommunity.cover_image}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          No Cover Image
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-10 left-6">
                      <div className="w-20 h-20 bg-slate-700 rounded-lg overflow-hidden border-4 border-[#001f3d]">
                        {selectedCommunity.avatar_image ? (
                          <img
                            src={selectedCommunity.avatar_image}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <Users className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-12">
                    <h3 className="text-2xl font-bold mb-2">{selectedCommunity.name}</h3>
                    <p className="text-slate-400 mb-4">{selectedCommunity.description}</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedCommunity.topics?.map((topic, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm"
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* BASIC INFO */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Basic Information</h4>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Hash className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-400 text-sm w-24">Slug:</span>
                            <span className="text-white text-sm">{selectedCommunity.slug}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-400 text-sm w-24">Visibility:</span>
                            <span className="text-white text-sm capitalize">{selectedCommunity.visibility}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            {selectedCommunity.join_policy === "open" ? (
                              <Unlock className="w-4 h-4 text-slate-500" />
                            ) : (
                              <Lock className="w-4 h-4 text-slate-500" />
                            )}
                            <span className="text-slate-400 text-sm w-24">Join Policy:</span>
                            <span className="text-white text-sm capitalize">{selectedCommunity.join_policy}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-400 text-sm w-24">Created:</span>
                            <span className="text-white text-sm">{formatDate(selectedCommunity.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* LOCATION INFO */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Location</h4>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-400 text-sm w-24">Country:</span>
                            <span className="text-white text-sm">{selectedCommunity.country}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-400 text-sm w-24">State:</span>
                            <span className="text-white text-sm">{selectedCommunity.state}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-400 text-sm w-24">City:</span>
                            <span className="text-white text-sm">{selectedCommunity.city}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* STATISTICS */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                        <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{selectedCommunity.members_count}</div>
                        <div className="text-sm text-slate-400">Members</div>
                      </div>

                      <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                        <MessageSquare className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{selectedCommunity.posts_count}</div>
                        <div className="text-sm text-slate-400">Posts</div>
                      </div>

                      <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                        <Calendar className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{selectedCommunity.events_count}</div>
                        <div className="text-sm text-slate-400">Events</div>
                      </div>
                    </div>

                    {/* MEMBERS */}
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-white mb-3">Members</h4>
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        {selectedCommunity.members?.length > 0 ? (
                          <div className="space-y-2">
                            {selectedCommunity.members.map((member, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-slate-400" />
                                </div>
                                <span className="text-white text-sm">User ID: {member.user_id}</span>
                                <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs capitalize">
                                  {member.role}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 text-center py-4">No members found</p>
                        )}
                      </div>
                    </div>

                    {/* STATUS */}
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-white mb-3">Status</h4>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusStyle(
                            selectedCommunity.status.toUpperCase()
                          )}`}
                        >
                          {selectedCommunity.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE COMMUNITY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#001f3d] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Create New Community</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError("");
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Community Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#cb2926]"
                      placeholder="Enter community name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#cb2926]"
                      placeholder="Enter country"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#cb2926]"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#cb2926]"
                      placeholder="Enter state"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Visibility
                    </label>
                    <select
                      name="visibility"
                      value={formData.visibility}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#cb2926]"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Join Policy
                    </label>
                    <select
                      name="join_policy"
                      value={formData.join_policy}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#cb2926]"
                    >
                      <option value="open">Open</option>
                      <option value="approval">Approval Required</option>
                      <option value="invitation">Invitation Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#cb2926]"
                    placeholder="Enter community description"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Topics
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                      className="flex-1 bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#cb2926]"
                      placeholder="Add a topic"
                    />
                    <button
                      onClick={addTopic}
                      className="px-4 py-2 bg-[#cb2926] hover:bg-[#a71f1c] rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm flex items-center gap-1"
                      >
                        {topic}
                        <button
                          onClick={() => removeTopic(topic)}
                          className="text-blue-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Avatar Image URL
                    </label>
                    <input
                      type="text"
                      name="avatar_image"
                      value={formData.avatar_image}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#cb2926]"
                      placeholder="Enter avatar image URL"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Cover Image URL
                    </label>
                    <input
                      type="text"
                      name="cover_image"
                      value={formData.cover_image}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#cb2926]"
                      placeholder="Enter cover image URL"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError("");
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createCommunity}
                disabled={createLoading}
                className="px-4 py-2 bg-[#cb2926] hover:bg-[#a71f1c] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {createLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Community
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;