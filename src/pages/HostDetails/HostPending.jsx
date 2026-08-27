import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
    Phone, Mail, MessageCircle, MapPin, Globe, 
    Facebook, Instagram, Linkedin, Home, Clock, 
    Calendar, User, AlertCircle, CheckCircle, XCircle 
} from 'lucide-react';

function HostPending() {
    const [hosts, setHosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedHost, setSelectedHost] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);
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

            // Pending profiles (not approved, not rejected, not blocked)
            const pendingProfiles = profilesData.filter(p => 
                p.status === "pending" || (!p.status && !p.is_approved && p.status !== "rejected" && p.status !== "blocked")
            );

            const formatted = pendingProfiles.map(h => normalizeHost(h, propsData));

            // Also check properties that are pending where host might not be in profiles
            const existingEmails = new Set(formatted.map(h => h.email?.toLowerCase()).filter(Boolean));
            const existingIds = new Set(formatted.map(h => h.id).filter(Boolean));

            propsData.forEach(p => {
                const hostEmail = p.email?.toLowerCase();
                const hostId = p.host_id;
                const isPendingProp = p.status === 'pending' || (!p.status && !p.is_approved);

                if (isPendingProp && ((hostEmail && !existingEmails.has(hostEmail)) || (hostId && !existingIds.has(hostId)))) {
                    if (hostEmail) existingEmails.add(hostEmail);
                    if (hostId) existingIds.add(hostId);

                    formatted.push(normalizeHost({
                        id: hostId || p.id,
                        full_name: p.host_name || p.hostName || p.user_name || 'Host Applicant',
                        email: p.email || '',
                        phone: p.phone || '',
                        street_address: p.address || '',
                        city: p.city || '',
                        state: p.state || '',
                        zip_code: p.zip_code || '',
                        country: p.country || '',
                        status: 'pending',
                        is_approved: false,
                        created_at: p.created_at,
                        updated_at: p.updated_at
                    }, propsData));
                }
            });

            setHosts(formatted);
        } catch (err) {
            console.error("Error fetching pending hosts:", err);
            setError(err.message || 'Failed to fetch pending hosts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHosts();
    }, []);

    const openModal = (host) => { 
        setSelectedHost(host); 
        setRejectionReason(""); 
        setIsRejecting(false); 
    };

    const closeModal = () => { 
        setSelectedHost(null); 
        setIsRejecting(false); 
    };

    const handleApprove = async () => {
        if (!selectedHost) return;
        try {
            setActionLoading(true);
            const hostId = selectedHost.id || selectedHost._id;
            
            // Update profile
            await supabase
                .from("profiles")
                .update({ status: "approved", is_approved: true, updated_at: new Date().toISOString() })
                .or(`id.eq.${hostId},_id.eq.${hostId}`);

            // Also update any matching properties
            if (selectedHost.email) {
                await supabase
                    .from("properties")
                    .update({ status: "approved", is_approved: true, updated_at: new Date().toISOString() })
                    .eq("email", selectedHost.email);
            }

            setHosts(prev => prev.filter(h => (h.id !== hostId && h._id !== hostId)));
            closeModal();
        } catch (e) {
            console.error(e);
            alert(e.message || 'Failed to approve host');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectSubmit = async () => {
        if (!selectedHost || !rejectionReason.trim()) { 
            alert("Please specify a reason for rejection"); 
            return; 
        }
        try {
            setActionLoading(true);
            const hostId = selectedHost.id || selectedHost._id;
            
            await supabase
                .from("profiles")
                .update({
                    status: "rejected",
                    is_approved: false,
                    rejection_reason: rejectionReason,
                    updated_at: new Date().toISOString()
                })
                .or(`id.eq.${hostId},_id.eq.${hostId}`);

            setHosts(prev => prev.filter(h => (h.id !== hostId && h._id !== hostId)));
            closeModal();
        } catch (e) {
            console.error(e);
            alert(e.message || 'Failed to reject host');
        } finally {
            setActionLoading(false);
        }
    };

    const displayValue = (val) => val && String(val).trim() ? val : <span className="italic text-gray-400">N/A</span>;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                <p className="mt-3 text-sm text-slate-500 font-medium">Loading pending applications...</p>
            </div>
        );
    }

    if (error) return <div className="text-center text-red-500 py-12">{error}</div>;

    if (hosts.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-700">No Pending Applications</h3>
                <p className="text-sm text-slate-400 mt-1">All host applications have been reviewed.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hosts.map((host) => (
                    <div key={host.id || host.email} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
                        <div className="p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center space-x-3.5 min-w-0">
                                    <img 
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(host.full_name)}&background=d97706&color=fff&size=100`} 
                                        alt={host.full_name}
                                        className="w-13 h-13 rounded-full border-2 border-amber-100 shrink-0 object-cover" 
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
                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0 inline-flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Pending
                                </span>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Phone</span>
                                    <span className="font-medium truncate block">{host.phone || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Listings</span>
                                    <span className="font-medium text-indigo-600 block">{host.properties_count || 0} Properties</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 pt-0">
                            <button 
                                onClick={() => openModal(host)} 
                                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm rounded-xl border border-indigo-200 transition-colors"
                            >
                                Review Application
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* REVIEW MODAL */}
            {selectedHost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col relative z-50 border border-slate-100">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center rounded-t-2xl z-10">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Review Host Application</h2>
                                    <p className="text-xs text-slate-400">Verify host details and approve or reject application</p>
                                </div>
                            </div>
                            <button 
                                onClick={closeModal} 
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xl font-bold transition-colors"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Profile Hero */}
                            <div className="flex items-center space-x-5 bg-gradient-to-br from-amber-50/70 to-orange-50/50 p-5 rounded-2xl border border-amber-100/60">
                                <img 
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedHost.full_name)}&background=d97706&color=fff&size=128`} 
                                    alt={selectedHost.full_name}
                                    className="w-18 h-18 rounded-2xl border-4 border-white shadow-sm object-cover shrink-0" 
                                />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-xl font-bold text-slate-900">{selectedHost.full_name}</h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-600 text-white shadow-sm inline-flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Pending Review
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-0.5">{selectedHost.email || 'No email on record'}</p>
                                    {selectedHost.headline && (
                                        <p className="text-xs font-medium text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded mt-1.5 inline-block">
                                            {selectedHost.headline}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            {selectedHost.bio && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">About / Bio</h4>
                                    <p className="text-sm text-slate-700 leading-relaxed">{selectedHost.bio}</p>
                                </div>
                            )}

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
                                        {selectedHost.website && (
                                            <li>
                                                <span className="text-slate-400 block text-xs">Website</span>
                                                <a href={selectedHost.website.startsWith('http') ? selectedHost.website : `https://${selectedHost.website}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-xs truncate block">
                                                    {selectedHost.website}
                                                </a>
                                            </li>
                                        )}
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
                                        {selectedHost.linkedin && (
                                            <li>
                                                <span className="text-slate-400 block text-xs">LinkedIn</span>
                                                <span className="text-slate-800 font-medium">{displayValue(selectedHost.linkedin)}</span>
                                            </li>
                                        )}
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

                            {/* HOSTED PROPERTIES */}
                            {selectedHost.properties?.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <Home className="w-4 h-4 text-amber-600" /> 
                                        Submitted Accommodation Listings ({selectedHost.properties.length})
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedHost.properties.map((prop, idx) => (
                                            <div key={prop.id || idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs">
                                                {prop.photos?.[0] ? (
                                                    <img src={prop.photos[0]} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                                        <Home className="w-6 h-6" />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold text-slate-800 truncate">{prop.title || 'Untitled Accommodation'}</p>
                                                    <p className="text-[11px] text-slate-500 truncate">{prop.city || prop.address || 'Location not set'}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[11px] font-semibold text-emerald-700">
                                                            {prop.currency || '$'}{prop.price_per_night || prop.price || 0}/night
                                                        </span>
                                                        <span className="px-1.5 py-0.2 text-[10px] font-bold rounded uppercase bg-amber-100 text-amber-800">
                                                            {prop.status || 'pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Rejection Form Input if Rejecting */}
                            {isRejecting && (
                                <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-3 animate-fade-in">
                                    <div className="flex items-center gap-2 text-rose-800 font-semibold text-sm">
                                        <AlertCircle className="w-4 h-4" /> State Rejection Reason:
                                    </div>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="e.g. Incomplete address verification, invalid contact information..."
                                        rows={3}
                                        className="w-full p-3 bg-white border border-rose-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => setIsRejecting(false)} 
                                            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleRejectSubmit} 
                                            disabled={actionLoading || !rejectionReason.trim()} 
                                            className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-50"
                                        >
                                            {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Actions */}
                        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 px-6 flex items-center justify-between rounded-b-2xl">
                            <button 
                                onClick={closeModal} 
                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
                            >
                                Close
                            </button>

                            <div className="flex items-center gap-3">
                                {!isRejecting && (
                                    <button 
                                        onClick={() => setIsRejecting(true)} 
                                        disabled={actionLoading}
                                        className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-sm font-semibold transition-colors inline-flex items-center gap-1.5"
                                    >
                                        <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                )}
                                <button 
                                    onClick={handleApprove} 
                                    disabled={actionLoading}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    <CheckCircle className="w-4 h-4" /> {actionLoading ? 'Approving...' : 'Approve Host'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default HostPending;