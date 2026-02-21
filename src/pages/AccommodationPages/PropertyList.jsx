import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MapIcon,
  HeartIcon,
  MapPinIcon,
  UserGroupIcon,
  HomeIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";
import { StarIcon, HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

const VIEW_MODES = { GRID: 'grid', LIST: 'list', MAP: 'map' };

const PropertyList = ({ type, onBack, onPropertyClick }) => {
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    priceRange: [0, 10000],
    bedrooms: null,
    bathrooms: null,
    sortBy: 'recommended'
  });

  const toggleFavorite = useCallback((propertyId) => {
    setFavorites(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  }, []);

  const filteredProperties = useMemo(() => {
    let filtered = type.properties.filter(item => {
      const p = item.property;
      const matchesSearch = searchTerm === '' ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPrice = p.price_per_night >= activeFilters.priceRange[0] &&
        p.price_per_night <= activeFilters.priceRange[1];

      const matchesBedrooms = activeFilters.bedrooms === null ||
        p.bedrooms >= parseInt(activeFilters.bedrooms);

      const matchesBathrooms = activeFilters.bathrooms === null ||
        p.bathrooms >= parseInt(activeFilters.bathrooms);

      return matchesSearch && matchesPrice && matchesBedrooms && matchesBathrooms;
    });

    switch (activeFilters.sortBy) {
      case 'priceLow':
        return filtered.sort((a, b) => a.property.price_per_night - b.property.price_per_night);
      case 'priceHigh':
        return filtered.sort((a, b) => b.property.price_per_night - a.property.price_per_night);
      case 'rating':
        return filtered.sort((a, b) => (b.property.rating || 0) - (a.property.rating || 0));
      default:
        return filtered;
    }
  }, [type.properties, searchTerm, activeFilters]);

  // --- SUB-COMPONENTS ---

  const FilterPill = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${active
        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
        }`}
    >
      {label}
    </button>
  );

  const PropertyCard = ({ item, idx }) => {
    const p = item.property;
    const isFavorite = favorites.includes(p.id);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: idx * 0.05 }}
        className="group relative bg-slate-800/40 backdrop-blur-sm rounded-3xl overflow-hidden border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer"
        onClick={() => onPropertyClick(item)}
      >
        {/* Image Container */}
        <div className="relative h-60 w-full overflow-hidden">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
            src={p.photos && p.photos.length > 0 ? p.photos[0] : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80"}
            alt={p.title}
            className="w-full h-full object-cover"
          />

          {/* Top Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>

          {/* Type Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-black/40 backdrop-blur-md text-white text-xs font-bold rounded-lg border border-white/10 uppercase tracking-wider">
              {p.property_type || "Stay"}
            </span>
          </div>

          {/* Favorite Button */}
          <button
            className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 transition-all z-10"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(p.id);
            }}
          >
            {isFavorite ? (
              <HeartSolidIcon className="w-5 h-5 text-rose-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-xl text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">{p.title}</h3>
            <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
              <StarIcon className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-amber-500">{p.rating ? p.rating : 'New'}</span>
            </div>
          </div>

          <div className="flex items-center text-slate-400 mb-4 text-sm">
            <MapPinIcon className="w-4 h-4 mr-1 text-indigo-400" />
            <span>{p.city}, {p.country}</span>
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-700/50">
              <HomeIcon className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-300">{p.bedrooms} Beds</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-700/50">
              <SparklesIcon className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-300">{p.bathrooms} Baths</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-700/50">
              <UserGroupIcon className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-300">{p.guests} Guests</span>
            </div>
          </div>

          <div className="flex justify-between items-end border-t border-slate-700/50 pt-4">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-0.5">Price / Night</p>
              <p className="text-2xl font-bold text-white tracking-tight">₹{p.price_per_night}</p>
            </div>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all">
              Details
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans pb-12">
      {/* --- HEADER --- */}
      <div className="pt-8 pb-12 px-6 bg-gradient-to-b from-indigo-900/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 text-slate-300 rounded-full hover:bg-slate-700 hover:text-white transition-colors mb-8 border border-slate-700/50"
          >
            <ArrowLeftIcon className="w-5 h-5" /> Back to Categories
          </button>

          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl md:text-5xl font-bold text-white mb-3"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{type.name}</span> Stays
              </motion.h1>
              <p className="text-slate-400 text-lg">Browse {type.properties.length} premium properties available for you.</p>
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-auto flex-1 max-w-md">
              <div className="relative group">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search location, property name..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* --- TOOLBAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          {/* Filters Trigger */}
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button
              onClick={() => setFilterPanelOpen(!filterPanelOpen)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 border ${filterPanelOpen
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              Filters
            </button>
            <div className="h-6 w-px bg-slate-700 mx-2"></div>
            <FilterPill label="Price: Low to High" active={activeFilters.sortBy === 'priceLow'} onClick={() => setActiveFilters({ ...activeFilters, sortBy: 'priceLow' })} />
            <FilterPill label="Top Rated" active={activeFilters.sortBy === 'rating'} onClick={() => setActiveFilters({ ...activeFilters, sortBy: 'rating' })} />
          </div>

          {/* View Toggle */}
          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
            <button
              onClick={() => setViewMode(VIEW_MODES.GRID)}
              className={`p-2 rounded-lg transition-all ${viewMode === VIEW_MODES.GRID ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode(VIEW_MODES.LIST)}
              className={`p-2 rounded-lg transition-all ${viewMode === VIEW_MODES.LIST ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode(VIEW_MODES.MAP)}
              className={`p-2 rounded-lg transition-all ${viewMode === VIEW_MODES.MAP ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <MapIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- FILTER PANEL --- */}
        <AnimatePresence>
          {filterPanelOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-6 md:p-8 backdrop-blur-md">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Price Range</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={activeFilters.priceRange[0]}
                        onChange={(e) => setActiveFilters({
                          ...activeFilters,
                          priceRange: [parseInt(e.target.value) || 0, activeFilters.priceRange[1]]
                        })}
                      />
                      <span className="text-slate-500">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={activeFilters.priceRange[1]}
                        onChange={(e) => setActiveFilters({
                          ...activeFilters,
                          priceRange: [activeFilters.priceRange[0], parseInt(e.target.value) || 0]
                        })}
                      />
                    </div>
                  </div>

                  {[
                    { label: "Bedrooms", key: "bedrooms" },
                    { label: "Bathrooms", key: "bathrooms" }
                  ].map((filter) => (
                    <div className="space-y-3" key={filter.key}>
                      <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">{filter.label}</label>
                      <select
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
                        value={activeFilters[filter.key] || ''}
                        onChange={(e) => setActiveFilters({ ...activeFilters, [filter.key]: e.target.value })}
                      >
                        <option value="">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                      </select>
                    </div>
                  ))}

                  <div className="flex items-end">
                    <button
                      onClick={() => setActiveFilters({
                        priceRange: [0, 10000],
                        bedrooms: null,
                        bathrooms: null,
                        sortBy: 'recommended'
                      })}
                      className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- GRID / LIST VIEW --- */}
        {filteredProperties.length === 0 ? (
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-16 text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <FunnelIcon className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No properties found</h3>
            <p className="text-slate-400">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === VIEW_MODES.GRID ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredProperties.map((item, idx) => <PropertyCard key={idx} item={item} idx={idx} />)}
              </motion.div>
            ) : viewMode === VIEW_MODES.LIST ? (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* List View Item implementation similar to Card but Horizontal */}
                {filteredProperties.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="flex flex-col sm:flex-row bg-slate-800/40 border border-slate-700/50 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all cursor-pointer group"
                    onClick={() => onPropertyClick(item)}
                  >
                    <div className="sm:w-64 h-48 sm:h-auto relative overflow-hidden">
                      <img
                        src={item.property.photos?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80"}
                        alt={item.property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-xl text-white">{item.property.title}</h3>
                          <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg">
                            <StarIcon className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-xs font-bold text-amber-500">{item.property.rating ? item.property.rating : 'New'}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-slate-400 mb-4 text-sm">
                          <MapPinIcon className="w-4 h-4 mr-1 text-indigo-400" />
                          <span>{item.property.city}, {item.property.country}</span>
                        </div>

                        <div className="flex gap-4 mb-4">
                          <div className="flex items-center gap-2 text-slate-300 text-sm">
                            <HomeIcon className="w-4 h-4 text-slate-500" /> {item.property.bedrooms} Beds
                          </div>
                          <div className="flex items-center gap-2 text-slate-300 text-sm">
                            <SparklesIcon className="w-4 h-4 text-slate-500" /> {item.property.bathrooms} Baths
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-2xl font-bold text-white">₹{item.property.price_per_night}</span>
                          <span className="text-sm text-slate-500 ml-1">/ night</span>
                        </div>
                        <button className="text-indigo-400 font-semibold group-hover:text-indigo-300 group-hover:underline">
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-16 text-center">
                <MapIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">Map View</h3>
                <p className="text-slate-400">Interactive map integration coming soon.</p>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default PropertyList;