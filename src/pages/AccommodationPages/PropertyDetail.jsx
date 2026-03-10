import React, { useState } from "react";
import {
    ArrowLeftIcon,
    MapPinIcon,
    UserGroupIcon,
    HomeIcon,
    Square3Stack3DIcon,
    CurrencyDollarIcon,
    StarIcon,
    ShieldCheckIcon,
    WifiIcon,
    SparklesIcon,
    PhotoIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

const PropertyDetail = ({ property, onBack }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const p = property?.property || {};
    const h = property?.host || {};

    // Safety check if property data is missing
    if (!p.title) return <div className="p-8 text-white">Loading property details...</div>;

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans pb-12">
            {/* --- HERO SECTION --- */}
            <div className="relative h-[50vh] min-h-[400px] w-full bg-slate-900 group">
                {/* Back Button (Floating) */}
                <button
                    onClick={onBack}
                    className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full transition-all duration-300 border border-white/10 group-hover:pl-3"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span className="font-medium">Back to Listings</span>
                </button>

                {/* Main Image */}
                {p.photos && p.photos.length > 0 ? (
                    <div className="w-full h-full relative">
                        <img
                            src={p.photos[currentImageIndex]}
                            alt={p.title}
                            className="w-full h-full object-cover transition-transform duration-1000"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent"></div>
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                        <PhotoIcon className="w-20 h-20" />
                    </div>
                )}

                {/* Floating Image Gallery Dots */}
                {p.photos && p.photos.length > 1 && (
                    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {p.photos.slice(0, 5).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${currentImageIndex === idx ? "bg-white w-6" : "bg-white/40 hover:bg-white/80"
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* Title & Location Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                        {p.property_type || "Property"}
                                    </span>
                                    {p.privacy_type && (
                                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                            {p.privacy_type}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
                                    {p.title}
                                </h1>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <MapPinIcon className="w-5 h-5 text-indigo-400" />
                                    <span className="text-lg">{p.city}, {p.country}</span>
                                </div>
                            </div>

                            {/* Price Badge (Hero) */}
                            <div className="flex flex-col items-end">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white tracking-tight">
                                        {p.currency || "₹"}{p.price_per_night}
                                    </span>
                                    <span className="text-slate-400 font-medium">/ night</span>
                                </div>
                                <div className="text-sm text-slate-400 mt-1">
                                    {p.price_per_month ? `${p.currency}${p.price_per_month}/month` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT GRID --- */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN (Details) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm flex flex-col items-center justify-center text-center group hover:bg-slate-800 transition-all">
                                <UserGroupIcon className="w-6 h-6 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-xl font-bold text-white">{p.guests || 1}</span>
                                <span className="text-xs text-slate-400 uppercase tracking-wide">Guests</span>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm flex flex-col items-center justify-center text-center group hover:bg-slate-800 transition-all">
                                <HomeIcon className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-xl font-bold text-white">{p.bedrooms || 1}</span>
                                <span className="text-xs text-slate-400 uppercase tracking-wide">Bedrooms</span>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm flex flex-col items-center justify-center text-center group hover:bg-slate-800 transition-all">
                                <SparklesIcon className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-xl font-bold text-white">{p.bathrooms || 1}</span>
                                <span className="text-xs text-slate-400 uppercase tracking-wide">Baths</span>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm flex flex-col items-center justify-center text-center group hover:bg-slate-800 transition-all">
                                <Square3Stack3DIcon className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-xl font-bold text-white">{p.area || 0}</span>
                                <span className="text-xs text-slate-400 uppercase tracking-wide">Sq. Ft</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-slate-800/30 rounded-3xl p-8 border border-slate-700/30">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <StarSolid className="w-5 h-5 text-amber-400" />
                                About this place
                            </h3>
                            <p className="text-slate-300 leading-relaxed text-lg font-light">
                                {p.description || "No description provided for this property."}
                            </p>
                        </div>

                        {/* Amenities */}
                        <div className="bg-slate-800/30 rounded-3xl p-8 border border-slate-700/30">
                            <h3 className="text-xl font-bold text-white mb-6">What this place offers</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {p.amenities?.length > 0 ? (
                                    p.amenities.map((amenity, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                                <SparklesIcon className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <span className="text-slate-200 font-medium">{amenity}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-500">No amenities listed.</p>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN (Host & Rules) */}
                    <div className="space-y-8">

                        {/* Host Card */}
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 border border-slate-700 shadow-xl relative overflow-hidden">
                            {/* Decorative Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>

                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg ring-4 ring-slate-800">
                                    {h.full_name?.charAt(0) || 'H'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Hosted by {h.full_name?.split(' ')[0]}</h3>
                                    <p className="text-slate-400 text-sm">Member since 2024</p>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-3 text-slate-300">
                                    <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center">
                                        <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Identity Verified</p>
                                        <p className="text-xs text-slate-500">{h.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300">
                                    <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center">
                                        <StarIcon className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Superhost</p>
                                        <p className="text-xs text-slate-500">{h.phone || 'No phone verified'}</p>
                                    </div>
                                </div>
                            </div>

                            <button className="mt-6 w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-lg shadow-white/5">
                                Contact Host
                            </button>
                        </div>

                        {/* Rules Card */}
                        <div className="bg-slate-800/30 rounded-3xl p-6 border border-slate-700/30">
                            <h3 className="text-lg font-bold text-white mb-4">House Rules</h3>
                            <ul className="space-y-3">
                                {p.rules?.length > 0 ? (
                                    p.rules.map((rule, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2 flex-shrink-0"></span>
                                            {rule}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-slate-500 italic">No rules specified by host.</li>
                                )}
                            </ul>
                        </div>

                        {/* Location Mini Map Placeholder */}
                        <div className="bg-slate-800/30 rounded-3xl p-1 border border-slate-700/30 h-48 relative group overflow-hidden">
                            <div className="absolute inset-0 bg-slate-700 flex items-center justify-center">
                                <MapPinIcon className="w-8 h-8 text-slate-500 mb-2" />
                            </div>
                            {/* You would integrate Google Maps / Leaflet here */}
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/10 transition-colors cursor-pointer">
                                <span className="px-4 py-2 bg-white/90 text-slate-900 text-sm font-bold rounded-full shadow-lg">
                                    View on Map
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetail;
