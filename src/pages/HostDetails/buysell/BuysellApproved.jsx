import React, { useState, useEffect } from 'react';

const BuySellApproved = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    const BASE_URL = "https://api.nextkinlife.live";

    const getAuthHeaders = () => {
        const token = localStorage.getItem("admin-auth");
        if (!token) console.error("No token found");
        return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    };

    useEffect(() => {
        const fetchApproved = async () => {
            try {
                const response = await fetch(`${BASE_URL}/buy-sell/admin/buy-sell/approved`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) throw new Error('Network response was not ok');

                const data = await response.json();

                // --- FIXED DATA HANDLING ---
                if (Array.isArray(data)) {
                    setListings(data);
                } else if (data && Array.isArray(data.listings)) {
                    // This handles the { success: true, listings: [...] } format
                    setListings(data.listings);
                } else if (data && Array.isArray(data.data)) {
                    setListings(data.data);
                } else {
                    console.error("Unexpected Data Format:", data);
                    setListings([]);
                }
            } catch (err) {
                console.error("Error fetching approved listings:", err);
                setListings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchApproved();
    }, [BASE_URL]);

    return (
        <div className="space-y-4">
            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading Approved Listings...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {Array.isArray(listings) && listings.length > 0 ? (
                                listings.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <img className="h-10 w-10 rounded object-cover" src={item.images?.[0]} alt="" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                                                    <div className="text-sm text-gray-500">{item.category} / {item.subcategory}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{item.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">${item.price}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setSelectedItem(item)}
                                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded hover:bg-indigo-100 transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No approved listings found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- MODAL --- */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">Listing Details</h2>
                            <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-red-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {selectedItem.images && selectedItem.images.length > 0 && (
                                <div className="mb-6">
                                    <img src={selectedItem.images[0]} alt="Item" className="w-full h-64 object-cover rounded-lg shadow-md" />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="md:col-span-2 space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{selectedItem.title}</h3>
                                        <p className="text-gray-600 text-sm mt-1">{selectedItem.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><span className="font-medium text-gray-500">Category:</span> {selectedItem.category}</div>
                                        <div><span className="font-medium text-gray-500">Subcategory:</span> {selectedItem.subcategory}</div>
                                        <div><span className="font-medium text-gray-500">Price:</span> <span className="font-bold text-gray-900">${selectedItem.price}</span></div>
                                        <div><span className="font-medium text-gray-500">Status:</span>
                                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">{selectedItem.status}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                        <h4 className="text-xs uppercase text-gray-500 font-bold mb-2">Seller Info</h4>
                                        <div className="space-y-1 text-sm">
                                            <p className="font-bold text-gray-900">{selectedItem.name}</p>
                                            <p className="text-gray-600">{selectedItem.phone}</p>
                                            <p className="text-gray-500 text-xs">{selectedItem.User?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6 border-t pt-4">
                                <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                                <p className="text-sm text-gray-600">
                                    {selectedItem.street_address}<br />
                                    {selectedItem.city}, {selectedItem.state} {selectedItem.zip_code}<br />
                                    {selectedItem.country}
                                </p>
                            </div>

                            <div className="text-xs text-gray-400 pt-4 border-t grid grid-cols-2 gap-2">
                                <p>Posted: {new Date(selectedItem.createdAt).toLocaleString()}</p>
                                <p>Updated: {new Date(selectedItem.updatedAt).toLocaleString()}</p>
                                <p>User ID: {selectedItem.user_id}</p>
                                <p>Listing ID: {selectedItem.id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuySellApproved;