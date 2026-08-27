import React, { useState } from 'react';
import {
    PackageOpen, Users, ShoppingBag
} from 'lucide-react';

// --- COMPONENTS ---
import ManageListings from '../buysell/ManageListings';
import ManageUsers from '../buysell/ManageUsers';
import ManageCategories from '../buysell/ManageCategories';

function Buysellpages() {
    const [currentPage, setCurrentPage] = useState('listings');

    const renderPage = () => {
        switch (currentPage) {
            case 'listings':
                return <ManageListings />;
            case 'users':
                return <ManageUsers />;
            case 'categories':
                return <ManageCategories />;
            default:
                return <ManageListings />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-200">
            {/* Main Content Area */}
            <div className="max-w-8xl mx-auto px-4 py-6">
                {/* Tab Navigation with Rounded Bar */}
                <div className="mb-6">
                    <div className="bg-white rounded-full p-1 flex justify-center shadow-sm">
                        <div className="bg-white rounded-full p-1 flex space-x-3">
                            <button
                                onClick={() => setCurrentPage('listings')}
                                className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${currentPage === 'listings'
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <PackageOpen className="w-4 h-4 mr-2 inline" />
                                Listings
                            </button>

                            <button
                                onClick={() => setCurrentPage('users')}
                                className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${currentPage === 'users'
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Users className="w-4 h-4 mr-2 inline" />
                                Users
                            </button>

                            <button
                                onClick={() => setCurrentPage('categories')}
                                className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${currentPage === 'categories'
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <ShoppingBag className="w-4 h-4 mr-2 inline" />
                                Categories
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

export default Buysellpages;