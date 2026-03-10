// src/UnbookedProperties.js

import React, { useState } from 'react';
import {
    ArrowLeft, Star, Wifi, Car, Dumbbell, Coffee, Home, Shield, Utensils, Wind, Droplets, Baby, Ban, Clock as ClockIcon, CalendarX, MapPin,
    Users, Building, Crown, Briefcase, Users2, Tent, Check, X, ChevronRight, Phone, Mail, Globe, Search, Filter, Grid, List, Plus, Heart, Share2
} from 'lucide-react';

// Icon mapping for amenities
const amenityIcons = {
    'High-Speed Wi-Fi': Wifi, 'Free Parking': Car, 'Gym Access': Dumbbell, 'Common Room': Coffee,
    'Laundry': Home, 'Study Lounge': Users, 'Security': Shield, 'Rooftop Terrace': Building,
    'Concierge': Crown, 'Garden': Tent, 'Pet-Friendly': Baby, 'Room Service': Utensils,
    'Business Center': Briefcase, 'Meeting Rooms': Users2, 'Private Pool': Dumbbell,
    'Butler Service': Crown, 'Infinity Pool': Dumbbell, 'Spa Services': Wind,
    'Tour Desk': MapPin, 'Game Room': Coffee, 'Shared Kitchen': Utensils, 'Fire Pit': Wind,
    'Picnic Table': Coffee, 'Heated Pool': Droplets, 'Mini-Fridge': Home, 'Air Conditioning': Wind,
    'Express Check-in': ClockIcon, 'Business Lounge': Briefcase, 'BBQ Area': Wind, 'Lounge': Coffee,
    'Bike Rental': Car, 'Lockers': Shield, 'Shared Bathroom': Droplets, 'Real Bed': Home,
    'Private Deck': Building, 'Restrooms': Droplets, 'Water Access': Droplets, 'Kitchenette': Utensils,
    'In-Unit Laundry': Home, 'Continental Breakfast': Utensils, 'Cleaning Service': Home,
    'Meeting Pods': Users2, 'Personal Chef': Utensils, 'Private Beach': Tent,
};

