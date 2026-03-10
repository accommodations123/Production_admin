import React, { useState, useEffect } from 'react';

const BASE_URL = "https://api.nextkinlife.live";
const getAuthHeaders = () => {
    const token = localStorage.getItem("admin-auth");
    if (!token) console.error("No token");
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
};

function EventApproved() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${BASE_URL}/events/admin/events/approved`, { method: 'GET', headers: getAuthHeaders() });
                if (!response.ok) throw new Error('Failed to fetch');
                const result = await response.json();
                setEvents(result.events || []);
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchEvents();
    }, []);

    const displayValue = (val) => val ? val : <span className="italic text-gray-400">N/A</span>;

    if (loading) return <div className="text-center py-12">Loading...</div>;
    if (events.length === 0) return <div className="text-center py-12 text-gray-500">No approved events.</div>;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((ev) => (
                    <div key={ev.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md flex flex-col">
                        <div className="h-32 w-full bg-gray-200 relative">
                            <img src={ev.banner_image} className="w-full h-full object-cover" alt="banner" />
                            <span className="absolute top-2 right-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded uppercase">Approved</span>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg text-gray-900 truncate">{ev.title}</h3>
                            <p className="text-sm text-gray-500 truncate">{ev.city}, {ev.state}</p>
                        </div>
                        <div className="p-4 pt-0 mt-auto">
                            <button onClick={() => setSelectedEvent(ev)} className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100">Event Details</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL (Read-Only) */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col relative z-50">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center rounded-t-2xl z-10">
                            <h2 className="text-xl font-bold text-gray-800">Event Details</h2>
                            <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>
                        <div className="p-6 space-y-8">
                            <div className="rounded-xl overflow-hidden shadow-sm h-64 bg-gray-100"><img src={selectedEvent.banner_image} className="w-full h-full object-cover" /></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">Event Info</h4>
                                    <ul className="space-y-3 text-sm">
                                        <li><span className="text-gray-500 block text-xs">Title</span>{selectedEvent.title}</li>
                                        <li><span className="text-gray-500 block text-xs">Type</span>{displayValue(selectedEvent.type)}</li>
                                        <li><span className="text-gray-500 block text-xs">Mode</span>{displayValue(selectedEvent.event_mode)}</li>
                                        <li><span className="text-gray-500 block text-xs">Price</span>{displayValue(selectedEvent.price)}</li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">Date & Time</h4>
                                    <ul className="space-y-3 text-sm">
                                        <li><span className="text-gray-500 block text-xs">Start</span>{selectedEvent.start_date} {selectedEvent.start_time}</li>
                                        <li><span className="text-gray-500 block text-xs">End</span>{displayValue(selectedEvent.end_date)} {displayValue(selectedEvent.end_time)}</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Reuse of detailed sections for Approved */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">Location</h4>
                                <ul className="space-y-3 text-sm">
                                    <li><span className="text-gray-500 block text-xs">Venue</span>{displayValue(selectedEvent.venue_name)}</li>
                                    <li><span className="text-gray-500 block text-xs">Address</span>{displayValue(selectedEvent.street_address)}, {selectedEvent.city}</li>
                                </ul>
                            </div>

                            {/* Host Info */}
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                <img src={selectedEvent.Host?.User?.profile_image || "https://ui-avatars.com/api/?name=Host"} className="w-12 h-12 rounded-full" alt="Host" />
                                <div><p className="font-bold text-gray-900">{selectedEvent.Host?.full_name}</p><p className="text-sm text-gray-500">{selectedEvent.Host?.User?.email}</p></div>
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex justify-end rounded-b-2xl">
                            <button onClick={() => setSelectedEvent(null)} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
export default EventApproved;