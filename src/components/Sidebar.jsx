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
  Shield
} from 'lucide-react';
import { getAdminRole, clearAdminAuth } from '../utils/auth';

/* ═══════════════════════════════════════════════════════════════════════
   ROLE-BASED MENU CONFIGURATION

   Each item has a `roles` array defining who can see it.
   - super_admin: sees everything
   - admin: sees all management pages except "Manage Admins"
   - recruiter: sees only Career
   ═══════════════════════════════════════════════════════════════════════ */

const ALL_MENU_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: Home, end: true, roles: ['super_admin', 'admin'] },
  { name: 'Hosting Approval', path: '/dashboard/hosting-approval', icon: CheckCircle, roles: ['super_admin', 'admin'] },
  { name: 'Accommodation', path: '/dashboard/accommodation', icon: Building, roles: ['super_admin', 'admin'] },
  { name: 'Events', path: '/dashboard/events', icon: Calendar, roles: ['super_admin', 'admin'] },
  { name: 'Career', path: '/dashboard/career', icon: Briefcase, roles: ['super_admin', 'admin', 'recruiter'] },
  { name: 'Community', path: '/dashboard/community', icon: Users, roles: ['super_admin', 'admin'] },
  { name: 'Buy and Sell', path: '/dashboard/buy-and-sell', icon: ShoppingBag, roles: ['super_admin', 'admin'] },
  { name: 'Travel', path: '/dashboard/travell', icon: ShoppingBag, roles: ['super_admin', 'admin'] },
  { name: 'Host Details', path: '/dashboard/host-details', icon: ShoppingBag, roles: ['super_admin', 'admin'] },
  { name: 'Manage Admins', path: '/dashboard/manage-admins', icon: Shield, roles: ['super_admin'] },
];


const Sidebar = () => {
  const navigate = useNavigate();
  const currentRole = getAdminRole() || 'admin';

  // Filter menu items by current admin's role
  const menuItems = ALL_MENU_ITEMS.filter(item => item.roles.includes(currentRole));

  // Premium Link Styling using your colors
  const linkClasses = ({ isActive }) =>
    `flex items-center justify-between px-4 py-3 mt-1.5 transition-all duration-300 rounded-lg border border-transparent ${isActive
      ? 'bg-gradient-to-r from-[#cb2926] to-[#a71f1c] text-white shadow-lg shadow-red-900/40 font-medium'
      : 'text-blue-200 hover:bg-[#001f3d] hover:border-[#001f3d] hover:text-white'
    }`;

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      clearAdminAuth();
      navigate("/login");
    }
  };

  return (
    <aside className="w-72 bg-[#00162d] text-white flex-shrink-0 h-screen sticky top-0 flex flex-col justify-between font-sans border-r border-white/5">

      {/* TOP SECTION: LOGO */}
      <div>
        <div className="h-20 flex items-center justify-center border-b border-white/5 shadow-lg shadow-black/20 backdrop-blur-md">
          <img
            src='/nextkinlife-logo.jpeg'
            alt="NextKinLife Logo"
            className="h-12 w-auto object-contain drop-shadow-md"
          />
        </div>

        {/* ROLE BADGE */}
        <div className="px-4 pt-4 pb-1">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${currentRole === 'super_admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              currentRole === 'recruiter' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
            {currentRole === 'super_admin' ? '⚡ Super Admin' :
              currentRole === 'recruiter' ? '📋 Recruiter' :
                '🛡️ Admin'}
          </span>
        </div>

        {/* MENU ITEMS */}
        <nav className="p-4 pt-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={linkClasses}
              end={item.end || false}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                {item.name}
              </div>
              {/* Subtle Arrow on hover */}
              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${linkClasses({ isActive: false }).includes('bg-gradient') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
            </NavLink>
          ))}
        </nav>
      </div>


    </aside>
  );
};

export default Sidebar;