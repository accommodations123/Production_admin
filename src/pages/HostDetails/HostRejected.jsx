import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

function HostRejected() {
    const [hosts, setHosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHost, setSelectedHost] = useState(null);

    const isRejectedHost = (p) => {
        if (!p) return false;
        const status = (p.status || '').toLowerCase().trim();
        return status === 'rejected' || (p.is_approved === false && !!p.rejection_reason);
    };

    const fetchHosts = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error: supaErr } = await supabase
                .from('profiles')
                .select('*')
                .order('updated_at', { ascending: false });

            if (supaErr) {
                console.error("Fetch rejected hosts error:", supaErr);
            } else {
                setHosts((data || []).filter(isRejectedHost));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHosts();

        if (!supabase) return;
        const channel = supabase
            .channel('public:profiles_rejected_hosts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
                fetchHosts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchHosts]);

    const extractProfileData = (host) => {
        if (!host) return { street: '', address: '', meta: null };
        let street = host.street_address || '';
        let address = host.address || '';
        let meta = null;

        if (typeof street === 'string' && (street.trim().startsWith('{') || street.trim().startsWith('['))) {
            try {
                meta = JSON.parse(street);
                street = address && !address.trim().startsWith('{') ? address : '';
            } catch {
                street = '';
            }
        }

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

    if (loading) return <div className="text-center py-12 text-slate-500 font-medium">Loading rejected applications...</div>;
    if (hosts.length === 0) return (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto p-8">
            <h3 className="text-lg font-bold text-slate-800">No Rejected Applications</h3>
            <p className="text-sm text-slate-400 mt-1">Applications that are rejected will be listed here with reasons.</p>
        </div>
    );

    const parsedData = selectedHost ? extractProfileData(selectedHost) : null;
    const meta = parsedData?.meta;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hosts.map((host) => (
                    <div key={host.id} className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between opacity-80 hover:opacity-100">
                        <div className="p-6 flex items-start justify-between border-b border-slate-100">
                            <div className="flex items-center space-x-3.5">
                                <img
                                    src={host.avatar_url || host.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(host.full_name || 'User')}&background=random`}
                                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 grayscale"
                                    alt=""
                                />
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 leading-snug">{host.full_name || 'Applicant'}</h3>
                                    <p className="text-xs text-slate-400 truncate max-w-[180px]">{host.email}</p>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                                Rejected
                            </span>
                        </div>

                        <div className="p-6 space-y-3">
                            <div className="bg-red-50/70 p-2.5 rounded-lg border border-red-100 text-xs text-red-700 line-clamp-2">
                                <span className="font-semibold block text-[10px] text-red-800 uppercase">Reason:</span>
                                {host.rejection_reason || 'No specific reason provided'}
                            </div>
                            <button
                                onClick={() => setSelectedHost(host)}
                                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl text-xs transition-colors border border-red-200"
                            >
                                View Rejection Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            {selectedHost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col relative z-50 border border-slate-100">
                        <div className="sticky top-0 bg-white border-b border-slate-100 p-5 px-6 flex justify-between items-center rounded-t-2xl z-10">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Rejection Details</h2>
                                <p className="text-xs text-slate-400">Application status and recorded decision</p>
                            </div>
                            <button onClick={() => setSelectedHost(null)} className="text-slate-400 hover:text-slate-600 text-2xl p-1 rounded-lg hover:bg-slate-50">&times;</button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                                <img
                                    src={selectedHost.avatar_url || selectedHost.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedHost.full_name || 'User')}&background=random&size=128`}
                                    className="w-16 h-16 rounded-xl object-cover border-2 border-red-100 grayscale"
                                    alt=""
                                />
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{selectedHost.full_name || 'Applicant'}</h3>
                                    <p className="text-xs text-slate-500">{selectedHost.email}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-800">
                                            Status: Rejected
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* REJECTION REASON CARD */}
                            <div className="bg-red-50 p-4 rounded-xl border border-red-200 space-y-1">
                                <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider">Reason for Rejection</h4>
                                <p className="text-xs text-red-700 leading-relaxed">{selectedHost.rejection_reason || 'No specific reason recorded.'}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Contact</h4>
                                    <ul className="space-y-2 text-xs">
                                        <li><span className="text-slate-400 block text-[11px]">Email</span><span className="font-medium text-slate-800">{selectedHost.email}</span></li>
                                        <li><span className="text-slate-400 block text-[11px]">Phone</span><span className="font-medium text-slate-800">{displayValue(selectedHost.phone)}</span></li>
                                        <li><span className="text-slate-400 block text-[11px]">WhatsApp</span><span className="font-medium text-slate-800">{displayValue(selectedHost.whatsapp)}</span></li>
                                    </ul>
                                </div>

                                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Address</h4>
                                    <ul className="space-y-2 text-xs">
                                        <li><span className="text-slate-400 block text-[11px]">Street / Area</span><span className="font-medium text-slate-800">{displayValue(parsedData?.street)}</span></li>
                                        <li><span className="text-slate-400 block text-[11px]">City</span><span className="font-medium text-slate-800">{displayValue(selectedHost.city)}</span></li>
                                        <li><span className="text-slate-400 block text-[11px]">State</span><span className="font-medium text-slate-800">{displayValue(selectedHost.state)}</span></li>
                                        <li><span className="text-slate-400 block text-[11px]">Zip Code</span><span className="font-medium text-slate-800">{displayValue(selectedHost.zip_code)}</span></li>
                                        <li><span className="text-slate-400 block text-[11px]">Country</span><span className="font-medium text-slate-800">{displayValue(selectedHost.country)}</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-5 px-6 flex justify-end rounded-b-2xl">
                            <button onClick={() => setSelectedHost(null)} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default HostRejected;