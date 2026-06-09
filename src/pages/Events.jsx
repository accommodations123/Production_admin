import React, { useEffect, useState } from "react";
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
  MapPinIcon as MapPinSolid, // Solid variant for emphasis
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolid,
  XCircleIcon as XCircleSolid,
} from "@heroicons/react/24/solid";
import moment from "moment";

const API_BASE = "https://api.nextkinlife.live";

// --- UTILITIES ---
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Currency mapping based on country
const getCurrencySymbol = (country) => {
  if (!country) return '$'; // Default to USD if no country is specified

  const countryLower = country.toLowerCase();

  // Map countries to their currency symbols
  const currencyMap = {
    'united states': '$',
    'usa': '$',
    'canada': 'C$',
    'united kingdom': '£',
    'uk': '£',
    'europe': '€',
    'germany': '€',
    'france': '€',
    'italy': '€',
    'spain': '€',
    'netherlands': '€',
    'belgium': '€',
    'austria': '€',
    'portugal': '€',
    'ireland': '€',
    'finland': '€',
    'greece': '€',
    'japan': '¥',
    'china': '¥',
    'india': '₹',
    'australia': 'A$',
    'new zealand': 'NZ$',
    'mexico': '$',
    'brazil': 'R$',
    'russia': '₽',
    'south korea': '₩',
    'switzerland': 'CHF',
    'sweden': 'kr',
    'norway': 'kr',
    'denmark': 'kr',
    'poland': 'zł',
    'turkey': '₺',
    'south africa': 'R',
    'singapore': 'S$',
    'hong kong': 'HK$',
    'israel': '₪',
    'uae': 'د.إ',
    'saudi arabia': '﷼',
    'thailand': '฿',
    'malaysia': 'RM',
    'philippines': '₱',
    'indonesia': 'Rp',
    'argentina': '$',
    'chile': '$',
    'colombia': '$',
    'peru': 'S/',
    'egypt': 'E£',
    'nigeria': '₦',
    'kenya': 'KSh',
    'pakistan': '₨',
    'bangladesh': '৳',
    'sri lanka': 'Rs',
    'vietnam': '₫',
    'czech republic': 'Kč',
    'hungary': 'Ft',
    'romania': 'lei',
  };

  return currencyMap[countryLower] || '$'; // Default to USD if country not found
};

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
    icon: "p-2 rounded-full",
  };

  const variants = {
    primary: "text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200 focus:ring-indigo-500",
    secondary: "text-slate-700 bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-500 shadow-sm",
    danger: "text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 focus:ring-red-500",
    dangerGhost: "text-red-600 bg-red-50 hover:bg-red-100 focus:ring-red-500",
    ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
    successGhost: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 focus:ring-emerald-500",
    virtual: "text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200",
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

const Badge = ({ status, mode }) => {
  const statusStyles = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    all: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const modeStyles = {
    offline: "bg-slate-100 text-slate-600 border-slate-200",
    online: "bg-purple-50 text-purple-700 border-purple-200",
    hybrid: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div className="flex gap-2">
      {mode && (
        <span className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors",
          modeStyles[mode] || modeStyles.offline
        )}>
          {mode}
        </span>
      )}
      <span className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
        statusStyles[status] || statusStyles.all
      )}>
        {status}
      </span>
    </div>
  );
};

