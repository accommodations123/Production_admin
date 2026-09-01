import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    MagnifyingGlassIcon, EyeIcon, EnvelopeIcon, CheckCircleIcon, XCircleIcon,
    UserGroupIcon, DocumentTextIcon, ArrowDownTrayIcon,
    XMarkIcon, PaperAirplaneIcon, ClockIcon as PendingIcon,
    ArrowRightIcon, CheckIcon, SparklesIcon, BriefcaseIcon,
    CalendarIcon, PhoneIcon, ArrowPathIcon, MapPinIcon, BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { formatUTCDate } from '../../utils/timezone';
import { supabase } from '../../lib/supabase';

const BASE_URL = import.meta.env.VITE_API_URL || "https://api.nextkinlife.live";
const api = axios.create({
    baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("admin-auth") || localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const getRelativeTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    
    const months = Math.floor(days / 30);
    if (months === 1) return '1 month ago';
    return `${months} months ago`;
};

// 4-Stage Canonical Recruitment Pipeline Flow
const RECRUITMENT_STAGES = [
    { key: 'submitted', label: 'Submitted', step: 1, desc: 'Application received & logged' },
    { key: 'reviewing', label: 'Reviewing', step: 2, desc: 'Profile & resume under review' },
    { key: 'interview', label: 'Interview', step: 3, desc: 'Interview round scheduled/active' },
    { key: 'offer', label: 'Offer', step: 4, desc: 'Job offer extended or hired' },
];

const normalizeStatus = (rawStatus) => {
    if (!rawStatus) return 'submitted';
    const s = String(rawStatus).toLowerCase().trim();
    if (s === 'submitted' || s === 'pending' || s === 'applied' || s === 'new') return 'submitted';
    if (s === 'reviewing' || s === 'viewed' || s === 'shortlisted' || s === 'under review') return 'reviewing';
    if (s === 'interview' || s === 'interviewed' || s === 'interviewing') return 'interview';
    if (s === 'offer' || s === 'offered' || s === 'hired' || s === 'accepted') return 'offer';
    if (s === 'rejected' || s === 'declined') return 'rejected';
    return 'submitted';
};

const getStageIndex = (status) => {
    const norm = normalizeStatus(status);
    if (norm === 'rejected') return -1;
    const idx = RECRUITMENT_STAGES.findIndex(st => st.key === norm);
    return idx >= 0 ? idx : 0;
};

/* =====================================================
   RECRUITMENT FLOW STEPPER COMPONENT
===================================================== */
const RecruitmentFlowStepper = ({ currentStatus, onStageSelect, isInteractive = false }) => {
    const norm = normalizeStatus(currentStatus);
    const isRejected = norm === 'rejected';
    const activeStageIdx = getStageIndex(currentStatus);

    return (
        <div className="w-full py-4 px-2 sm:px-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Recruitment Flow</span>
                    {isRejected ? (
                        <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full">Rejected</span>
                    ) : (
                        <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">
                            Step {activeStageIdx + 1} of 4: {RECRUITMENT_STAGES[activeStageIdx]?.label}
                        </span>
                    )}
                </div>
                {isInteractive && (
                    <span className="text-[11px] text-slate-400">Click any stage to update flow</span>
                )}
            </div>

            {/* Stepper Line & Nodes */}
            <div className="relative flex items-center justify-between">
                {/* Connecting Background Line */}
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />
                
                {/* Active Progress Line */}
                {!isRejected && (
                    <div
                        className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-blue-600 z-0 transition-all duration-500"
                        style={{ width: `${(activeStageIdx / (RECRUITMENT_STAGES.length - 1)) * 100}%` }}
                    />
                )}

                {/* Step Nodes */}
                {RECRUITMENT_STAGES.map((stage, idx) => {
                    const isPassed = !isRejected && idx < activeStageIdx;
                    const isCurrent = !isRejected && idx === activeStageIdx;
                    const isUpcoming = !isRejected && idx > activeStageIdx;

                    let circleClasses = "bg-white border-2 border-slate-300 text-slate-400";
                    let labelClasses = "text-slate-400 font-medium";

                    if (isCurrent) {
                        circleClasses = "bg-blue-600 border-2 border-blue-600 text-white shadow-md shadow-blue-200 ring-4 ring-blue-100";
                        labelClasses = "text-blue-700 font-bold";
                    } else if (isPassed) {
                        circleClasses = "bg-blue-600 border-2 border-blue-600 text-white";
                        labelClasses = "text-slate-700 font-semibold";
                    } else if (isRejected) {
                        circleClasses = "bg-slate-100 border-2 border-slate-300 text-slate-400 opacity-60";
                        labelClasses = "text-slate-400";
                    }

                    return (
                        <div
                            key={stage.key}
                            onClick={() => isInteractive && onStageSelect && onStageSelect(stage.key)}
                            className={`relative z-10 flex flex-col items-center group ${
                                isInteractive ? 'cursor-pointer' : ''
                            }`}
                        >
                            <div
                                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 transform ${
                                    isInteractive ? 'group-hover:scale-110' : ''
                                } ${circleClasses}`}
                            >
                                {isPassed ? (
                                    <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                                ) : isCurrent ? (
                                    <span className="animate-pulse">{stage.step}</span>
                                ) : (
                                    <span>{stage.step}</span>
                                )}
                            </div>
                            <span className={`mt-2 text-xs text-center whitespace-nowrap transition-colors ${labelClasses}`}>
                                {stage.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* =====================================================
   MAIN COMPONENT
===================================================== */
const ApplicationsTab = ({ searchTerm = '', setSearchTerm = () => {}, statusFilter = 'all', setStatusFilter = () => {} }) => {
    // State
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    // Modal States
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    // Email States
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [emailTemplate, setEmailTemplate] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);
    const [syncStatus, setSyncStatus] = useState(true);

    // Helper: Show Notification Toast
    const showNotification = (msg, type = "success") => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3500);
    };

    /* =====================================================
       HELPER: DATA FORMATTER
    ===================================================== */
    const formatApplicationData = (raw) => {
        const getNestedValue = (obj, path) => {
            return path.split('.').reduce((acc, part) => acc && acc[part], obj);
        };

        const candidateInfo = raw.candidate || raw.user || raw.applicant || {};
        const jobInfo = raw.jobs || raw.job || {};

        // Name Extraction
        let name = '';
        if (raw.name) name = raw.name;
        else if (raw.applicant_name) name = raw.applicant_name;
        else if (candidateInfo.name) name = candidateInfo.name;

        if (!name) {
            const firstName = raw.first_name || candidateInfo.first_name || getNestedValue(raw, 'profile.first_name') || getNestedValue(candidateInfo, 'profile.first_name') || '';
            const lastName = raw.last_name || candidateInfo.last_name || getNestedValue(raw, 'profile.last_name') || getNestedValue(candidateInfo, 'profile.last_name') || '';
            if (firstName || lastName) {
                name = `${firstName} ${lastName}`.trim();
            }
        }

        if (!name) {
            name = raw.full_name || candidateInfo.full_name ||
                raw.display_name || candidateInfo.display_name ||
                raw.username || candidateInfo.username || '';
        }

        if (!name) {
            const email = raw.email || candidateInfo.email || '';
            if (email) {
                name = email.split('@')[0];
            } else {
                name = `Applicant #${raw.id ? String(raw.id).slice(0, 6) : 'Unknown'}`;
            }
        }

        // Experience Extraction
        let experienceValue = null;
        const experienceFields = [
            'experience_years', 'years_of_experience', 'experience', 'total_experience', 'exp',
            'work_experience', 'work_history'
        ];

        for (const field of experienceFields) {
            if (raw[field] !== undefined && raw[field] !== null && raw[field] !== '') {
                if (field === 'experience' && Array.isArray(raw[field]) && raw[field].length === 0) continue;
                experienceValue = raw[field];
                break;
            }
            if (candidateInfo[field] !== undefined && candidateInfo[field] !== null && candidateInfo[field] !== '') {
                if (field === 'experience' && Array.isArray(candidateInfo[field]) && candidateInfo[field].length === 0) continue;
                experienceValue = candidateInfo[field];
                break;
            }
        }

        let displayExp = 'N/A';
        if (experienceValue !== null && experienceValue !== undefined && experienceValue !== '') {
            if (typeof experienceValue === 'number' || !isNaN(Number(experienceValue))) {
                const num = Number(experienceValue);
                displayExp = `${num} year${num !== 1 ? 's' : ''}`;
            } else if (typeof experienceValue === 'string') {
                displayExp = experienceValue.includes('year') ? experienceValue : `${experienceValue} years`;
            } else if (Array.isArray(experienceValue)) {
                displayExp = `${experienceValue.length} position${experienceValue.length !== 1 ? 's' : ''}`;
            }
        }

        // Contact info
        const email = raw.email || candidateInfo.email || getNestedValue(raw, 'contact.email') || getNestedValue(candidateInfo, 'contact.email') || 'N/A';
        const phone = raw.phone || candidateInfo.phone || getNestedValue(raw, 'contact.phone') || getNestedValue(candidateInfo, 'contact.phone') || 'N/A';

        // Job Title & Metadata
        let jobTitle = '';
        if (typeof jobInfo === 'object') {
            jobTitle = jobInfo.title || jobInfo.name || jobInfo.position || '';
        }
        if (!jobTitle) {
            jobTitle = raw.job_title || raw.job || raw.position || raw.role || '';
        }

        const FALLBACK_JOB_TITLES = {
            "2b3e71fa-4565-4067-8ac4-cffd8a59b627": "Senior Java Backend Developer",
            "3eb26e3c-7af7-457f-ab4f-bfbb1a435e9e": "Full Stack Developer",
            "e258fecb-d11c-43ac-b0a5-8423280106cb": "Backend Developer",
            "4b2f4ecf-1816-44af-9606-03196c7c4f9e": "Full Stack Developer"
        };

        if (!jobTitle) {
            jobTitle = FALLBACK_JOB_TITLES[raw.job_id] || 'Backend Developer';
        }

        const company = jobInfo.company || raw.company || 'NextKinLife LLC';
        const location = jobInfo.location || raw.location || 'India';
        const employmentType = jobInfo.employment_type || jobInfo.position_type || raw.employment_type || 'W2';

        // Resume URL
        let resume = raw.resume_url || raw.resume || raw.cv || raw.cv_url || '';
        const S3_BASE = "https://prod-nextkinlife-backend-imagestoring.s3.us-east-2.amazonaws.com";
        const CLOUDFRONT_BASE = "https://d3dqp3l6ug81j3.cloudfront.net";
        if (resume && resume.includes(S3_BASE)) {
            resume = resume.replace(S3_BASE, CLOUDFRONT_BASE);
        }

        const applied = raw.createdAt || raw.created_at || raw.application_date || raw.date_applied || new Date().toISOString();
        const normalized = normalizeStatus(raw.status);

        return {
            ...raw,
            status: normalized,
            rawStatus: raw.status || 'submitted',
            name: name,
            email: email,
            jobTitle: jobTitle,
            company: company,
            location: location,
            employmentType: employmentType,
            resume: resume,
            applied: applied,
            experience: displayExp,
            score: raw.score || 0,
            phone: phone,
            source: raw.source || 'NextKinLife Portal'
        };
    };

    /* =====================================================
       FETCH APPLICATIONS (SUPABASE + BACKEND API SYNC)
    ===================================================== */
    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError(null);
            let combinedApps = [];
            const seenIds = new Set();

            // 1. Fetch from Supabase with joined jobs table
            if (supabase) {
                try {
                    const { data: supaApps, error: supaErr } = await supabase
                        .from('job_applications')
                        .select('*, jobs:job_id(title, company, location, employment_type)')
                        .order('created_at', { ascending: false });

                    if (!supaErr && Array.isArray(supaApps)) {
                        supaApps.forEach(item => {
                            if (item.id && !seenIds.has(item.id)) {
                                seenIds.add(item.id);
                                combinedApps.push(item);
                            }
                        });
                    }
                } catch (supaErr) {
                    console.warn("Supabase applications fetch note:", supaErr.message);
                }
            }

            // 2. Fetch from Backend API as well
            try {
                const endpoints = [
                    "/career/admin/applications?t=" + new Date().getTime(),
                    "https://api.nextkinlife.live/career/admin/applications?t=" + new Date().getTime()
                ];

                for (const ep of endpoints) {
                    try {
                        const res = await api.get(ep);
                        let apiList = [];
                        if (res.data?.applications && Array.isArray(res.data.applications)) {
                            apiList = res.data.applications;
                        } else if (Array.isArray(res.data)) {
                            apiList = res.data;
                        } else if (res.data?.data && Array.isArray(res.data.data)) {
                            apiList = res.data.data;
                        }

                        if (apiList.length > 0) {
                            apiList.forEach(item => {
                                const id = item.id || `${item.email}-${item.job_id}`;
                                if (!seenIds.has(id)) {
                                    seenIds.add(id);
                                    combinedApps.push(item);
                                }
                            });
                            break;
                        }
                    } catch (e) {
                        // ignore secondary endpoint attempt error
                    }
                }
            } catch (apiErr) {
                console.warn("API career applications fetch note:", apiErr.message);
            }

            const formattedData = combinedApps.map(formatApplicationData);
            setApplications(formattedData);

        } catch (err) {
            console.error("Error fetching applications:", err);
            setError("Failed to load applications. Please check connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();

        let channel = null;
        if (supabase) {
            channel = supabase
                .channel('admin_job_applications_flow')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'job_applications' }, () => {
                    fetchApplications();
                })
                .subscribe();
        }

        return () => {
            if (channel && supabase) {
                supabase.removeChannel(channel);
            }
        };
    }, []);

    /* =====================================================
       FETCH SINGLE APPLICATION DETAILS
    ===================================================== */
    const fetchApplicationDetails = async (id) => {
        setModalLoading(true);
        setShowApplicationModal(true);
        setSelectedApplication(null);

        try {
            if (supabase) {
                const { data, error: supaErr } = await supabase
                    .from('job_applications')
                    .select('*, jobs:job_id(title, company, location, employment_type)')
                    .eq('id', id)
                    .single();

                if (data && !supaErr) {
                    setSelectedApplication(formatApplicationData(data));
                    return;
                }
            }

            const found = applications.find(a => a.id === id);
            if (found) {
                setSelectedApplication(found);
            } else {
                throw new Error("Application not found");
            }
        } catch (err) {
            console.error("Error fetching details:", err);
            const found = applications.find(a => a.id === id);
            if (found) {
                setSelectedApplication(found);
            } else {
                showNotification("Failed to load application details", "error");
                setShowApplicationModal(false);
            }
        } finally {
            setModalLoading(false);
        }
    };

    /* =====================================================
       UPDATE STATUS / STAGE
    ===================================================== */
    const updateStatus = async (appId, newStatus) => {
        const normalized = normalizeStatus(newStatus);
        const currentApp = applications.find(app => app.id === appId);
        if (currentApp && currentApp.status === normalized) {
            showNotification(`Application is already in "${normalized.toUpperCase()}" stage`, "info");
            return;
        }

        setUpdatingId(appId);
        const originalApps = [...applications];

        // Optimistic UI update
        setApplications(prev => prev.map(app =>
            app.id === appId ? { ...app, status: normalized } : app
        ));

        if (selectedApplication && selectedApplication.id === appId) {
            setSelectedApplication(prev => ({ ...prev, status: normalized }));
        }

        try {
            // 1. Try Supabase update
            if (supabase) {
                const { error: supaErr } = await supabase
                    .from('job_applications')
                    .update({
                        status: normalized,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', appId);

                if (supaErr) {
                    console.warn("Supabase update error:", supaErr.message);
                }
            }

            // 2. Try Backend API update
            try {
                await api.patch(`/career/admin/applications/${appId}/status`, { status: normalized });
            } catch (apiErr) {
                try {
                    await api.put(`/career/applications/${appId}`, { status: normalized });
                } catch (e2) {
                    // Supabase handled it
                }
            }

            const stageName = RECRUITMENT_STAGES.find(s => s.key === normalized)?.label || normalized.toUpperCase();
            showNotification(`Application advanced to "${stageName}" stage`);

        } catch (err) {
            console.error("Status update failed:", err);
            setApplications(originalApps);
            if (selectedApplication && selectedApplication.id === appId) {
                setSelectedApplication(originalApps.find(a => a.id === appId));
            }
            showNotification(err.message || "Failed to update status", "error");
        } finally {
            setUpdatingId(null);
        }
    };

    /* =====================================================
       EXPORT CSV
    ===================================================== */
    const handleExportCSV = () => {
        if (applications.length === 0) {
            showNotification("No data to export", "error");
            return;
        }
        const headers = ["Name", "Email", "Job Title", "Company", "Stage", "Experience", "Applied Date"];
        const csvRows = [];
        csvRows.push(headers.join(","));
        applications.forEach(app => {
            const row = [
                `"${(app.name || '').replace(/"/g, '""')}"`,
                `"${app.email || ''}"`,
                `"${app.jobTitle || ''}"`,
                `"${app.company || 'NextKinLife LLC'}"`,
                `"${app.status.toUpperCase()}"`,
                app.experience || 'N/A',
                formatUTCDate(app.applied)
            ];
            csvRows.push(row.join(","));
        });
        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'career_applications.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showNotification("CSV downloaded successfully");
    };

    /* =====================================================
       SEND EMAIL
    ===================================================== */
    const handleSendEmail = async () => {
        if (!emailSubject || !emailBody) {
            showNotification("Please fill in subject and body", "error");
            return;
        }

        setSendingEmail(true);
        try {
            const applicationId = selectedApplication.id;
            const endpoint = `/career/applications/${applicationId}/notify`;

            let statusToUpdate = null;
            if (syncStatus) {
                if (emailTemplate === 'Offer Extension') statusToUpdate = 'offer';
                else if (emailTemplate === 'Interview Scheduled') statusToUpdate = 'interview';
                else if (emailTemplate === 'Rejection Letter') statusToUpdate = 'rejected';
                else if (emailTemplate === 'General Update') statusToUpdate = 'reviewing';
            }

            const payload = {
                subject: emailSubject,
                message: emailBody,
                template: emailTemplate,
                status: statusToUpdate
            };

            await api.post(endpoint, payload);

            if (statusToUpdate) {
                await updateStatus(applicationId, statusToUpdate);
            }

            showNotification("Email sent successfully!");
            setShowEmailModal(false);
            setEmailSubject('');
            setEmailBody('');
            setEmailTemplate('');
        } catch (err) {
            console.error("Email sending failed:", err.response?.data || err);
            const serverMsg = err.response?.data?.message || "Failed to send email";
            showNotification(serverMsg, "error");
        } finally {
            setSendingEmail(false);
        }
    };

    /* =====================================================
       EMAIL TEMPLATE HANDLER
    ===================================================== */
    const handleTemplateChange = (e) => {
        const selectedTemplate = e.target.value;
        setEmailTemplate(selectedTemplate);

        const candidateName = selectedApplication?.name || 'Candidate';
        const jobTitle = selectedApplication?.jobTitle || 'Role';

        switch (selectedTemplate) {
            case 'Offer Extension':
                setEmailSubject(`Offer Extension - NextKinLife LLC`);
                setEmailBody(`Dear ${candidateName},\n\nCongratulations! We are pleased to extend an offer to you for the ${jobTitle} position at NextKinLife LLC.\n\nBest regards,\nThe Hiring Team`);
                break;
            case 'Interview Scheduled':
                setEmailSubject(`Interview Scheduled - NextKinLife LLC`);
                setEmailBody(`Dear ${candidateName},\n\nWe would like to schedule an interview with you for the ${jobTitle} position at NextKinLife LLC. Please let us know your availability.\n\nBest regards,\nThe Hiring Team`);
                break;
            case 'Rejection Letter':
                setEmailSubject(`Update regarding your application for ${jobTitle} - NextKinLife LLC`);
                setEmailBody(`Dear ${candidateName},\n\nThank you for your interest in the ${jobTitle} position at NextKinLife LLC.\n\nAfter careful consideration, we regret to inform you that we are not proceeding with your application at this time.\n\nBest regards,\nThe Hiring Team`);
                break;
            case 'General Update':
                setEmailSubject(`Update on your application - NextKinLife LLC`);
                setEmailBody(`Dear ${candidateName},\n\nWe wanted to provide a quick update regarding your application for the ${jobTitle} position at NextKinLife LLC.\n\nBest regards,\nThe Hiring Team`);
                break;
            default:
                break;
        }
    };

    const getStatusBadge = (status) => {
        const norm = normalizeStatus(status);
        switch (norm) {
            case 'submitted':
                return <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200"><PendingIcon className="h-3.5 w-3.5 mr-1" /> SUBMITTED</span>;
            case 'reviewing':
                return <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200"><PendingIcon className="h-3.5 w-3.5 mr-1" /> REVIEWING</span>;
            case 'interview':
                return <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200"><CalendarIcon className="h-3.5 w-3.5 mr-1" /> INTERVIEW</span>;
            case 'offer':
                return <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircleIcon className="h-3.5 w-3.5 mr-1" /> OFFER</span>;
            case 'rejected':
                return <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full bg-red-50 text-red-700 border border-red-200"><XCircleIcon className="h-3.5 w-3.5 mr-1" /> REJECTED</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full bg-gray-50 text-gray-700 border border-gray-200">{status}</span>;
        }
    };

    // Filter applications
    const filteredApplications = applications.filter(app => {
        const searchLower = searchTerm.toLowerCase();
        const name = (app.name || '').toLowerCase();
        const jobTitle = (app.jobTitle || '').toLowerCase();
        const email = (app.email || '').toLowerCase();

        const matchesSearch = name.includes(searchLower) || jobTitle.includes(searchLower) || email.includes(searchLower);
        const matchesStatus = statusFilter === 'all' || normalizeStatus(app.status) === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Counts for Stage Cards
    const counts = {
        all: applications.length,
        submitted: applications.filter(a => normalizeStatus(a.status) === 'submitted').length,
        reviewing: applications.filter(a => normalizeStatus(a.status) === 'reviewing').length,
        interview: applications.filter(a => normalizeStatus(a.status) === 'interview').length,
        offer: applications.filter(a => normalizeStatus(a.status) === 'offer').length,
        rejected: applications.filter(a => normalizeStatus(a.status) === 'rejected').length,
    };

    return (
        <div className="relative">
            {/* Toast Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl text-white font-medium flex items-center gap-2 animate-bounce ${
                    notification.type === 'error' ? 'bg-red-600' : (notification.type === 'info' ? 'bg-blue-600' : 'bg-emerald-600')
                }`}>
                    {notification.type === 'error' ? <XCircleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                    {notification.msg}
                </div>
            )}

            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <span>Recruitment & Applications Flow</span>
                        <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                            {applications.length} Total
                        </span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Track candidate flow across stages: <span className="font-semibold text-blue-600">Submitted</span> ➔ <span className="font-semibold text-purple-600">Reviewing</span> ➔ <span className="font-semibold text-amber-600">Interview</span> ➔ <span className="font-semibold text-emerald-600">Offer</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchApplications}
                        className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
                        title="Refresh applications"
                    >
                        <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Stage / Pipeline Summary Cards (Interactive Filters) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {[
                    { key: 'all', label: 'All Candidates', count: counts.all, color: 'border-slate-300 text-slate-800' },
                    { key: 'submitted', label: '1. Submitted', count: counts.submitted, color: 'border-blue-400 text-blue-700' },
                    { key: 'reviewing', label: '2. Reviewing', count: counts.reviewing, color: 'border-purple-400 text-purple-700' },
                    { key: 'interview', label: '3. Interview', count: counts.interview, color: 'border-amber-400 text-amber-700' },
                    { key: 'offer', label: '4. Offer', count: counts.offer, color: 'border-emerald-400 text-emerald-700' },
                    { key: 'rejected', label: 'Rejected', count: counts.rejected, color: 'border-red-300 text-red-600' },
                ].map(item => (
                    <button
                        key={item.key}
                        onClick={() => setStatusFilter(item.key)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                            statusFilter === item.key
                                ? 'bg-white ring-2 ring-blue-500 shadow-md transform -translate-y-0.5'
                                : 'bg-slate-50/70 hover:bg-white hover:shadow-sm'
                        } ${item.color}`}
                    >
                        <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                        <p className="text-2xl font-black mt-1 text-slate-900">{item.count}</p>
                    </button>
                ))}
            </div>

            {/* Search & Filter Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by candidate name, role, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-auto"
                    >
                        <option value="all">All Stages</option>
                        <option value="submitted">1. Submitted</option>
                        <option value="reviewing">2. Reviewing</option>
                        <option value="interview">3. Interview</option>
                        <option value="offer">4. Offer / Hired</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Candidate</th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider hidden lg:table-cell">Job Applied</th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Recruitment Stage</th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Experience</th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider hidden md:table-cell">Applied</th>
                                <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Quick Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
                                            <p className="text-sm font-medium">Loading applications & pipeline...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-red-500">
                                        <p className="font-semibold">{error}</p>
                                        <button onClick={fetchApplications} className="mt-3 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold">Retry</button>
                                    </td>
                                </tr>
                            ) : filteredApplications.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                        <div className="max-w-sm mx-auto">
                                            <BriefcaseIcon className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                                            <p className="font-semibold text-slate-700">No applications found</p>
                                            <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or status filter.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredApplications.map((app) => {
                                    const currentNorm = normalizeStatus(app.status);
                                    return (
                                        <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* Candidate Name & Initials */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                                                        {app.name ? app.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'N'}
                                                    </div>
                                                    <div className="ml-3 min-w-0 flex-1">
                                                        <div className="text-sm font-bold text-gray-900 truncate flex items-center gap-1.5">
                                                            <span>{app.name}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate">{app.email}</div>
                                                        <div className="text-xs text-blue-600 font-medium lg:hidden mt-0.5">{app.jobTitle}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Job Applied */}
                                            <td className="px-5 py-4 whitespace-nowrap hidden lg:table-cell">
                                                <div className="text-sm font-semibold text-gray-900 truncate">{app.jobTitle}</div>
                                                <div className="text-xs text-gray-500">{app.company || 'NextKinLife LLC'} • {app.location || 'India'} • {app.employmentType || 'W2'}</div>
                                            </td>

                                            {/* Recruitment Stage & Stepper Mini */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="space-y-1.5">
                                                    <div>{getStatusBadge(app.status)}</div>
                                                    {/* Mini 4-dot Stage Flow Indicator */}
                                                    {currentNorm !== 'rejected' && (
                                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                                            {RECRUITMENT_STAGES.map((st, i) => {
                                                                const activeIdx = getStageIndex(app.status);
                                                                const isPassed = i <= activeIdx;
                                                                return (
                                                                    <div key={st.key} className="flex items-center gap-1">
                                                                        <span
                                                                            title={st.label}
                                                                            className={`w-2 h-2 rounded-full ${
                                                                                isPassed ? 'bg-blue-600 ring-2 ring-blue-100' : 'bg-slate-200'
                                                                            }`}
                                                                        />
                                                                        {i < RECRUITMENT_STAGES.length - 1 && (
                                                                            <span className={`w-3 h-0.5 ${isPassed && i < activeIdx ? 'bg-blue-600' : 'bg-slate-200'}`} />
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Experience */}
                                            <td className="px-5 py-4 whitespace-nowrap hidden sm:table-cell">
                                                <p className="text-sm font-medium text-gray-700">{app.experience}</p>
                                            </td>

                                            {/* Applied Date */}
                                            <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                                                <div>{formatUTCDate(app.applied)}</div>
                                                <div className="text-[11px] text-slate-400">{getRelativeTime(app.applied)}</div>
                                            </td>

                                            {/* Quick Actions & Flow Dropdown */}
                                            <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {/* Quick Advance Button */}
                                                    {currentNorm === 'submitted' && (
                                                        <button
                                                            disabled={updatingId === app.id}
                                                            onClick={() => updateStatus(app.id, 'reviewing')}
                                                            className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                                                            title="Advance to Reviewing stage"
                                                        >
                                                            <span>Review</span>
                                                            <ArrowRightIcon className="w-3 h-3 ml-1" />
                                                        </button>
                                                    )}
                                                    {currentNorm === 'reviewing' && (
                                                        <button
                                                            disabled={updatingId === app.id}
                                                            onClick={() => updateStatus(app.id, 'interview')}
                                                            className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                                                            title="Schedule Interview"
                                                        >
                                                            <span>Interview</span>
                                                            <ArrowRightIcon className="w-3 h-3 ml-1" />
                                                        </button>
                                                    )}
                                                    {currentNorm === 'interview' && (
                                                        <button
                                                            disabled={updatingId === app.id}
                                                            onClick={() => updateStatus(app.id, 'offer')}
                                                            className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                                            title="Extend Offer"
                                                        >
                                                            <span>Offer</span>
                                                            <ArrowRightIcon className="w-3 h-3 ml-1" />
                                                        </button>
                                                    )}

                                                    {/* View Details Modal Button */}
                                                    <button
                                                        onClick={() => fetchApplicationDetails(app.id)}
                                                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View full application details & flow"
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </button>

                                                    {/* Email Modal Button */}
                                                    <button
                                                        onClick={() => { setSelectedApplication(app); setShowEmailModal(true); }}
                                                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title="Send email notification"
                                                    >
                                                        <EnvelopeIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* =====================================================
                APPLICATION DETAILS & FLOW MODAL
            ===================================================== */}
            {showApplicationModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-100">
                        {modalLoading ? (
                            <div className="h-72 flex flex-col items-center justify-center text-slate-500">
                                <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
                                <p className="text-sm font-medium">Loading application flow & details...</p>
                            </div>
                        ) : selectedApplication && (
                            <>
                                {/* Modal Header with Branding */}
                                <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-white font-bold text-lg border border-white/20">
                                            {selectedApplication.name ? selectedApplication.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'N'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-bold text-white leading-snug">
                                                    {selectedApplication.jobTitle}
                                                </h3>
                                            </div>
                                            <p className="text-xs text-blue-200 mt-0.5">
                                                {selectedApplication.company || 'NextKinLife LLC'} • {selectedApplication.location || 'India'} • {selectedApplication.employmentType || 'W2'} • Applied on {formatUTCDate(selectedApplication.applied)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowApplicationModal(false)}
                                        className="text-slate-300 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="px-6 py-5 overflow-y-auto space-y-6 flex-1">
                                    {/* 1. RECRUITMENT FLOW TRACKER (MATCHES USER PORTAL FLOW) */}
                                    <div>
                                        <RecruitmentFlowStepper
                                            currentStatus={selectedApplication.status}
                                            onStageSelect={(newStage) => updateStatus(selectedApplication.id, newStage)}
                                            isInteractive={true}
                                        />
                                    </div>

                                    {/* 2. CANDIDATE PROFILE */}
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                                            <UserGroupIcon className="h-4 w-4 text-blue-600" /> Candidate Profile
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium">Full Name</p>
                                                <p className="text-sm font-bold text-slate-800">{selectedApplication.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium">Email</p>
                                                <p className="text-sm font-medium text-slate-800 break-all">{selectedApplication.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium">Phone</p>
                                                <p className="text-sm font-medium text-slate-800">{selectedApplication.phone || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium">Experience</p>
                                                <p className="text-sm font-bold text-slate-800">{selectedApplication.experience}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium">Application Source</p>
                                                <p className="text-sm font-medium text-slate-800">{selectedApplication.source || 'NextKinLife Portal'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium">Applied Date</p>
                                                <p className="text-sm font-medium text-slate-800">{formatUTCDate(selectedApplication.applied)} ({getRelativeTime(selectedApplication.applied)})</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. RESUME ATTACHMENT */}
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg">
                                                <DocumentTextIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">Candidate Resume</p>
                                                <p className="text-xs text-slate-500">
                                                    {selectedApplication.resume ? 'Resume uploaded and verified' : 'No resume file attached'}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedApplication.resume ? (
                                            <a
                                                href={selectedApplication.resume}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                                            >
                                                <ArrowDownTrayIcon className="w-4 h-4" /> Download Resume
                                            </a>
                                        ) : (
                                            <span className="text-xs text-slate-400 font-medium">Not available</span>
                                        )}
                                    </div>

                                    {/* 4. COVER LETTER OR NOTES */}
                                    {selectedApplication.cover_letter && (
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Cover Letter</h4>
                                            <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{selectedApplication.cover_letter}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Modal Footer with Direct Stage Transitions */}
                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-bold text-slate-600">Change Stage:</label>
                                        <select
                                            value={normalizeStatus(selectedApplication.status)}
                                            onChange={(e) => updateStatus(selectedApplication.id, e.target.value)}
                                            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        >
                                            <option value="submitted">1. Submitted</option>
                                            <option value="reviewing">2. Reviewing</option>
                                            <option value="interview">3. Interview</option>
                                            <option value="offer">4. Offer / Hired</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                        <button
                                            onClick={() => {
                                                setShowApplicationModal(false);
                                                setShowEmailModal(true);
                                            }}
                                            className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-indigo-200"
                                        >
                                            <EnvelopeIcon className="w-4 h-4" /> Email Candidate
                                        </button>
                                        {normalizeStatus(selectedApplication.status) !== 'rejected' ? (
                                            <button
                                                onClick={() => updateStatus(selectedApplication.id, 'rejected')}
                                                className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors border border-red-200"
                                            >
                                                Reject Application
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => updateStatus(selectedApplication.id, 'submitted')}
                                                className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Restore to Submitted
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* =====================================================
                EMAIL NOTIFICATION MODAL
            ===================================================== */}
            {showEmailModal && selectedApplication && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-100">
                        <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                                <EnvelopeIcon className="w-6 h-6" />
                                <div>
                                    <h3 className="text-lg font-bold text-white">Send Flow Notification Email</h3>
                                    <p className="text-xs text-blue-100">To: {selectedApplication.name} ({selectedApplication.email})</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="px-6 py-5 overflow-y-auto space-y-4 flex-1">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Quick Flow Template
                                </label>
                                <select
                                    value={emailTemplate}
                                    onChange={handleTemplateChange}
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="">Select a pre-filled template</option>
                                    <option value="General Update">Reviewing - General Status Update</option>
                                    <option value="Interview Scheduled">Interview - Interview Invitation</option>
                                    <option value="Offer Extension">Offer - Job Offer Extension</option>
                                    <option value="Rejection Letter">Rejected - Formal Rejection Notice</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Email Subject
                                </label>
                                <input
                                    type="text"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    placeholder="Enter subject line..."
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center space-x-2 py-1">
                                <input
                                    type="checkbox"
                                    id="syncStatusChange"
                                    checked={syncStatus}
                                    onChange={(e) => setSyncStatus(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="syncStatusChange" className="text-xs text-slate-700 font-semibold cursor-pointer select-none">
                                    Automatically update applicant flow stage to match email template
                                </label>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Message Body
                                </label>
                                <textarea
                                    rows={8}
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-sans"
                                    placeholder="Write your email message here..."
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 text-xs font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendEmail}
                                disabled={sendingEmail}
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
                            >
                                {sendingEmail ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <PaperAirplaneIcon className="h-4 w-4" /> Send Email & Advance Flow
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicationsTab;