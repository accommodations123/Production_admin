import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

function EventPending() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const { data, error: supaErr } = await supabase
                .from('events')
                .select('*')
                .or('status.eq.pending,status.is.null,is_approved.eq.false');

            if (supaErr) {
                console.error("Fetch pending events error:", supaErr);
                setEvents([]);
            } else {
                let eventList = (data || []).filter(e => e.status !== 'rejected' && e.status !== 'blocked');
                const hostIds = [...new Set(eventList.map(e => e.host_id || e.user_id).filter(Boolean))];
                if (hostIds.length > 0) {
                    const { data: profiles } = await supabase.from('profiles').select('*').in('id', hostIds);
                    const profileMap = {};
                    (profiles || []).forEach(p => { profileMap[p.id] = p; });
                    eventList = eventList.map(e => ({
                        ...e,
                        Host: profileMap[e.host_id || e.user_id] || e.Host || null,
                    }));
                }
                setEvents(eventList);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleApprove = async (id) => {
        setActionLoading(true);
        try {
            const { error: supaErr } = await supabase
                .from('events')
                .update({ status: 'approved', is_approved: true })
                .eq('id', id);

            if (supaErr) throw supaErr;
            setEvents(prev => prev.filter(e => e.id !== id));
            setSelectedEvent(null);
        } catch (err) {
            console.error("Approve error:", err);
            alert(err.message || "Failed to approve event");
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
                .from('events')
                .update({
                    status: 'rejected',
                    is_approved: false,
                    rejection_reason: rejectionReason.trim()
                })
                .eq('id', id);

            if (supaErr) throw supaErr;
            setEvents(prev => prev.filter(e => e.id !== id));
            setSelectedEvent(null);
            setIsRejecting(false);
            setRejectionReason("");
        } catch (err) {
            console.error("Reject error:", err);
            alert(err.message || "Failed to reject event");
        } finally {
            setActionLoading(false);
        }
    };

    const displayValue = (val) => val ? val : <span className="italic text-gray-400">N/A</span>;

    if (loading) return <div className="text-center py-12">Loading pending events...</div>;
    if (events.length === 0) return <div className="text-center py-12 text-gray-500">No pending events to review.</div>;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((ev) => (
                    <div key={ev.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md flex flex-col">
                        <div className="h-32 w-full bg-gray-200 relative">
                            {ev.banner_image ? (
                                <img src={ev.banner_image} className="w-full h-full object-cover" alt="banner" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">No Image</div>
                            )}
                            <span className="absolute top-2 right-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded uppercase">Pending</span>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg text-gray-900 truncate">{ev.title || 'Untitled Event'}</h3>
                            <p className="text-sm text-gray-500 truncate">{[ev.city, ev.state, ev.country].filter(Boolean).join(', ') || 'Location N/A'}</p>
                            {ev.Host?.full_name && (
                                <p className="text-xs text-indigo-600 font-medium mt-1">Host: {ev.Host.full_name}</p>
                            )}
                        </div>
                        <div className="p-4 pt-0 mt-auto flex gap-2">
                            <button
                                onClick={() => { setSelectedEvent(ev); setIsRejecting(false); }}
                                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                            >
                                Details
                            </button>
                            <button
                                onClick={() => handleApprove(ev.id)}
                                disabled={actionLoading}
                                className="flex-1 py-2 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col relative z-50">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center rounded-t-2xl z-10">
                            <h2 className="text-xl font-bold text-gray-800">Review Event</h2>
                            <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>
                        <div className="p-6 space-y-6">
                            {selectedEvent.banner_image && (
                                <div className="rounded-xl overflow-hidden shadow-sm h-64 bg-gray-100">
                                    <img src={selectedEvent.banner_image} className="w-full h-full object-cover" alt="Banner" />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Event Details</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li><span className="text-slate-500 text-xs block">Title</span>{selectedEvent.title}</li>
                                        <li><span className="text-slate-500 text-xs block">Type</span>{displayValue(selectedEvent.type)}</li>
                                        <li><span className="text-slate-500 text-xs block">Mode</span>{displayValue(selectedEvent.event_mode)}</li>
                                        <li><span className="text-slate-500 text-xs block">Price</span>{displayValue(selectedEvent.price)}</li>
                                    </ul>
                                </div>
                                <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li><span className="text-slate-500 text-xs block">Start</span>{selectedEvent.start_date} {selectedEvent.start_time}</li>
                                        <li><span className="text-slate-500 text-xs block">End</span>{displayValue(selectedEvent.end_date)} {displayValue(selectedEvent.end_time)}</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Host Info */}
                            {selectedEvent.Host && (
                                <div className="flex items-center space-x-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                                        {selectedEvent.Host?.full_name?.[0]?.toUpperCase() || 'H'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{selectedEvent.Host?.full_name}</p>
                                        <p className="text-xs text-slate-500">{selectedEvent.Host?.email} {selectedEvent.Host?.phone ? `• ${selectedEvent.Host.phone}` : ''}</p>
                                    </div>
                                </div>
                            )}

                            {/* Rejection input */}
                            {isRejecting && (
                                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                                    <label className="text-xs font-bold text-rose-800 uppercase">Reason for Rejection</label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        rows={3}
                                        placeholder="Explain why this event is rejected..."
                                        className="w-full p-2.5 bg-white border border-rose-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex justify-between rounded-b-2xl">
                            <button onClick={() => setSelectedEvent(null)} className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
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
                                            onClick={() => handleApprove(selectedEvent.id)}
                                            disabled={actionLoading}
                                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
                                        >
                                            Approve Event
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
                                            onClick={() => handleReject(selectedEvent.id)}
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
        </>
    );
}

export default EventPending;
