import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Clock, X, Command } from 'lucide-react';
import {
    Home, CheckCircle, Building, Briefcase, Users,
    ShoppingBag, Plane, ClipboardList, Shield, Settings, FileText,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   SEARCHABLE PAGES
   ═══════════════════════════════════════════════════════════════ */
const PAGES = [
    { name: 'Dashboard', path: '/dashboard', icon: Home, keywords: ['home', 'overview', 'analytics'] },
    { name: 'Hosting Approval', path: '/dashboard/hosting-approval', icon: CheckCircle, keywords: ['host', 'approve', 'pending'] },
    { name: 'Accommodation', path: '/dashboard/accommodation', icon: Building, keywords: ['property', 'listing', 'room', 'hotel'] },
    { name: 'Career', path: '/dashboard/career', icon: Briefcase, keywords: ['job', 'application', 'recruit', 'hire'] },
    { name: 'Community', path: '/dashboard/community', icon: Users, keywords: ['group', 'post', 'member'] },
    { name: 'Buy & Sell', path: '/dashboard/buy-and-sell', icon: ShoppingBag, keywords: ['marketplace', 'listing', 'product'] },
    { name: 'Travel', path: '/dashboard/travell', icon: Plane, keywords: ['trip', 'match', 'destination'] },
    { name: 'Host Details', path: '/dashboard/host-details', icon: ClipboardList, keywords: ['host', 'profile', 'info'] },
    { name: 'Manage Admins', path: '/dashboard/manage-admins', icon: Shield, keywords: ['admin', 'team', 'role', 'account'] },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings, keywords: ['profile', 'password', 'notification', 'theme'] },
    { name: 'Activity Log', path: '/dashboard/activity-log', icon: FileText, keywords: ['audit', 'history', 'action', 'log'] },
];

const RECENT_KEY = 'nkl-recent-searches';
const MAX_RECENT = 5;

/* ═══════════════════════════════════════════════════════════════ */

export default function SearchModal({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const [recentPaths, setRecentPaths] = useState(() => {
        try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; }
        catch { return []; }
    });

    // Filter pages
    const filtered = query.trim()
        ? PAGES.filter(p => {
            const q = query.toLowerCase();
            return p.name.toLowerCase().includes(q) ||
                p.keywords.some(k => k.includes(q));
        })
        : PAGES;

    // Recent pages
    const recentPages = recentPaths
        .map(path => PAGES.find(p => p.path === path))
        .filter(Boolean);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Keyboard nav
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && filtered[selectedIndex]) {
            e.preventDefault();
            navigateTo(filtered[selectedIndex]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    }, [filtered, selectedIndex]);

    // Navigate to page
    const navigateTo = (page) => {
        const updated = [page.path, ...recentPaths.filter(p => p !== page.path)].slice(0, MAX_RECENT);
        setRecentPaths(updated);
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
        navigate(page.path);
        onClose();
    };

    // Reset index when filtering
    useEffect(() => { setSelectedIndex(0); }, [query]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_0.2s_ease-out]"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <Search className="w-5 h-5 text-gray-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search pages..."
                        className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
                    />
                    <kbd className="hidden sm:flex items-center gap-1 text-[10px] font-medium text-gray-400 bg-gray-100 border border-gray-200 px-2 py-1 rounded-md">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto py-2">
                    {/* Recent searches (when no query) */}
                    {!query.trim() && recentPages.length > 0 && (
                        <div className="px-4 pb-2">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-1 mb-2">Recent</p>
                            {recentPages.map(page => (
                                <button
                                    key={`recent-${page.path}`}
                                    onClick={() => navigateTo(page)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>{page.name}</span>
                                    <ArrowRight className="w-3.5 h-3.5 ml-auto text-gray-300" />
                                </button>
                            ))}
                            <div className="h-px bg-gray-100 mx-1 my-2" />
                        </div>
                    )}

                    {/* All / filtered pages */}
                    <div className="px-4">
                        {!query.trim() && (
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-1 mb-2">Navigate to</p>
                        )}
                        {filtered.length === 0 ? (
                            <div className="text-center py-8">
                                <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No pages found for "<span className="font-medium">{query}</span>"</p>
                            </div>
                        ) : (
                            filtered.map((page, i) => {
                                const Icon = page.icon;
                                const isSelected = i === selectedIndex;
                                return (
                                    <button
                                        key={page.path}
                                        onClick={() => navigateTo(page)}
                                        onMouseEnter={() => setSelectedIndex(i)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors mb-0.5
                      ${isSelected ? 'bg-[#cb2926]/10 text-[#cb2926]' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                      ${isSelected ? 'bg-[#cb2926] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium">{page.name}</span>
                                        {isSelected && <ArrowRight className="w-3.5 h-3.5 ml-auto" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center gap-4 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1"><kbd className="bg-gray-200 px-1.5 py-0.5 rounded text-[9px] font-mono">↑↓</kbd> Navigate</span>
                    <span className="flex items-center gap-1"><kbd className="bg-gray-200 px-1.5 py-0.5 rounded text-[9px] font-mono">↵</kbd> Open</span>
                    <span className="flex items-center gap-1"><kbd className="bg-gray-200 px-1.5 py-0.5 rounded text-[9px] font-mono">esc</kbd> Close</span>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </div>
    );
}
