import React, { useState, useEffect } from 'react';

const BASE_URL = "https://api.nextkinlife.live";

const getAuthHeaders = () => {
    const token = localStorage.getItem("admin-auth");
    if (!token) console.error("No token found");
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
};

function HostPending() {
    const [hosts, setHosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedHost, setSelectedHost] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    useEffect(() => {
        const fetchHosts = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${BASE_URL}/host/admin/hosts/pending`, { method: 'GET', headers: getAuthHeaders() });
                if (!response.ok) throw new Error('Failed to fetch pending hosts');
                const result = await response.json();
                setHosts(result.hosts || []);
            } catch (err) { setError(err.message); } finally { setLoading(false); }
        };
        fetchHosts();
    }, []);

    const openModal = (host) => { setSelectedHost(host); setRejectionReason(""); setIsRejecting(false); };
    const closeModal = () => { setSelectedHost(null); setIsRejecting(false); };

    const handleApprove = async () => {
        if (!selectedHost) return;
        try {
            const response = await fetch(`${BASE_URL}/host/admin/hosts/approve/${selectedHost.id}`, { method: 'PUT', headers: getAuthHeaders() });
            if (response.ok) { setHosts(prev => prev.filter(h => h.id !== selectedHost.id)); closeModal(); } else { alert('Failed'); }
        } catch (e) { console.error(e); }
    };

    const handleRejectSubmit = async () => {
        if (!selectedHost || !rejectionReason.trim()) { alert("Reason required"); return; }
        try {
            const response = await fetch(`${BASE_URL}/host/admin/hosts/reject/${selectedHost.id}`, {
                method: 'PUT', headers: getAuthHeaders(),
                body: JSON.stringify({ rejection_reason: rejectionReason })
            });
            if (response.ok) { setHosts(prev => prev.filter(h => h.id !== selectedHost.id)); closeModal(); } else { alert('Failed'); }
        } catch (e) { console.error(e); }
    };

    const displayValue = (val) => val ? val : <span className="italic text-gray-400">N/A</span>;

    if (loading) return <div className="text-center py-12">Loading...</div>;
    if (error) return <div className="text-center text-red-500 py-12">{error}</div>;
    if (hosts.length === 0) return <div className="text-center py-12 text-gray-500">No pending hosts.</div>;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hosts.map((host) => (
                    <div key={host.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                        <div className="p-6 flex items-start justify-between border-b border-gray-50">
                            <div className="flex items-center space-x-4">
                                <img src={`https://ui-avatars.com/api/?name=${host.full_name}&background=random`} alt="" className="w-14 h-14 rounded-full border-2 border-gray-100" />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{host.full_name}</h3>
                                    <p className="text-sm text-gray-500">{host.email}</p>
                                </div>
                            </div>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                        </div>
                        <div className="p-6 pt-0">
                            <button onClick={() => openModal(host)} className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100">Review Application</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL WITH ALL JSON FIELDS */}
            {selectedHost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col relative z-50">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center rounded-t-2xl z-10">
                            <h2 className="text-xl font-bold text-gray-800">Application Details</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>
                        <div className="p-6 space-y-8">
                            {/* Header */}
                            <div className="flex items-center space-x-6">
                                <img src={`https://ui-avatars.com/api/?name=${selectedHost.full_name}&background=random&size=128`} className="w-20 h-20 rounded-full border-4 border-indigo-50" />
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{selectedHost.full_name}</h3>
                                    <p className="text-gray-500">ID: {selectedHost.id} | User ID: {selectedHost.user_id}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                {/* CONTACT */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">Contact</h4>
                                    <ul className="space-y-3 text-sm">
                                        <li><span className="text-gray-500 block text-xs">Email</span>{selectedHost.email}</li>
                                        <li><span className="text-gray-500 block text-xs">Phone</span>{displayValue(selectedHost.phone)}</li>
                                        <li><span className="text-gray-500 block text-xs">WhatsApp</span>{displayValue(selectedHost.whatsapp)}</li>
                                    </ul>
                                </div>

                                {/* ADDRESS */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">Address</h4>
                                    <ul className="space-y-3 text-sm">
                                        <li><span className="text-gray-500 block text-xs">Street</span>{displayValue(selectedHost.street_address)}</li>
                                        <li><span className="text-gray-500 block text-xs">City</span>{displayValue(selectedHost.city)}</li>
                                        <li><span className="text-gray-500 block text-xs">State</span>{displayValue(selectedHost.state)}</li>
                                        <li><span className="text-gray-500 block text-xs">Zip Code</span>{displayValue(selectedHost.zip_code)}</li>
                                        <li><span className="text-gray-500 block text-xs">Country</span>{displayValue(selectedHost.country)}</li>
                                    </ul>
                                </div>

                                {/* SOCIAL */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">Social Media</h4>
                                    <ul className="space-y-3 text-sm">
                                        <li><span className="text-gray-500 block text-xs">Facebook</span>{displayValue(selectedHost.facebook)}</li>
                                        <li><span className="text-gray-500 block text-xs">Instagram</span>{displayValue(selectedHost.instagram)}</li>
                                    </ul>
                                </div>

                                {/* SYSTEM */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">System Info</h4>
                                    <ul className="space-y-3 text-sm">
                                        <li><span className="text-gray-500 block text-xs">Created At</span>{new Date(selectedHost.createdAt).toLocaleString()}</li>
                                        <li><span className="text-gray-500 block text-xs">Updated At</span>{new Date(selectedHost.updatedAt).toLocaleString()}</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Rejection Input */}
                            {isRejecting && (
                                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                    <label className="block text-sm font-bold text-red-800 mb-2">Reason for Rejection</label>
                                    <textarea className="w-full p-3 border border-red-200 rounded-lg text-sm" rows="3" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}></textarea>
                                    <div className="mt-3 flex justify-end space-x-3">
                                        <button onClick={() => { setIsRejecting(false); setRejectionReason(""); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                                        <button onClick={handleRejectSubmit} className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">Confirm Rejection</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex justify-end space-x-3 rounded-b-2xl">
                            {!isRejecting ? (
                                <>
                                    <button onClick={() => setIsRejecting(true)} className="px-6 py-2.5 border border-red-200 rounded-lg text-sm font-medium text-red-600 bg-white hover:bg-red-50">Reject</button>
                                    <button onClick={handleApprove} className="px-6 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700">Approve</button>
                                </>
                            ) : <span className="text-sm text-red-500 italic">Please complete rejection form.</span>}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
export default HostPending;