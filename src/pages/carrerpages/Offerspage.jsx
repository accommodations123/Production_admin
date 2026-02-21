import React, { useState } from 'react';
import {
    PlusIcon, BriefcaseIcon, MagnifyingGlassIcon, EyeIcon, EnvelopeIcon,
    XMarkIcon, PaperAirplaneIcon, UserGroupIcon, DocumentTextIcon,
    HeartIcon, CheckCircleIcon, XCircleIcon, ClockIcon, SparklesIcon,
    CalendarIcon, CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const OffersTab = ({ offers, jobs, applications, searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => {
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [showOfferModal, setShowOfferModal] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': case 'accepted': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'declined': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': case 'accepted': return <CheckCircleIcon className="h-4 w-4" />;
            case 'draft': return <ClockIcon className="h-4 w-4" />;
            case 'declined': return <XCircleIcon className="h-4 w-4" />;
            case 'pending': return <ClockIcon className="h-4 w-4" />;
            default: return <ClockIcon className="h-4 w-4" />;
        }
    };

    const filteredOffers = offers.filter(offer => {
        const matchesSearch = offer.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            offer.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleViewOffer = (offer) => {
        setSelectedOffer(offer);
        setShowOfferModal(true);
    };

    return (
        <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Offers Management</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage job offers sent to candidates</p>
                </div>
                <button onClick={() => { setSelectedOffer(null); setShowOfferModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm w-full sm:w-auto justify-center">
                    <PlusIcon className="h-5 w-5 mr-2" /> New Offer
                </button>
            </div>

            <div className="bg-white rounded-lg shadow mb-6 p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input type="text" placeholder="Search offers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-auto">
                            <option value="all">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="declined">Declined</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Position</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Start Date</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Response Deadline</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOffers.map((offer) => (
                                <tr key={offer.id} className="hover:bg-gray-50">
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold flex-shrink-0">{offer.candidateName.split(' ').map(n => n[0]).join('')}</div>
                                            <div className="ml-3 min-w-0 flex-1">
                                                <div className="text-sm font-medium text-gray-900 truncate">{offer.candidateName}</div>
                                                <div className="text-xs text-gray-500 truncate hidden lg:block">{offer.candidateEmail}</div>
                                                <div className="text-xs text-gray-500 lg:hidden">{offer.jobTitle}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell text-sm text-gray-900">{offer.jobTitle}</td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{offer.salary}</td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">{offer.startDate}</td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(offer.status)}`}>{getStatusIcon(offer.status)} <span className="ml-1 hidden sm:inline">{offer.status}</span></span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{offer.responseDeadline || '-'}</td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-1 sm:space-x-2">
                                            <button onClick={() => handleViewOffer(offer)} className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"><EyeIcon className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Offer Modal (View or New) */}
            {showOfferModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out">
                        {selectedOffer ? (
                            // View Offer Mode
                            <>
                                <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-gray-200 flex justify-between items-start">
                                    <div className="flex items-center"><div className="bg-white bg-opacity-20 rounded-full p-2 mr-3"><PaperAirplaneIcon className="h-6 w-6 text-white" /></div><div><h3 className="text-xl font-semibold text-white">Offer Details</h3><p className="text-blue-100 text-sm mt-1">{selectedOffer.jobTitle} • {selectedOffer.candidateName}</p></div></div>
                                    <button onClick={() => setShowOfferModal(false)} className="text-white hover:text-blue-100 p-1 hover:bg-white hover:bg-opacity-10 rounded-full"><XMarkIcon className="h-6 w-6" /></button>
                                </div>
                                <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-180px)]">
                                    <div className="mb-6 flex items-center justify-between">
                                        <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedOffer.status)}`}>{selectedOffer.status}</span>
                                        <div className="text-sm text-gray-500">{selectedOffer.offeredDate ? `Offered on ${selectedOffer.offeredDate}` : 'Draft'}</div>
                                    </div>
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" /> Candidate</h4>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center">
                                            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mr-4">{selectedOffer.candidateName.split(' ').map(n => n[0]).join('')}</div>
                                            <div className="flex-1"><h5 className="text-lg font-medium text-gray-900">{selectedOffer.candidateName}</h5><p className="text-gray-600">{selectedOffer.candidateEmail}</p><p className="text-gray-600">{selectedOffer.candidatePhone}</p></div>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><BriefcaseIcon className="h-5 w-5 mr-2 text-blue-600" /> Offer Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200"><p className="text-sm text-gray-500">Position</p><p className="text-base font-medium text-gray-900">{selectedOffer.jobTitle}</p></div>
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200"><p className="text-sm text-gray-500">Salary</p><p className="text-base font-medium text-gray-900">{selectedOffer.salary}</p></div>
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200"><p className="text-sm text-gray-500">Bonus</p><p className="text-base font-medium text-gray-900">{selectedOffer.bonus}</p></div>
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200"><p className="text-sm text-gray-500">Start Date</p><p className="text-base font-medium text-gray-900">{selectedOffer.startDate}</p></div>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><HeartIcon className="h-5 w-5 mr-2 text-blue-600" /> Benefits</h4>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex flex-wrap gap-2">{selectedOffer.benefits.map((benefit, i) => <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">{benefit}</span>)}</div>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" /> Notes</h4>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200"><p className="text-gray-700">{selectedOffer.notes}</p></div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                        <div className="text-sm text-gray-500">Offer ID: <span className="font-medium text-gray-700">#{selectedOffer.id.toString().padStart(5, '0')}</span></div>
                                        <div className="flex gap-3 w-full sm:w-auto">
                                            {selectedOffer.status === 'draft' && <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Send Offer</button>}
                                            {selectedOffer.status === 'pending' && <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Send Reminder</button>}
                                            {selectedOffer.status === 'accepted' && <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Onboard</button>}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // New Offer Mode
                            <>
                                <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-gray-200 flex justify-between items-start">
                                    <div className="flex items-center"><div className="bg-white bg-opacity-20 rounded-full p-2 mr-3"><PlusIcon className="h-6 w-6 text-white" /></div><div><h3 className="text-xl font-semibold text-white">Create New Offer</h3><p className="text-blue-100 text-sm mt-1">Send an offer to a candidate</p></div></div>
                                    <button onClick={() => setShowOfferModal(false)} className="text-white hover:text-blue-100 p-1 hover:bg-white hover:bg-opacity-10 rounded-full"><XMarkIcon className="h-6 w-6" /></button>
                                </div>
                                <form className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Candidate *</label><select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"><option>Select a candidate</option>{applications.filter(app => app.status === 'interview' || app.status === 'shortlisted').map(app => <option key={app.id} value={app.id}>{app.name} - {app.jobTitle}</option>)}</select></div>
                                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Position *</label><select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"><option>Select a position</option>{jobs.filter(job => job.status === 'active').map(job => <option key={job.id} value={job.id}>{job.title}</option>)}</select></div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Salary *</label><input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="$120,000" /></div>
                                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Bonus</label><input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="$10,000" /></div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label><input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Response Deadline *</label><input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {['Health insurance', '401(k)', 'Stock options', 'Remote work options'].map(b => <label key={b} className="flex items-center"><input type="checkbox" className="mr-2 rounded text-blue-600" /><span className="text-gray-700">{b}</span></label>)}
                                        </div>
                                    </div>
                                </form>
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-4">
                                    <button type="button" onClick={() => setShowOfferModal(false)} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                                    <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"><PaperAirplaneIcon className="h-4 w-4 mr-2 inline" /> Create Offer</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OffersTab;