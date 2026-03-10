import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence, } from 'framer-motion';
import {
  Building, Plus, ArrowRight, Search, Filter, Grid, List, X, Home, Bell, Map, Eye, Edit, Trash2, Copy, Mail, Phone, CalendarDays, Wifi, Car, Coffee, Dumbbell, Tv, Wind, MoreHorizontal
} from 'lucide-react';
import PropertyList from "./PropertyList";
import PropertyDetail from "./PropertyDetail";

// --- CONFIG ---
const API_URL = "https://api.nextkinlife.live/admin/approved/approved-host-details";
const BRAND_COLORS = {
  primary: "#00162d", // Navy
  accent: "#cb2926",  // Red
};

const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
  MAP: 'map'
};

const VIEWS = {
  CATEGORIES: 'categories',
  PROPERTIES: 'properties',
  DETAILS: 'details'
};

// Icon mapping
const TYPE_ICONS = {
  'apartment': Building,
  'house': Home,
  'studio': Building,
  'villa': Home,
  'condo': Building,
  'loft': Home,
  'cabin': Home,
  'bungalow': Home,
  'townhouse': Building,
  'guesthouse': Home,
  'hotel': Building,
  'resort': Home,
  'hostel': Building,
  'motel': Building,
  'camping': Home,
  'other': Building
};

const CATEGORY_NAMES = {
  'apartment': 'Apartment',
  'house': 'House',
  'studio': 'Studio',
  'villa': 'Villa',
  'condo': 'Condo',
  'loft': 'Loft',
  'cabin': 'Cabin',
  'bungalow': 'Bungalow',
  'townhouse': 'Townhouse',
  'guesthouse': 'Guesthouse',
  'hotel': 'Hotel',
  'resort': 'Resort',
  'hostel': 'Hostel',
  'motel': 'Motel',
  'camping': 'Camping',
  'other': 'Other'
};

