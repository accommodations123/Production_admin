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
  Users // <--- Added this import
} from 'lucide-react';



const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home, end: true },
    { name: 'Hosting Approval', path: '/dashboard/hosting-approval', icon: CheckCircle },
    { name: 'Accommodation', path: '/dashboard/accommodation', icon: Building },
    { name: 'Events', path: '/dashboard/events', icon: Calendar },
    { name: 'Career', path: '/dashboard/career', icon: Briefcase },
    { name: 'Community', path: '/dashboard/community', icon: Users }, 
    { name: 'Buy and Sell', path: '/dashboard/buy-and-sell', icon: ShoppingBag },
    { name: 'Travel', path: '/dashboard/travell', icon: ShoppingBag }, 
    { name: 'Host Details', path: '/dashboard/host-details', icon: ShoppingBag }, 
  ];

  // Premium Link Styling using your colors
  const linkClasses = ({ isActive }) =>
    `flex items-center justify-between px-4 py-3 mt-1.5 transition-all duration-300 rounded-lg border border-transparent ${isActive
      ? 'bg-gradient-to-r from-[#cb2926] to-[#a71f1c] text-white shadow-lg shadow-red-900/40 font-medium'
      : 'text-blue-200 hover:bg-[#001f3d] hover:border-[#001f3d] hover:text-white'
    }`;

  const handleLogout = () => {
    // Optional: Add a confirmation modal here
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) { // Fixed syntax here
      localStorage.removeItem("admin-auth");
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

        {/* MENU ITEMS */}
        <nav className="p-4">
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
              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${linkClasses({isActive: false}).includes('bg-gradient') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
            </NavLink>
          ))}
        </nav>
      </div>

    
    </aside>
  );
};

export default Sidebar;