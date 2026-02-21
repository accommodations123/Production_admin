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

function App() {
  const isAuth = localStorage.getItem("admin-auth");

  return (
    <BrowserRouter>
      <Routes>

        {/* DEFAULT ROUTE */}
        <Route path="/" element={isAuth ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />

        {/* LOGIN ROUTE */}
        <Route path="/login" element={isAuth ? <Navigate to="/dashboard" replace /> : <AdminLogin />} />

        {/* DASHBOARD + PROTECTED ROUTES */}
        <Route path="/dashboard" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>

          {/* Dashboard Home */}
          <Route index element={<Dashboard />} />

          {/* Hosting Approval */}
          <Route path="hosting-approval" element={<HostingApproval />} />

          {/* Accommodation Routes */}
          <Route path="accommodation">
            <Route index element={<AccommodationCategories />} />
            <Route path=":categoryName" element={<PropertyDetail />} />
            <Route path=":categoryName/:propertyId" element={<PropertyList />} />
          </Route>

          {/* Events */}
          <Route path="events" element={<Events />} />

          {/* Career */}
          <Route path="career" element={<CareerPages />} />

          {/* Buy and Sell */}
          <Route path="buy-and-sell" element={<Buysellpages />} />
          <Route path="community" element={<Community />} />

          {/* TRAVEL ADMIN ROUTE */}
          {/* Note: 'travell' matches your sidebar link. If you want to fix the typo, change path to "travel" */}
          <Route path="travell" element={<TravelAdmin />} />
          {/* ------------------------------------------------- */}

          <Route path="host-details" element={<Hostdetailpages />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;