// --- MAIN COMPONENT ---

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [viewEvent, setViewEvent] = useState(null);

  // Filters
  const [activeTab, setActiveTab] = useState("pending");
  const [searchText, setSearchText] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // UI State
  const [imageError, setImageError] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeView, setActiveView] = useState("grid");

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const token = localStorage.getItem("admin-auth");

  // --- DATA FETCHING ---
  // --- DATA FETCHING ---
  const fetchEvents = async () => {
    setLoading(true);
    if (!token) {
      console.error("Token missing");
      setLoading(false);
      return;
    }
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        fetch(`${API_BASE}/events/admin/pending`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }),
        fetch(`${API_BASE}/events/admin/events/approved`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }),
        fetch(`${API_BASE}/events/admin/events/rejected`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        })
      ]);

      const [pendingData, approvedData, rejectedData] = await Promise.all([
        pendingRes.json(),
        approvedRes.json(),
        rejectedRes.json()
      ]);

      const pendingEvents = Array.isArray(pendingData) ? pendingData : (Array.isArray(pendingData.events) ? pendingData.events : []);
      const approvedEvents = Array.isArray(approvedData.events) ? approvedData.events : [];
      const rejectedEvents = Array.isArray(rejectedData.events) ? rejectedData.events : [];

      // Add status property if missing (API might not return it for approved/rejected endpoints)
      const formattedApproved = approvedEvents.map(e => ({ ...e, status: 'approved' }));
      const formattedRejected = rejectedEvents.map(e => ({ ...e, status: 'rejected' }));
      // Pending usually has status, but ensure it
      const formattedPending = pendingEvents.map(e => ({ ...e, status: 'pending' }));

      setEvents([...formattedPending, ...formattedApproved, ...formattedRejected]);
    } catch (err) {
      console.error("Failed to fetch events", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    if (!token) {
      setLoadingReviews(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/events/reviews/admin/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchReviews();
  }, [refreshKey]);

  // --- FILTERING LOGIC ---
  useEffect(() => {
    let filtered = [...events];

    if (activeTab !== "all") {
      filtered = filtered.filter(e => e.status === activeTab);
    }

    if (eventTypeFilter !== "all") {
      filtered = filtered.filter(e => {
        const type = e.type?.toLowerCase() || "";
        return type === eventTypeFilter.toLowerCase();
      });
    }

    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter(e => {
        const title = e.title?.toLowerCase() || "";
        const type = e.type?.toLowerCase() || "";
        const hostName = e.Host?.full_name?.toLowerCase() || "";
        return title.includes(lowerSearch) || type.includes(lowerSearch) || hostName.includes(lowerSearch);
      });
    }

    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(event => {
        if (!event.start_date) return false;
        const eventStartDate = moment(event.start_date);
        return eventStartDate.isBetween(moment(dateRange.start), moment(dateRange.end), 'day', '[]');
      });
    }

    setFilteredEvents(filtered);
  }, [events, activeTab, eventTypeFilter, searchText, dateRange]);

  // --- ACTIONS ---
  const handleApprove = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/events/admin/approve/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === id ? { ...event, status: 'approved' } : event
          )
        );
        setRefreshKey(prev => prev + 1);
      }
    } catch (err) {
      console.error("Approval error:", err);
    }
  };

  const handleRejectClick = (id) => {
    setCurrentEventId(id);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim() || !token) return;

    try {
      const res = await fetch(`${API_BASE}/events/admin/reject/${currentEventId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ rejection_reason: rejectionReason }),
      });

      if (res.ok) {
        setRejectModalOpen(false);
        setRejectionReason("");
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === currentEventId ? { ...event, status: 'rejected', rejection_reason: rejectionReason } : event
          )
        );
        setRefreshKey(prev => prev + 1);
      }
    } catch (err) {
      console.error("Rejection error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

    try {
      const res = await fetch(`${API_BASE}/events/admin/delete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
        setRefreshKey(prev => prev + 1);
      }
    } catch (err) {
      console.error("Deletion error:", err);
    }
  };

  const handleView = (event) => {
    setViewEvent(event);
    setViewModalOpen(true);
  };

  // --- HELPERS ---
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${API_BASE}/${cleanPath}`;
  };

  const getStatusCount = (status) => {
    if (status === "all") return events.length;
    return events.filter(e => e.status === status).length;
  };

  // --- SUB-COMPONENTS ---

  const StatCard = ({ title, value, colorClass, icon: Icon }) => (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={cn("rounded-xl p-4 text-white shadow-lg", colorClass)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  const EventCard = ({ event }) => {
    const bannerUrl = getImageUrl(event.banner_image);
    const hasError = imageError[event.id];
    const isOnline = event.event_mode === 'online';
    const isHybrid = event.event_mode === 'hybrid';
    const currencySymbol = getCurrencySymbol(event.country);

    return (
      <div className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="relative h-48 w-full bg-slate-200">
          {bannerUrl && !hasError ? (
            <img
              src={bannerUrl}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageError(p => ({ ...p, [event.id]: true }))}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
              <PhotoIcon className="h-10 w-10 text-slate-300" />
            </div>
          )}
          <div className="absolute top-4 right-4">
            <Badge status={event.status} />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex justify-between items-start">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{event.type || 'Event'}</p>
            <span className="text-lg font-bold text-slate-900">{currencySymbol}{event.price || 0}</span>
          </div>

          <h3 className="mb-2 truncate text-xl font-bold text-slate-900 leading-tight">{event.title}</h3>

          <div className="mb-4 space-y-2">
            <div className="flex items-center text-sm text-slate-500">
              <UserGroupIcon className="mr-1.5 h-4 w-4 text-indigo-500" />
              <span className="truncate">Host: {event.Host?.full_name || 'Unknown'}</span>
            </div>
            <div className="flex items-center text-sm text-slate-500">
              {isOnline || isHybrid ? (
                <><VideoCameraIcon className="mr-1.5 h-4 w-4 text-purple-500" /><span className="truncate">{isHybrid ? 'Hybrid Event' : 'Online Event'}</span></>
              ) : (
                <><MapPinIcon className="mr-1.5 h-4 w-4 text-slate-400" /><span className="truncate">{event.venue_name || 'TBD'}</span></>
              )}
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between text-sm font-medium text-slate-900 border-t border-slate-50 pt-3">
              <span className="flex items-center text-slate-500 font-normal">
                <CalendarIcon className="mr-1.5 h-4 w-4" />
                {moment(event.start_date).format('MMM DD')}
              </span>
              <span className="flex items-center text-slate-400">
                <CheckBadgeIcon className="mr-1 h-4 w-4" />
                {event.attendees_count || 0}
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="flex space-x-1">
                <button onClick={() => handleView(event)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-colors" title="View">
                  <EyeIcon className="h-5 w-5" />
                </button>
                {event.status === "pending" && (
                  <>
                    <button onClick={() => handleApprove(event.id)} className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors" title="Approve">
                      <CheckCircleIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleRejectClick(event.id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors" title="Reject">
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
              <button onClick={() => handleDelete(event.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EventListItem = ({ event }) => {
    const bannerUrl = getImageUrl(event.banner_image);
    const hasError = imageError[event.id];
    const isOnline = event.event_mode === 'online';
    const isHybrid = event.event_mode === 'hybrid';
    const currencySymbol = getCurrencySymbol(event.country);

    return (
      <li className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] ring-1 ring-slate-100 transition-all hover:shadow-md sm:flex-row">
        <div className="relative h-48 w-full flex-shrink-0 bg-slate-100 sm:h-auto sm:w-56">
          {bannerUrl && !hasError ? (
            <img
              src={bannerUrl}
              alt={event.title}
              className="h-full w-full object-cover"
              onError={() => setImageError(p => ({ ...p, [event.id]: true }))}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-50">
              <PhotoIcon className="h-10 w-10 text-slate-300" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Badge status={event.status} />
                <span className="text-xs font-bold uppercase text-indigo-600 tracking-wide">{event.type}</span>
                {event.event_mode && <span className="text-[10px] font-bold uppercase text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full">{event.event_mode}</span>}
              </div>
              <h3 className="truncate text-xl font-bold text-slate-900">{event.title}</h3>
              <p className="text-sm text-slate-500 truncate mt-1">by {event.Host?.full_name || 'Unknown Host'}</p>

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                <span className="flex items-center">
                  <CalendarIcon className="mr-1.5 h-4 w-4 text-slate-400" />
                  {moment(event.start_date).format('MMMM DD, YYYY')}
                </span>
                <span className="flex items-center font-semibold text-slate-900">
                  <CurrencyDollarIcon className="mr-1.5 h-4 w-4 text-slate-400" />
                  {currencySymbol}{event.price || 0}
                </span>
                <span className="flex items-center">
                  <UserGroupIcon className="mr-1.5 h-4 w-4 text-slate-400" />
                  {event.attendees_count || 0}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 sm:mt-0">
              <Button variant="ghost" size="icon" onClick={() => handleView(event)}><EyeIcon className="h-5 w-5" /></Button>
              {event.status === "pending" && (
                <>
                  <Button variant="successGhost" size="icon" onClick={() => handleApprove(event.id)}><CheckCircleIcon className="h-5 w-5" /></Button>
                  <Button variant="dangerGhost" size="icon" onClick={() => handleRejectClick(event.id)}><XCircleIcon className="h-5 w-5" /></Button>
                </>
              )}
              <Button variant="dangerGhost" size="icon" onClick={() => handleDelete(event.id)}><TrashIcon className="h-5 w-5" /></Button>
            </div>
          </div>
        </div>
      </li>
    );
  };

  const ScheduleTimeline = ({ schedule }) => {
    if (!schedule || schedule.length === 0) return null;
    return (
      <div className="space-y-4 relative pl-6 border-l-2 border-slate-100">
        {schedule.map((item, idx) => (
          <div key={idx} className="relative">
            <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full bg-white border-2 border-indigo-500"></div>
            <p className="text-xs font-bold text-indigo-600 mb-0.5">{item.time}</p>
            <p className="text-sm font-medium text-slate-900">{item.title}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans">

      <div className="mx-auto max-w-7xl space-y-8">

        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Pending"
            value={getStatusCount("pending")}
            colorClass="bg-amber-500"
            icon={FunnelIcon}
          />
          <StatCard
            title="Approved"
            value={getStatusCount("approved")}
            colorClass="bg-emerald-500"
            icon={CheckCircleIcon}
          />
          <StatCard
            title="Total Events"
            value={events.length}
            colorClass="bg-indigo-600"
            icon={PhotoIcon}
          />
        </div>

        {/* Main Content Container */}
        <main className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">

          {/* Filters */}
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative w-full max-w-lg group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    className="block w-full rounded-2xl border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                    placeholder="Search events, hosts..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select
                    className="flex-1 sm:flex-none block rounded-2xl border-slate-200 bg-white py-3 pl-4 pr-10 text-sm text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                    value={eventTypeFilter}
                    onChange={(e) => setEventTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="meetup">Meetup</option>
                    <option value="festival">Festival</option>
                    <option value="party">Party</option>
                    <option value="conference">Conference</option>
                  </select>

                  <input
                    type="date"
                    className="flex-1 sm:flex-none block w-full rounded-2xl border-slate-200 bg-white py-3 pl-4 pr-4 text-sm text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <div className="hidden sm:flex items-center bg-slate-100 rounded-2xl p-1">
                  <button
                    onClick={() => setActiveView("grid")}
                    className={cn("p-2 rounded-xl transition-all", activeView === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  </button>
                  <button
                    onClick={() => setActiveView("list")}
                    className={cn("p-2 rounded-xl transition-all", activeView === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </button>
                </div>
                <Button variant="secondary" size="icon" onClick={() => setRefreshKey(prev => prev + 1)} title="Refresh">
                  <ArrowPathIcon className={cn("h-5 w-5", loading && "animate-spin")} />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-100 px-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {['pending', 'approved', 'rejected'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "whitespace-nowrap border-b-2 py-5 text-sm font-semibold transition-colors",
                    activeTab === tab
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} ({getStatusCount(tab)})
                </button>
              ))}
            </nav>
          </div>

          {/* Event List */}
          <div className="p-8">
            {loading ? (
              <div className="flex h-80 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" role="status" aria-label="Loading"></div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 py-16 text-center">
                <PhotoIcon className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-sm font-semibold text-slate-900">No events found</h3>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your filters.</p>
              </div>
            ) : activeView === "grid" ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <ul className="space-y-6">
                {filteredEvents.map(event => (
                  <EventListItem key={event.id} event={event} />
                ))}
              </ul>
            )}
          </div>
        </main>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <section className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                  <ChatBubbleLeftRightIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Recent Reviews</h3>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {reviews.length}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => fetchReviews()}>Reload</Button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-start space-x-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-sm shadow-md shadow-indigo-200">
                      {review.userName?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{review.userName || 'Anonymous'}</h4>
                        <div className="flex items-center space-x-0.5">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={cn("h-3.5 w-3.5", i < (review.rating || 0) ? "text-amber-400" : "text-slate-300")}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">{moment(review.createdAt).format('MMM DD, YYYY')}</p>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
                      Reject Event
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-500 mb-4">
                        Please provide a reason for rejecting this event. This will be visible to creator.
                      </p>
                      <textarea
                        rows={4}
                        className="block w-full rounded-2xl border-0 bg-slate-50 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter reason..."
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-4 py-4 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                <Button variant="danger" onClick={handleRejectConfirm} disabled={!rejectionReason.trim()}>Reject Event</Button>
                <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewModalOpen && viewEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm transition-opacity" onClick={() => setViewModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            <div className="relative inline-block w-full max-w-7xl transform overflow-hidden rounded-[2rem] bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:align-middle">

              {/* Close Button */}
              <button onClick={() => setViewModalOpen(false)} className="absolute top-6 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-white hover:bg-black/20 backdrop-blur-md transition-colors">
                <XMarkIcon className="h-6 w-6" />
              </button>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12">

                {/* Left: Images & Media */}
                <div className="lg:col-span-7 bg-slate-50">
                  <div className="relative h-64 lg:h-80 overflow-hidden">
                    {getImageUrl(viewEvent.banner_image) && !imageError[`view-${viewEvent.id}`] ? (
                      <img
                        src={getImageUrl(viewEvent.banner_image)}
                        className="h-full w-full object-cover"
                        onError={() => setImageError(p => ({ ...p, [`view-${viewEvent.id}`]: true }))}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-200">
                        <PhotoIcon className="h-20 w-20 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-20">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <Badge status={viewEvent.status} mode={viewEvent.event_mode} />
                        <span className="text-xs font-bold text-white uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                          {viewEvent.type}
                        </span>
                      </div>
                      <h2 className="text-3xl font-bold text-white">{viewEvent.title}</h2>
                    </div>
                  </div>

                  {/* Gallery */}
                  <div className="p-8">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Gallery</h4>
                    {Array.isArray(viewEvent.gallery_images) && viewEvent.gallery_images.length > 0 ? (
                      <div className="grid grid-cols-4 gap-4">
                        {viewEvent.gallery_images.map((img, i) => (
                          <img
                            key={i}
                            src={getImageUrl(img)}
                            className="h-28 w-full rounded-xl object-cover shadow-sm border border-slate-200"
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No images available</p>
                    )}
                  </div>

                  {/* Schedule */}
                  {Array.isArray(viewEvent.schedule) && viewEvent.schedule.length > 0 && (
                    <div className="px-8 pb-8">
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Event Schedule</h4>
                      <ScheduleTimeline schedule={viewEvent.schedule} />
                    </div>
                  )}
                </div>

                {/* Right: All Details */}
                <div className="lg:col-span-5 bg-white p-8 border-l border-slate-100 h-[800px] overflow-y-auto custom-scrollbar">

                  {/* Header / Host / Price */}
                  <div className="space-y-6 mb-8">
                    {viewEvent.Host && (
                      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                          {viewEvent.Host.full_name?.[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase">Hosted by</p>
                          <p className="text-sm font-bold text-slate-900">{viewEvent.Host.full_name}</p>
                          <p className="text-xs text-slate-500 truncate w-32">{viewEvent.Host.User?.email}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-slate-900">{getCurrencySymbol(viewEvent.country)}{viewEvent.price}</span>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase font-semibold">Attendance</p>
                        <p className="text-sm font-bold text-indigo-600">{viewEvent.attendees_count || 0} People</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 mb-8">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-2">Description</h4>
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                        {viewEvent.description || "No description provided."}
                      </p>
                    </div>

                    {/* Event Information Section */}
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Event Information</h4>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Start Date</p>
                          <p className="text-sm font-semibold text-slate-900">{moment(viewEvent.start_date).format('MMMM DD, YYYY')}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">End Date</p>
                          <p className="text-sm font-semibold text-slate-900">{viewEvent.end_date ? moment(viewEvent.end_date).format('MMMM DD, YYYY') : 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Start Time</p>
                          <p className="text-sm font-semibold text-slate-900">{viewEvent.start_time || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">End Time</p>
                          <p className="text-sm font-semibold text-slate-900">{viewEvent.end_time || 'Not specified'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Event URL</p>
                          {viewEvent.event_url ? (
                            <a href={viewEvent.event_url} target="_blank" rel="noreferrer" className="flex items-center text-sm font-semibold text-indigo-600 hover:underline break-all">
                              <LinkIcon className="h-4 w-4 mr-1" /> {viewEvent.event_url}
                            </a>
                          ) : (
                            <p className="text-sm text-slate-400">Not specified</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Location Information Section */}
                    {(viewEvent.event_mode === 'offline' || viewEvent.event_mode === 'hybrid') && (
                      <div className="bg-indigo-50/30 rounded-2xl p-5 border border-indigo-100">
                        <div className="flex items-center justify-between mb-3 border-b border-indigo-100 pb-2">
                          <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Location Information</h4>
                          {viewEvent.google_maps_url && (
                            <a href={viewEvent.google_maps_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline flex items-center">
                              <MapPinSolid className="h-3 w-3 mr-1" /> Map
                            </a>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-6 mb-4">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Venue</p>
                            <p className="text-sm font-bold text-indigo-900">{viewEvent.venue_name || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">City</p>
                            <p className="text-sm font-medium text-slate-700">{viewEvent.city || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">State</p>
                            <p className="text-sm font-medium text-slate-700">{viewEvent.state || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Country</p>
                            <p className="text-sm font-medium text-slate-700">{viewEvent.country || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Zip Code</p>
                            <p className="text-sm font-medium text-slate-700">{viewEvent.zip_code || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Landmark</p>
                            <p className="text-sm font-medium text-slate-700">{viewEvent.landmark || 'Not specified'}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Address</p>
                            <p className="text-sm font-medium text-slate-700">{viewEvent.street_address || 'Not specified'}</p>
                          </div>
                        </div>

                        {/* Venue Description */}
                        {viewEvent.venue_description && (
                          <div className="mb-3 bg-white p-3 rounded-xl border border-indigo-50">
                            <p className="text-xs italic text-slate-600">{viewEvent.venue_description}</p>
                          </div>
                        )}

                        <div className="flex gap-3 text-xs">
                          {viewEvent.parking_info && (
                            <span className="bg-white px-2 py-1 rounded border border-slate-200 text-slate-600">
                              🅿️ {viewEvent.parking_info}
                            </span>
                          )}
                          {viewEvent.accessibility_info && (
                            <span className="bg-white px-2 py-1 rounded border border-slate-200 text-slate-600">
                              ♿ {viewEvent.accessibility_info}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Online Information Section */}
                    {(viewEvent.event_mode === 'online' || viewEvent.event_mode === 'hybrid') && (
                      <div className="bg-purple-50/30 rounded-2xl p-5 border border-purple-100">
                        <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-3 border-b border-purple-100 pb-2">Virtual Meeting</h4>
                        {viewEvent.event_url ? (
                          <a href={viewEvent.event_url} target="_blank" rel="noreferrer" className="block w-full text-center bg-white border border-purple-200 shadow-sm rounded-xl px-3 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-50 transition-colors mb-2">
                            Join Meeting Room
                          </a>
                        ) : (
                          <p className="text-xs text-purple-400 mb-2 italic text-center">Link not provided</p>
                        )}
                        {viewEvent.online_instructions && (
                          <div className="flex gap-2">
                            <InformationCircleIcon className="h-4 w-4 text-purple-500 mt-0.5" />
                            <p className="text-xs text-purple-800">{viewEvent.online_instructions}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Inclusions Section */}
                  <div className="flex flex-col gap-4 mb-8 border-t border-slate-100 pt-6">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">What's Included</h4>
                      {Array.isArray(viewEvent.included_items) && viewEvent.included_items.length > 0 ? (
                        <div className="space-y-1">
                          {viewEvent.included_items.map((item, i) => (
                            <div key={i} className="flex items-center text-xs text-slate-700">
                              <CheckBadgeIcon className="h-3 w-3 mr-2 text-emerald-500" /> {item}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Not specified</p>
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">What's Not Included</h4>
                      {Array.isArray(viewEvent.not_included_items) && viewEvent.not_included_items.length > 0 ? (
                        <div className="space-y-1">
                          {viewEvent.not_included_items.map((item, i) => (
                            <div key={i} className="flex items-center text-xs text-slate-700">
                              <XMarkIcon className="h-3 w-3 mr-2 text-rose-500" /> {item}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Not specified</p>
                      )}
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {viewEvent.status === 'rejected' && viewEvent.rejection_reason && (
                    <div className="rounded-2xl bg-red-50 p-4 mb-6 border border-red-100">
                      <h4 className="text-sm font-bold text-red-800 mb-1">Rejection Reason</h4>
                      <p className="text-sm text-red-700">{viewEvent.rejection_reason}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-3 border-t border-slate-100 pt-6">
                    {viewEvent.status === "pending" && (
                      <>
                        <Button className="w-full" size="lg" icon={CheckCircleIcon} onClick={() => { handleApprove(viewEvent.id); setViewModalOpen(false); }}>
                          Approve Event
                        </Button>
                        <Button variant="dangerGhost" className="w-full" size="lg" icon={XCircleIcon} onClick={() => { handleRejectClick(viewEvent.id); setViewModalOpen(false); }}>
                          Reject Event
                        </Button>
                      </>
                    )}
                    <Button variant="secondary" className="w-full" size="lg" onClick={() => setViewModalOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Events;