const AccommodationCategories = () => {
  const [categories, setCategories] = useState([]);
  const [view, setView] = useState("categories");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', title: 'New Booking', message: 'A new booking has been made', time: '5 minutes ago', read: false },
    { id: 2, type: 'warning', title: 'Payment Pending', message: 'Payment is pending for booking #12345', time: '1 hour ago', read: false },
    { id: 3, type: 'success', title: 'Property Listed', message: 'Your new property has been successfully listed', time: '3 hours ago', read: true }
  ]);

  const [activeFilters, setActiveFilters] = useState({
    priceRange: [0, 1000],
    amenities: [],
    rating: 0,
    availability: null,
    propertySize: null,
    bedrooms: null,
    bathrooms: null
  });

  const [formData, setFormData] = useState({
    listType: '',
    propertyType: '',
    guests: '',
    streetAddress: '',
    city: '',
    zipCode: '',
    country: '',
    propertyName: '',
    propertyDescription: '',
    propertySize: '',
    bedrooms: '',
    bathrooms: '',
    amenities: [],
    pricePerNight: '',
    images: [],
    availability: []
  });

  const searchInputRef = useRef(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("admin-auth");
        if (!token) {
          throw new Error("No authentication token found.");
        }

        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 401) throw new Error("Authentication failed.");
          throw new Error("Failed to fetch data");
        }

        const json = await res.json();
        if (!json.success || !json.data) {
          throw new Error("Invalid API response format");
        }

        const grouped = {};

        json.data.forEach((item) => {
          const normalized = {
            property: {
              id: item.id,
              category_id: item.category_id,
              property_type: item.property_type,
              privacy_type: item.privacy_type,
              guests: item.guests,
              bedrooms: item.bedrooms,
              bathrooms: item.bathrooms,
              pets_allowed: item.pets_allowed,
              area: item.area,
              title: item.title || `${item.property_type} in ${item.city}`,
              description: item.description,
              country: item.country,
              city: item.city,
              address: item.address,
              photos: item.photos || [],
              video: item.video,
              amenities: item.amenities || [],
              rules: item.rules || [],
              legal_docs: item.legal_docs || [],
              price_per_hour: item.price_per_hour,
              price_per_night: item.price_per_night,
              price_per_month: item.price_per_month,
              currency: item.currency,
              status: item.status,
              createdAt: item.createdAt,
            },
            host: {
              id: item.Host?.id,
              full_name: item.Host?.full_name,
              phone: item.Host?.phone,
              email: item.Host?.User?.email,
            },
          };

          if (!grouped[item.category_id]) {
            grouped[item.category_id] = {
              id: item.category_id,
              name: CATEGORY_NAMES[item.category_id] || item.category_id.toUpperCase(),
              icon: TYPE_ICONS[item.category_id] || Building,
              description: `Browse all ${CATEGORY_NAMES[item.category_id] || item.category_id} properties`,
              properties: [],
              count: 0,
            };
          }

          grouped[item.category_id].properties.push(normalized);
          grouped[item.category_id].count += 1;
        });

        setCategories(Object.values(grouped));
        setError(null);
      } catch (err) {
        console.error("Error fetching accommodation data:", err);
        setError(err.message);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- HANDLERS ---
  const handleBackToCategories = useCallback(() => {
    setView(VIEWS.CATEGORIES);
    setSelectedCategory(null);
    setSelectedProperty(null);
  }, []);

  const handleViewProperties = useCallback((category) => {
    setSelectedCategory(category);
    setView(VIEWS.PROPERTIES);
  }, []);

  const handleViewProperty = useCallback((property) => {
    setSelectedProperty(property);
    setView(VIEWS.DETAILS);
  }, []);

  const handleBackToProperties = useCallback(() => {
    setView(VIEWS.PROPERTIES);
    setSelectedProperty(null);
  }, []);

  const handlePropertyFormSubmit = useCallback((e) => {
    e.preventDefault();
    console.log('Form data submitted:', formData);
    setFormData({
      listType: '', propertyType: '', guests: '', streetAddress: '', city: '', zipCode: '',
      country: '', propertyName: '', propertyDescription: '', propertySize: '',
      bedrooms: '', bathrooms: '', amenities: [], pricePerNight: '',
      images: [], availability: []
    });
    setShowPropertyForm(false);
    setNotifications(prev => [{ id: Date.now(), type: 'success', title: 'Property Added', message: `${formData.propertyName} has been added.`, time: 'Just now', read: false }, ...prev]);
  }, [formData]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleNotificationClick = useCallback((notificationId) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // --- FILTERS ---
  const filteredCategories = useMemo(() =>
    categories.filter(category => {
      return category.name.toLowerCase().includes(searchTerm.toLowerCase());
    }), [categories, searchTerm]);

  // --- SUB-RENDER VIEWS ---
  if (view === VIEWS.DETAILS && selectedProperty) {
    return <PropertyDetail property={selectedProperty} onBack={handleBackToProperties} />;
  }

  if (view === VIEWS.PROPERTIES && selectedCategory) {
    return (
      <PropertyList
        type={selectedCategory}
        onBack={handleBackToCategories}
        onPropertyClick={handleViewProperty}
      />
    );
  }

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-200">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-8">

        {/* PREMIUM HEADER */}
        <header className="bg-white/80 backdrop-blur-xl border border-slate-200 sticky top-0 z-40 rounded-2xl shadow-sm px-6 py-4 mb-8 flex justify-between items-center transition-all">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gradient-to-br from-[#00162d] to-[#002a4d] rounded-xl text-white shadow-lg">
              <Building size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: BRAND_COLORS.primary }}>
                Accommodation
              </h1>
              <p className="text-sm text-slate-500 font-medium">Manage approved listings</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
            >
              <Bell size={20} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#cb2926] rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#00162d] to-[#002a4d] text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all font-medium">
              <Plus size={18} />
              <span>Add New</span>
            </button>
          </div>
        </header>

        {/* NOTIFICATION PANEL */}
        <AnimatePresence>
          {notificationPanelOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed right-8 top-24 w-96 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800">Notifications</h3>
                <button onClick={markAllNotificationsAsRead} className="text-xs font-semibold text-[#00162d] hover:underline">Mark all read</button>
              </div>
              <div className="max-h-96 overflow-y-auto p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    className={`group p-4 mb-2 rounded-xl cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${notification.type === 'warning' ? 'bg-amber-500' : notification.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                        <h4 className="font-semibold text-sm text-slate-800">{notification.title}</h4>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{notification.time}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-snug pl-4">{notification.message}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LOADING & ERROR */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-[#00162d] rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium animate-pulse">Loading Inventory...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-sm flex items-center">
            <XCircle size={24} className="mr-3" />
            <div>
              <p className="font-bold">Error loading data</p>
              <p className="text-sm">{error}. Please try refreshing.</p>
            </div>
          </div>
        ) : (
          <>
            {/* CONTROLS BAR */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8 gap-4">
              <div className="relative w-full md:w-1/3 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00162d] transition-colors" size={18} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search categories..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#00162d] transition-all font-medium placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setFilterPanelOpen(!filterPanelOpen)}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${filterPanelOpen ? 'bg-[#00162d] text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  <Filter size={18} />
                  <span>Filters</span>
                </button>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {[
                    { mode: VIEW_MODES.GRID, icon: Grid },
                    { mode: VIEW_MODES.LIST, icon: List },
                    { mode: VIEW_MODES.MAP, icon: Map }
                  ].map(({ mode, icon: Icon }) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`p-2.5 rounded-lg transition-all ${viewMode === mode ? 'bg-white text-[#00162d] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Icon size={18} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* FILTER PANEL */}
            <AnimatePresence>
              {filterPanelOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 mb-8 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {/* Simplified Filter Inputs for Visual Demo */}
                    {['Price', 'Rating', 'Size', 'Beds', 'Baths', 'Amenities'].map((f, i) => (
                      <div key={i} className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">{f}</label>
                        <div className="h-10 bg-slate-50 rounded-lg animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between items-end mb-6">
              <h2 className="text-3xl font-bold text-slate-900">Categories</h2>
              <span className="text-sm text-slate-500 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
                Showing {filteredCategories.length} types
              </span>
            </div>

            {/* CATEGORIES GRID/LIST/MAP */}
            <AnimatePresence mode="wait">
              {viewMode === VIEW_MODES.GRID ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
                >
                  {filteredCategories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      whileHover={{ y: -6 }}
                      className="group relative bg-white rounded-3xl shadow-sm hover:shadow-2xl border border-slate-100 cursor-pointer overflow-hidden h-full flex flex-col"
                      onClick={() => handleViewProperties(category)}
                    >
                      {/* Decorative Gradient BG for Header */}
                      <div className="h-24 bg-gradient-to-br from-[#00162d] via-[#002a4d] to-[#00162d] p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                        <div className="relative z-10 flex items-center justify-between">
                          <category.icon className="text-white drop-shadow-lg" size={32} />
                          <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10">
                            {category.count} Props
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#cb2926] transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                            {category.description}
                          </p>
                        </div>

                        <div className="mt-6 flex items-center text-sm font-medium text-slate-400 group-hover:text-[#00162d] transition-colors">
                          <span>Browse List</span>
                          <ArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" size={16} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : viewMode === VIEW_MODES.LIST ? (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  {filteredCategories.map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ x: 5, backgroundColor: "#f8fafc" }}
                      className="p-6 border-b border-slate-100 last:border-0 flex items-center justify-between cursor-pointer"
                      onClick={() => handleViewProperties(category)}
                    >
                      <div className="flex items-center gap-5">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600 shadow-inner">
                          <category.icon size={28} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">{category.name}</h3>
                          <p className="text-slate-500 text-sm mt-1">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-sm font-medium">{category.count} listings</span>
                        <div className="p-2 rounded-full bg-slate-50 group-hover:bg-[#00162d] group-hover:text-white transition-all">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="map"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 h-[600px] flex flex-col items-center justify-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                  <div className="z-10 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00162d] to-[#002a4d] flex items-center justify-center mx-auto mb-6 shadow-lg text-white">
                      <Map size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Map View</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">Interact with property locations geographically</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* ADD PROPERTY MODAL (Premium Overlay) */}
      <AnimatePresence>
        {showPropertyForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-200"
            >
              <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center z-10 backdrop-blur-md bg-white/95">
                <div>
                  <h2 className="text-2xl font-bold text-[#00162d]">Add New Property</h2>
                  <p className="text-slate-500 text-sm">Fill in the details to list a new accommodation.</p>
                </div>
                <button onClick={() => setShowPropertyForm(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handlePropertyFormSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Property Name', name: 'propertyName', type: 'text' },
                  { label: 'Property Type', name: 'propertyType', type: 'select' },
                  { label: 'Price per Night', name: 'pricePerNight', type: 'number' },
                  { label: 'Guests', name: 'guests', type: 'number' },
                  { label: 'Bedrooms', name: 'bedrooms', type: 'number' },
                  { label: 'Bathrooms', name: 'bathrooms', type: 'number' },
                  { label: 'Property Size (sq ft)', name: 'propertySize', type: 'number' },
                  { label: 'Street Address', name: 'streetAddress', type: 'text' },
                  { label: 'City', name: 'city', type: 'text' },
                  { label: 'Zip Code', name: 'zipCode', type: 'text' },
                  { label: 'Country', name: 'country', type: 'text' },
                ].map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wide text-xs">{field.label}</label>
                    {field.type === 'select' ? (
                      <select name={field.name} value={formData[field.name]} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00162d] transition-all font-medium">
                        <option value="">Select Type</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    ) : (
                      <input type={field.type} name={field.name} value={formData[field.name]} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00162d] transition-all font-medium placeholder:text-slate-400" />
                    )}
                  </div>
                ))}

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wide text-xs">Property Description</label>
                  <textarea name="propertyDescription" value={formData.propertyDescription} onChange={handleInputChange} rows={4} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00162d] transition-all font-medium"></textarea>
                </div>

                <div className="md:col-span-2 flex justify-between items-center pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowPropertyForm(false)} className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                  <button type="submit" className="px-8 py-3 bg-[#00162d] text-white font-bold rounded-xl hover:bg-[#002a4d] hover:shadow-lg transition-all">Save Property</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccommodationCategories;