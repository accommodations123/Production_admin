import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { notifyHostApproval, notifyHostRejection } from '../../services/notificationService';

function HostPending() {
    const [hosts, setHosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedHost, setSelectedHost] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const isPendingHost = (p) => {
        if (!p) return false;
        const status = (p.status || '').toLowerCase().trim();
        const isApproved = p.is_approved === true || status === 'approved';
        const isRejected = status === 'rejected';
        const isBlocked = status === 'blocked' || p.is_blocked === true;

        // Never include approved, rejected, or blocked hosts in pending
        if (isApproved || isRejected || isBlocked) return false;

        // Include if explicitly pending or unapproved applicant
        return status === 'pending' || p.role === 'host' || !status;
    };

    const fetchHosts = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error: supaErr } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (supaErr) {
                console.error("Fetch pending hosts error:", supaErr);
                setError(supaErr.message);
            } else {
                const pendingList = (data || []).filter(isPendingHost);
                setHosts(pendingList);
                setError(null);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHosts();

        if (!supabase) return;
        const channel = supabase
            .channel('public:profiles_pending_hosts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
                fetchHosts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchHosts]);

    const openModal = (host) => { setSelectedHost(host); setRejectionReason(""); setIsRejecting(false); };
    const closeModal = () => { setSelectedHost(null); setIsRejecting(false); };

    const handleApprove = async () => {
        if (!selectedHost) return;
        try {
            setActionLoading(true);
            const { error: supaErr } = await supabase
                .from('profiles')
                .update({
                    status: 'approved',
                    is_approved: true,
                    is_verified: true,
                    role: 'host',
                    rejection_reason: null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedHost.id);

            if (supaErr) {
                console.error("Approve host error:", supaErr);
                alert("Failed to approve: " + supaErr.message);
                return;
            }

            // Dispatch in-app and email notification
            const hostName = selectedHost.full_name || `${selectedHost.firstName || ''} ${selectedHost.lastName || ''}`.trim() || 'Host';
            notifyHostApproval({
                hostId: selectedHost.id,
                hostEmail: selectedHost.email,
                hostName
            });

            setHosts(prev => prev.filter(h => h.id !== selectedHost.id));
            closeModal();
            fetchHosts();
        } catch (e) {
            console.error(e);
            alert(e.message || 'Failed to approve');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectSubmit = async () => {
        if (!selectedHost || !rejectionReason.trim()) { alert("Please provide a rejection reason"); return; }
        try {
            setActionLoading(true);
            const reason = rejectionReason.trim();
            const { error: supaErr } = await supabase
                .from('profiles')
                .update({
                    status: 'rejected',
                    is_approved: false,
                    rejection_reason: reason,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedHost.id);

            if (supaErr) {
                console.error("Reject host error:", supaErr);
                alert("Failed to reject: " + supaErr.message);
                return;
            }

            // Dispatch in-app and email notification
            const hostName = selectedHost.full_name || `${selectedHost.firstName || ''} ${selectedHost.lastName || ''}`.trim() || 'Applicant';
            notifyHostRejection({
                hostId: selectedHost.id,
                hostEmail: selectedHost.email,
                hostName,
                reason
            });

            setHosts(prev => prev.filter(h => h.id !== selectedHost.id));
            closeModal();
            fetchHosts();
        } catch (e) {
            console.error(e);
            alert(e.message || 'Failed to reject');
        } finally {
            setActionLoading(false);
        }
    };


    // Helper to safely extract address & any embedded profile metadata
    const extractProfileData = (host) => {
        if (!host) return { street: '', address: '', meta: null };
        let street = host.street_address || '';
        let address = host.address || '';
        let meta = null;

        // Check if street_address is a JSON string
        if (typeof street === 'string' && (street.trim().startsWith('{') || street.trim().startsWith('['))) {
            try {
                meta = JSON.parse(street);
                street = address && !address.trim().startsWith('{') ? address : '';
            } catch {
                street = '';
            }
        }

        // Check if address is a JSON string
        if (typeof address === 'string' && address.trim().startsWith('{')) {
            try {
                if (!meta) meta = JSON.parse(address);
                address = '';
            } catch {
                address = '';
            }
        }

        return {
            street: street || address || '',
            meta: meta
        };
    };

    const displayValue = (val) => {
        if (val === null || val === undefined || val === '') {
            return <span className="italic text-gray-400">N/A</span>;
        }
        if (typeof val === 'string' && (val.trim().startsWith('{') || val.trim().startsWith('['))) {
            try {
                const parsed = JSON.parse(val);
                if (typeof parsed === 'object') {
                    if (parsed.street) return parsed.street;
                    if (parsed.address) return parsed.address;
                    if (parsed.name) return parsed.name;
                    return <span className="italic text-gray-400">N/A</span>;
                }
            } catch {
                // ignore
            }
        }
        if (typeof val === 'object') {
            return <span className="italic text-gray-400">N/A</span>;
        }
        return String(val);
    };

    if (loading) return <div className="text-center py-12 text-slate-500 font-medium">Loading pending applications...</div>;
    if (error) return <div className="text-center text-red-500 py-12">{error}</div>;
    if (hosts.length === 0) return (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto p-8">
            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">✓</div>
            <h3 className="text-lg font-bold text-slate-800">No Pending Host Applications</h3>
            <p className="text-sm text-slate-400 mt-1">All host onboarding submissions have been reviewed and approved.</p>
        </div>
    );

    const parsedData = selectedHost ? extractProfileData(selectedHost) : null;
    const meta = parsedData?.meta;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hosts.map((host) => (
                    <div key={host.id} className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="p-6 flex items-start justify-between border-b border-slate-100">
                            <div className="flex items-center space-x-3.5">
                                <img
                                    src={host.avatar_url || host.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(host.full_name || 'User')}&background=random`}
                                    alt=""
                                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                                />
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 leading-snug">{host.full_name || 'Unnamed Host'}</h3>
                                    <p className="text-xs text-slate-400 truncate max-w-[180px]">{host.email}</p>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Pending
                            </span>
                        </div>

                        <div className="p-6 space-y-3">
                            <div className="text-xs text-slate-600 space-y-1">
                                <p><span className="text-slate-400 font-medium">Location:</span> {host.city || host.state || host.country ? `${host.city || ''}, ${host.country || ''}` : 'Not provided'}</p>
                                <p><span className="text-slate-400 font-medium">Phone:</span> {host.phone || host.whatsapp || 'N/A'}</p>
                            </div>
                            <button
                                onClick={() => openModal(host)}
                                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-xs transition-colors border border-indigo-200"
                            >
                                Review Application
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* APPLICATION DETAILS MODAL */}
            {selectedHost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col relative z-50 border border-slate-100">
                        <div className="sticky top-0 bg-white border-b border-slate-100 p-5 px-6 flex justify-between items-center rounded-t-2xl z-10">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Host Application Details</h2>
                                <p className="text-xs text-slate-400">Review KYC & profile verification details</p>
                            </div>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-2xl p-1 rounded-lg hover:bg-slate-50">&times;</button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Profile Header */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                                <img
                                    src={selectedHost.avatar_url || selectedHost.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedHost.full_name || 'User')}&background=random&size=128`}
                                    className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-100"
                                    alt=""
                                />
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{selectedHost.full_name || 'Anonymous Applicant'}</h3>
                                    <p className="text-xs text-slate-500">{selectedHost.email}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                                            Status: Pending Review
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            User ID: {selectedHost.id?.slice(0, 10)}...
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* CONTACT */}
                                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Contact Details</h4>
                                    <ul className="space-y-2 text-xs">
                                        <li><span className="text-slate-400 block text-[11px]">Email Address</span><span className="font-medium text-slate-800">{selectedHost.email || 'N/A'}</span></li>
                                        <li><span className="text-slate-400 block text-[11px]">Phone</span><span className="font-medium text-slate-800">{displayValue(selectedHost.phone)}</span></li>
                                        <li><span className="text-slate-400 block text-[11px]">WhatsApp</span><span className="font-medium text-slate-800">{displayValue(selectedHost.whatsapp)}</span></li>
                                    </ul>
                                </div>

                                {/* ADDRESS */}
                                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Address & Location</h4>
                                    <ul className="space-y-2 text-xs">
                                        <li><span className="text-slate-400 block text-[11px]">Street / Area</span><span className="font-medium text-slate-800">{displayValue(parsedData?.street)}</span></li>
                                        <li><span className="text-slate-400 block text-[11px]">City</span><span className="font-medium text-slate-800">{displayValue(selectedHost.city)}</span></li>
                                        <li><span className="text-slate-400 block text-[11px]">State / Province</span><span className="font-medium text-slate-800">{displayValue(selectedHost.state)}</span></li>
                                        <li><span className="text-slate-400 block text-[11px]">Zip Code</span><span className="font-medium text-slate-800">{displayValue(selectedHost.zip_code)}</span></li>
                                        <li><span className="text-slate-400 block text-[11px]">Country</span><span className="font-medium text-slate-800">{displayValue(selectedHost.country)}</span></li>
                                    </ul>
                                </div>

                                {/* SOCIAL MEDIA */}
                                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Social & Online Profiles</h4>
                                    <ul className="space-y-2 text-xs">
                                        <li><span className="text-slate-400 block text-[11px]">Facebook</span><span className="font-medium text-slate-800">{displayValue(selectedHost.facebook)}</span></li>
                                        <li><span className="text-slate-400 block text-[11px]">Instagram</span><span className="font-medium text-slate-800">{displayValue(selectedHost.instagram)}</span></li>
                                        <li><span className="text-slate-400 block text-[11px]">LinkedIn</span><span className="font-medium text-slate-800">{displayValue(selectedHost.linkedin)}</span></li>
                                    </ul>
                                </div>

                                {/* SYSTEM TIMESTAMPS */}
                                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Registration Info</h4>
                                    <ul className="space-y-2 text-xs">
                                        <li><span className="text-slate-400 block text-[11px]">Created At</span><span className="font-medium text-slate-700">{selectedHost.created_at ? new Date(selectedHost.created_at).toLocaleString() : 'N/A'}</span></li>
                                        <li><span className="text-slate-400 block text-[11px]">Last Updated</span><span className="font-medium text-slate-700">{selectedHost.updated_at ? new Date(selectedHost.updated_at).toLocaleString() : 'N/A'}</span></li>
                                    </ul>
                                </div>
                            </div>

                            {/* EXTRA PROFILE & PORTFOLIO METADATA (IF PRESENT) */}
                            {meta && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Host Profile Details</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        {meta.category && (
                                            <div><span className="text-slate-400 block text-[11px]">Category</span><span className="font-semibold text-slate-800 capitalize">{meta.category}</span></div>
                                        )}
                                        {meta.hourly_rate && (
                                            <div><span className="text-slate-400 block text-[11px]">Hourly Rate</span><span className="font-bold text-emerald-600">{meta.hourly_rate} {meta.currency || 'USD'}</span></div>
                                        )}
                                        {meta.experience && (
                                            <div><span className="text-slate-400 block text-[11px]">Experience</span><span className="font-semibold text-slate-800">{meta.experience}</span></div>
                                        )}
                                        {Array.isArray(meta.languages) && meta.languages.length > 0 && (
                                            <div>
                                                <span className="text-slate-400 block text-[11px]">Languages</span>
                                                <span className="font-medium text-slate-700">{meta.languages.join(', ')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {Array.isArray(meta.skills) && meta.skills.length > 0 && (
                                        <div>
                                            <span className="text-slate-400 block text-[11px] mb-1">Skills & Specialties</span>
                                            <div className="flex flex-wrap gap-1">
                                                {meta.skills.map((skill, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] text-slate-700">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {meta.bio && (
                                        <div>
                                            <span className="text-slate-400 block text-[11px] mb-1">Bio / Overview</span>
                                            <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">{meta.bio}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Rejection Reason Form */}
                            {isRejecting && (
                                <div className="bg-red-50 p-4 rounded-xl border border-red-200 space-y-3 animate-fade-in">
                                    <label className="block text-xs font-bold text-red-800">Reason for Rejection (sent to applicant):</label>
                                    <textarea
                                        className="w-full p-3 bg-white border border-red-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200"
                                        rows="3"
                                        placeholder="e.g. Incomplete verification documents, invalid phone number..."
                                        value={rejectionReason}
                                        onChange={e => setRejectionReason(e.target.value)}
                                    />
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => { setIsRejecting(false); setRejectionReason(""); }}
                                            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleRejectSubmit}
                                            disabled={actionLoading}
                                            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50"
                                        >
                                            {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-5 px-6 flex justify-end space-x-3 rounded-b-2xl">
                            {!isRejecting ? (
                                <>
                                    <button
                                        onClick={() => setIsRejecting(true)}
                                        disabled={actionLoading}
                                        className="px-5 py-2 border border-red-200 rounded-xl text-xs font-bold text-red-600 bg-white hover:bg-red-50 transition-colors"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        disabled={actionLoading}
                                        className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading ? 'Approving...' : 'Approve Host'}
                                    </button>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default HostPending;