const UnbookedProperties = ({ onBack, type }) => {
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [favorites, setFavorites] = useState([]);

    // Sample unbooked properties data
    const unbookedProperties = [
        {
            id: 1,
            name: 'Sunset Villa',
            propertyType: 'Villa',
            city: 'Miami',
            country: 'USA',
            price: '$2,500',
            date: '2023-07-15',
            image: 'https://picsum.photos/seed/villa1/400/300.jpg',
            detailedDescription: 'Luxurious beachfront villa with stunning ocean views and private beach access.',
            stats: {
                avgRating: 4.8,
                occupancy: '85%'
            },
            amenities: ['High-Speed Wi-Fi', 'Free Parking', 'Gym Access', 'Private Pool', 'Pet-Friendly', 'Air Conditioning', 'Security', 'Laundry']
        },
        {
            id: 2,
            name: 'Urban Loft',
            propertyType: 'Apartment',
            city: 'New York',
            country: 'USA',
            price: '$3,200',
            date: '2023-08-01',
            image: 'https://picsum.photos/seed/loft1/400/300.jpg',
            detailedDescription: 'Modern loft in heart of downtown with panoramic city views.',
            stats: {
                avgRating: 4.6,
                occupancy: '92%'
            },
            amenities: ['High-Speed Wi-Fi', 'Gym Access', 'Security', 'Air Conditioning', 'Business Center', 'Meeting Rooms']
        },
        {
            id: 3,
            name: 'Mountain Retreat',
            propertyType: 'Cabin',
            city: 'Aspen',
            country: 'USA',
            price: '$1,800',
            date: '2023-09-10',
            image: 'https://picsum.photos/seed/cabin1/400/300.jpg',
            detailedDescription: 'Cozy mountain cabin perfect for winter getaways with ski-in/ski-out access.',
            stats: {
                avgRating: 4.9,
                occupancy: '78%'
            },
            amenities: ['Fire Pit', 'Heated Pool', 'Kitchenette', 'Air Conditioning', 'Pet-Friendly', 'BBQ Area']
        },
        {
            id: 4,
            name: 'Lakeside Cottage',
            propertyType: 'Cottage',
            city: 'Seattle',
            country: 'USA',
            price: '$1,950',
            date: '2023-07-20',
            image: 'https://picsum.photos/seed/cottage1/400/300.jpg',
            detailedDescription: 'Charming cottage with beautiful lake views and a private dock.',
            stats: {
                avgRating: 4.7,
                occupancy: '80%'
            },
            amenities: ['High-Speed Wi-Fi', 'Free Parking', 'Kitchenette', 'Pet-Friendly', 'BBQ Area', 'Water Access']
        },
        {
            id: 5,
            name: 'City Penthouse',
            propertyType: 'Penthouse',
            city: 'San Francisco',
            country: 'USA',
            price: '$4,500',
            date: '2023-08-15',
            image: 'https://picsum.photos/seed/penthouse1/400/300.jpg',
            detailedDescription: 'Luxurious penthouse with panoramic city views and rooftop terrace.',
            stats: {
                avgRating: 4.9,
                occupancy: '95%'
            },
            amenities: ['High-Speed Wi-Fi', 'Concierge', 'Rooftop Terrace', 'Security', 'Air Conditioning', 'Business Center']
        },
        {
            id: 6,
            name: 'Beach Bungalow',
            propertyType: 'Bungalow',
            city: 'San Diego',
            country: 'USA',
            price: '$2,100',
            date: '2023-07-25',
            image: 'https://picsum.photos/seed/bungalow1/400/300.jpg',
            detailedDescription: 'Cozy beach bungalow just steps from the sand with ocean views.',
            stats: {
                avgRating: 4.5,
                occupancy: '75%'
            },
            amenities: ['High-Speed Wi-Fi', 'Free Parking', 'Private Beach', 'Pet-Friendly', 'BBQ Area']
        }
    ];

    // Filter properties based on search term
    const filteredProperties = unbookedProperties.filter(property =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.propertyType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePropertyClick = (property) => {
        setSelectedProperty(property);
    };

    const handleBackToList = () => {
        setSelectedProperty(null);
    };

    const toggleFavorite = (propertyId) => {
        setFavorites(prev =>
            prev.includes(propertyId)
                ? prev.filter(id => id !== propertyId)
                : [...prev, propertyId]
        );
    };

    if (selectedProperty) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-100 to-slate-200 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
                </div>

                {/* Header Navigation - Improved for mobile */}
                <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <button
                                onClick={handleBackToList}
                                className="flex items-center gap-2 text-gray-700 hover:text-red-700 font-medium transition-all duration-300 group relative"
                            >
                                <div className="absolute inset-0 bg-red-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                                <span className="relative flex items-center gap-2 px-3 py-1">
                                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                    <span className="hidden sm:inline">Back to Properties</span>
                                    <span className="sm:hidden">Back</span>
                                </span>
                            </button>
                            <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate max-w-[200px] sm:max-w-none">
                                {selectedProperty.name}
                            </h1>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleFavorite(selectedProperty.id)}
                                    className="p-2 hover:bg-red-100 rounded-lg transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-md hover:shadow-lg"
                                    aria-label="Add to favorites"
                                >
                                    <Heart size={20} className={favorites.includes(selectedProperty.id) ? "text-red-600 fill-current" : "text-gray-600"} />
                                </button>
                                <button className="p-2 hover:bg-red-100 rounded-lg transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-md hover:shadow-lg sm:block hidden" aria-label="Share">
                                    <Share2 size={20} className="text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-red-100 rounded-lg transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-md hover:shadow-lg sm:block hidden" aria-label="Call">
                                    <Phone size={20} className="text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-red-100 rounded-lg transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 shadow-md hover:shadow-lg sm:block hidden" aria-label="Email">
                                    <Mail size={20} className="text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
                    {/* Hero Section with Image and Price - Improved mobile layout */}
                    <section className="mb-6 sm:mb-8">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-500 hover:shadow-2xl">
                            <div className="flex flex-col lg:flex-row">
                                {/* Image Side - Improved mobile height */}
                                <div className="lg:w-3/5 h-56 sm:h-64 md:h-80 lg:h-auto relative">
                                    <img
                                        src={selectedProperty.image}
                                        alt={selectedProperty.name}
                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                                    {/* Floating Badge - Better mobile positioning */}
                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                                        <div className="flex items-center gap-2">
                                            <Star size={16} className="text-yellow-500 fill-current" />
                                            <span className="font-semibold text-sm">{selectedProperty.stats.avgRating}</span>
                                            <span className="text-gray-500 text-xs hidden sm:inline">({Math.floor(Math.random() * 200) + 50})</span>
                                        </div>
                                    </div>

                                    {/* Property Title Overlay - Better mobile text sizing */}
                                    <div className="absolute bottom-0 left-0 p-4 text-white">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium transform transition-all duration-300 hover:bg-white/30">
                                                {selectedProperty.propertyType}
                                            </span>
                                            <span className="px-2 py-1 bg-green-500/80 backdrop-blur-sm rounded-full text-xs font-medium transform transition-all duration-300 hover:bg-green-600/80">
                                                Available Now
                                            </span>
                                        </div>
                                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 transform transition-all duration-500 hover:translate-x-2">{selectedProperty.name}</h1>
                                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                                            <MapPin size={14} />
                                            <span>{selectedProperty.city}, {selectedProperty.country}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Side - Better mobile layout */}
                                <div className="lg:w-2/5 p-4 sm:p-6 bg-gradient-to-br from-red-600 to-red-700">
                                    <div className="h-full flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-white/80 text-sm font-medium mb-2">Pricing Details</h3>
                                            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                                                {selectedProperty.price}
                                                <span className="text-sm sm:text-lg font-normal text-white/80">/month</span>
                                            </div>
                                            <p className="text-white/70 text-sm mb-6">All utilities included</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center py-2 border-b border-white/20">
                                                <span className="text-white/80 text-sm">Security Deposit</span>
                                                <span className="font-semibold text-white">${parseInt(selectedProperty.price.replace('$', '')) * 0.5}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-white/20">
                                                <span className="text-white/80 text-sm">Available From</span>
                                                <span className="font-semibold text-white">{selectedProperty.date}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-white/20">
                                                <span className="text-white/80 text-sm">Minimum Stay</span>
                                                <span className="font-semibold text-white">3 months</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-white/80 text-sm">Property Type</span>
                                                <span className="font-semibold text-white">{selectedProperty.propertyType}</span>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <button className="w-full py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="xl:col-span-2 space-y-6">
                            {/* Description Section - Better mobile spacing */}
                            <section className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-5 transform transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">About This Property</h2>
                                <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">
                                    {selectedProperty.detailedDescription}
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                                    <div className="text-center transform transition-all duration-300 hover:scale-110">
                                        <div className="text-xl sm:text-2xl font-bold text-red-600 mb-1">{selectedProperty.stats.occupancy}</div>
                                        <div className="text-xs text-gray-500">occupancy rate</div>
                                    </div>
                                    <div className="text-center transform transition-all duration-300 hover:scale-110">
                                        <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">4.8</div>
                                        <div className="text-xs text-gray-500">rating</div>
                                    </div>
                                    <div className="text-center transform transition-all duration-300 hover:scale-110">
                                        <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">24/7</div>
                                        <div className="text-xs text-gray-500">support</div>
                                    </div>
                                    <div className="text-center transform transition-all duration-300 hover:scale-110">
                                        <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{selectedProperty.amenities.length}</div>
                                        <div className="text-xs text-gray-500">amenities</div>
                                    </div>
                                </div>
                            </section>

                            {/* Amenities Section - Better mobile grid */}
                            <section className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-5 transform transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">Premium Amenities</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {selectedProperty.amenities.map((amenity, index) => {
                                        const Icon = amenityIcons[amenity];
                                        return (
                                            <div key={index} className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-slate-50 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-md">
                                                <div className="p-2 bg-gradient-to-br from-red-50 to-slate-50 rounded-lg group-hover:from-red-100 group-hover:to-slate-100 transition-all duration-300 transform group-hover:rotate-6 flex-shrink-0">
                                                    {Icon && <Icon size={18} className="text-red-600" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 text-sm truncate">{amenity}</h3>
                                                    <p className="text-xs text-gray-500">Included with your stay</p>
                                                </div>
                                                <ChevronRight size={16} className="text-gray-400 group-hover:text-red-600 transition-all duration-300 group-hover:translate-x-1 flex-shrink-0" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Property Rules Section - Better mobile layout */}
                            <section className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-5 transform transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">House Rules & Policies</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
                                            <div className="p-1.5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm flex-shrink-0">
                                                <ClockIcon size={18} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-sm">Check-in Time</h3>
                                                <p className="text-gray-600 text-xs">3:00 PM - 9:00 PM</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
                                            <div className="p-1.5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm flex-shrink-0">
                                                <CalendarX size={18} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-sm">Cancellation Policy</h3>
                                                <p className="text-gray-600 text-xs">24 hours notice required</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-red-50 transition-all duration-300 transform hover:scale-105">
                                            <div className="p-1.5 bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm flex-shrink-0">
                                                <Ban size={18} className="text-red-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-sm">Smoking Policy</h3>
                                                <p className="text-gray-600 text-xs">Non-smoking property</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
                                            <div className="p-1.5 bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm flex-shrink-0">
                                                <Baby size={18} className="text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-sm">Pet Policy</h3>
                                                <p className="text-gray-600 text-xs">
                                                    {selectedProperty.amenities.includes('Pet-Friendly') ? 'Pets welcome' : 'No pets allowed'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Sidebar - Better mobile layout */}
                        <div className="space-y-6">
                            {/* Owner Details Card - Better mobile spacing */}
                            <section className="bg-gradient-to-br from-white to-red-50/30 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-5 transform transition-all duration-500 hover:shadow-xl hover:-translate-y-1 border border-red-100/50">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">Property Owner</h3>
                                    <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                        Verified
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-base font-bold text-gray-900">John Smith</h4>
                                    <p className="text-xs text-gray-600">Property Manager</p>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 cursor-pointer transform hover:scale-105">
                                        <Phone size={16} className="text-red-600 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="text-sm font-medium text-gray-900 truncate">+1 (555) 123-4567</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 cursor-pointer transform hover:scale-105">
                                        <Mail size={16} className="text-red-600 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="text-sm font-medium text-gray-900 truncate">john.smith@property.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 cursor-pointer transform hover:scale-105">
                                        <MapPin size={16} className="text-red-600 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-500">Address</p>
                                            <p className="text-sm font-medium text-gray-900 truncate">123 Main St, {selectedProperty.city}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="text-center p-2 bg-red-50 rounded-lg">
                                        <p className="text-lg font-bold text-red-600">98%</p>
                                        <p className="text-xs text-gray-600">Response Rate</p>
                                    </div>
                                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                                        <p className="text-sm font-bold text-slate-700">Within 1 hour</p>
                                        <p className="text-xs text-gray-600">Response Time</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 mb-3">
                                    <button className="flex-1 flex items-center justify-center gap-1 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105">
                                        <Mail size={16} />
                                        <span className="text-sm font-semibold">Message</span>
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-1 p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-all duration-300 transform hover:scale-105">
                                        <Phone size={16} />
                                        <span className="text-sm font-semibold">Call</span>
                                    </button>
                                </div>
                            </section>

                            {/* Location Card - Better mobile spacing */}
                            <section className="bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-5 transform transition-all duration-500 hover:shadow-xl hover:-translate-y-1 border border-slate-100/50">
                                <h3 className="text-lg font-bold text-gray-900 mb-3 bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">Location Highlights</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-50 transition-all duration-300 transform hover:scale-105 hover:translate-x-2">
                                        <MapPin size={16} className="text-red-600 flex-shrink-0" />
                                        <span className="text-xs text-gray-700">Prime location in {selectedProperty.city}</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 hover:translate-x-2">
                                        <Building size={16} className="text-slate-700 flex-shrink-0" />
                                        <span className="text-xs text-gray-700">Walking distance to downtown</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-50 transition-all duration-300 transform hover:scale-105 hover:translate-x-2">
                                        <Coffee size={16} className="text-red-600 flex-shrink-0" />
                                        <span className="text-xs text-gray-700">Near cafes and restaurants</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 hover:translate-x-2">
                                        <Shield size={16} className="text-slate-700 flex-shrink-0" />
                                        <span className="text-xs text-gray-700">Secure neighborhood</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col items-center justify-center text-center">
                    <button
                        onClick={onBack}
                        className="self-start flex items-center gap-2 text-gray-700 hover:text-red-700 font-medium transition-all duration-300 group relative mb-6"
                    >
                        <div className="absolute inset-0 bg-red-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                        <span className="relative flex items-center gap-2 px-3 py-1">
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Back to Categories</span>
                        </span>
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-[#00162d] mb-2">Unbooked Properties</h1>
                    <p className="text-gray-600 max-w-2xl text-sm sm:text-base">Browse and book available properties from our exclusive collection.</p>
                    {type && <p className="text-sm text-gray-500 mt-3">Showing: <span className="font-semibold text-[#cb2926]">{type.name}</span> category</p>}
                </div>

                {/* Header with controls - Better mobile layout */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-1/3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search properties..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cb2926] focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#00162d] text-white rounded-lg hover:bg-opacity-90 transition-colors">
                            <Filter size={18} />
                            <span>Filter</span>
                        </button>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                                aria-label="Grid view"
                            >
                                <Grid size={18} className={viewMode === 'grid' ? 'text-[#cb2926]' : 'text-gray-600'} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                                aria-label="List view"
                            >
                                <List size={18} className={viewMode === 'list' ? 'text-[#cb2926]' : 'text-gray-600'} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Properties display - Better mobile grid */}
                {filteredProperties.length > 0 ? (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProperties.map((property) => (
                                    <div
                                        key={property.id}
                                        className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-out cursor-pointer group hover:shadow-2xl hover:-translate-y-2"
                                        onClick={() => handlePropertyClick(property)}
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            <img
                                                src={property.image}
                                                alt={property.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <div className="bg-white/95 backdrop-blur-md px-2 py-1 rounded-full shadow-lg">
                                                    <div className="flex items-center gap-1">
                                                        <Star size={14} className="text-yellow-500 fill-current" />
                                                        <span className="font-semibold text-xs">{property.stats.avgRating}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(property.id);
                                                    }}
                                                    className="bg-white/95 backdrop-blur-md p-1.5 rounded-full shadow-lg hover:bg-white transition-colors"
                                                >
                                                    <Heart size={14} className={favorites.includes(property.id) ? "text-red-600 fill-current" : "text-gray-600"} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="px-2 py-1 bg-[#00162d]/10 text-[#00162d] rounded-full text-xs font-medium">{property.propertyType}</span>
                                                <span className="text-[#cb2926] font-bold">{property.price}/month</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-[#00162d] mb-1 truncate">{property.name}</h3>
                                            <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                                                <MapPin size={14} />
                                                <span className="truncate">{property.city}, {property.country}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">Available from {property.date}</span>
                                                <button className="text-[#00162d] font-semibold text-sm hover:text-[#cb2926] transition-colors">View Details</button>
                                            </div>
                                        </div>
                                        <div className="h-1 bg-[#cb2926] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
                                {filteredProperties.map((property) => (
                                    <div key={property.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={property.image}
                                                    alt={property.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-lg font-bold text-[#00162d] truncate">{property.name}</h3>
                                                <p className="text-gray-600 text-sm">{property.city}, {property.country} • {property.propertyType}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[#cb2926] font-bold">{property.price}/month</span>
                                                    <span className="text-xs text-gray-500">Available from {property.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 mr-4">
                                                <Star size={14} className="text-yellow-500 fill-current" />
                                                <span className="text-sm font-medium">{property.stats.avgRating}</span>
                                            </div>
                                            <button
                                                onClick={() => handlePropertyClick(property)}
                                                className="text-[#00162d] font-semibold text-sm hover:text-[#cb2926] transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={24} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                        <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="px-4 py-2 bg-[#00162d] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnbookedProperties;