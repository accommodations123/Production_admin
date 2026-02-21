import React, { useState, useEffect } from 'react';
import {
    HomeIcon,
    MapPinIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    XMarkIcon,
    CheckBadgeIcon,
    BuildingOfficeIcon,
    SparklesIcon,
    EyeIcon,
    PhotoIcon,
    WifiIcon,
    TvIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon as CheckBadgeSolid } from '@heroicons/react/24/solid';

const PropertyApproved = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const BASE_URL = "https://api.nextkinlife.live";

    const getAuthHeaders = () => {
        const token = localStorage.getItem("admin-auth");
        if (!token) console.error("No token found");
        return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    };

    useEffect(() => {
        console.log("🔵 PropertyApproved component mounted - fetching approved properties...");

        const fetchApproved = async () => {
            console.log("🔵 Calling API:", `${BASE_URL}/adminproperty/admin/properties/approved`);
            try {
                const response = await fetch(`${BASE_URL}/adminproperty/admin/properties/approved`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                if (Array.isArray(data)) {
                    setProperties(data);
                } else if (data && Array.isArray(data.data)) {
                    setProperties(data.data);
                } else if (data && Array.isArray(data.properties)) {
                    setProperties(data.properties);
                } else {
                    console.error("Unexpected API Data Format:", data);
                    setProperties([]);
                }

            } catch (err) {
                console.error("Error fetching approved properties:", err);
                setProperties([]);
            } finally {
                setLoading(false);
            }
        };

        fetchApproved();
    }, []);

    const handleRefresh = () => {
        setLoading(true);
        window.location.reload();
    };

    // Loading State
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-200 rounded-full animate-spin border-t-emerald-600"></div>
                    <CheckBadgeSolid className="w-6 h-6 text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="mt-4 text-slate-600 font-medium animate-pulse">Loading approved properties...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 shadow-xl shadow-emerald-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                            <CheckBadgeSolid className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Approved Properties</h2>
                            <p className="text-emerald-100 text-sm mt-1">
                                {properties.length} properties are live and active
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all duration-300 font-medium text-sm"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <HomeIcon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{properties.length}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Total Live</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <MapPinIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {new Set(properties.map(p => p.city)).size}
                            </p>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Cities</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <UserGroupIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {new Set(properties.map(p => p.Host?.full_name)).size}
                            </p>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Hosts</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 rounded-lg">
                            <SparklesIcon className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {properties.filter(p => p.property_type === 'villa' || p.property_type === 'apartment').length}
                            </p>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Premium</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Properties Grid */}
            {properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {properties.map((property) => (
                        <div
                            key={property.id}
                            className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            {/* Image Section */}
                            <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                                {property.photos?.[0] ? (
                                    <img
                                        src={property.photos[0]}
                                        alt={property.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <HomeIcon className="w-16 h-16 text-slate-300" />
                                    </div>
                                )}

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                {/* Status Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                                        <CheckBadgeSolid className="w-3.5 h-3.5" />
                                        Approved
                                    </span>
                                </div>

                                {/* Property Type */}
                                <div className="absolute top-3 right-3">
                                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold rounded-full shadow-sm capitalize">
                                        {property.property_type || 'Property'}
                                    </span>
                                </div>

                                {/* Photo Count */}
                                {property.photos?.length > 1 && (
                                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-lg">
                                        <PhotoIcon className="w-3.5 h-3.5" />
                                        {property.photos.length}
                                    </div>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="p-5">
                                {/* Title & Location */}
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                                        {property.title || `Property #${property.id}`}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1">
                                        <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{property.city}, {property.country}</span>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-y border-slate-100">
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-slate-900">{property.guests || 0}</p>
                                        <p className="text-xs text-slate-500">Guests</p>
                                    </div>
                                    <div className="text-center border-x border-slate-100">
                                        <p className="text-lg font-bold text-slate-900">{property.bedrooms || 0}</p>
                                        <p className="text-xs text-slate-500">Beds</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-slate-900">{property.bathrooms || 0}</p>
                                        <p className="text-xs text-slate-500">Baths</p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-emerald-600">
                                            {property.currency || '₹'}{property.price_per_night}
                                        </span>
                                        <span className="text-slate-500 text-sm">/night</span>
                                    </div>
                                    {property.price_per_month && (
                                        <div className="text-right">
                                            <span className="text-sm font-semibold text-slate-700">
                                                {property.currency || '₹'}{property.price_per_month}
                                            </span>
                                            <span className="text-xs text-slate-400">/month</span>
                                        </div>
                                    )}
                                </div>

                                {/* Host Info */}
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        {property.Host?.full_name?.charAt(0) || 'H'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 truncate">
                                            {property.Host?.full_name || 'Unknown Host'}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">
                                            {property.Host?.User?.email || 'No email'}
                                        </p>
                                    </div>
                                </div>

                                {/* View Button */}
                                <button
                                    onClick={() => setSelectedProperty(property)}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300"
                                >
                                    <EyeIcon className="w-4 h-4" />
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-100">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <HomeIcon className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No Approved Properties</h3>
                    <p className="text-slate-500 text-center max-w-md">
                        There are no approved properties at the moment. Properties will appear here once they are approved.
                    </p>
                </div>
            )}

            {/* Detail Modal */}
            {selectedProperty && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="relative h-72 bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">
                            {selectedProperty.photos?.length > 0 ? (
                                <>
                                    <img
                                        src={selectedProperty.photos[currentImageIndex]}
                                        alt={selectedProperty.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {selectedProperty.photos.length > 1 && (
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                            {selectedProperty.photos.slice(0, 5).map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentImageIndex(idx)}
                                                    className={`w-2.5 h-2.5 rounded-full transition-all ${currentImageIndex === idx
                                                        ? 'bg-white scale-125'
                                                        : 'bg-white/50 hover:bg-white/75'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <HomeIcon className="w-24 h-24 text-slate-300" />
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20"></div>

                            {/* Close Button */}
                            <button
                                onClick={() => { setSelectedProperty(null); setCurrentImageIndex(0); }}
                                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6 text-white" />
                            </button>

                            {/* Title Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white text-xs font-bold uppercase rounded-full">
                                        <CheckBadgeSolid className="w-3.5 h-3.5" />
                                        Approved
                                    </span>
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full capitalize">
                                        {selectedProperty.property_type}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-1">
                                    {selectedProperty.title || `Property #${selectedProperty.id}`}
                                </h2>
                                <div className="flex items-center gap-2 text-white/90">
                                    <MapPinIcon className="w-4 h-4" />
                                    <span>{selectedProperty.city}, {selectedProperty.state}, {selectedProperty.country}</span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Quick Stats Row */}
                            <div className="grid grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-emerald-50 rounded-xl">
                                    <p className="text-2xl font-bold text-emerald-600">{selectedProperty.guests || 0}</p>
                                    <p className="text-xs font-medium text-emerald-600/70 uppercase">Guests</p>
                                </div>
                                <div className="text-center p-4 bg-blue-50 rounded-xl">
                                    <p className="text-2xl font-bold text-blue-600">{selectedProperty.bedrooms || 0}</p>
                                    <p className="text-xs font-medium text-blue-600/70 uppercase">Bedrooms</p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-xl">
                                    <p className="text-2xl font-bold text-purple-600">{selectedProperty.bathrooms || 0}</p>
                                    <p className="text-xs font-medium text-purple-600/70 uppercase">Bathrooms</p>
                                </div>
                                <div className="text-center p-4 bg-amber-50 rounded-xl">
                                    <p className="text-2xl font-bold text-amber-600">{selectedProperty.area || 0}</p>
                                    <p className="text-xs font-medium text-amber-600/70 uppercase">Sq. Ft</p>
                                </div>
                            </div>

                            {/* Pricing Section */}
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
                                <h3 className="text-lg font-bold mb-4">Pricing</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                                        <p className="text-xs uppercase tracking-wider text-white/80 mb-1">Per Hour</p>
                                        <p className="text-xl font-bold">{selectedProperty.currency} {selectedProperty.price_per_hour || 'N/A'}</p>
                                    </div>
                                    <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 text-center border-2 border-white/50">
                                        <p className="text-xs uppercase tracking-wider text-white/80 mb-1">Per Night</p>
                                        <p className="text-2xl font-bold">{selectedProperty.currency} {selectedProperty.price_per_night}</p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                                        <p className="text-xs uppercase tracking-wider text-white/80 mb-1">Per Month</p>
                                        <p className="text-xl font-bold">{selectedProperty.currency} {selectedProperty.price_per_month || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedProperty.description && (
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-3">About this property</h3>
                                    <p className="text-slate-600 leading-relaxed">{selectedProperty.description}</p>
                                </div>
                            )}

                            {/* Amenities & Rules */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Amenities */}
                                <div className="bg-slate-50 rounded-2xl p-5">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <SparklesIcon className="w-5 h-5 text-emerald-600" />
                                        Amenities
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProperty.amenities?.length > 0 ? (
                                            selectedProperty.amenities.map((amenity, idx) => (
                                                <span key={idx} className="px-3 py-1.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-200 shadow-sm">
                                                    {amenity}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-400 text-sm">No amenities listed</span>
                                        )}
                                    </div>
                                </div>

                                {/* Rules */}
                                <div className="bg-slate-50 rounded-2xl p-5">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">House Rules</h3>
                                    <ul className="space-y-2">
                                        {selectedProperty.rules?.length > 0 ? (
                                            selectedProperty.rules.map((rule, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
                                                    {rule}
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-slate-400 text-sm">No rules specified</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Host Section */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
                                <h3 className="text-lg font-bold mb-4">Host Information</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-2xl font-bold shadow-lg">
                                        {selectedProperty.Host?.full_name?.charAt(0) || 'H'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xl font-bold">{selectedProperty.Host?.full_name || 'Unknown Host'}</p>
                                        <p className="text-white/70">{selectedProperty.Host?.User?.email || 'No email provided'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-slate-500 text-xs uppercase mb-1">Property ID</p>
                                    <p className="font-semibold text-slate-900">{selectedProperty.id}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-slate-500 text-xs uppercase mb-1">Created</p>
                                    <p className="font-semibold text-slate-900">{new Date(selectedProperty.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-slate-500 text-xs uppercase mb-1">Privacy Type</p>
                                    <p className="font-semibold text-slate-900 capitalize">{selectedProperty.privacy_type || 'N/A'}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-slate-500 text-xs uppercase mb-1">Pets Allowed</p>
                                    <p className="font-semibold text-slate-900">{selectedProperty.pets_allowed || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyApproved;