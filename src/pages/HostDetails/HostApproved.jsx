import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
    Phone, Mail, MessageCircle, MapPin, Globe, 
    Facebook, Instagram, Linkedin, Home, CheckCircle2, 
    Calendar, User, AlertCircle 
} from 'lucide-react';

function HostApproved() {
    const [hosts, setHosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHost, setSelectedHost] = useState(null);

    const parseJson = (val) => {
        if (!val) return {};
        if (typeof val === 'object') return val;
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch { return {}; }
        }
        return {};
    };

    const normalizeHost = (h, allProps = []) => {
        const raw = h || {};
        const addr = parseJson(raw.address || raw.location);
        const contact = parseJson(raw.contact || raw.contact_info);
        const socials = parseJson(raw.socials || raw.social_links || raw.socialMedia);
        const verification = parseJson(raw.verification);
        const meta = parseJson(raw.metadata || raw.meta || raw.raw_user_meta_data);

        const id = raw.id || raw._id || '';
        const email = raw.email || raw.user_email || raw.contact_email || raw.mail || contact.email || meta.email || '';
        const fullName = raw.full_name || `${raw.firstName || ''} ${raw.lastName || ''}`.trim() || raw.name || raw.displayName || raw.userName || raw.user_name || raw.host_name || verification.full_name || meta.full_name || meta.name || '';
        const phone = raw.phone || raw.phone_number || raw.phoneNumber || raw.mobile || raw.mobile_number || raw.contact || raw.contact_number || raw.tel || contact.phone || verification.phone || meta.phone || '';
        const whatsapp = raw.whatsapp || raw.whatsApp || raw.whatsapp_number || raw.whatsappNumber || raw.wa || raw.seller_whatsapp || contact.whatsapp || socials.whatsapp || '';
        const streetAddress = raw.street_address || raw.street || (typeof raw.address === 'string' ? raw.address : '') || raw.streetAddress || raw.address_line_1 || raw.address1 || raw.area || (typeof addr === 'object' ? (addr.street || addr.street_address || addr.address || '') : '');
        const city = raw.city || raw.location_city || raw.town || (typeof addr === 'object' ? addr.city : '') || '';
        const state = raw.state || raw.province || raw.region || raw.state_province || (typeof addr === 'object' ? (addr.state || addr.province) : '') || '';
        const zipCode = raw.zip_code || raw.zipCode || raw.zip || raw.postal_code || raw.postalCode || raw.pincode || raw.pin || (typeof addr === 'object' ? (addr.zip_code || addr.zipCode || addr.postal_code) : '') || '';
        const country = raw.country || raw.country_name || raw.nation || (typeof addr === 'object' ? addr.country : '') || '';
        const facebook = raw.facebook || raw.facebook_url || raw.facebookUrl || socials.facebook || '';
        const instagram = raw.instagram || raw.instagram_url || raw.instagramUrl || socials.instagram || '';
        const linkedin = raw.linkedin || raw.linkedin_url || socials.linkedin || '';
        const website = raw.website || raw.portfolio_url || raw.portfolio || meta.website || '';
        const bio = raw.bio || raw.about || raw.description || raw.about_me || meta.bio || '';
        const headline = raw.headline || raw.occupation || raw.profession || raw.role || '';

        // Match properties for this host
        const userProperties = allProps.filter(p => 
            (id && (p.host_id === id || p.user_id === id || p.owner_id === id)) ||
            (email && (p.email?.toLowerCase() === email.toLowerCase() || p.owner_email?.toLowerCase() === email.toLowerCase())) ||
            (fullName && fullName !== 'Host' && (p.host_name?.toLowerCase() === fullName.toLowerCase() || p.hostName?.toLowerCase() === fullName.toLowerCase()))
        );

        const firstProp = userProperties[0] || {};
        const finalName = fullName || firstProp.host_name || firstProp.hostName || firstProp.user_name || (email ? email.split('@')[0] : 'Approved Host');

        return {
            ...raw,
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

    useEffect(() => {
        const fetchHosts = async () => {
            try {
                setLoading(true);
                const [profilesRes, propsRes] = await Promise.all([
                    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
                    supabase.from("properties").select("*").order("created_at", { ascending: false })
                ]);

                const profilesData = Array.isArray(profilesRes.data) ? profilesRes.data : [];
                const propsData = Array.isArray(propsRes.data) ? propsRes.data : [];

                // Strictly APPROVED hosts only (exclude super_admin / admin)
                const approvedProfiles = profilesData.filter(p => {
                    const isAdmin = p.role === "super_admin" || p.role === "admin";
                    if (isAdmin) return false;
                    
                    return p.status === "approved" && p.is_approved === true;
                });

                const formatted = approvedProfiles.map(h => normalizeHost(h, propsData));
                setHosts(formatted);
            } catch (err) {
                console.error("Error fetching approved hosts:", err);
                setHosts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchHosts();
    }, []);

    const displayValue = (val) => val && String(val).trim() ? val : <span className="italic text-gray-400">N/A</span>;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="mt-3 text-sm text-slate-500 font-medium">Loading approved hosts...</p>
            </div>
        );
    }

    if (hosts.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-700">No Approved Hosts Found</h3>
                <p className="text-sm text-slate-400 mt-1">When an admin accepts a pending application, the approved host will appear here.</p>
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
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(host.full_name)}&background=059669&color=fff&size=100`} 
                                        alt={host.full_name}
                                        className="w-13 h-13 rounded-full border-2 border-emerald-100 shrink-0 object-cover" 
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
                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Approved
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
                                onClick={() => setSelectedHost(host)} 
                                className="w-full py-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-semibold text-sm rounded-xl border border-slate-200 hover:border-emerald-200 transition-colors"
                            >
                                View Host Details
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
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Host Profile & Details</h2>
                                    <p className="text-xs text-slate-400">Verified host account information</p>
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
                            <div className="flex items-center space-x-5 bg-gradient-to-br from-emerald-50/70 to-teal-50/50 p-5 rounded-2xl border border-emerald-100/60">
                                <img 
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedHost.full_name)}&background=059669&color=fff&size=128`} 
                                    alt={selectedHost.full_name}
                                    className="w-18 h-18 rounded-2xl border-4 border-white shadow-sm object-cover shrink-0" 
                                />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-xl font-bold text-slate-900">{selectedHost.full_name}</h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-sm inline-flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Approved Host
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-0.5">{selectedHost.email || 'No email on record'}</p>
                                    {selectedHost.headline && (
                                        <p className="text-xs font-medium text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded mt-1.5 inline-block">
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

                            {/* Two-Column Details */}
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
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> System Info
                                    </h4>
                                    <ul className="space-y-2.5 text-sm">
                                        <li>
                                            <span className="text-slate-400 block text-xs">Host / Profile ID</span>
                                            <span className="text-slate-800 font-mono text-xs break-all">{selectedHost.id || 'N/A'}</span>
                                        </li>
                                        <li>
                                            <span className="text-slate-400 block text-xs">Joined Date</span>
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
                                        <Home className="w-4 h-4 text-emerald-600" /> 
                                        Accommodation Listings ({selectedHost.properties.length})
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedHost.properties.map((prop, idx) => (
                                            <div key={prop.id || idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs">
                                                {prop.photos?.[0] ? (
                                                    <img src={prop.photos[0]} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
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
                                                        <span className="px-1.5 py-0.2 text-[10px] font-bold rounded uppercase bg-emerald-100 text-emerald-800">
                                                            approved
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 px-6 flex justify-end rounded-b-2xl">
                            <button 
                                onClick={() => setSelectedHost(null)} 
                                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default HostApproved;