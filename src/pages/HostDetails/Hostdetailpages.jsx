import React, { useState } from 'react';
// Import your actual components here
import HostPending from '../HostDetails/HostPending';
import HostApproved from '../HostDetails/HostApproved';
import HostRejected from '../HostDetails/HostRejected';


import EventApproved from '../HostDetails/Events/EventsApproved';
import EventRejected from '../HostDetails/Events/EventsResjected';

// Note: Ensure the path matches your actual folder structure
import PropertyApproved from '../HostDetails/propeties/PropertiesApproved';
import PropertyRejected from '../HostDetails/propeties/PropertiesRejected';

// --- IMPORT BUY SELL COMPONENTS ---
import BuySellApproved from '../HostDetails/buysell/BuysellApproved';
import BuySellBlocked from '../HostDetails/buysell/BuysellRejected'; // Corrected import name

function Hostdetailpages() {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [activeSubTab, setActiveSubTab] = useState('pending');

    // --- HELPER TO GET TABS BASED ON CATEGORY ---
    const getAvailableTabs = (category) => {
        if (category === 'hosts') {
            return ['pending', 'approved', 'rejected'];
        }
        if (category === 'events' || category === 'property') {
            return ['approved', 'rejected'];
        }
        if (category === 'buysell') {
            return ['approved', 'blocked'];
        }
        return [];
    };

    // --- UPDATED CLICK HANDLER ---
    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        const tabs = getAvailableTabs(category);
        setActiveSubTab(tabs[0]);
    };

    const handleBack = () => {
        setSelectedCategory(null);
        setActiveSubTab('pending');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased">

            {/* --- HEADER --- */}
            <header className="bg-white border-b border-slate-200 px-4 py-5 shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {/* Decorative Logo Icon */}
                        <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-md">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Admin Portal</h1>
                            <p className="text-sm text-slate-500 font-medium">Management Dashboard</p>
                        </div>
                    </div>

                    {/* Back Button */}
                    {selectedCategory && (
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-all duration-200"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Back to Menu
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-grow max-w-7xl mx-auto w-full p-4 md:p-8 pb-24">

                {/* --- MAIN MENU (DASHBOARD TILES) --- */}
                {!selectedCategory ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">

                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">Select Management Category</h2>
                            <p className="text-slate-500">Choose a category below to view details and actions.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">

                            {/* TILE 1: HOST DETAILS */}
                            <button
                                onClick={() => handleCategoryChange('hosts')}
                                className="group relative flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-indigo-400 transition-all duration-300 w-full"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-inner">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600">Host Details</h3>
                                <p className="text-sm text-slate-500 mt-1">Manage Accommodation Hosts</p>
                                <span className="mt-4 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">3 Tabs</span>
                            </button>

                            {/* TILE 2: EVENTS HOST DETAILS */}
                            <button
                                onClick={() => handleCategoryChange('events')}
                                className="group relative flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-purple-400 transition-all duration-300 w-full"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-inner">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-purple-600">Events Host</h3>
                                <p className="text-sm text-slate-500 mt-1">Approved & Rejected Events</p>
                                <span className="mt-4 px-2 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full">2 Tabs</span>
                            </button>

                            {/* TILE 3: PROPERTY HOST DETAILS */}
                            <button
                                onClick={() => handleCategoryChange('property')}
                                className="group relative flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-teal-400 transition-all duration-300 w-full"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-inner">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-teal-600">Property Host</h3>
                                <p className="text-sm text-slate-500 mt-1">Manage Property Listings</p>
                                <span className="mt-4 px-2 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full">2 Tabs</span>
                            </button>

                            {/* TILE 4: BUY SELL HOST DETAILS */}
                            <button
                                onClick={() => handleCategoryChange('buysell')}
                                className="group relative flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-orange-400 transition-all duration-300 w-full"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 shadow-inner">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-orange-600">Buy Sell Host</h3>
                                <p className="text-sm text-slate-500 mt-1">Approved & Blocked Items</p>
                                <span className="mt-4 px-2 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-full">2 Tabs</span>
                            </button>

                        </div>
                    </div>
                ) : (
                    // --- CATEGORY VIEW REVEALED ---
                    <div className="space-y-6 animate-fade-in">

                        {/* --- REFINED SUB-TABS --- */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <nav className="flex" aria-label="Tabs">
                                {getAvailableTabs(selectedCategory).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveSubTab(tab)}
                                        className={`
                                            flex-1 py-4 px-1 text-sm font-semibold transition-all duration-200 border-b-2
                                            ${activeSubTab === tab
                                                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
                                            capitalize
                                        `}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* --- DYNAMIC CONTENT AREA (Card Container) --- */}
                        <div className="min-h-[400px]">
                            {/* --- HOST DETAILS CONTENT --- */}
                            {selectedCategory === 'hosts' && (
                                <>
                                    {activeSubTab === 'pending' && <HostPending />}
                                    {activeSubTab === 'approved' && <HostApproved />}
                                    {activeSubTab === 'rejected' && <HostRejected />}
                                </>
                            )}

                            {/* --- EVENTS HOST CONTENT --- */}
                            {selectedCategory === 'events' && (
                                <>
                                    {activeSubTab === 'approved' && <EventApproved />}
                                    {activeSubTab === 'rejected' && <EventRejected />}
                                </>
                            )}

                            {/* --- PROPERTY HOST CONTENT --- */}
                            {selectedCategory === 'property' && (
                                <>
                                    {activeSubTab === 'approved' && <PropertyApproved />}
                                    {activeSubTab === 'rejected' && <PropertyRejected />}
                                </>
                            )}

                            {/* --- BUY SELL HOST CONTENT --- */}
                            {selectedCategory === 'buysell' && (
                                <>
                                    {activeSubTab === 'approved' && <BuySellApproved />}
                                    {activeSubTab === 'blocked' && <BuySellBlocked />}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Hostdetailpages;