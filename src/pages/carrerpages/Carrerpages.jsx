import React, { useState } from 'react';
import {
    Briefcase,
    FileText,
    Send,
    Search,
    Plus,
    Settings,
    Clock,
    Bell,
    LogOut,
    Menu,
    X,
    MoreHorizontal,
} from 'lucide-react';

// Import the remaining 3 tab components
import JobsTab from '../carrerpages/Jobposting';
import ApplicationsTab from '../carrerpages/Applicationpage';
import OffersTab from '../carrerpages/Offerspage';

// --- STATIC DATA REMOVED ---

const jobs = [];

const applications = [];

const offers = [];

// --- MAIN COMPONENT ---

function CareerPages() {
    // Set default state to 'jobs' so it opens on the Jobs page
    const [activeTab, setActiveTab] = useState('jobs');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Render the specific tab component based on activeTab state
    const renderPage = () => {
        switch (activeTab) {
            // Dashboard case removed
            case 'jobs':
                return (
                    <JobsTab
                        jobs={jobs}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />
                );
            case 'applications':
                return (
                    <ApplicationsTab
                        applications={applications}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                    />
                );
            case 'offers':
                return (
                    <OffersTab
                        offers={offers}
                        jobs={jobs}
                        applications={applications}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-200">
            {/* Admin Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center">
                            <div className="bg-red-500 p-2 rounded-lg mr-3">
                                <Briefcase className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Career Admin</h1>
                                <p className="text-sm text-gray-500 mt-1">Recruitment & Hiring Portal</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-8xl mx-auto px-4 py-6">
                {/* Tab Navigation with Rounded Bar */}
                <div className="mb-6">
                    <div className="bg-white rounded-full p-1 flex justify-center shadow-sm">
                        <div className="bg-white rounded-full p-1 flex space-x-3">

                            {/* Dashboard Button Removed */}

                            <button
                                onClick={() => setActiveTab('jobs')}
                                className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 flex items-center ${activeTab === 'jobs'
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Briefcase className="w-4 h-4 mr-2" />
                                Jobs
                            </button>

                            <button
                                onClick={() => setActiveTab('applications')}
                                className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 flex items-center ${activeTab === 'applications'
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Applications
                            </button>

                            <button
                                onClick={() => setActiveTab('offers')}
                                className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 flex items-center ${activeTab === 'offers'
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Offers
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow p-6">
                    {renderPage()}
                </div>
            </div>
        </div>
    );
}

export default CareerPages;