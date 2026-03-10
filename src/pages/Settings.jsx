import React, { useState, useEffect } from 'react';
import {
    User, Lock, Bell, Globe, Eye, EyeOff, Save, CheckCircle,
    AlertTriangle, X, Shield, Mail, Clock, Sun, Moon, Loader2,
    Settings as SettingsIcon, ChevronRight,
} from 'lucide-react';
import { getAdminInfo, getAdminRole } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || "https://api.nextkinlife.live";

const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'general', label: 'General', icon: Globe },
];

const ROLE_CONFIG = {
    super_admin: { label: 'Super Admin', gradient: 'from-amber-500 to-orange-600', textColor: 'text-amber-600', bgLight: 'bg-amber-50 border-amber-200' },
    admin: { label: 'Admin', gradient: 'from-blue-500 to-indigo-600', textColor: 'text-blue-600', bgLight: 'bg-blue-50 border-blue-200' },
    recruiter: { label: 'Recruiter', gradient: 'from-emerald-500 to-teal-600', textColor: 'text-emerald-600', bgLight: 'bg-emerald-50 border-emerald-200' },
};

/* ── Toast ─────────────────────────────────────────────────── */
function Toast({ message, type, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
    const colors = { success: 'bg-emerald-50 border-emerald-400 text-emerald-800', error: 'bg-red-50 border-red-400 text-red-800', info: 'bg-blue-50 border-blue-400 text-blue-800' };
    const icons = { success: <CheckCircle className="w-5 h-5 text-emerald-600" />, error: <AlertTriangle className="w-5 h-5 text-red-600" />, info: <CheckCircle className="w-5 h-5 text-blue-600" /> };
    return (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl animate-[slideIn_0.3s_ease-out] ${colors[type] || colors.info}`}>
            {icons[type]}<span className="font-medium text-sm">{message}</span>
            <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="w-4 h-4" /></button>
        </div>
    );
}

/* ── Toggle ────────────────────────────────────────────────── */
function Toggle({ enabled, onToggle }) {
    return (
        <button onClick={onToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#cb2926]/30 ${enabled ? 'bg-[#cb2926]' : 'bg-gray-300'}`}>
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
}

/* ── Section Card ──────────────────────────────────────────── */
function Card({ title, description, children }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

/* ── Profile Tab ───────────────────────────────────────────── */
function ProfileTab({ adminInfo, role, showToast }) {
    const rc = ROLE_CONFIG[role] || ROLE_CONFIG.admin;
    const initials = (adminInfo?.name || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const [name, setName] = useState(adminInfo?.name || 'Admin');
    const [saving, setSaving] = useState(false);
    const handleSave = async () => { setSaving(true); await new Promise(r => setTimeout(r, 800)); showToast('Profile updated successfully', 'success'); setSaving(false); };

    return (
        <Card title="Profile Information" description="Manage your personal information.">
            <div className="space-y-6">
                <div className="flex items-center gap-5">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${rc.gradient} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>{initials}</div>
                    <div>
                        <h4 className="text-lg font-bold text-gray-900">{adminInfo?.name || 'Admin'}</h4>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 mt-1 rounded-full text-xs font-semibold border ${rc.bgLight} ${rc.textColor}`}><Shield className="w-3 h-3" />{rc.label}</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                    <div className="flex items-center border border-gray-300 rounded-xl focus-within:border-[#cb2926] focus-within:ring-2 focus-within:ring-[#cb2926]/20 overflow-hidden transition-all">
                        <div className="bg-gray-50 p-3 border-r border-gray-200"><User className="w-4 h-4 text-gray-400" /></div>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="flex-1 px-3 py-2.5 outline-none text-gray-900 text-sm" placeholder="Enter your name" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                        <div className="bg-gray-100 p-3 border-r border-gray-200"><Mail className="w-4 h-4 text-gray-400" /></div>
                        <input type="email" value={adminInfo?.email || 'admin@nextkinlife.com'} disabled className="flex-1 px-3 py-2.5 outline-none text-gray-500 text-sm bg-transparent cursor-not-allowed" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 ml-1">Email cannot be changed. Contact a super admin.</p>
                </div>
                <div className="flex justify-end pt-2">
                    <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 bg-gradient-to-r from-[#cb2926] to-[#a71f1c] hover:from-[#a71f1c] hover:to-[#8b1916] text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transition-all disabled:opacity-60">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </Card>
    );
}

/* ── Security Tab ──────────────────────────────────────────── */
function SecurityTab({ showToast }) {
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); setError('');
        if (!currentPass) { setError('Current password is required'); return; }
        if (newPass.length < 8) { setError('New password must be at least 8 characters'); return; }
        if (newPass !== confirmPass) { setError('Passwords do not match'); return; }
        setSaving(true);
        try {
            const token = localStorage.getItem('admin-auth');
            const res = await fetch(`${API_URL}/admin/change-password`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) }, body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }) });
            if (!res.ok) { const d = await res.json(); setError(d.message || 'Failed to change password'); setSaving(false); return; }
            showToast('Password changed successfully', 'success');
            setCurrentPass(''); setNewPass(''); setConfirmPass('');
        } catch { setError('Network error. Please try again.'); }
        setSaving(false);
    };

    const InputField = ({ label, value, onChange, show, onToggle, placeholder }) => (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
            <div className="flex items-center border border-gray-300 rounded-xl focus-within:border-[#cb2926] focus-within:ring-2 focus-within:ring-[#cb2926]/20 overflow-hidden transition-all">
                <div className="bg-gray-50 p-3 border-r border-gray-200"><Lock className="w-4 h-4 text-gray-400" /></div>
                <input type={show ? 'text' : 'password'} value={value} onChange={e => { onChange(e.target.value); setError(''); }} className="flex-1 px-3 py-2.5 outline-none text-gray-900 text-sm" placeholder={placeholder} />
                {onToggle && <button type="button" onClick={onToggle} className="px-3 text-gray-400 hover:text-[#cb2926] transition">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <Card title="Change Password" description="Ensure your account stays secure.">
                <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
                    {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl"><AlertTriangle className="w-4 h-4 shrink-0" />{error}</div>}
                    <InputField label="Current Password" value={currentPass} onChange={setCurrentPass} show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} placeholder="Enter current password" />
                    <InputField label="New Password" value={newPass} onChange={setNewPass} show={showNew} onToggle={() => setShowNew(!showNew)} placeholder="Min 8 characters" />
                    <InputField label="Confirm New Password" value={confirmPass} onChange={setConfirmPass} show={false} placeholder="Repeat new password" />
                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-gradient-to-r from-[#cb2926] to-[#a71f1c] hover:from-[#a71f1c] hover:to-[#8b1916] text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transition-all disabled:opacity-60">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}{saving ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </Card>
            <Card title="Session Information" description="Your current session details.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div><p className="text-xs text-gray-400 font-medium">Last Login</p><p className="text-sm text-gray-700 font-semibold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <div><p className="text-xs text-gray-400 font-medium">Status</p><p className="text-sm text-emerald-600 font-semibold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Active</p></div>
                    </div>
                </div>
            </Card>
        </div>
    );
}

/* ── Notifications Tab ─────────────────────────────────────── */
function NotificationsTab({ showToast }) {
    const [prefs, setPrefs] = useState(() => {
        const defaults = { emailNewHost: true, emailNewProperty: true, emailNewEvent: false, emailWeeklyReport: true, pushNewSubmission: true, pushApproval: true, pushSystemAlerts: true };
        try { const s = localStorage.getItem('nkl-notif-prefs'); return s ? JSON.parse(s) : defaults; } catch { return defaults; }
    });
    const toggle = k => setPrefs(p => ({ ...p, [k]: !p[k] }));
    const handleSave = () => { localStorage.setItem('nkl-notif-prefs', JSON.stringify(prefs)); showToast('Preferences saved', 'success'); };

    const items = (list) => list.map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div><p className="text-sm font-semibold text-gray-800">{label}</p><p className="text-xs text-gray-400 mt-0.5">{desc}</p></div>
            <Toggle enabled={prefs[key]} onToggle={() => toggle(key)} />
        </div>
    ));

    return (
        <div className="space-y-6">
            <Card title="Email Notifications" description="Choose which emails you'd like to receive.">
                <div className="space-y-1">{items([
                    { key: 'emailNewHost', label: 'New Host Registration', desc: 'When a new host registers' },
                    { key: 'emailNewProperty', label: 'Property Submissions', desc: 'New properties pending review' },
                    { key: 'emailNewEvent', label: 'Event Submissions', desc: 'New event submissions' },
                    { key: 'emailWeeklyReport', label: 'Weekly Summary', desc: 'Weekly platform digest' },
                ])}</div>
            </Card>
            <Card title="Push Notifications" description="In-app notification preferences.">
                <div className="space-y-1">{items([
                    { key: 'pushNewSubmission', label: 'New Submissions', desc: 'In-app alerts for new content' },
                    { key: 'pushApproval', label: 'Approval Updates', desc: 'Items approved or rejected' },
                    { key: 'pushSystemAlerts', label: 'System Alerts', desc: 'Critical system notifications' },
                ])}</div>
            </Card>
            <div className="flex justify-end">
                <button onClick={handleSave} className="inline-flex items-center gap-2 bg-gradient-to-r from-[#cb2926] to-[#a71f1c] hover:from-[#a71f1c] hover:to-[#8b1916] text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transition-all"><Save className="w-4 h-4" />Save Preferences</button>
            </div>
        </div>
    );
}

/* ── General Tab ───────────────────────────────────────────── */
function GeneralTab({ showToast }) {
    const [timezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
    return (
        <div className="space-y-6">
            <Card title="Platform Information" description="General details about the platform.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { label: 'Platform Name', value: 'NextKinLife' },
                        { label: 'Version', value: '2.0.0' },
                        { label: 'API Endpoint', value: API_URL },
                        { label: 'Timezone', value: timezone },
                    ].map(i => (
                        <div key={i.label} className="bg-gray-50 rounded-xl px-5 py-4 border border-gray-100">
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{i.label}</p>
                            <p className="text-sm font-bold text-gray-900 mt-1 truncate">{i.value}</p>
                        </div>
                    ))}
                </div>
            </Card>
            <Card title="Danger Zone" description="Irreversible actions.">
                <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-4">
                    <div><p className="text-sm font-semibold text-red-800">Clear Local Data</p><p className="text-xs text-red-600/70 mt-0.5">Remove cached preferences</p></div>
                    <button onClick={() => { localStorage.removeItem('nkl-notif-prefs'); localStorage.removeItem('nkl-theme'); showToast('Local data cleared', 'info'); }} className="px-4 py-2 text-sm font-semibold text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-all">Clear Data</button>
                </div>
            </Card>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN SETTINGS PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function Settings() {
    const [activeTab, setActiveTab] = useState('profile');
    const [toast, setToast] = useState(null);
    const adminInfo = getAdminInfo();
    const role = getAdminRole() || 'admin';
    const showToast = (message, type = 'info') => setToast({ message, type });

    return (
        <div className="min-h-screen bg-gray-50">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#cb2926] to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20"><SettingsIcon className="w-5 h-5 text-white" /></div>
                    <div><h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h1><p className="text-gray-500 text-sm">Manage your account, security, and preferences</p></div>
                </div>
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-56 shrink-0">
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-2 lg:sticky lg:top-24">
                            {TABS.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mb-0.5 ${activeTab === tab.id ? 'bg-[#cb2926]/10 text-[#cb2926] font-semibold' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
                                    <tab.icon className={`w-[18px] h-[18px] ${activeTab === tab.id ? 'text-[#cb2926]' : ''}`} />{tab.label}
                                    {activeTab === tab.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        {activeTab === 'profile' && <ProfileTab adminInfo={adminInfo} role={role} showToast={showToast} />}
                        {activeTab === 'security' && <SecurityTab showToast={showToast} />}
                        {activeTab === 'notifications' && <NotificationsTab showToast={showToast} />}
                        {activeTab === 'general' && <GeneralTab showToast={showToast} />}
                    </div>
                </div>
            </div>
            <style>{`@keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`}</style>
        </div>
    );
}
