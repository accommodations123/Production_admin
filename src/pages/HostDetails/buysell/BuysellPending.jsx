import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

const BuySellPending = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    const fetchPending = async () => {
        try {
            setLoading(true);
            const { data, error: supaErr } = await supabase
                .from('buy_sell')
                .select('*')
                .or('status.eq.pending,status.is.null,status.eq.draft');

            if (supaErr) {
                console.error("Error fetching pending listings:", supaErr);
                setListings([]);
            } else {
                let list = (data || []).filter(item => item.status !== 'approved' && item.status !== 'active' && item.status !== 'rejected' && item.status !== 'blocked');
                const userIds = [...new Set(list.map(l => l.user_id).filter(Boolean))];
                if (userIds.length > 0) {
                    const { data: profiles } = await supabase.from('profiles').select('*').in('id', userIds);
                    const profileMap = {};
                    (profiles || []).forEach(p => { profileMap[p.id] = p; });
                    list = list.map(l => {
                        const prof = profileMap[l.user_id] || {};
                        return {
                            ...l,
                            name: l.name || l.seller_name || prof.full_name || prof.name || 'Anonymous',
                            email: l.email || l.seller_email || prof.email || null,
                            phone: l.phone || l.seller_phone || prof.phone || prof.mobile || null,
                            whatsapp: l.whatsapp || l.seller_whatsapp || prof.whatsapp || null,
                            sellerEmail: l.seller_email || l.email || prof.email || null,
                            sellerPhone: l.seller_phone || l.phone || prof.phone || prof.mobile || null,
                            sellerWhatsapp: l.seller_whatsapp || l.whatsapp || prof.whatsapp || null,
                            sellerProfile: { email: prof.email, full_name: prof.full_name, phone: prof.phone, ...prof }
                        };
                    });
                }
                setListings(list);
            }
        } catch (err) {
            console.error("Error fetching pending listings:", err);
            setListings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApprove = async (id) => {
        setActionLoading(true);
        try {
            const { error: supaErr } = await supabase
                .from('buy_sell')
                .update({ status: 'approved', is_approved: true })
                .eq('id', id);

            if (supaErr) throw supaErr;
            setListings(prev => prev.filter(l => l.id !== id));
            setSelectedItem(null);
        } catch (err) {
            console.error("Approve error:", err);
            alert(err.message || "Failed to approve listing");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (id) => {
        if (!rejectionReason.trim()) {
            alert("Please provide a rejection reason");
            return;
        }
        setActionLoading(true);
        try {
            const { error: supaErr } = await supabase
                .from('buy_sell')
                .update({
                    status: 'rejected',
                    is_approved: false,
                    denial_reason: rejectionReason.trim()
                })
                .eq('id', id);

            if (supaErr) throw supaErr;
            setListings(prev => prev.filter(l => l.id !== id));
            setSelectedItem(null);
            setIsRejecting(false);
            setRejectionReason("");
        } catch (err) {
            console.error("Reject error:", err);
            alert(err.message || "Failed to reject listing");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="text-center py-12">Loading pending marketplace listings...</div>;
    if (listings.length === 0) return <div className="text-center py-12 text-gray-500">No pending listings to review.</div>;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                        <div className="h-48 w-full bg-gray-200 relative overflow-hidden">
                            {item.images?.[0] ? (
                                <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">No Image</div>
                            )}
                            <span className="absolute top-2 right-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded uppercase">
                                Pending
                            </span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 truncate">{item.title}</h3>
                                <p className="text-sm text-gray-500 mb-2">{item.category} • {item.city || 'Location N/A'}</p>
                                <p className="text-xl font-extrabold text-indigo-600 mb-3">{item.currency || '$'} {item.price}</p>
                                {item.sellerProfile?.full_name && (
                                    <p className="text-xs text-slate-500">Seller: <span className="font-medium text-slate-800">{item.sellerProfile.full_name}</span></p>
                                )}
                            </div>
                            <div className="pt-3 border-t border-gray-100 mt-3 flex gap-2">
                                <button
                                    onClick={() => { setSelectedItem(item); setIsRejecting(false); }}
                                    className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Details
                                </button>
                                <button
                                    onClick={() => handleApprove(item.id)}
                                    disabled={actionLoading}
                                    className="flex-1 py-2 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    Approve
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* DETAILS MODAL */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col relative z-50">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center rounded-t-2xl z-10">
                            <h2 className="text-xl font-bold text-gray-800">Review Listing</h2>
                            <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>
                        <div className="p-6 space-y-6">
                            {selectedItem.images?.[0] && (
                                <div className="rounded-xl overflow-hidden shadow-sm h-64 bg-gray-100">
                                    <img src={selectedItem.images[0]} alt={selectedItem.title} className="w-full h-full object-cover" />
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{selectedItem.title}</h3>
                                    <p className="text-2xl font-bold text-indigo-600 mt-1">{selectedItem.currency || '$'} {selectedItem.price}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Details</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
                                        <p><span className="text-slate-400">Category:</span> {selectedItem.category}</p>
                                        <p><span className="text-slate-400">Condition:</span> {selectedItem.condition || 'N/A'}</p>
                                        <p><span className="text-slate-400">Location:</span> {selectedItem.city}, {selectedItem.country}</p>
                                        <p><span className="text-slate-400">Date:</span> {new Date(selectedItem.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</h4>
                                    <p className="text-sm text-slate-600 whitespace-pre-line bg-slate-50 p-3 rounded-lg">{selectedItem.description || 'No description'}</p>
                                </div>

                                {selectedItem.sellerProfile && (
                                    <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                                            {selectedItem.sellerProfile.full_name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{selectedItem.sellerProfile.full_name}</p>
                                            <p className="text-xs text-slate-500">{selectedItem.sellerProfile.email} {selectedItem.sellerProfile.phone ? `• ${selectedItem.sellerProfile.phone}` : ''}</p>
                                        </div>
                                    </div>
                                )}

                                {isRejecting && (
                                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                                        <label className="text-xs font-bold text-rose-800 uppercase">Rejection Reason</label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            rows={3}
                                            placeholder="Explain why this listing is rejected..."
                                            className="w-full p-2.5 bg-white border border-rose-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex justify-between rounded-b-2xl">
                            <button onClick={() => setSelectedItem(null)} className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Close
                            </button>
                            <div className="flex gap-2">
                                {!isRejecting ? (
                                    <>
                                        <button
                                            onClick={() => setIsRejecting(true)}
                                            className="px-5 py-2 border border-rose-300 bg-rose-50 text-rose-700 rounded-lg text-sm font-bold hover:bg-rose-100"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleApprove(selectedItem.id)}
                                            disabled={actionLoading}
                                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
                                        >
                                            Approve Listing
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsRejecting(false)}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleReject(selectedItem.id)}
                                            disabled={actionLoading || !rejectionReason.trim()}
                                            className="px-6 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 disabled:opacity-50"
                                        >
                                            Confirm Rejection
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuySellPending;
