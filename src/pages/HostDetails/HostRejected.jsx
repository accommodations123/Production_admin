import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
    Phone, Mail, MessageCircle, MapPin, Globe, 
    Facebook, Instagram, Linkedin, Home, XCircle, 
    Calendar, User, AlertCircle, RefreshCw 
} from 'lucide-react';

function HostRejected() {
    const [hosts, setHosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHost, setSelectedHost] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const normalizeHost = (h, allProps = []) => {
        const id = h.id || h._id || '';
        const email = h.email || h.user_email || h.contact_email || h.mail || '';
        const fullName = h.full_name || `${h.firstName || ''} ${h.lastName || ''}`.trim() || h.name || h.displayName || h.userName || h.user_name || h.host_name || '';
        const phone = h.phone || h.phone_number || h.phoneNumber || h.mobile || h.mobile_number || h.contact || h.contact_number || h.tel || '';
        const whatsapp = h.whatsapp || h.whatsApp || h.whatsapp_number || h.whatsappNumber || h.wa || h.seller_whatsapp || '';
        const streetAddress = h.street_address || h.street || h.address || h.streetAddress || h.address_line_1 || h.address1 || h.location || h.area || '';
        const city = h.city || h.location_city || h.town || '';
        const state = h.state || h.province || h.region || h.state_province || '';
        const zipCode = h.zip_code || h.zipCode || h.zip || h.postal_code || h.postalCode || h.pincode || h.pin || '';
        const country = h.country || h.country_name || h.nation || '';
        const facebook = h.facebook || h.facebook_url || h.facebookUrl || h.socials?.facebook || h.social_links?.facebook || h.social?.facebook || '';
        const instagram = h.instagram || h.instagram_url || h.instagramUrl || h.socials?.instagram || h.social_links?.instagram || h.social?.instagram || '';
        const linkedin = h.linkedin || h.linkedin_url || h.socials?.linkedin || h.social_links?.linkedin || '';
        const website = h.website || h.portfolio_url || h.portfolio || '';
        const bio = h.bio || h.about || h.description || '';
        const headline = h.headline || h.occupation || h.profession || h.role || '';
        const rejectionReason = h.rejection_reason || h.rejectionReason || 'Application criteria was not satisfied';

        // Match properties for this host
        const userProperties = allProps.filter(p => 
            (id && (p.host_id === id || p.user_id === id || p.owner_id === id)) ||
            (email && (p.email?.toLowerCase() === email.toLowerCase() || p.owner_email?.toLowerCase() === email.toLowerCase())) ||
            (fullName && fullName !== 'Host' && (p.host_name?.toLowerCase() === fullName.toLowerCase() || p.hostName?.toLowerCase() === fullName.toLowerCase()))
        );

        const firstProp = userProperties[0] || {};
        const finalName = fullName || firstProp.host_name || firstProp.hostName || firstProp.user_name || (email ? email.split('@')[0] : 'Host Applicant');

        return {
            ...h,
            id,
            full_name: finalName,
            email: email || firstProp.email || '',
            phone: phone || firstProp.phone || '',
            whatsapp: whatsapp || '',
            street_address: streetAddress || firstProp.address || firstProp.area || '',
            city: city || firstProp.city || '',
            state: state || firstProp.state || '',
            zip_code: zipCode || firstProp.zip_code || '',
            country: country || firstProp.country || '',
            facebook,
            instagram,
            linkedin,
            website,
            bio,
            headline,
            rejection_reason: rejectionReason,
            properties: userProperties,
            properties_count: userProperties.length
        };
    };

    const fetchHosts = async () => {
        try {
            setLoading(true);
            const [profilesRes, propsRes] = await Promise.all([
                supabase.from("profiles").select("*").order("created_at", { ascending: false }),
                supabase.from("properties").select("*").order("created_at", { ascending: false })
            ]);

            const profilesData = Array.isArray(profilesRes.data) ? profilesRes.data : [];
            const propsData = Array.isArray(propsRes.data) ? propsRes.data : [];

            // Rejected profiles
            const rejectedProfiles = profilesData.filter(p => p.status === "rejected");

            const formatted = rejectedProfiles.map(h => normalizeHost(h, propsData));

            // Check rejected properties whose host may not be in profiles
            const existingEmails = new Set(formatted.map(h => h.email?.toLowerCase()).filter(Boolean));
            const existingIds = new Set(formatted.map(h => h.id).filter(Boolean));

            propsData.forEach(p => {
                const hostEmail = p.email?.toLowerCase();
                const hostId = p.host_id;
                const isRejectedProp = p.status === 'rejected';

                if (isRejectedProp && ((hostEmail && !existingEmails.has(hostEmail)) || (hostId && !existingIds.has(hostId)))) {
                    if (hostEmail) existingEmails.add(hostEmail);
                    if (hostId) existingIds.add(hostId);

                    formatted.push(normalizeHost({
                        id: hostId || p.id,
                        full_name: p.host_name || p.hostName || p.user_name || 'Host',
                        email: p.email || '',
                        phone: p.phone || '',
                        street_address: p.address || '',
                        city: p.city || '',
                        state: p.state || '',
                        zip_code: p.zip_code || '',
                        country: p.country || '',
                        status: 'rejected',
                        rejection_reason: p.rejection_reason || 'Listing rejected',
                        created_at: p.created_at,
                        updated_at: p.updated_at
                    }, propsData));
                }
            });

            setHosts(formatted);
        } catch (err) {
            console.error("Error fetching rejected hosts:", err);
            setHosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHosts();
    }, []);

    const handleReconsider = async () => {
        if (!selectedHost) return;
        try {
            setActionLoading(true);
            const hostId = selectedHost.id || selectedHost._id;
            
            // Move back to pending for re-evaluation
            await supabase
                .from("profiles")
                .update({ status: "pending", is_approved: false, rejection_reason: null, updated_at: new Date().toISOString() })
                .or(`id.eq.${hostId},_id.eq.${hostId}`);

            setHosts(prev => prev.filter(h => (h.id !== hostId && h._id !== hostId)));
            setSelectedHost(null);
        } catch (e) {
            console.error(e);
            alert(e.message || 'Failed to move to pending');
        } finally {
            setActionLoading(false);
        }
    };

    const displayValue = (val) => val && String(val).trim() ? val : <span className="italic text-gray-400">N/A</span>;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
                <p className="mt-3 text-sm text-slate-500 font-medium">Loading rejected hosts...</p>
            </div>
        );
    }

    if (hosts.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                <XCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-700">No Rejected Hosts</h3>
                <p className="text-sm text-slate-400 mt-1">There are no rejected host applications on record.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hosts.map((host) => (
                    <div key={host.id || host.email} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between opacity-85 hover:opacity-100">
                        <div className="p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center space-x-3.5 min-w-0">
                                    <img 
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(host.full_name)}&background=e11d48&color=fff&size=100`} 
                                        alt={host.full_name}
                                        className="w-13 h-13 rounded-full border-2 border-rose-100 shrink-0 object-cover grayscale" 
                                    />
                                    <div className="min-w-0">
                                        <h3 className="text-base font-bold text-slate-900 truncate" title={host.full_name}>{host.full_name}</h3>
                                        <p className="text-xs text-slate-500 truncate" title={host.email}>{host.email || 'No email provided'}</p>
                                        {(host.city || host.country) && (
                                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span className="truncate">{[host.city, host.country].filter(Boolean).join(', ')}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shrink-0 inline-flex items-center gap-1">
                                    <XCircle className="w-3 h-3" /> Rejected
                                </span>
                            </div>

                            {/* Rejection Snippet */}
                            <div className="mt-3 p-2.5 bg-rose-50/70 rounded-lg text-xs text-rose-800 border border-rose-100 line-clamp-2">
                                <span className="font-semibold">Reason:</span> {host.rejection_reason}
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Phone</span>
                                    <span className="font-medium truncate block">{host.phone || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Listings</span>
                                    <span className="font-medium text-slate-600 block">{host.properties_count || 0} Properties</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 pt-0">
                            <button 
                                onClick={() => setSelectedHost(host)} 
                                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-sm rounded-xl border border-rose-200 transition-colors"
                            >
                                View Rejection Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            {selectedHost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col relative z-50 border border-slate-100">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center rounded-t-2xl z-10">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Rejected Host Details</h2>
                                    <p className="text-xs text-slate-400">Review rejection notes and applicant records</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedHost(null)} 
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xl font-bold transition-colors"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Profile Hero */}
                            <div className="flex items-center space-x-5 bg-gradient-to-br from-rose-50/70 to-pink-50/50 p-5 rounded-2xl border border-rose-100/60">
                                <img 
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedHost.full_name)}&background=e11d48&color=fff&size=128`} 
                                    alt={selectedHost.full_name}
                                    className="w-18 h-18 rounded-2xl border-4 border-white shadow-sm object-cover shrink-0 grayscale" 
                                />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-xl font-bold text-slate-900">{selectedHost.full_name}</h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-600 text-white shadow-sm inline-flex items-center gap-1">
                                            <XCircle className="w-3 h-3" /> Rejected
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-0.5">{selectedHost.email || 'No email on record'}</p>
                                    {selectedHost.headline && (
                                        <p className="text-xs font-medium text-slate-700 bg-rose-100/60 px-2 py-0.5 rounded mt-1.5 inline-block">
                                            {selectedHost.headline}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* REJECTION REASON BANNER */}
                            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide">Reason for Rejection</h4>
                                    <p className="text-sm text-rose-800 mt-0.5 font-medium leading-relaxed">
                                        {selectedHost.rejection_reason}
                                    </p>
                                </div>
                            </div>

                            {/* Two-Column Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* CONTACT */}
                                <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 space-y-3">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" /> Contact Information
                                    </h4>
                                    <ul className="space-y-2.5 text-sm">
                                        <li>
                                            <span className="text-slate-400 block text-xs">Email</span>
                                            <span className="text-slate-800 font-medium">{displayValue(selectedHost.email)}</span>
                                        </li>
                                        <li>
                                            <span className="text-slate-400 block text-xs">Phone</span>
                                            <span className="text-slate-800 font-medium">{displayValue(selectedHost.phone)}</span>
                                        </li>
                                        <li>
                                            <span className="text-slate-400 block text-xs">WhatsApp</span>
                                            <span className="text-slate-800 font-medium">{displayValue(selectedHost.whatsapp)}</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* ADDRESS */}
                                <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 space-y-3">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> Address & Location
                                    </h4>
                                    <ul className="space-y-2.5 text-sm">
                                        <li>
                                            <span className="text-slate-400 block text-xs">Street Address</span>
                                            <span className="text-slate-800 font-medium">{displayValue(selectedHost.street_address)}</span>
                                        </li>
                                        <li>
                                            <span className="text-slate-400 block text-xs">City</span>
                                            <span className="text-slate-800 font-medium">{displayValue(selectedHost.city)}</span>
                                        </li>
                                        <li>
                                            <span className="text-slate-400 block text-xs">State / Region</span>
                                            <span className="text-slate-800 font-medium">{displayValue(selectedHost.state)}</span>
                                        </li>
                                        <li>
                                            <span className="text-slate-400 block text-xs">Zip / Postal Code</span>
                                            <span className="text-slate-800 font-medium">{displayValue(selectedHost.zip_code)}</span>
                                        </li>
                                        <li>
                                            <span className="text-slate-400 block text-xs">Country</span>
                                            <span className="text-slate-800 font-medium">{displayValue(selectedHost.country)}</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* SOCIAL MEDIA */}
                                <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 space-y-3">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
                                        <Globe className="w-3.5 h-3.5 text-slate-400" /> Social Media
                                    </h4>
                                    <ul className="space-y-2.5 text-sm">
                                        <li>
                                            <span className="text-slate-400 block text-xs">Facebook</span>
                                            <span className="text-slate-800 font-medium">{displayValue(selectedHost.facebook)}</span>
                                        </li>
                                        <li>
                                            <span className="text-slate-400 block text-xs">Instagram</span>
                                            <span className="text-slate-800 font-medium">{displayValue(selectedHost.instagram)}</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* SYSTEM INFO */}
                                <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 space-y-3">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Application Details
                                    </h4>
                                    <ul className="space-y-2.5 text-sm">
                                        <li>
                                            <span className="text-slate-400 block text-xs">Host / Profile ID</span>
                                            <span className="text-slate-800 font-mono text-xs break-all">{selectedHost.id || 'N/A'}</span>
                                        </li>
                                        <li>
                                            <span className="text-slate-400 block text-xs">Application Date</span>
                                            <span className="text-slate-800 font-medium">{selectedHost.created_at ? new Date(selectedHost.created_at).toLocaleString() : 'N/A'}</span>
                                        </li>
                                        <li>
                                            <span className="text-slate-400 block text-xs">Last Updated</span>
                                            <span className="text-slate-800 font-medium">{selectedHost.updated_at ? new Date(selectedHost.updated_at).toLocaleString() : 'N/A'}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 px-6 flex items-center justify-between rounded-b-2xl">
                            <button 
                                onClick={() => setSelectedHost(null)} 
                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
                            >
                                Close
                            </button>

                            <button 
                                onClick={handleReconsider}
                                disabled={actionLoading}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} /> 
                                Move Back to Pending
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default HostRejected;