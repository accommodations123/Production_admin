import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Bell, LogOut, Settings, HelpCircle, ChevronRight, X, User } from 'lucide-react';

const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const location = useLocation();
  
  // Refs for Click-Outside detection
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // MAPPING
  const routeMap = {
    'dashboard': 'Dashboard',
    'hosting-approval': 'Hosting Approval',
    'accommodation': 'Accommodation',
    'events': 'Events',
    'career': 'Career',
    'buy-and-sell': 'Buy and Sell',
  };

  // CLICK OUTSIDE LOGIC
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // BREADCRUMB LOGIC
  const pathnames = location.pathname.split('/').filter((x) => x);

  const handleLogout = () => {
    localStorage.removeItem("admin-auth");
    window.location.href = "/login";
  };

  return (
    <header className="bg-[#00162d] sticky top-0 z-40 border-b border-[#cb2926]/30 shadow-lg backdrop-blur-xl">
      <div className="px-6 py-3.5 flex justify-between items-center max-w-full">
        
        {/* LEFT SIDE: MODERN BREADCRUMBS */}
        <div className="flex flex-col justify-center min-w-0">
          <nav className="flex items-center gap-2 text-sm overflow-x-auto no-scrollbar">
            {/* Brand */}
            <span className="bg-[#cb2926] text-white px-3 py-1 rounded-md font-bold shadow-lg shadow-[#cb2926]/40 shrink-0">
              NextKinLife
            </span>
            
            {pathnames.map((name, index) => {
              const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
              const isLast = index === pathnames.length - 1;
              const displayName = routeMap[name] || name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

              return (
                <div key={routeTo} className="flex items-center shrink-0">
                  <ChevronRight className="w-3 h-3 text-slate-600 mx-1" />
                  
                  {isLast ? (
                    // Current Page (Active Pill)
                    <span className="bg-white/10 border border-white/10 text-white px-3 py-1.5 rounded-lg font-medium backdrop-blur-sm">
                      {displayName}
                    </span>
                  ) : (
                    // Previous Page (Hoverable Link)
                    <Link to={routeTo} className="text-slate-400 hover:text-[#cb2926] hover:bg-white/5 px-2 py-1.5 rounded-lg transition-all duration-200">
                      {displayName}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* RIGHT SIDE: ACTIONS */}
        <div className="flex items-center gap-3 sm:gap-5">

          {/* 1. SEARCH BAR (Desktop / Mobile Toggle) */}
          <div className="relative flex items-center group">
            {/* Desktop Input */}
            <div className="hidden md:block relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-[#cb2926] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search (Cmd + K)..."
                className="bg-[#001f3d] border border-slate-700/50 text-white text-sm rounded-full pl-10 pr-4 py-2 w-48 lg:w-64 focus:outline-none focus:border-[#cb2926]/50 focus:ring-2 focus:ring-[#cb2926]/10 transition-all placeholder:text-slate-500"
              />
            </div>

            {/* Mobile Search Toggle */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 rounded-full hover:bg-white/5 text-slate-300"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* 2. NOTIFICATIONS (With Dropdown) */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-slate-300 hover:text-white group"
            >
              <Bell className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              {true && ( // Change {true} to {hasNotification}
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-[#cb2926] rounded-full border-2 border-[#00162d] animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-[#0b1120] border border-slate-700/50 rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-700/50 flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Notifications</span>
                  <span className="text-[10px] text-[#cb2926] bg-[#cb2926]/10 px-2 py-0.5 rounded-full font-semibold">2 New</span>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {/* Mock Items */}
                  {[1, 2].map(i => (
                    <div key={i} className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-slate-700/30 last:border-0 flex gap-3">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                      <div>
                        <p className="text-sm text-slate-200">New event submission received</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">2 mins ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. PROFILE DROPDOWN (Ref Added) */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-slate-700 hover:border-[#cb2926] hover:bg-white/5 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#cb2926] to-orange-700 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_10px_rgba(203,41,38,0.5)]">
                A
              </div>
              <div className="hidden md:block text-right mr-2 leading-none">
                <p className="text-sm font-semibold text-white group-hover:text-red-50">Admin</p>
                <p className="text-[10px] text-slate-400 group-hover:text-slate-300">Super Admin</p>
              </div>
              <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-90' : ''}`} />
            </button>

            {/* Profile Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-[#0b1120] border border-slate-700/50 rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-[#cb2926]/20 to-transparent border-b border-slate-700/50">
                  <p className="text-[10px] font-bold text-[#cb2926] uppercase tracking-wider">Admin Controls</p>
                </div>
                
                <a href="#" className="flex items-center px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                  <Settings className="w-4 h-4 mr-3 text-slate-400" />
                  Settings
                </a>
                <a href="#" className="flex items-center px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                  <HelpCircle className="w-4 h-4 mr-3 text-slate-400" />
                  Help Center
                </a>
                
                <div className="my-1 h-px bg-slate-700/50"></div>
                
                <button 
                  className="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
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
      
      {/* MOBILE SEARCH OVERLAY (Optional Expansion) */}
      {isSearchOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#00162d] border-b border-slate-700 p-4 z-30 animate-in slide-in-from-top">
           <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="w-full bg-[#001f3d] border border-slate-700 text-white text-lg rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-[#cb2926] transition-all"
              />
              <button onClick={() => setIsSearchOpen(false)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400">
                 <X className="h-5 w-5" />
              </button>
           </div>
        </div>
      )}
    </header>
  );
};

export default Header;