import React, { useState, useMemo } from 'react';
import {
    FileText, Filter, Search, X, CheckCircle, XCircle, UserPlus,
    LogIn, Shield, Eye, Trash2, Edit, Clock, ChevronDown,
    AlertTriangle, Building, Calendar, ShoppingBag, Users,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   DEMO ACTIVITY DATA
   Generated with realistic timestamps relative to "now"
   ═══════════════════════════════════════════════════════════════ */
const generateDemoActivities = () => {
    const now = Date.now();
    const m = 60_000, h = 3_600_000, d = 86_400_000;
    return [
        { id: 1, action: 'approved', module: 'Hosting', target: 'John Doe (Host Application)', admin: 'Admin', time: new Date(now - 3 * m), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 2, action: 'rejected', module: 'Property', target: 'Beach Villa #42', admin: 'Admin', time: new Date(now - 15 * m), icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
        { id: 3, action: 'created', module: 'Admin', target: 'New recruiter account — recruiter@nextkinlife.com', admin: 'Super Admin', time: new Date(now - 1 * h), icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 4, action: 'login', module: 'Auth', target: 'Admin logged in from 192.168.1.10', admin: 'Admin', time: new Date(now - 2 * h), icon: LogIn, color: 'text-slate-600', bg: 'bg-slate-50' },
        { id: 5, action: 'approved', module: 'Event', target: 'Community Meetup — March 2026', admin: 'Admin', time: new Date(now - 4 * h), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 6, action: 'updated', module: 'Accommodation', target: 'Updated pricing for Category: Luxury Villas', admin: 'Admin', time: new Date(now - 6 * h), icon: Edit, color: 'text-amber-600', bg: 'bg-amber-50' },
        { id: 7, action: 'approved', module: 'Buy & Sell', target: 'Listing: Vintage Guitar', admin: 'Admin', time: new Date(now - 8 * h), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 8, action: 'rejected', module: 'Community', target: 'Post flagged for policy violation', admin: 'Super Admin', time: new Date(now - 12 * h), icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
        { id: 9, action: 'login', module: 'Auth', target: 'Super Admin logged in', admin: 'Super Admin', time: new Date(now - 1 * d), icon: LogIn, color: 'text-slate-600', bg: 'bg-slate-50' },
        { id: 10, action: 'created', module: 'Event', target: 'New event created: Tech Conference 2026', admin: 'Admin', time: new Date(now - 1.5 * d), icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 11, action: 'approved', module: 'Hosting', target: 'Jane Smith (Host Application)', admin: 'Admin', time: new Date(now - 2 * d), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 12, action: 'deleted', module: 'Community', target: 'Removed spam post #1284', admin: 'Super Admin', time: new Date(now - 3 * d), icon: Trash2, color: 'text-red-600', bg: 'bg-red-50' },
    ];
};

/* ── Time ago helper ──────────────────────────────────────── */
const timeAgo = (date) => {
    const s = Math.floor((Date.now() - date) / 1000);
    if (s < 60) return 'Just now';
    const min = Math.floor(s / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.floor(hr / 24);
    if (d < 7) return `${d}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/* ── Module icon map ──────────────────────────────────────── */
const MODULE_ICONS = {
    Hosting: Shield, Property: Building, Accommodation: Building,
    Event: Calendar, 'Buy & Sell': ShoppingBag, Community: Users,
    Admin: Shield, Auth: LogIn,
};

const ACTION_FILTERS = ['all', 'approved', 'rejected', 'created', 'updated', 'deleted', 'login'];
const MODULE_FILTERS = ['All', 'Hosting', 'Property', 'Event', 'Buy & Sell', 'Community', 'Admin', 'Auth'];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function ActivityLog() {
    const [activities] = useState(generateDemoActivities);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [moduleFilter, setModuleFilter] = useState('All');
    const [showModuleDropdown, setShowModuleDropdown] = useState(false);

    const filtered = useMemo(() => {
        return activities.filter(a => {
            const matchSearch = !search || a.target.toLowerCase().includes(search.toLowerCase()) || a.admin.toLowerCase().includes(search.toLowerCase());
            const matchAction = actionFilter === 'all' || a.action === actionFilter;
            const matchModule = moduleFilter === 'All' || a.module === moduleFilter;
            return matchSearch && matchAction && matchModule;
        });
    }, [activities, search, actionFilter, moduleFilter]);

    const stats = useMemo(() => ({
        total: activities.length,
        approved: activities.filter(a => a.action === 'approved').length,
        rejected: activities.filter(a => a.action === 'rejected').length,
        created: activities.filter(a => a.action === 'created').length,
    }), [activities]);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* ── Header ──────────────────────────────────────── */}
                <div className="mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Activity Log</h1>
                        <p className="text-gray-500 text-sm">Track all admin actions and platform changes</p>
                    </div>
                </div>

                {/* ── Stats ────────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Actions', value: stats.total, gradient: 'from-slate-500 to-slate-700', icon: FileText },
                        { label: 'Approved', value: stats.approved, gradient: 'from-emerald-500 to-teal-600', icon: CheckCircle },
                        { label: 'Rejected', value: stats.rejected, gradient: 'from-red-500 to-rose-600', icon: XCircle },
                        { label: 'Created', value: stats.created, gradient: 'from-blue-500 to-indigo-600', icon: UserPlus },
                    ].map(s => (
                        <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{s.label}</p>
                                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{s.value}</p>
                                </div>
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg`}>
                                    <s.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Filters ─────────────────────────────────────── */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search actions..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#cb2926] focus:ring-2 focus:ring-[#cb2926]/10 transition-all" />
                        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>}
                    </div>

                    {/* Action filter chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {ACTION_FILTERS.map(f => (
                            <button key={f} onClick={() => setActionFilter(f)} className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${actionFilter === f ? 'bg-[#cb2926] text-white border-[#cb2926] shadow-md shadow-red-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Module dropdown */}
                    <div className="relative">
                        <button onClick={() => setShowModuleDropdown(!showModuleDropdown)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all">
                            <Filter className="w-3.5 h-3.5" />{moduleFilter}<ChevronDown className="w-3 h-3" />
                        </button>
                        {showModuleDropdown && (
                            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-20">
                                {MODULE_FILTERS.map(m => (
                                    <button key={m} onClick={() => { setModuleFilter(m); setShowModuleDropdown(false); }} className={`w-full text-left px-4 py-2 text-sm transition-colors ${moduleFilter === m ? 'text-[#cb2926] bg-red-50 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>{m}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Timeline ────────────────────────────────────── */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    {filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600">No activities found</h3>
                            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filtered.map(activity => {
                                const Icon = activity.icon;
                                return (
                                    <div key={activity.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-xl ${activity.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                            <Icon className={`w-5 h-5 ${activity.color}`} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900">
                                                <span className="font-semibold">{activity.admin}</span>
                                                <span className={`ml-1.5 px-2 py-0.5 rounded-md text-xs font-semibold ${activity.bg} ${activity.color}`}>
                                                    {activity.action}
                                                </span>
                                            </p>
                                            <p className="text-sm text-gray-600 mt-0.5 truncate">{activity.target}</p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(activity.time)}</span>
                                                <span className="text-xs text-gray-300">•</span>
                                                <span className="text-xs text-gray-400">{activity.module}</span>
                                            </div>
                                        </div>

                                        {/* Timestamp */}
                                        <p className="text-xs text-gray-400 shrink-0 hidden sm:block">
                                            {activity.time.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
