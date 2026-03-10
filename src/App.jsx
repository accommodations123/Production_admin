import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLogin from "./pages/Loginpage";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import HostingApproval from "./pages/HostingApproval";
import Events from "./pages/Events";

import AccommodationCategories from "./pages/AccommodationPages/AccommodationCategories";
import PropertyDetail from "./pages/AccommodationPages/PropertyDetail";
import PropertyList from "./pages/AccommodationPages/PropertyList";

import Buysellpages from "./pages/buysell/Buysellpages";
import Community from "./Community";
// ---------------------------------------------------------
// IMPORTANT: Ensure this path matches where you saved the files
import TravelAdmin from './Traveladmin/TravelAdmin';
// ---------------------------------------------------------
import CareerPages from "./pages/carrerpages/Carrerpages";
import Hostdetailpages from "./pages/HostDetails/Hostdetailpages"
import ManageAdmins from "./pages/ManageAdmins"
import Settings from "./pages/Settings"
import ActivityLog from "./pages/ActivityLog"

import { getAdminRole } from "./utils/auth";

/* ═══════════════════════════════════════════════════════════════════════
   ROLE-BASED ROUTE GUARD WRAPPER
   Wraps a page element with role-based access control.
   ═══════════════════════════════════════════════════════════════════════ */

function RoleGuard({ roles, children }) {
  const currentRole = getAdminRole();

  if (!roles || roles.length === 0) return children;

  if (!currentRole || !roles.includes(currentRole)) {
    // Redirect unauthorized users to their default page
    const fallback = currentRole === "recruiter" ? "/dashboard/career" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}

function App() {
  const isAuth = localStorage.getItem("admin-auth")
  const role = getAdminRole();

  // Determine default landing page based on role
  const defaultRoute = isAuth
    ? (role === "recruiter" ? "/dashboard/career" : "/dashboard")
    : "/login";

  return (
    <BrowserRouter>
      <Routes>

        {/* DEFAULT ROUTE */}
        <Route path="/" element={<Navigate to={defaultRoute} replace />} />

        {/* LOGIN ROUTE */}
        <Route path="/login" element={isAuth ? <Navigate to={defaultRoute} replace /> : <AdminLogin />} />

        {/* DASHBOARD + PROTECTED ROUTES */}
        <Route path="/dashboard" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>

          {/* Dashboard Home — super_admin & admin only */}
          <Route index element={
            <RoleGuard roles={["super_admin", "admin"]}>
              <Dashboard />
            </RoleGuard>
          } />

          {/* Hosting Approval — super_admin & admin */}
          <Route path="hosting-approval" element={
            <RoleGuard roles={["super_admin", "admin"]}>
              <HostingApproval />
            </RoleGuard>
          } />

          {/* Accommodation Routes — super_admin & admin */}
          <Route path="accommodation">
            <Route index element={
              <RoleGuard roles={["super_admin", "admin"]}>
                <AccommodationCategories />
              </RoleGuard>
            } />
            <Route path=":categoryName" element={
              <RoleGuard roles={["super_admin", "admin"]}>
                <PropertyDetail />
              </RoleGuard>
            } />
            <Route path=":categoryName/:propertyId" element={
              <RoleGuard roles={["super_admin", "admin"]}>
                <PropertyList />
              </RoleGuard>
            } />
          </Route>

          {/* Events — super_admin & admin */}
          <Route path="events" element={
            <RoleGuard roles={["super_admin", "admin"]}>
              <Events />
            </RoleGuard>
          } />

          {/* Career — all roles can access */}
          <Route path="career" element={<CareerPages />} />

          {/* Buy and Sell — super_admin & admin */}
          <Route path="buy-and-sell" element={
            <RoleGuard roles={["super_admin", "admin"]}>
              <Buysellpages />
            </RoleGuard>
          } />

          {/* Community — super_admin & admin */}
          <Route path="community" element={
            <RoleGuard roles={["super_admin", "admin"]}>
              <Community />
            </RoleGuard>
          } />

          {/* Travel — super_admin & admin */}
          <Route path="travell" element={
            <RoleGuard roles={["super_admin", "admin"]}>
              <TravelAdmin />
            </RoleGuard>
          } />

          {/* Host Details — super_admin & admin */}
          <Route path="host-details" element={
            <RoleGuard roles={["super_admin", "admin"]}>
              <Hostdetailpages />
            </RoleGuard>
          } />

          {/* Manage Admins — super_admin only */}
          <Route path="manage-admins" element={
            <RoleGuard roles={["super_admin"]}>
              <ManageAdmins />
            </RoleGuard>
          } />

          {/* Settings — super_admin & admin */}
          <Route path="settings" element={
            <RoleGuard roles={["super_admin", "admin"]}>
              <Settings />
            </RoleGuard>
          } />

          {/* Activity Log — super_admin & admin */}
          <Route path="activity-log" element={
            <RoleGuard roles={["super_admin", "admin"]}>
              <ActivityLog />
            </RoleGuard>
          } />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;