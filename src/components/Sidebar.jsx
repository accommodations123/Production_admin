import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Calendar,
  Building,
  Briefcase,
  CheckCircle,
  LogOut,
  ShoppingBag,
  ChevronRight,
  Users,
  Shield,
  Plane,
  ClipboardList,
  ChevronLeft,
  Settings,
  FileText,
} from 'lucide-react';
import { getAdminRole, clearAdminAuth } from '../utils/auth';

/* ═══════════════════════════════════════════════════════════════
   ROLE-BASED MENU CONFIGURATION — grouped by section
   ═══════════════════════════════════════════════════════════════ */

const MENU_SECTIONS = [
  {
    label: 'Main',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: Home, end: true, roles: ['super_admin', 'admin'] },
    ],
  },
  {
    label: 'Management',
    items: [
      { name: 'Hosting Approval', path: '/dashboard/hosting-approval', icon: CheckCircle, roles: ['super_admin', 'admin'] },
      { name: 'Accommodation', path: '/dashboard/accommodation', icon: Building, roles: ['super_admin', 'admin'] },
      { name: 'Events', path: '/dashboard/events', icon: Calendar, roles: ['super_admin', 'admin'] },
      { name: 'Career', path: '/dashboard/career', icon: Briefcase, roles: ['super_admin', 'admin', 'recruiter'] },
      { name: 'Community', path: '/dashboard/community', icon: Users, roles: ['super_admin', 'admin'] },
      { name: 'Buy & Sell', path: '/dashboard/buy-and-sell', icon: ShoppingBag, roles: ['super_admin', 'admin'] },
      { name: 'Travel', path: '/dashboard/travell', icon: Plane, roles: ['super_admin', 'admin'] },
      { name: 'Host Details', path: '/dashboard/host-details', icon: ClipboardList, roles: ['super_admin', 'admin'] },
    ],
  },
  {
    label: 'Admin',
    items: [
      { name: 'Manage Admins', path: '/dashboard/manage-admins', icon: Shield, roles: ['super_admin'] },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Activity Log', path: '/dashboard/activity-log', icon: FileText, roles: ['super_admin', 'admin'] },
      { name: 'Settings', path: '/dashboard/settings', icon: Settings, roles: ['super_admin', 'admin'] },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════ */

const Sidebar = () => {
  const navigate = useNavigate();
  const currentRole = getAdminRole() || 'admin';
  const [expanded, setExpanded] = useState(true);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      clearAdminAuth();
      navigate("/login");
    }
  };

  return (
    <aside
      className={`${expanded ? 'w-[264px]' : 'w-[72px]'} 
        bg-[#0f172a] text-white flex-shrink-0 h-screen sticky top-0 
        flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        border-r border-slate-800/60 z-50`}
    >
      {/* ── Logo + Collapse Toggle ─────────────────────────── */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/60 shrink-0">
        <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${expanded ? 'w-full' : 'w-0'}`}>
          <img
            src='/nextkinlife-logo.jpeg'
            alt="NextKinLife"
            className="h-9 w-auto object-contain shrink-0"
          />
        </div>
        {!expanded && (
          <img
            src='/nextkinlife-logo.jpeg'
            alt="NKL"
            className="h-8 w-8 object-contain rounded-lg shrink-0"
          />
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors shrink-0 ml-auto"
          title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${!expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* ── Role Badge ─────────────────────────────────────── */}
      {expanded && (
        <div className="px-4 pt-4 pb-1 animate-fade-in">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${currentRole === 'super_admin' ? 'bg-amber-500/15 text-amber-400' :
            currentRole === 'recruiter' ? 'bg-emerald-500/15 text-emerald-400' :
              'bg-blue-500/15 text-blue-400'
            }`}>
            {currentRole === 'super_admin' ? '⚡ Super Admin' :
              currentRole === 'recruiter' ? '📋 Recruiter' :
                '🛡️ Admin'}
          </span>
        </div>
      )}

      {/* ── Navigation ─────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-3 pt-3 pb-2">
        {MENU_SECTIONS.map((section) => {
          const visibleItems = section.items.filter(item => item.roles.includes(currentRole));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.label} className="mb-4">
              {/* Section label */}
              {expanded && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 mb-2">
                  {section.label}
                </p>
              )}
              {!expanded && <div className="h-px bg-slate-700/50 mx-2 mb-3" />}

              {/* Items */}
              {visibleItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.end || false}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl mb-0.5 transition-all duration-200 
                    ${expanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'}
                    ${isActive
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#cb2926] rounded-r-full" />
                      )}

                      <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-white' : ''}`} />

                      {expanded && (
                        <span className="text-sm truncate">{item.name}</span>
                      )}

                      {/* Tooltip when collapsed */}
                      {!expanded && (
                        <span className="sidebar-tooltip group-hover:opacity-100">
                          {item.name}
                        </span>
                      )}

                      {expanded && isActive && (
                        <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-500" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* ── Logout Button ──────────────────────────────────── */}
      <div className="px-3 pb-4 pt-2 border-t border-slate-800/60 shrink-0">
        <button
          onClick={handleLogout}
          className={`group relative flex items-center gap-3 w-full rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200
            ${expanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'}`}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {expanded && <span className="text-sm font-medium">Logout</span>}
          {!expanded && (
            <span className="sidebar-tooltip group-hover:opacity-100">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;