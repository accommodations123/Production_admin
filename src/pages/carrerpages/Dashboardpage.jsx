import React from 'react';
import {
    BriefcaseIcon,
    ChartBarIcon,
    DocumentTextIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon as PendingIcon,
} from '@heroicons/react/24/outline';

const DashboardTab = ({ stats, applications, offers }) => {
    // Helper functions for status styling
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'reviewing': return 'bg-blue-100 text-blue-800';
            case 'shortlisted': return 'bg-purple-100 text-purple-800';
            case 'interview': return 'bg-yellow-100 text-yellow-800';
            case 'offered': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'accepted': return 'bg-green-100 text-green-800';
            case 'declined': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': case 'offered': case 'accepted': case 'shortlisted': return <CheckCircleIcon className="h-4 w-4" />;
            case 'rejected': case 'declined': return <XCircleIcon className="h-4 w-4" />;
            default: return <PendingIcon className="h-4 w-4" />;
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-sm text-gray-500 mt-1">Monitor your career portal performance</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                            </div>
                            <span className={`flex items-center text-xs sm:text-sm font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.changeType === 'increase' ? (
                                    <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                ) : (
                                    <ArrowTrendingDownIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                )}
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Applications</h3>
                        <button className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium">View All</button>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                            {applications.slice(0, 4).map((app) => (
                                <div key={app.id} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                    <div className="flex items-center min-w-0 flex-1">
                                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold flex-shrink-0">
                                            {app.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="ml-3 min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 truncate">{app.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{app.jobTitle}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStatusColor(app.status)}`}>
                                        {app.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Offers</h3>
                        <button className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium">View All</button>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                            {offers.slice(0, 4).map((offer) => (
                                <div key={offer.id} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                    <div className="flex items-center min-w-0 flex-1">
                                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold flex-shrink-0">
                                            {offer.candidateName.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="ml-3 min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 truncate">{offer.candidateName}</p>
                                            <p className="text-xs text-gray-500 truncate">{offer.jobTitle}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStatusColor(offer.status)}`}>
                                        {offer.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;