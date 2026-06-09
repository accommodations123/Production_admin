import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Bell, LogOut, ChevronRight, X, User, Settings, Sun, Moon } from 'lucide-react';
import { getAdminRole, clearAdminAuth } from '../utils/auth';
import SearchModal from './SearchModal';

/* ═══════════════════════════════════════════════════════════════
   ROUTE → DISPLAY NAME MAPPING
   ═══════════════════════════════════════════════════════════════ */
const ROUTE_MAP = {
  'dashboard': 'Dashboard',
  'hosting-approval': 'Hosting Approval',
  'accommodation': 'Accommodation',
  'career': 'Career',
  'buy-and-sell': 'Buy & Sell',
  'manage-admins': 'Manage Admins',
  'community': 'Community',
  'travell': 'Travel',
  'host-details': 'Host Details',
  'settings': 'Settings',
  'activity-log': 'Activity Log',
};

/* ═══════════════════════════════════════════════════════════════
   RELATIVE TIME HELPER
   ═══════════════════════════════════════════════════════════════ */
const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

/* ═══════════════════════════════════════════════════════════════
   INITIAL NOTIFICATIONS
   ═══════════════════════════════════════════════════════════════ */
const createNotifications = () => [
  { id: 1, text: 'New host registration pending review', time: new Date(Date.now() - 3 * 60000), read: false, dot: 'bg-blue-500' },
  { id: 2, text: 'Property submission awaiting approval', time: new Date(Date.now() - 12 * 60000), read: false, dot: 'bg-amber-500' },
  { id: 3, text: 'New event created: Community Meetup', time: new Date(Date.now() - 45 * 60000), read: true, dot: 'bg-emerald-500' },
  { id: 4, text: 'Admin login from new device detected', time: new Date(Date.now() - 2 * 3600000), read: true, dot: 'bg-slate-400' },
];

const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState(createNotifications);
  const [, setTick] = useState(0); // force re-render for timeAgo

  /* Dark mode state */
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nkl-theme') === 'dark';
    }
    return false;
  });

  const location = useLocation();
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const adminRole = getAdminRole() || 'admin';
  const roleLabel = adminRole === 'super_admin' ? 'Super Admin'
    : adminRole === 'recruiter' ? 'Recruiter' : 'Admin';

  const unreadCount = notifications.filter(n => !n.read).length;

  // Click-outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update timeAgo every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // Dark mode toggle
  const toggleDarkMode = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('nkl-theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  // Apply dark mode on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Breadcrumb logic
  const pathnames = location.pathname.split('/').filter(Boolean);
  const currentPageKey = pathnames[pathnames.length - 1] || 'dashboard';
  const pageTitle = ROUTE_MAP[currentPageKey] || currentPageKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const handleLogout = () => {
    clearAdminAuth();
    window.location.href = "/login";
  };

  return (
    <>
      <header className="bg-white dark:bg-slate-900 sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-700/80">
        <div className="px-6 py-3 flex justify-between items-center">

          {/* ── LEFT: Page Title + Breadcrumbs ─────────────── */}
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {pageTitle}
            </h1>
            <nav className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <Link to="/dashboard" className="hover:text-[#cb2926] transition-colors">
                Home
              </Link>
              {pathnames.slice(1).map((name, index) => {
                const routeTo = `/${pathnames.slice(0, index + 2).join('/')}`;
                const display = ROUTE_MAP[name] || name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const isLast = index === pathnames.length - 2;
                return (
                  <span key={routeTo} className="flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    {isLast ? (
                      <span className="text-slate-600 dark:text-slate-300 font-medium">{display}</span>
                    ) : (
                      <Link to={routeTo} className="hover:text-[#cb2926] transition-colors">{display}</Link>
                    )}
                  </span>
                );
              })}
            </nav>
          </div>

          {/* ── RIGHT: Actions ─────────────────────────────── */}
          <div className="flex items-center gap-2">

            {/* Search */}
            <div className="hidden md:block">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="relative flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 text-sm rounded-xl pl-9 pr-3 py-2 w-52 lg:w-60 
                  hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer"
              >
                <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                <span className="text-slate-400 text-sm">Search...</span>
                <kbd className="absolute right-3 text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
              >
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#cb2926] rounded-full border-2 border-white dark:border-slate-900" />
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1 z-50 animate-slide-up">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 ? (
                      <button onClick={markAllRead} className="text-[10px] text-[#cb2926] bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                        {unreadCount} New — Mark read
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 px-2 py-0.5">All read</span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-50 dark:border-slate-700/50 last:border-0 flex gap-3 transition-colors
                          ${!notif.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                        onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                      >
                        <div className={`w-2 h-2 mt-1.5 rounded-full ${notif.read ? 'bg-transparent' : notif.dot} shrink-0`} />
                        <div>
                          <p className={`text-sm ${notif.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>{notif.text}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{timeAgo(notif.time)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 pl-2 pr-1.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#cb2926] to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  A
                </div>
                <div className="hidden md:block text-left mr-1 leading-tight">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">Admin</p>
                  <p className="text-[10px] text-slate-400">{roleLabel}</p>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-90' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1 z-50 animate-slide-up">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Admin</p>
                    <p className="text-[11px] text-slate-400">{roleLabel}</p>
                  </div>

                  <Link
                    to="/dashboard/settings"
                    className="w-full flex items-center px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Link>

                  <button
                    className="w-full flex items-center px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;