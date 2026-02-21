import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    PlusIcon,
    XMarkIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";

/* =====================================================
   AXIOS INSTANCE
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
   INITIAL FORM STATE
===================================================== */
const initialFormData = {
    title: "",
    company: "",
    department: "",
    location: "",
    geo_restriction: "",
    employment_type: "",
    contract_duration: "",
    work_style: "",
    experience_level: "",
    salary_range: { min: "", max: "", currency: "USD" },
    description: "",
    requirements: [""],
    responsibilities: [""],
    skills: {
        primary: [""],
        secondary: [""],
        nice_to_have: [""],
    },
    mandatory_conditions: [""],
};

/* =====================================================
   COMPONENT
===================================================== */
const JobsTab = () => {
    const [jobsData, setJobsData] = useState([]);
    const [showJobModal, setShowJobModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");

    const [formData, setFormData] = useState(initialFormData);

    /* =====================================================
       FETCH JOBS (GET) - Persists on Refresh
    ===================================================== */
    const fetchJobs = async () => {
        try {
            // Assuming a GET route exists at the same endpoint or similar
            const res = await api.get("/carrer/admin/jobs");

            // Handle response based on structure (usually { jobs: [...] } or just [...])
            if (res.data.success && res.data.jobs) {
                setJobsData(res.data.jobs);
            } else if (Array.isArray(res.data)) {
                setJobsData(res.data);
            }
        } catch (err) {
            console.error("FETCH JOBS ERROR", err.response?.data || err.message);
        }
    };

    // Load jobs when component mounts
    useEffect(() => {
        fetchJobs();
    }, []);

    /* =====================================================
       CREATE JOB (POST → DRAFT)
    ===================================================== */
    const handleCreateJob = async () => {
        try {
            setLoading(true);

            // Filter out empty items from arrays
            const filterEmpty = (arr) => arr.filter((item) => item.trim() !== "");

            const payload = {
                title: formData.title,
                company: formData.company,
                department: formData.department,
                location: formData.location,
                geo_restriction: formData.geo_restriction || null,
                employment_type: formData.employment_type,
                contract_duration: formData.contract_duration || null,
                work_style: formData.work_style,
                experience_level: formData.experience_level,
                salary_range: formData.salary_range.min && formData.salary_range.max
                    ? `${formData.salary_range.min} - ${formData.salary_range.max} ${formData.salary_range.currency}`
                    : null,
                description: formData.description,
                requirements: filterEmpty(formData.requirements),
                responsibilities: filterEmpty(formData.responsibilities),
                skills: {
                    primary: filterEmpty(formData.skills.primary),
                    secondary: filterEmpty(formData.skills.secondary),
                    nice_to_have: filterEmpty(formData.skills.nice_to_have),
                },
                mandatory_conditions: filterEmpty(formData.mandatory_conditions),
            };

            const res = await api.post("/carrer/admin/jobs", payload);

            const job = res.data.job;

            if (!job?.id) {
                console.error("❌ Backend did not return job.id", job);
                return;
            }

            // Add new job to the top of the list
            setJobsData((prev) => [job, ...prev]);

            // Close and Reset
            setShowJobModal(false);
            setFormData(initialFormData);
        } catch (err) {
            console.error("CREATE JOB ERROR", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       UPDATE STATUS (PATCH) - Matches Backend Route
    ===================================================== */
    const updateJobStatus = async (jobId, status) => {
        if (!jobId) {
            console.error("❌ Missing job id");
            return;
        }

        try {
            // URL matches: router.patch("/carrer/admin/jobs/:id/status", ...)
            const res = await api.patch(
                `/carrer/admin/jobs/${jobId}/status`,
                { status }
            );

            const updatedJob = res.data.job;

            // Optimistic UI update or update based on server response
            setJobsData((prev) =>
                prev.map((job) =>
                    job.id === jobId ? { ...job, status: updatedJob.status } : job
                )
            );
        } catch (err) {
            console.error(
                "UPDATE STATUS ERROR",
                err.response?.data || err.message
            );
        }
    };

    /* =====================================================
       STATUS BADGE
    ===================================================== */
    const statusBadge = (status) => {
        if (status === "active") {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="h-4 w-4 mr-1" /> Active
                </span>
            );
        }
        if (status === "closed") {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircleIcon className="h-4 w-4 mr-1" /> Closed
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <ClockIcon className="h-4 w-4 mr-1" /> Draft
            </span>
        );
    };

    /* =====================================================
       JSX
    ===================================================== */
    return (
        <div>
            {/* HEADER */}
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Job Postings</h2>
                <button
                    onClick={() => setShowJobModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
                >
                    <PlusIcon className="h-5 w-5 mr-2" /> New Job
                </button>
            </div>

            {/* JOB TABLE */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {jobsData.map((job) => (
                            <tr key={job.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{job.title}</td>
                                <td className="px-6 py-4">{statusBadge(job.status)}</td>
                                <td className="px-6 py-4 flex gap-2">
                                    {/* If Draft -> Show Activate Button */}
                                    {job.status === "draft" && (
                                        <button
                                            onClick={() =>
                                                updateJobStatus(job.id, "active")
                                            }
                                            className="bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-green-700 transition"
                                        >
                                            Activate
                                        </button>
                                    )}

                                    {/* If Active -> Show Close Button */}
                                    {job.status === "active" && (
                                        <button
                                            onClick={() =>
                                                updateJobStatus(job.id, "closed")
                                            }
                                            className="bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-700 transition"
                                        >
                                            Close
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {jobsData.length === 0 && (
                            <tr>
                                <td
                                    colSpan="3"
                                    className="px-6 py-10 text-center text-gray-500"
                                >
                                    No jobs found. Create a new job to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* CREATE JOB MODAL */}
            {showJobModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm overflow-y-auto py-8">
                    <div className="bg-white rounded-xl w-full max-w-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto mx-4">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h3 className="text-xl font-semibold text-gray-900">Create New Job</h3>
                            <button
                                onClick={() => {
                                    setShowJobModal(false);
                                    setActiveTab("basic");
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex border-b">
                            {[
                                { id: "basic", label: "Basic Info" },
                                { id: "details", label: "Details" },
                                { id: "skills", label: "Skills" },
                                { id: "conditions", label: "Conditions" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 font-medium text-sm transition ${activeTab === tab.id
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="space-y-4 min-h-[300px]">
                            {/* BASIC INFO TAB */}
                            {activeTab === "basic" && (
                                <>
                                    {["title", "company", "department", "location", "geo_restriction"].map((key) => (
                                        <div key={key}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                                {key.replace(/_/g, " ")}
                                                {["title", "company", "department", "location"].includes(key) && (
                                                    <span className="text-red-500 ml-1">*</span>
                                                )}
                                            </label>
                                            <input
                                                value={formData[key]}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, [key]: e.target.value })
                                                }
                                                placeholder={
                                                    key === "geo_restriction"
                                                        ? "e.g., US Only, EU, Global"
                                                        : `Enter ${key.replace(/_/g, " ")}`
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    ))}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Employment Type<span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <select
                                                value={formData.employment_type}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        employment_type: e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select Type</option>
                                                <option value="Full Time">Full Time</option>
                                                <option value="Part Time">Part Time</option>
                                                <option value="Contract">Contract</option>
                                                <option value="C2C">C2C</option>
                                                <option value="Contract to Hire">Contract to Hire</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Work Style<span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <select
                                                value={formData.work_style}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        work_style: e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select Style</option>
                                                <option value="onsite">Onsite</option>
                                                <option value="remote">Remote</option>
                                                <option value="hybrid">Hybrid</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Experience Level<span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <input
                                                value={formData.experience_level}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        experience_level: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g., 12+ years, Senior, Lead"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Contract Duration
                                            </label>
                                            <input
                                                value={formData.contract_duration}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        contract_duration: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g., 6 months, 1 year"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* DETAILS TAB */}
                            {activeTab === "details" && (
                                <>
                                    {/* Salary Range */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Salary Range
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <input
                                                type="number"
                                                value={formData.salary_range.min}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        salary_range: {
                                                            ...formData.salary_range,
                                                            min: e.target.value,
                                                        },
                                                    })
                                                }
                                                placeholder="Min"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <input
                                                type="number"
                                                value={formData.salary_range.max}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        salary_range: {
                                                            ...formData.salary_range,
                                                            max: e.target.value,
                                                        },
                                                    })
                                                }
                                                placeholder="Max"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <select
                                                value={formData.salary_range.currency}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        salary_range: {
                                                            ...formData.salary_range,
                                                            currency: e.target.value,
                                                        },
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                                <option value="GBP">GBP</option>
                                                <option value="INR">INR</option>
                                                <option value="AUD">AUD</option>
                                                <option value="CAD">CAD</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description<span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    description: e.target.value,
                                                })
                                            }
                                            placeholder="Job description details..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Requirements */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Requirements
                                        </label>
                                        {formData.requirements.map((req, idx) => (
                                            <div key={idx} className="flex gap-2 mb-2">
                                                <input
                                                    value={req}
                                                    onChange={(e) => {
                                                        const updated = [...formData.requirements];
                                                        updated[idx] = e.target.value;
                                                        setFormData({
                                                            ...formData,
                                                            requirements: updated,
                                                        });
                                                    }}
                                                    placeholder={`Requirement ${idx + 1}`}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                {formData.requirements.length > 1 && (
                                                    <button
                                                        onClick={() => {
                                                            setFormData({
                                                                ...formData,
                                                                requirements: formData.requirements.filter(
                                                                    (_, i) => i !== idx
                                                                ),
                                                            });
                                                        }}
                                                        className="text-red-500 hover:text-red-700 p-2"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            onClick={() =>
                                                setFormData({
                                                    ...formData,
                                                    requirements: [...formData.requirements, ""],
                                                })
                                            }
                                            className="text-blue-600 text-sm hover:text-blue-800 flex items-center gap-1"
                                        >
                                            <PlusIcon className="h-4 w-4" /> Add Requirement
                                        </button>
                                    </div>

                                    {/* Responsibilities */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Responsibilities
                                        </label>
                                        {formData.responsibilities.map((resp, idx) => (
                                            <div key={idx} className="flex gap-2 mb-2">
                                                <input
                                                    value={resp}
                                                    onChange={(e) => {
                                                        const updated = [...formData.responsibilities];
                                                        updated[idx] = e.target.value;
                                                        setFormData({
                                                            ...formData,
                                                            responsibilities: updated,
                                                        });
                                                    }}
                                                    placeholder={`Responsibility ${idx + 1}`}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                {formData.responsibilities.length > 1 && (
                                                    <button
                                                        onClick={() => {
                                                            setFormData({
                                                                ...formData,
                                                                responsibilities: formData.responsibilities.filter(
                                                                    (_, i) => i !== idx
                                                                ),
                                                            });
                                                        }}
                                                        className="text-red-500 hover:text-red-700 p-2"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            onClick={() =>
                                                setFormData({
                                                    ...formData,
                                                    responsibilities: [...formData.responsibilities, ""],
                                                })
                                            }
                                            className="text-blue-600 text-sm hover:text-blue-800 flex items-center gap-1"
                                        >
                                            <PlusIcon className="h-4 w-4" /> Add Responsibility
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* SKILLS TAB */}
                            {activeTab === "skills" && (
                                <>
                                    {/* Primary Skills */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Primary Skills <span className="text-gray-400 text-xs">(Must have)</span>
                                        </label>
                                        {formData.skills.primary.map((skill, idx) => (
                                            <div key={idx} className="flex gap-2 mb-2">
                                                <input
                                                    value={skill}
                                                    onChange={(e) => {
                                                        const updated = [...formData.skills.primary];
                                                        updated[idx] = e.target.value;
                                                        setFormData({
                                                            ...formData,
                                                            skills: { ...formData.skills, primary: updated },
                                                        });
                                                    }}
                                                    placeholder={`Primary skill ${idx + 1}`}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                {formData.skills.primary.length > 1 && (
                                                    <button
                                                        onClick={() => {
                                                            setFormData({
                                                                ...formData,
                                                                skills: {
                                                                    ...formData.skills,
                                                                    primary: formData.skills.primary.filter(
                                                                        (_, i) => i !== idx
                                                                    ),
                                                                },
                                                            });
                                                        }}
                                                        className="text-red-500 hover:text-red-700 p-2"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            onClick={() =>
                                                setFormData({
                                                    ...formData,
                                                    skills: {
                                                        ...formData.skills,
                                                        primary: [...formData.skills.primary, ""],
                                                    },
                                                })
                                            }
                                            className="text-blue-600 text-sm hover:text-blue-800 flex items-center gap-1"
                                        >
                                            <PlusIcon className="h-4 w-4" /> Add Primary Skill
                                        </button>
                                    </div>

                                    {/* Secondary Skills */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Secondary Skills <span className="text-gray-400 text-xs">(Good to have)</span>
                                        </label>
                                        {formData.skills.secondary.map((skill, idx) => (
                                            <div key={idx} className="flex gap-2 mb-2">
                                                <input
                                                    value={skill}
                                                    onChange={(e) => {
                                                        const updated = [...formData.skills.secondary];
                                                        updated[idx] = e.target.value;
                                                        setFormData({
                                                            ...formData,
                                                            skills: { ...formData.skills, secondary: updated },
                                                        });
                                                    }}
                                                    placeholder={`Secondary skill ${idx + 1}`}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                {formData.skills.secondary.length > 1 && (
                                                    <button
                                                        onClick={() => {
                                                            setFormData({
                                                                ...formData,
                                                                skills: {
                                                                    ...formData.skills,
                                                                    secondary: formData.skills.secondary.filter(
                                                                        (_, i) => i !== idx
                                                                    ),
                                                                },
                                                            });
                                                        }}
                                                        className="text-red-500 hover:text-red-700 p-2"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            onClick={() =>
                                                setFormData({
                                                    ...formData,
                                                    skills: {
                                                        ...formData.skills,
                                                        secondary: [...formData.skills.secondary, ""],
                                                    },
                                                })
                                            }
                                            className="text-blue-600 text-sm hover:text-blue-800 flex items-center gap-1"
                                        >
                                            <PlusIcon className="h-4 w-4" /> Add Secondary Skill
                                        </button>
                                    </div>

                                    {/* Nice to Have Skills */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nice to Have <span className="text-gray-400 text-xs">(Bonus)</span>
                                        </label>
                                        {formData.skills.nice_to_have.map((skill, idx) => (
                                            <div key={idx} className="flex gap-2 mb-2">
                                                <input
                                                    value={skill}
                                                    onChange={(e) => {
                                                        const updated = [...formData.skills.nice_to_have];
                                                        updated[idx] = e.target.value;
                                                        setFormData({
                                                            ...formData,
                                                            skills: { ...formData.skills, nice_to_have: updated },
                                                        });
                                                    }}
                                                    placeholder={`Nice to have ${idx + 1}`}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                {formData.skills.nice_to_have.length > 1 && (
                                                    <button
                                                        onClick={() => {
                                                            setFormData({
                                                                ...formData,
                                                                skills: {
                                                                    ...formData.skills,
                                                                    nice_to_have: formData.skills.nice_to_have.filter(
                                                                        (_, i) => i !== idx
                                                                    ),
                                                                },
                                                            });
                                                        }}
                                                        className="text-red-500 hover:text-red-700 p-2"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            onClick={() =>
                                                setFormData({
                                                    ...formData,
                                                    skills: {
                                                        ...formData.skills,
                                                        nice_to_have: [...formData.skills.nice_to_have, ""],
                                                    },
                                                })
                                            }
                                            className="text-blue-600 text-sm hover:text-blue-800 flex items-center gap-1"
                                        >
                                            <PlusIcon className="h-4 w-4" /> Add Nice to Have Skill
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* CONDITIONS TAB */}
                            {activeTab === "conditions" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mandatory Conditions
                                        <span className="text-gray-400 text-xs ml-2">
                                            (e.g., Background check required, Valid work permit)
                                        </span>
                                    </label>
                                    {formData.mandatory_conditions.map((condition, idx) => (
                                        <div key={idx} className="flex gap-2 mb-2">
                                            <input
                                                value={condition}
                                                onChange={(e) => {
                                                    const updated = [...formData.mandatory_conditions];
                                                    updated[idx] = e.target.value;
                                                    setFormData({
                                                        ...formData,
                                                        mandatory_conditions: updated,
                                                    });
                                                }}
                                                placeholder={`Condition ${idx + 1}`}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            {formData.mandatory_conditions.length > 1 && (
                                                <button
                                                    onClick={() => {
                                                        setFormData({
                                                            ...formData,
                                                            mandatory_conditions: formData.mandatory_conditions.filter(
                                                                (_, i) => i !== idx
                                                            ),
                                                        });
                                                    }}
                                                    className="text-red-500 hover:text-red-700 p-2"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                mandatory_conditions: [...formData.mandatory_conditions, ""],
                                            })
                                        }
                                        className="text-blue-600 text-sm hover:text-blue-800 flex items-center gap-1"
                                    >
                                        <PlusIcon className="h-4 w-4" /> Add Condition
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                onClick={() => {
                                    setShowJobModal(false);
                                    setActiveTab("basic");
                                }}
                                className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateJob}
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {loading ? "Creating..." : "Create Job"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobsTab;