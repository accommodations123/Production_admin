// HostingApprovalPremium.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  UserGroupIcon,
  StarIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  XMarkIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  FunnelIcon,
  MapPinIcon,
  ClockIcon,
  CheckBadgeIcon,
  VideoCameraIcon,
  InformationCircleIcon,
  LinkIcon,
  HomeIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  UserIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  WifiIcon,
  DevicePhoneMobileIcon,
  AcademicCapIcon,
  BanknotesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HeartIcon,
  FlagIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolid,
  XCircleIcon as XCircleSolid,
  MapPinIcon as MapPinSolid,
} from "@heroicons/react/24/solid";

import AccomadationStats from "../pages/AccommodationPages/AccomadationStats";

const API = {
  PENDING: "https://api.nextkinlife.live/adminproperty/pending",
  APPROVED: "https://api.nextkinlife.live/adminproperty/admin/properties/approved",
  REJECTED: "https://api.nextkinlife.live/adminproperty/admin/properties/rejected",
  APPROVE: (id) => `https://api.nextkinlife.liveadminproperty/approve/${id}`,
  REJECT: (id) => `https://api.nextkinlife.live/adminproperty/reject/${id}`,
};

// --- UTILITIES ---
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// --- COMPONENTS ---
const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  icon: Icon,
  disabled = false,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent";

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
    icon: "p-2 rounded-full",
  };

  const variants = {
    primary: "text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200 focus:ring-indigo-500",
    secondary: "text-slate-700 bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-500 shadow-sm",
    danger: "text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-200 focus:ring-red-500",
    dangerGhost: "text-red-600 bg-red-50 hover:bg-red-100 focus:ring-red-500",
    ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
    successGhost: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 focus:ring-emerald-500",
    success: "text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-200 focus:ring-emerald-500",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, sizes[size], variants[variant], className)}
      {...props}
    >
      {Icon && <Icon className={cn(size === "icon" ? "h-5 w-5" : "h-4 w-4", children && "mr-2")} aria-hidden="true" />}
      {children}
    </button>
  );
};

const Badge = ({ status, type = "status", children }) => {
  const statusStyles = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    live: "bg-blue-50 text-blue-700 border-blue-200",
    draft: "bg-slate-50 text-slate-700 border-slate-200",
  };

  const typeStyles = {
    private: "bg-purple-50 text-purple-700 border-purple-200",
    shared: "bg-cyan-50 text-cyan-700 border-cyan-200",
    entire: "bg-indigo-50 text-indigo-700 border-indigo-200",
    house: "bg-amber-50 text-amber-700 border-amber-200",
    apartment: "bg-teal-50 text-teal-700 border-teal-200",
    villa: "bg-pink-50 text-pink-700 border-pink-200",
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
      type === "status" ? statusStyles[status] || statusStyles.pending : typeStyles[children] || "bg-slate-50 text-slate-700 border-slate-200"
    )}>
      {children || status}
    </span>
  );
};

const StatCard = ({ title, value, colorClass, icon: Icon, subtitle }) => (
  <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className={cn("rounded-xl p-4 text-white shadow-lg", colorClass)}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

const FeatureItem = ({ icon: Icon, label, value, color = "indigo" }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100">
    <div className={cn(
      "p-2 rounded-lg",
      color === "indigo" && "bg-indigo-50 text-indigo-600",
      color === "emerald" && "bg-emerald-50 text-emerald-600",
      color === "amber" && "bg-amber-50 text-amber-600",
      color === "rose" && "bg-rose-50 text-rose-600"
    )}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const HostingApproval = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modals
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [currentPropertyId, setCurrentPropertyId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [viewProperty, setViewProperty] = useState(null);
  const [viewDocument, setViewDocument] = useState(null);

  // Filters
  const [activeTab, setActiveTab] = useState("pending");
  const [searchText, setSearchText] = useState("");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // UI State
  const [imageError, setImageError] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeView, setActiveView] = useState("grid");
  const [actionInProgress, setActionInProgress] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const token = localStorage.getItem("admin-auth");

  // Normalize function (same as your original)
  const normalize = (item) => {
    const raw = item?.property || item;
    const owner = item?.owner || raw?.User || item?.owner || null;
    const rawId = raw?.id ?? raw?._id ?? raw?.property_id ?? null;
    const _id = rawId != null ? String(rawId) : Math.random().toString(36).slice(2, 9);

    const normalizeDocs = (docs) => {
      if (!Array.isArray(docs)) return [];
      return docs.map(doc => {
        if (typeof doc === 'string') {
          return {
            url: doc,
            name: doc.split('/').pop() || 'Document',
            type: doc.includes('.') ? doc.split('.').pop().toLowerCase() : 'unknown'
          };
        }
        if (!doc.url && doc.path) {
          return {
            ...doc,
            url: doc.path,
            name: doc.name || doc.path.split('/').pop() || 'Document',
            type: doc.type || (doc.path.includes('.') ? doc.path.split('.').pop().toLowerCase() : 'unknown')
          };
        }
        if (doc.url && !doc.name) {
          return {
            ...doc,
            name: doc.url.split('/').pop() || 'Document',
            type: doc.type || (doc.url.includes('.') ? doc.url.split('.').pop().toLowerCase() : 'unknown')
          };
        }
        return doc;
      });
    };

    return {
      _id,
      title: raw?.title || raw?.property_title || raw?.name || null,
      propertyType: raw?.property_type || raw?.propertyType || raw?.propertyTypeName || raw?.propertyType,
      categoryId: raw?.category_id || raw?.categoryId || null,
      privacyType: raw?.privacy_type || raw?.privacyType || null,
      guests: raw?.guests ?? raw?.guest_count ?? null,
      bedrooms: raw?.bedrooms ?? raw?.beds ?? null,
      bathrooms: raw?.bathrooms ?? raw?.baths ?? null,
      area: raw?.area ?? null,
      description: raw?.description ?? null,
      country: raw?.country ?? null,
      city: raw?.city ?? null,
      address: raw?.address ?? null,
      photos: Array.isArray(raw?.photos) ? raw.photos : (raw?.photos ? [raw.photos] : []),
      video: raw?.video ?? null,
      amenities: Array.isArray(raw?.amenities) ? raw.amenities : (raw?.amenities ? [raw.amenities] : []),
      rules: Array.isArray(raw?.rules) ? raw.rules : (raw?.rules ? [raw.rules] : []),
      legalDocs: normalizeDocs(raw?.legal_docs || raw?.legalDocs || []),
      pricePerNight: raw?.price_per_night ?? raw?.pricePerNight ?? raw?.price_per_hour ?? null,
      pricePerMonth: raw?.price_per_month ?? raw?.pricePerMonth ?? null,
      currency: raw?.currency ?? raw?.currency_code ?? "$",
      status: raw?.status ?? "pending",
      rejectionReason: raw?.rejection_reason ?? raw?.rejectionReason ?? null,
      createdAt: raw?.createdAt ?? raw?.created_at ?? null,
      updatedAt: raw?.updatedAt ?? raw?.updated_at ?? null,
      owner: {
        email: owner?.email ?? owner?.User?.email ?? null,
        phone: owner?.verification?.phone ?? owner?.phone ?? null,
        fullName: owner?.verification?.full_name ?? owner?.full_name ?? null,
      },
      raw,
    };
  };

  // Fetch all properties (pending, approved, rejected)
  useEffect(() => {
    let mounted = true;
    const fetchAllProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("admin-auth");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch all 3 endpoints concurrently
        const [pendingRes, approvedRes, rejectedRes] = await Promise.allSettled([
          axios.get(API.PENDING, { headers }),
          axios.get(API.APPROVED, { headers }),
          axios.get(API.REJECTED, { headers })
        ]);

        // Helper to extract data safely
        const extractData = (res) => {
          if (res.status === 'fulfilled') {
            const data = res.value?.data;
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.data)) return data.data;
            if (Array.isArray(data?.properties)) return data.properties;
            return [];
          }
          console.error("Fetch failed:", res.reason);
          return [];
        };

        const pendingList = extractData(pendingRes).map(item => ({ ...item, status: 'pending' }));
        const approvedList = extractData(approvedRes).map(item => ({ ...item, status: 'approved' }));
        const rejectedList = extractData(rejectedRes).map(item => ({ ...item, status: 'rejected' }));

        // Merge all lists
        // Note: We map status manually because the API might not return it or might return something else
        const allRawProperties = [...pendingList, ...approvedList, ...rejectedList];
        const normalized = allRawProperties.map(normalize);

        if (mounted) {
          setProperties(normalized);
          setStats({
            total: normalized.length,
            pending: normalized.filter(p => p.status === "pending").length,
            approved: normalized.filter(p => p.status === "approved").length,
            rejected: normalized.filter(p => p.status === "rejected").length
          });
        }
      } catch (err) {
        console.error("Fetch properties error:", err);
        if (mounted) setError("Failed to fetch properties.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAllProperties();
    return () => (mounted = false);
  }, [refreshKey]);

  // Filter logic
  useEffect(() => {
    let filtered = [...properties];

    if (activeTab !== "all") {
      filtered = filtered.filter(p => p.status === activeTab);
    }

    if (propertyTypeFilter !== "all") {
      filtered = filtered.filter(p => {
        const type = p.propertyType?.toLowerCase() || "";
        return type === propertyTypeFilter.toLowerCase();
      });
    }

    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter(p => {
        const title = p.title?.toLowerCase() || "";
        const type = p.propertyType?.toLowerCase() || "";
        const city = p.city?.toLowerCase() || "";
        const country = p.country?.toLowerCase() || "";
        const ownerName = p.owner?.fullName?.toLowerCase() || "";
        const ownerEmail = p.owner?.email?.toLowerCase() || "";
        return title.includes(lowerSearch) || type.includes(lowerSearch) ||
          city.includes(lowerSearch) || country.includes(lowerSearch) ||
          ownerName.includes(lowerSearch) || ownerEmail.includes(lowerSearch);
      });
    }

    setFilteredProperties(filtered);
  }, [properties, activeTab, propertyTypeFilter, searchText, dateRange]);

  // Actions
  const handleApprove = async (id) => {
    if (actionInProgress || !token) return;
    setActionInProgress(true);
    try {
      await axios.put(API.APPROVE(id), {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local state
      setProperties(prev => prev.map(p =>
        p._id === String(id) ? { ...p, status: 'approved' } : p
      ));

      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        approved: prev.approved + 1
      }));

      // Show success notification
      const property = properties.find(p => p._id === String(id));
      showToast(`"${property?.title || 'Property'}" has been approved`, 'success');

    } catch (err) {
      console.error("Approval error:", err);
      showToast("Failed to approve property", 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRejectClick = (id) => {
    setCurrentPropertyId(id);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (actionInProgress || !rejectionReason.trim() || !token || !currentPropertyId) return;
    setActionInProgress(true);

    try {
      await axios.put(API.REJECT(currentPropertyId), {
        reason: rejectionReason.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local state
      setProperties(prev => prev.map(p =>
        p._id === String(currentPropertyId) ? {
          ...p,
          status: 'rejected',
          rejectionReason: rejectionReason.trim()
        } : p
      ));

      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        rejected: prev.rejected + 1
      }));

      // Show success notification
      const property = properties.find(p => p._id === String(currentPropertyId));
      showToast(`"${property?.title || 'Property'}" has been rejected`, 'error');

      // Close modal
      setRejectModalOpen(false);
      setRejectionReason("");
      setCurrentPropertyId(null);

    } catch (err) {
      console.error("Rejection error:", err);
      showToast("Failed to reject property", 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDelete = async (id) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) return;

    try {
      // Note: You'll need to add a delete endpoint in your API
      // For now, we'll just remove it from the local state
      setProperties(prev => prev.filter(p => p._id !== String(id)));
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        total: prev.total - 1
      }));
      showToast("Property removed", 'info');
    } catch (err) {
      console.error("Deletion error:", err);
      showToast("Failed to delete property", 'error');
    }
  };

  const handleView = (property) => {
    setViewProperty(property);
    setViewModalOpen(true);
  };

  const handleViewDocument = (doc) => {
    setViewDocument(doc);
    setDocumentModalOpen(true);
  };

  const showToast = (message, type = 'info') => {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = cn(
      'fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl text-white max-w-sm animate-slide-in',
      type === 'success' && 'bg-gradient-to-r from-emerald-600 to-green-600',
      type === 'error' && 'bg-gradient-to-r from-red-600 to-rose-600',
      type === 'info' && 'bg-gradient-to-r from-indigo-600 to-violet-600'
    );
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        ${type === 'success' ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>' : ''}
        ${type === 'error' ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>' : ''}
        <span class="font-medium">${message}</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const getPropertyTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'house': return HomeIcon;
      case 'apartment': return BuildingOfficeIcon;
      case 'villa': return BuildingOffice2Icon;
      default: return HomeIcon;
    }
  };

  // const PropertyTypeIcon = ({ type, className = "h-5 w-5" }) => {
  //   const Icon = getPropertyTypeIcon(type);
  //   return <Icon className={className} />;
  // };

  // Get unique property types for filter
  const propertyTypes = Array.from(new Set(properties.map(p => p.propertyType).filter(Boolean)));

  // Property Card Component
  // Replace the existing PropertyCard component with this version

  const PropertyCard = ({ property }) => {
    const PropertyIcon = getPropertyTypeIcon(property.propertyType);
    const hasError = imageError[property._id];
    const mainPhoto = property.photos?.[0];

    return (
      <div className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] ring-1 ring-slate-900/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative h-52 w-full bg-gradient-to-br from-slate-100 to-slate-200">
          {mainPhoto && !hasError ? (
            <img
              src={mainPhoto}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={() => setImageError(p => ({ ...p, [property._id]: true }))}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
              <PropertyIcon className="h-12 w-12 text-slate-300" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            <span className="inline-flex items-center rounded-lg bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm ring-1 ring-slate-900/5">
              {property.status}
            </span>
          </div>

          {/* Type Label (Bottom Left) */}
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center rounded-lg bg-black/40 backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg border border-white/10">
              {property.propertyType || 'APARTMENT entire place'}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-5">

          {/* Title & Location Block */}
          <div className="mb-4">
            <h3 className="mb-1 truncate text-lg font-bold text-slate-900 leading-tight tracking-tight">
              {property.title || `${property.propertyType} in ${property.city}`}
            </h3>
            <div className="flex items-start gap-1.5 text-sm font-medium text-slate-500">
              <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-400" />
              <span className="line-clamp-1">
                {property.city}, {property.country}
              </span>
            </div>
          </div>

          {/* Vertical Specs Grid */}
          <div className="mb-5 grid grid-cols-2 gap-y-3 gap-x-2 border-t border-slate-100 pt-4">
            {/* Guests */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Guests</span>
              <span className="text-sm font-bold text-slate-900">{property.guests || 0}</span>
            </div>
            {/* Bedrooms */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Bedrooms</span>
              <span className="text-sm font-bold text-slate-900">{property.bedrooms || 0}</span>
            </div>
            {/* Bathrooms */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Bathrooms</span>
              <span className="text-sm font-bold text-slate-900">{property.bathrooms || 0}</span>
            </div>
            {/* Area */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Area</span>
              <span className="text-sm font-bold text-slate-900">{property.area || 0} sqft</span>
            </div>
          </div>

          {/* Owner Block */}
          {property.owner?.fullName && (
            <div className="mb-auto mt-2 flex items-center gap-2.5 rounded-lg bg-slate-50 p-2.5">
              {/* Initials Avatar */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                {property.owner.fullName.charAt(0)}
              </div>
              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Owner</p>
                <p className="truncate text-xs font-bold text-slate-900">{property.owner.fullName}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-5 flex items-center justify-between gap-2 pt-4 border-t border-slate-100">
            <div className="flex gap-1">
              <button
                onClick={() => handleView(property)}
                className="rounded-xl bg-slate-100 p-2 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-800"
                title="View Details"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
            </div>

            {property.status === "pending" && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleRejectClick(property._id)}
                  disabled={actionInProgress}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <XCircleIcon className="h-3.5 w-3.5" />
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(property._id)}
                  disabled={actionInProgress}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg disabled:opacity-50"
                >
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  Approve
                </button>
              </div>
            )}

            {property.status === "approved" && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <CheckCircleIcon className="h-3.5 w-3.5" />
                Approved
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const PropertyListItem = ({ property }) => {
    const PropertyIcon = getPropertyTypeIcon(property.propertyType);
    const hasError = imageError[`list-${property._id}`];
    const mainPhoto = property.photos?.[0];

    return (
      <li className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] ring-1 ring-slate-100 transition-all hover:shadow-md sm:flex-row">
        <div className="relative h-48 w-full flex-shrink-0 bg-slate-100 sm:h-auto sm:w-56">
          {mainPhoto && !hasError ? (
            <img
              src={mainPhoto}
              alt={property.title}
              className="h-full w-full object-cover"
              onError={() => setImageError(p => ({ ...p, [`list-${property._id}`]: true }))}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-50">
              <PropertyIcon className="h-12 w-12 text-slate-300" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge status={property.status} />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Badge type="propertyType">{property.propertyType}</Badge>
                {property.privacyType && (
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                    {property.privacyType}
                  </span>
                )}
              </div>
              <h3 className="truncate text-xl font-bold text-slate-900 mb-1">{property.title}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                <MapPinIcon className="h-4 w-4" />
                <span>{[property.city, property.country].filter(Boolean).join(', ')}</span>
              </div>

              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.guests && (
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{property.guests} guests</span>
                  </div>
                )}
                {property.bedrooms && (
                  <div className="flex items-center gap-2">
                    <HomeIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{property.bedrooms} beds</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-2">
                    <BanknotesIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{property.bathrooms} baths</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-900">{property.currency}{property.pricePerNight}/night</span>
                </div>
              </div>

              {property.owner?.email && (
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <UserIcon className="h-4 w-4" />
                  <span>Owner: {property.owner.fullName || property.owner.email}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 sm:mt-0">
              <Button variant="ghost" size="icon" onClick={() => handleView(property)}>
                <EyeIcon className="h-5 w-5" />
              </Button>
              {property.status === "pending" && (
                <>
                  <Button variant="successGhost" size="icon" onClick={() => handleApprove(property._id)} disabled={actionInProgress}>
                    <CheckCircleIcon className="h-5 w-5" />
                  </Button>
                  <Button variant="dangerGhost" size="icon" onClick={() => handleRejectClick(property._id)} disabled={actionInProgress}>
                    <XCircleIcon className="h-5 w-5" />
                  </Button>
                </>
              )}
              <Button variant="dangerGhost" size="icon" onClick={() => handleDelete(property._id)}>
                <TrashIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </li>
    );
  };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-8 flex flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" role="status" aria-label="Loading"></div>
        <p className="mt-4 text-sm font-medium text-slate-600">Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-8 flex flex-col items-center justify-center">
        <div className="rounded-2xl bg-white p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationCircleIcon className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Properties</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Button onClick={() => setRefreshKey(prev => prev + 1)} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}


        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Pending Review"
            value={stats.pending}
            colorClass="bg-amber-500"
            icon={ClockIcon}
            subtitle="Waiting for approval"
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            colorClass="bg-emerald-500"
            icon={CheckCircleIcon}
            subtitle="Live properties"
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            colorClass="bg-rose-500"
            icon={XCircleIcon}
            subtitle="Not approved"
          />
          <StatCard
            title="Total"
            value={stats.total}
            colorClass="bg-indigo-600"
            icon={HomeIcon}
            subtitle="All properties"
          />
        </div>

        {/* Main Content */}
        <main className="bg-white rounded-[2rem]  border border-slate-100 overflow-hidden">
          {/* Filters */}
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                {/* Search */}
                <div className="relative w-full max-w-lg group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    className="block w-full rounded-2xl border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                    placeholder="Search properties, locations, owners..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select
                    className="flex-1 sm:flex-none block rounded-2xl border-slate-200 bg-white py-3 pl-4 pr-10 text-sm text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                    value={propertyTypeFilter}
                    onChange={(e) => setPropertyTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>

                  <select
                    className="flex-1 sm:flex-none block rounded-2xl border-slate-200 bg-white py-3 pl-4 pr-10 text-sm text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center justify-end gap-3">
                <div className="hidden sm:flex items-center bg-slate-100 rounded-2xl p-1">
                  <button
                    onClick={() => setActiveView("grid")}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      activeView === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveView("list")}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      activeView === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Property List */}
          <div className="p-8">
            {filteredProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed  py-16 text-center">
                <HomeIcon className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-sm font-semibold text-slate-900">No properties found</h3>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search criteria.</p>
              </div>
            ) : activeView === "grid" ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProperties.map(property => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            ) : (
              <ul className="space-y-6">
                {filteredProperties.map(property => (
                  <PropertyListItem key={property._id} property={property} />
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>

      {/* --- MODALS --- */}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setRejectModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            <div className="relative inline-block w-full max-w-lg transform overflow-hidden rounded-3xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:align-middle">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-50 sm:mx-0 sm:h-10 sm:w-10">
                    <XCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-semibold leading-6 text-slate-900" id="modal-title">
                      Reject Property
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-500 mb-4">
                        Please provide a reason for rejecting this property. This will be visible to the host.
                      </p>
                      <textarea
                        rows={4}
                        className="block w-full rounded-2xl border-0 bg-slate-50 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter reason for rejection..."
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-4 py-4 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                <Button
                  variant="danger"
                  onClick={handleRejectConfirm}
                  disabled={!rejectionReason.trim() || actionInProgress}
                >
                  Reject Property
                </Button>
                <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewModalOpen && viewProperty && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm transition-opacity" onClick={() => setViewModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            <div className="relative inline-block w-full max-w-7xl transform overflow-hidden rounded-[2rem] bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:align-middle">

              {/* Close Button */}
              <button
                onClick={() => setViewModalOpen(false)}
                className="absolute top-6 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-white hover:bg-black/20 backdrop-blur-md transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] overflow-y-auto">

                {/* Left: Images & Details */}
                <div className="lg:col-span-8 bg-slate-50">
                  {/* Gallery */}
                  <div className="relative h-80 lg:h-96 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                    {viewProperty.photos?.[0] ? (
                      <img
                        src={viewProperty.photos[0]}
                        alt={viewProperty.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <HomeIcon className="h-20 w-20 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-20">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <Badge status={viewProperty.status} />
                        <Badge type="propertyType">{viewProperty.propertyType}</Badge>
                        {viewProperty.privacyType && (
                          <span className="text-xs font-bold text-white uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                            {viewProperty.privacyType}
                          </span>
                        )}
                      </div>
                      <h2 className="text-3xl font-bold text-white">{viewProperty.title}</h2>
                      <div className="flex items-center gap-2 mt-2 text-white/90">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{[viewProperty.address, viewProperty.city, viewProperty.country].filter(Boolean).join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Photos */}
                  {viewProperty.photos && viewProperty.photos.length > 1 && (
                    <div className="p-6">
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Property Photos</h4>
                      <div className="grid grid-cols-4 gap-3">
                        {viewProperty.photos.slice(1).map((photo, i) => (
                          <img
                            key={i}
                            src={photo}
                            className="h-24 w-full rounded-xl object-cover shadow-sm border border-slate-200"
                            alt={`Property ${i + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="p-6">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Description</h4>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                      {viewProperty.description || "No description provided."}
                    </p>
                  </div>

                  {/* Amenities */}
                  {viewProperty.amenities && viewProperty.amenities.length > 0 && (
                    <div className="p-6 border-t border-slate-100">
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Amenities</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {viewProperty.amenities.map((amenity, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                            {amenity}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Property Info & Actions */}
                <div className="lg:col-span-4 bg-white p-6 border-l border-slate-100">
                  {/* Owner Info */}
                  {viewProperty.owner && (
                    <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Owner Information</h4>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                          {viewProperty.owner.fullName?.[0] || viewProperty.owner.email?.[0] || 'O'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{viewProperty.owner.fullName || 'Property Owner'}</p>
                          <p className="text-sm text-slate-500 truncate">{viewProperty.owner.email}</p>
                          {viewProperty.owner.phone && (
                            <p className="text-sm text-slate-500">{viewProperty.owner.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Property Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate-500">Guests</p>
                      <p className="text-2xl font-bold text-slate-900">{viewProperty.guests || 0}</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate-500">Bedrooms</p>
                      <p className="text-2xl font-bold text-slate-900">{viewProperty.bedrooms || 0}</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate-500">Bathrooms</p>
                      <p className="text-2xl font-bold text-slate-900">{viewProperty.bathrooms || 0}</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate-500">Area</p>
                      <p className="text-2xl font-bold text-slate-900">{viewProperty.area || 0} sq ft</p>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-4 mb-6">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Pricing</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Nightly Rate</span>
                        <span className="text-2xl font-bold text-slate-900">
                          {viewProperty.currency}{viewProperty.pricePerNight}
                        </span>
                      </div>
                      {viewProperty.pricePerMonth && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Monthly Rate</span>
                          <span className="text-lg font-semibold text-slate-900">
                            {viewProperty.currency}{viewProperty.pricePerMonth}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Legal Documents */}
                  {viewProperty.legalDocs && viewProperty.legalDocs.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Legal Documents</h4>
                      <div className="space-y-2">
                        {viewProperty.legalDocs.map((doc, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleViewDocument(doc)}
                            className="w-full flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <DocumentTextIcon className="h-5 w-5 text-indigo-500" />
                              <div className="text-left">
                                <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                                <p className="text-xs text-slate-500">{doc.type?.toUpperCase()}</p>
                              </div>
                            </div>
                            <EyeIcon className="h-4 w-4 text-slate-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-3 pt-6 border-t border-slate-100">
                    {viewProperty.status === "pending" ? (
                      <>
                        <Button
                          className="w-full"
                          size="lg"
                          icon={CheckCircleIcon}
                          onClick={() => { handleApprove(viewProperty._id); setViewModalOpen(false); }}
                          disabled={actionInProgress}
                        >
                          Approve Property
                        </Button>
                        <Button
                          variant="dangerGhost"
                          className="w-full"
                          size="lg"
                          icon={XCircleIcon}
                          onClick={() => { handleRejectClick(viewProperty._id); setViewModalOpen(false); }}
                          disabled={actionInProgress}
                        >
                          Reject Property
                        </Button>
                      </>
                    ) : viewProperty.status === "approved" ? (
                      <Button variant="success" className="w-full" size="lg" icon={CheckCircleIcon} disabled>
                        Already Approved
                      </Button>
                    ) : (
                      <div className="rounded-xl bg-rose-50 p-4 mb-3">
                        <h4 className="text-sm font-bold text-rose-800 mb-1">Rejection Reason</h4>
                        <p className="text-sm text-rose-700">{viewProperty.rejectionReason}</p>
                      </div>
                    )}
                    <Button variant="secondary" className="w-full" size="lg" onClick={() => setViewModalOpen(false)}>
                      Close Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {documentModalOpen && viewDocument && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm transition-opacity" onClick={() => setDocumentModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            <div className="relative inline-block w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:align-middle">
              <div className="bg-white p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="h-8 w-8 text-indigo-600" />
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{viewDocument.name}</h3>
                      <p className="text-sm text-slate-500">{viewDocument.type?.toUpperCase()} Document</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDocumentModalOpen(false)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  {viewDocument.url ? (
                    <iframe
                      src={viewDocument.url}
                      className="w-full h-[500px]"
                      title={viewDocument.name}
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center bg-slate-50">
                      <p className="text-slate-400">No document content available</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="secondary" onClick={() => setDocumentModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostingApproval;