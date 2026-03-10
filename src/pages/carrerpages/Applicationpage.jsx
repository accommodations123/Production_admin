import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    MagnifyingGlassIcon, EyeIcon, EnvelopeIcon, CheckCircleIcon, XCircleIcon,
    UserGroupIcon, DocumentTextIcon, ArrowDownTrayIcon,
    XMarkIcon, PaperAirplaneIcon, ClockIcon as PendingIcon
} from '@heroicons/react/24/outline';

/* =====================================================
   AXIOS INSTANCE & BASE URL CONFIGURATION
===================================================== */
const api = axios.create({
    baseURL: "https://api.nextkinlife.live",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("admin-auth");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/* =====================================================
   COMPONENT
===================================================== */
const ApplicationsTab = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => {
    // State
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

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

    // Helper: Show Notification Toast
    const showNotification = (msg, type = "success") => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    /* =====================================================
       HELPER: DATA FORMATTER (IMPROVED EXPERIENCE EXTRACTION)
    ===================================================== */
    const formatApplicationData = (raw) => {
        // Log the raw data for debugging
        console.log("Raw application data:", raw);

        // Helper function to safely get nested properties
        const getNestedValue = (obj, path) => {
            return path.split('.').reduce((acc, part) => acc && acc[part], obj);
        };

        // 1. Extract candidate information from various possible locations
        const candidateInfo = raw.candidate || raw.user || raw.applicant || {};

        // 2. Name Extraction with more comprehensive checks
        let name = '';

        // Try direct name field
        if (raw.name) name = raw.name;
        else if (candidateInfo.name) name = candidateInfo.name;

        // Try first_name + last_name combination
        if (!name) {
            const firstName = raw.first_name || candidateInfo.first_name || getNestedValue(raw, 'profile.first_name') || getNestedValue(candidateInfo, 'profile.first_name') || '';
            const lastName = raw.last_name || candidateInfo.last_name || getNestedValue(raw, 'profile.last_name') || getNestedValue(candidateInfo, 'profile.last_name') || '';

            if (firstName || lastName) {
                name = `${firstName} ${lastName}`.trim();
            }
        }

        // Try other possible name fields
        if (!name) {
            name = raw.full_name || candidateInfo.full_name ||
                raw.display_name || candidateInfo.display_name ||
                raw.username || candidateInfo.username || '';
        }

        // If still no name, use a generic but informative placeholder
        if (!name) {
            const email = raw.email || candidateInfo.email || '';
            if (email) {
                name = email.split('@')[0]; // Use email username as fallback
            } else {
                name = `Applicant #${raw.id || 'Unknown'}`;
            }
        }

        // 3. Experience Extraction with improved parsing
        let experienceValue = null;

        // Check various possible experience fields
        const experienceFields = [
            'experience', 'total_experience', 'exp', 'experience_years',
            'work_experience', 'years_of_experience', 'work_history'
        ];

        for (const field of experienceFields) {
            if (raw[field] !== undefined && raw[field] !== null) {
                experienceValue = raw[field];
                break;
            }
            if (candidateInfo[field] !== undefined && candidateInfo[field] !== null) {
                experienceValue = candidateInfo[field];
                break;
            }
        }

        // Check nested objects
        if (experienceValue === null) {
            const nestedPaths = [
                'profile.experience', 'profile.total_experience',
                'details.experience', 'details.work_experience'
            ];

            for (const path of nestedPaths) {
                const value = getNestedValue(raw, path) || getNestedValue(candidateInfo, path);
                if (value !== undefined && value !== null) {
                    experienceValue = value;
                    break;
                }
            }
        }

        // Format the experience value to always show "X years" format
        let displayExp = 'N/A';

        if (experienceValue !== null && experienceValue !== undefined && experienceValue !== '') {
            // If it's an array (like work_history), try to extract years or count positions
            if (Array.isArray(experienceValue)) {
                if (experienceValue.length > 0) {
                    // Try to calculate total years from work history
                    let totalYears = 0;
                    let hasValidYears = false;

                    for (const job of experienceValue) {
                        if (job.years || job.duration || job.experience_years) {
                            const years = parseFloat(job.years || job.duration || job.experience_years);
                            if (!isNaN(years)) {
                                totalYears += years;
                                hasValidYears = true;
                            }
                        }
                    }

                    if (hasValidYears) {
                        displayExp = `${totalYears} year${totalYears !== 1 ? 's' : ''}`;
                    } else {
                        displayExp = `${experienceValue.length} Position${experienceValue.length !== 1 ? 's' : ''}`;
                    }
                } else {
                    displayExp = '0 years';
                }
            }
            // If it's a nested object (like { years: 5 } or { total: 2 })
            else if (typeof experienceValue === 'object') {
                // Try to extract numeric value from common keys
                const numericValue = experienceValue.years || experienceValue.total ||
                    experienceValue.duration || experienceValue.value ||
                    experienceValue.experience_years || experienceValue.work_experience;

                if (numericValue !== undefined && numericValue !== null) {
                    const years = parseFloat(numericValue);
                    if (!isNaN(years)) {
                        displayExp = `${years} year${years !== 1 ? 's' : ''}`;
                    } else {
                        displayExp = 'N/A';
                    }
                } else {
                    // If we can't find a numeric value, try to parse stringified object
                    const objString = JSON.stringify(experienceValue);
                    const yearMatch = objString.match(/(\d+(?:\.\d+)?)\s*year/i);
                    if (yearMatch) {
                        const years = parseFloat(yearMatch[1]);
                        displayExp = `${years} year${years !== 1 ? 's' : ''}`;
                    } else {
                        displayExp = 'N/A';
                    }
                }
            }
            // If it's a string or number
            else {
                const expString = String(experienceValue).trim();

                // Extract numeric value from the string
                const yearMatches = expString.match(/(\d+(?:\.\d+)?)\s*(?:year|years|yr|yrs)/i);
                if (yearMatches) {
                    const years = parseFloat(yearMatches[1]);
                    displayExp = `${years} year${years !== 1 ? 's' : ''}`;
                } else {
                    // Try to extract any number from the string
                    const numberMatch = expString.match(/(\d+(?:\.\d+)?)/);
                    if (numberMatch) {
                        const years = parseFloat(numberMatch[1]);
                        // Only assume it's years if it's a reasonable number (0-50)
                        if (years >= 0 && years <= 50) {
                            displayExp = `${years} year${years !== 1 ? 's' : ''}`;
                        } else {
                            displayExp = 'N/A';
                        }
                    } else {
                        // If no number found, check if it's a pure number
                        const years = parseFloat(expString);
                        if (!isNaN(years) && years >= 0 && years <= 50) {
                            displayExp = `${years} year${years !== 1 ? 's' : ''}`;
                        } else {
                            displayExp = 'N/A';
                        }
                    }
                }
            }
        }

        // 4. Extract other fields with fallbacks
        const email = raw.email || candidateInfo.email || getNestedValue(raw, 'contact.email') || getNestedValue(candidateInfo, 'contact.email') || 'N/A';
        const phone = raw.phone || candidateInfo.phone || getNestedValue(raw, 'contact.phone') || getNestedValue(candidateInfo, 'contact.phone') || 'N/A';

        // 5. Job title extraction
        let jobTitle = '';
        if (raw.job && typeof raw.job === 'object') {
            jobTitle = raw.job.title || raw.job.name || raw.job.position || '';
        } else {
            jobTitle = raw.job_title || raw.job || raw.position || raw.role || '';
        }

        if (!jobTitle && raw.job_id) {
            jobTitle = `Job ID: ${raw.job_id}`;
        }

        // 6. Resume URL
        const resume = raw.resume_url || raw.resume || raw.cv || raw.cv_url || '';

        // 7. Applied date
        const applied = raw.createdAt || raw.created_at || raw.application_date || raw.date_applied || new Date().toISOString();

        return {
            ...raw,
            name: name,
            email: email,
            jobTitle: jobTitle || 'N/A',
            resume: resume,
            applied: applied,
            experience: displayExp,
            score: raw.score || 0,
            phone: phone,
            source: raw.source || 'Direct'
        };
    };

    /* =====================================================
       FETCH APPLICATIONS (GET ALL)
    ===================================================== */
    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setLoading(true);
                // Adding a timestamp to prevent 304 caching issues if the data changes frequently
                const endpoint = "/carrer/admin/applications?t=" + new Date().getTime();
                const res = await api.get(endpoint);

                let rawData = [];
                if (res.data.applications && Array.isArray(res.data.applications)) {
                    rawData = res.data.applications;
                } else if (Array.isArray(res.data)) {
                    rawData = res.data;
                } else if (res.data.data && Array.isArray(res.data.data)) {
                    rawData = res.data.data;
                } else {
                    console.warn("Unexpected API response structure:", res.data);
                    rawData = [];
                }

                const formattedData = rawData.map(formatApplicationData);
                setApplications(formattedData);

            } catch (err) {
                console.error("Error fetching applications:", err);
                if (err.message === "Network Error") {
                    setError("Network Error: Please check CORS or Backend URL");
                    showNotification("Network Error", "error");
                } else {
                    setError(err.response?.data?.message || err.message);
                    showNotification("Failed to load data", "error");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    /* =====================================================
       FETCH SINGLE APPLICATION DETAILS
    ===================================================== */
    const fetchApplicationDetails = async (id) => {
        setModalLoading(true);
        setShowApplicationModal(true);
        setSelectedApplication(null);

        try {
            const endpoint = "/carrer/admin/applications/" + id;
            const res = await api.get(endpoint);

            const rawData = res.data.application || res.data.data || res.data;

            if (!rawData) {
                throw new Error("Application data not found in response");
            }

            const formattedData = formatApplicationData(rawData);
            setSelectedApplication(formattedData);

        } catch (err) {
            console.error("Error fetching details:", err);
            showNotification("Failed to load application details", "error");
            setShowApplicationModal(false);
        } finally {
            setModalLoading(false);
        }
    };

    /* =====================================================
       UPDATE STATUS (Direct Action)
    ===================================================== */
    const updateStatus = async (appId, newStatus) => {
        const currentApp = applications.find(app => app.id === appId);
        if (currentApp && currentApp.status === newStatus) {
            showNotification(`Status is already ${newStatus}`, "info");
            setShowApplicationModal(false);
            return;
        }

        const originalApps = [...applications];
        setApplications(prev => prev.map(app =>
            app.id === appId ? { ...app, status: newStatus } : app
        ));

        setShowApplicationModal(false);

        try {
            const endpoint = "/carrer/admin/applications/" + appId + "/status";
            const payload = { status: newStatus };

            await api.patch(endpoint, payload);
            showNotification(`Application marked as ${newStatus}`);
        } catch (err) {
            console.error("Status update failed:", err.response?.data || err);
            setApplications(originalApps);
            const serverMsg = err.response?.data?.message || err.response?.data?.error || "Failed to update status";
            showNotification(serverMsg, "error");
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
        const headers = ["Name", "Email", "Job Title", "Status", "Experience", "Applied Date"];
        const csvRows = [];
        csvRows.push(headers.join(","));
        applications.forEach(app => {
            const row = [
                `"${(app.name || '').replace(/"/g, '""')}"`,
                `"${app.email || ''}"`,
                `"${app.jobTitle || ''}"`,
                `"${app.status || ''}"`,
                app.experience || 'N/A',
                app.applied ? new Date(app.applied).toLocaleDateString() : 'N/A'
            ];
            csvRows.push(row.join(","));
        });
        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'applications.csv');
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
            const endpoint = `/carrer/applications/${applicationId}/notify`;

            let statusToUpdate = null;
            if (emailTemplate === 'hired') statusToUpdate = 'offer';
            else if (emailTemplate === 'interview') statusToUpdate = 'interview';
            else if (emailTemplate === 'rejected') statusToUpdate = 'rejected';
            else if (emailTemplate === 'shortlisted') statusToUpdate = 'shortlisted';

            const payload = {
                subject: emailSubject,
                message: emailBody,
                template: emailTemplate,
                status: statusToUpdate
            };

            await api.post(endpoint, payload);

            if (statusToUpdate) {
                setApplications(prev => prev.map(app =>
                    app.id === applicationId ? { ...app, status: statusToUpdate } : app
                ));
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

        const candidateName = selectedApplication.name;
        const jobTitle = selectedApplication.jobTitle;

        switch (selectedTemplate) {
            case 'hired':
                setEmailSubject(`Offer for ${jobTitle} position at NextKinLife`);
                setEmailBody(`Dear ${candidateName},\n\nCongratulations! We are delighted to offer you the role of ${jobTitle} at NextKinLife.\n\nPlease find the official offer letter attached. We are very excited to have you join our team.\n\nBest regards,\nThe Hiring Team`);
                break;
            case 'interview':
                setEmailSubject(`Interview Invitation: ${jobTitle} position`);
                setEmailBody(`Dear ${candidateName},\n\nWe were impressed with your application. We would like to invite you for an interview to discuss the ${jobTitle} position further.\n\nPlease let us know your availability for the coming week so we can schedule a time.\n\nBest regards,\nThe Hiring Team`);
                break;
            case 'shortlisted':
                setEmailSubject(`Update: Shortlisted for ${jobTitle}`);
                setEmailBody(`Dear ${candidateName},\n\nWe are pleased to inform you that your application for the ${jobTitle} position has been shortlisted.\n\nOur team is currently reviewing applications and we will be in touch soon regarding the next steps.\n\nBest regards,\nThe Hiring Team`);
                break;
            case 'rejected':
                setEmailSubject(`Update regarding your application for ${jobTitle}`);
                setEmailBody(`Dear ${candidateName},\n\nThank you for your interest in the ${jobTitle} position.\n\nAfter careful consideration, we regret to inform you that we are not proceeding with your application at this time. However, we will keep your resume on file for future opportunities.\n\nWe wish you the best in your job search.\n\nBest regards,\nThe Hiring Team`);
                break;
            case 'custom':
                break;
            default:
                break;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'reviewing': case 'viewed': return 'bg-blue-100 text-blue-800';
            case 'shortlisted': return 'bg-purple-100 text-purple-800';
            case 'interview': return 'bg-yellow-100 text-yellow-800';
            case 'offered': case 'hired': case 'offer': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'reviewing': case 'viewed': case 'interview': return <PendingIcon className="h-4 w-4" />;
            case 'shortlisted': case 'offered': case 'hired': case 'offer': return <CheckCircleIcon className="h-4 w-4" />;
            case 'rejected': return <XCircleIcon className="h-4 w-4" />;
            default: return <PendingIcon className="h-4 w-4" />;
        }
    };

    const filteredApplications = applications.filter(app => {
        const searchLower = searchTerm.toLowerCase();
        const name = (app.name || '').toLowerCase();
        const jobTitle = (app.jobTitle || '').toLowerCase();
        const email = (app.email || '').toLowerCase();

        const matchesSearch = name.includes(searchLower) || jobTitle.includes(searchLower) || email.includes(searchLower);
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="relative">
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-lg text-white ${notification.type === 'error' ? 'bg-red-500' : (notification.type === 'info' ? 'bg-blue-500' : 'bg-green-600')}`}>
                    {notification.msg}
                </div>
            )}

            <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Applications Management</h2>
                <p className="text-sm text-gray-500 mt-1">Review and process job applications</p>
            </div>

            <div className="bg-white rounded-lg shadow mb-6 p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input type="text" placeholder="Search applications..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-auto">
                            <option value="all">All Status</option>
                            <option value="viewed">Viewed</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interview">Interview</option>
                            <option value="hired">Hired</option>
                            <option value="offer">Offered</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <button onClick={handleExportCSV} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full sm:w-auto flex items-center justify-center gap-2">
                        <ArrowDownTrayIcon className="h-4 w-4" /> Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Job Applied</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Applied</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="animate-spin h-6 w-6 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading applications...
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-red-500">
                                        Error: {error}
                                    </td>
                                </tr>
                            ) : filteredApplications.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                        No applications found.
                                    </td>
                                </tr>
                            ) : (
                                filteredApplications.map((app) => (
                                    <tr key={app.id} className="hover:bg-gray-50">
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold flex-shrink-0">{app.name ? app.name.split(' ').map(n => n[0]).join('') : 'NA'}</div>
                                                <div className="ml-3 min-w-0 flex-1">
                                                    <div className="text-sm font-medium text-gray-900 truncate">{app.name}</div>
                                                    <div className="text-xs text-gray-500 truncate hidden lg:block">{app.email}</div>
                                                    <div className="text-xs text-gray-500 lg:hidden">{app.jobTitle}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                            <div className="text-sm text-gray-900 truncate">{app.jobTitle}</div>
                                            <div className="text-xs text-gray-500">via {app.source || 'Direct'}</div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            {/* Experience Column - Now properly formatted */}
                                            <p className="text-sm font-medium text-gray-900">{app.experience}</p>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>{getStatusIcon(app.status)} <span className="ml-1 hidden sm:inline">{app.status}</span></span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{app.applied ? new Date(app.applied).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-1 sm:space-x-2">
                                                <button onClick={() => fetchApplicationDetails(app.id)} className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"><EyeIcon className="h-4 w-4" /></button>
                                                <button onClick={() => { setSelectedApplication(app); setShowEmailModal(true); }} className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-100 rounded hidden sm:block"><EnvelopeIcon className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Application Details Modal */}
            {showApplicationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        {modalLoading ? (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                                <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p>Loading full details...</p>
                            </div>
                        ) : (
                            selectedApplication && (
                                <>
                                    <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-gray-200 flex justify-between items-start">
                                        <div className="flex items-center"><div className="bg-white bg-opacity-20 rounded-full p-2 mr-3"><DocumentTextIcon className="h-6 w-6 text-white" /></div><div><h3 className="text-xl font-semibold text-white">Application Details</h3><p className="text-blue-100 text-sm mt-1">{selectedApplication.jobTitle}</p></div></div>
                                        <button onClick={() => setShowApplicationModal(false)} className="text-white hover:text-blue-100 p-1 hover:bg-white hover:bg-opacity-10 rounded-full"><XMarkIcon className="h-6 w-6" /></button>
                                    </div>
                                    <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-180px)]">
                                        <div className="mb-6 flex items-center justify-between">
                                            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedApplication.status)}`}>{selectedApplication.status}</span>
                                            <p className="text-sm text-gray-500">Applied on {selectedApplication.applied ? new Date(selectedApplication.applied).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                        <div className="mb-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" /> Candidate Information</h4>
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="flex items-center mb-4">
                                                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mr-4">{selectedApplication.name ? selectedApplication.name.split(' ').map(n => n[0]).join('') : 'NA'}</div>
                                                    <div className="flex-1"><h5 className="text-lg font-medium text-gray-900">{selectedApplication.name}</h5><p className="text-gray-600">{selectedApplication.email}</p><p className="text-gray-600">{selectedApplication.phone}</p></div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div><p className="text-sm text-gray-500">Experience</p><p className="text-base font-medium text-gray-900">{selectedApplication.experience}</p></div>
                                                    <div><p className="text-sm text-gray-500">Source</p><p className="text-base font-medium text-gray-900">{selectedApplication.source}</p></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" /> Resume</h4>
                                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
                                                <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-900 font-medium mb-2">{selectedApplication.resume ? 'Download Resume' : 'No Resume Uploaded'}</p>
                                                {selectedApplication.resume && (
                                                    <a href={selectedApplication.resume} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"><ArrowDownTrayIcon className="h-4 w-4 mr-2" /> Download Resume</a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                        <div className="text-sm text-gray-500">Application ID: <span className="font-medium text-gray-700">#{selectedApplication.id ? selectedApplication.id.toString().padStart(5, '0') : 'N/A'}</span></div>
                                        <div className="flex gap-3 w-full sm:w-auto">
                                            <button onClick={() => updateStatus(selectedApplication.id, 'rejected')} className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium">Reject</button>
                                            <button onClick={() => updateStatus(selectedApplication.id, 'interview')} className="px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 font-medium">Schedule</button>
                                            <button onClick={() => updateStatus(selectedApplication.id, 'offer')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Hire / Make Offer</button>
                                        </div>
                                    </div>
                                </>
                            )
                        )}
                    </div>
                </div>
            )}

            {/* Email Modal */}
            {showEmailModal && selectedApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                        <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-gray-200 flex justify-between items-start">
                            <div className="flex items-center"><div className="bg-white bg-opacity-20 rounded-full p-2 mr-3"><EnvelopeIcon className="h-6 w-6 text-white" /></div><div><h3 className="text-lg font-semibold text-white">Compose Email</h3><p className="text-blue-100 text-sm">To: {selectedApplication.name}</p></div></div>
                            <button onClick={() => setShowEmailModal(false)} className="text-white hover:text-blue-100 p-1 hover:bg-white hover:bg-opacity-10 rounded-full"><XMarkIcon className="h-6 w-6" /></button>
                        </div>
                        <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4">
                            <div className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center">
                                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-3">{selectedApplication.name ? selectedApplication.name.split(' ').map(n => n[0]).join('') : 'NA'}</div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{selectedApplication.name}</p>
                                    <p className="text-sm text-gray-500">{selectedApplication.email}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter email subject" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Template</label>
                                <select value={emailTemplate} onChange={handleTemplateChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select a template</option>
                                    <option value="hired">Offer / Hired</option>
                                    <option value="interview">Interview Invitation</option>
                                    <option value="shortlisted">Shortlisted Candidate</option>
                                    <option value="rejected">Rejection</option>
                                    <option value="custom">Custom Message</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea rows={10} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Type your message here..."></textarea>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                            <div className="text-sm text-gray-500">To: <span className="font-medium text-gray-700">{selectedApplication.email}</span></div>
                            <div className="flex space-x-3">
                                <button onClick={() => setShowEmailModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium">Cancel</button>
                                <button onClick={handleSendEmail} disabled={sendingEmail} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center disabled:opacity-50">
                                    {sendingEmail ? 'Sending...' : <><PaperAirplaneIcon className="h-4 w-4 mr-2" /> Send Email</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ApplicationsTab;