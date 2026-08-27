import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
    PlusIcon,
    XMarkIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "../../lib/supabaseClient";

const COUNTRY_OPTIONS = ["United States of America", "South Africa", "India",];

/* =====================================================
   INITIAL FORM STATE
===================================================== */
const initialFormData = {
    title: "",
    company: "NextKinLife LLC",
    location: "",
    state: "",
    work_style: "",
    employment_type: "",

    client_name: "",
    vendor_name: "",
    contract_duration: "",

    pay_type: "hourly",
    pay_min: "",
    pay_max: "",
    salary_range: "",

    experience_level: "",
    visa_status: [],

    start_date: "",

    description: "",
    responsibilities: [""],
    requirements: [""],
    preferred_skills: [""],
    benefits: [""],

    skills: {
        primary: [""],
        secondary: [""],
        nice_to_have: [""]
    },

    recruiter_name: "",
    recruiter_email: "",
    recruiter_phone: "",
    recruiter_linkedin: "",
    company_linkedin: ""
};

/* =====================================================
   COMPONENT
===================================================== */
const SkillTagInput = ({ label, tags, onChange, placeholder, required = false }) => {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const val = inputValue.trim();
            if (val && !tags.includes(val)) {
                onChange([...tags, val]);
            }
            setInputValue("");
        }
    };

    const handleBlur = () => {
        const val = inputValue.trim();
        if (val && !tags.includes(val)) {
            onChange([...tags, val]);
        }
        setInputValue("");
    };

    const removeTag = (indexToRemove) => {
        onChange(tags.filter((_, i) => i !== indexToRemove));
    };

    // Filter out empty strings from display
    const activeTags = (tags || []).filter(t => t && t.trim() !== "");

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-500 bg-white">
                <div className="flex flex-wrap gap-2 mb-1">
                    {activeTags.map((tag, idx) => (
                        <span
                            key={idx}
                            className="inline-flex items-center bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(idx)}
                                className="ml-1.5 text-blue-400 hover:text-blue-600 font-bold focus:outline-none"
                            >
                                &times;
                            </button>
                        </span>
                    ))}
                </div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    placeholder={placeholder || "Type skill and press Enter or Comma"}
                    className="w-full text-sm outline-none bg-transparent py-1 px-1"
                />
            </div>
        </div>
    );
};

const JobsTab = () => {
    const [jobsData, setJobsData] = useState([]);
    const [showJobModal, setShowJobModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");
    const [formData, setFormData] = useState(initialFormData);

    const [expMode, setExpMode] = useState("select");
    const [editingJobId, setEditingJobId] = useState(null);

    const getCurrencySymbol = (country) => {
        switch (country) {
            case "United States of America":
                return "$";
            case "India":
                return "₹";
            case "South Africa":
                return "R";
            case "Remote":
                return "$";
            default:
                return "$";
        }
    };
    const currencySymbol = getCurrencySymbol(formData.location);

    /* =====================================================
       FETCH JOBS (GET) - Persists on Refresh via Supabase
    ===================================================== */
    const fetchJobs = async () => {
        try {
            const { data, error } = await supabase
                .from("jobs")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.warn("Supabase fetch jobs warning:", error);
            }
            if (data && Array.isArray(data)) {
                setJobsData(data);
            }
        } catch (err) {
            console.error("FETCH JOBS ERROR", err.message || err);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    /* =====================================================
       CREATE / UPDATE JOB (POST / PUT)
    ===================================================== */
    const handleCreateJob = async () => {
        try {
            setLoading(true);

            // Filter out empty items from arrays
            const filterEmpty = (arr) => {
                if (!arr) return [];
                if (typeof arr === "string") {
                    return arr.split("\n").map(item => item.trim()).filter(Boolean);
                }
                if (Array.isArray(arr)) {
                    return arr.map((item) => typeof item === "string" ? item.trim() : item).filter(Boolean);
                }
                return [];
            };

            const payload = {
                title: formData.title,
                company: formData.company,
                location: formData.location,
                state: formData.state,

                client_name: formData.client_name,
                vendor_name: formData.vendor_name,

                employment_type: formData.employment_type,
                position_type: formData.employment_type,
                contract_duration: formData.contract_duration,

                work_style: formData.work_style,

                pay_type: formData.pay_type,
                pay_min: formData.pay_min ? Number(formData.pay_min) : undefined,
                pay_max: formData.pay_max ? Number(formData.pay_max) : undefined,
                salary_range: formData.salary_range,

                experience_level: formData.experience_level,

                visa_status: formData.visa_status,

                start_date: formData.start_date,

                description: formData.description,

                requirements: filterEmpty(formData.requirements),
                responsibilities: filterEmpty(formData.responsibilities),
                preferred_skills: filterEmpty(formData.preferred_skills),
                benefits: filterEmpty(formData.benefits),

                skills: {
                    primary: filterEmpty(formData.skills.primary),
                    secondary: filterEmpty(formData.skills.secondary),
                    nice_to_have: filterEmpty(formData.skills.nice_to_have),
                },

                recruiter_name: formData.recruiter_name,
                recruiter_email: formData.recruiter_email,
                recruiter_phone: formData.recruiter_phone,
                recruiter_linkedin: formData.recruiter_linkedin,
                company_linkedin: formData.company_linkedin,
                updated_at: new Date().toISOString()
            };

            let savedJob;
            if (editingJobId) {
                const { data, error } = await supabase
                    .from("jobs")
                    .update(payload)
                    .eq("id", editingJobId)
                    .select()
                    .single();
                if (error) throw error;
                savedJob = data;
            } else {
                const { data, error } = await supabase
                    .from("jobs")
                    .insert([{ ...payload, status: 'draft', created_at: new Date().toISOString() }])
                    .select()
                    .single();
                if (error) throw error;
                savedJob = data;
            }

            const job = savedJob || { id: editingJobId || Date.now(), ...payload };

            setJobsData((prev) =>
                editingJobId
                    ? prev.map((item) =>
                          item.id === editingJobId ? job : item
                      )
                    : [job, ...prev]
            );

            // Close and Reset
            setShowJobModal(false);
            setFormData(initialFormData);
            setExpMode("select");
            setEditingJobId(null);
        } catch (err) {
            console.error("CREATE JOB ERROR", err.message || err);
            alert("Failed to save job: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       UPDATE STATUS (PATCH) - Matches Supabase Table
    ===================================================== */
    const handleEditClick = (job) => {
        setEditingJobId(job.id);

        setFormData((prev) => ({
            ...prev,
            ...job,
            employment_type:
                job.employment_type || job.position_type || "",
            visa_status: Array.isArray(job.visa_status)
                ? job.visa_status
                : [],
            skills: {
                primary: job.skills?.primary || [""],
                secondary: job.skills?.secondary || [""],
                nice_to_have:
                    job.skills?.nice_to_have || [""],
            },
            requirements:
                job.requirements?.length > 0
                    ? job.requirements
                    : [""],
            responsibilities:
                job.responsibilities?.length > 0
                    ? job.responsibilities
                    : [""],
            preferred_skills:
                job.preferred_skills?.length > 0
                    ? job.preferred_skills
                    : [""],
            benefits:
                job.benefits?.length > 0
                    ? job.benefits
                    : [""],
        }));

        setShowJobModal(true);
    };

    const updateJobStatus = async (jobId, status) => {
        if (!jobId) {
            console.error("❌ Missing job id");
            return;
        }

        try {
            const { error } = await supabase
                .from("jobs")
                .update({ status, updated_at: new Date().toISOString() })
                .eq("id", jobId);

            if (error) throw error;

            setJobsData((prev) =>
                prev.map((job) =>
                    job.id === jobId ? { ...job, status } : job
                )
            );
        } catch (err) {
            console.error(
                "UPDATE STATUS ERROR",
                err.message || err
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

    const toggleVisaStatus = (opt) => {
        const current = formData.visa_status || [];
        const updated = current.includes(opt)
            ? current.filter((v) => v !== opt)
            : [...current, opt];
        setFormData({ ...formData, visa_status: updated });
    };

    return (
        <div>
            {/* HEADER */}
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Job Postings</h2>
                <button
                    onClick={() => {
                        setFormData(initialFormData);
                        setExpMode("select");
                        setEditingJobId(null);
                        setShowJobModal(true);
                    }}
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
                                Job Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Company
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Start Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Visa Status
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
                                <td className="px-6 py-4 text-gray-600">
                                    {job.company || "-"}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {job.location || "-"}
                                    {job.state ? `, ${job.state}` : ""}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {job.employment_type || "-"}
                                </td>
                                <td className="px-6 py-4">
                                    {statusBadge(job.status)}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {job.start_date || "-"}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {job.visa_status && job.visa_status.length > 0
                                        ? job.visa_status.join(", ")
                                        : "-"}
                                </td>
                                <td className="px-6 py-4 space-x-2">
                                    <button
                                        onClick={() => handleEditClick(job)}
                                        className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition"
                                    >
                                        Edit
                                    </button>

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
                                    colSpan="8"
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
                            <h3 className="text-xl font-semibold text-gray-900">{editingJobId ? "Edit Job" : "Create New Job"}</h3>
                            <button
                                onClick={() => {
                                    setShowJobModal(false);
                                    setActiveTab("basic");
                                    setExpMode("select");
                                    setEditingJobId(null);
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
                                    {/* Job Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Job Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            value={formData.title}
                                            onChange={(e) =>
                                                setFormData({ ...formData, title: e.target.value })
                                            }
                                            placeholder="Enter job title (e.g. Senior Java Backend Developer)"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Company */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Company <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            value={formData.company}
                                            onChange={(e) =>
                                                setFormData({ ...formData, company: e.target.value })
                                            }
                                            placeholder="Enter company name"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>



                                    {/* Location & State */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Country <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.location}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, location: e.target.value })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                            >
                                                <option value="">Select Country</option>
                                                {COUNTRY_OPTIONS.map((opt) => (
                                                    <option key={opt} value={opt}>
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                State <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>
                                            </label>
                                            <input
                                                value={formData.state}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, state: e.target.value })
                                                }
                                                placeholder="e.g. Texas"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Client & Vendor Name */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Client Name <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>
                                            </label>
                                            <input
                                                placeholder="e.g. Walmart"
                                                value={formData.client_name}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        client_name: e.target.value
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Vendor Name <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>
                                            </label>
                                            <input
                                                placeholder="e.g. Infosys"
                                                value={formData.vendor_name}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        vendor_name: e.target.value
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Employment Type & Work Style */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Employment/Position Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.employment_type}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        employment_type: e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                            >
                                                <option value="">Select Type</option>
                                                <option value="C2C">C2C (Corp-to-Corp)</option>
                                                <option value="W2">W2</option>
                                                <option value="Contract">Contract</option>
                                                <option value="Full Time">Full Time</option>
                                                <option value="Part Time">Part Time</option>
                                                <option value="Contract to Hire">Contract to Hire</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Work Mode <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.work_style}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        work_style: e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                            >
                                                <option value="">Select Mode</option>
                                                <option value="remote">Remote</option>
                                                <option value="hybrid">Hybrid</option>
                                                <option value="onsite">Onsite</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Experience Level & Pay Type */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Experience Level <span className="text-red-500">*</span>
                                            </label>
                                            {expMode === "select" ? (
                                                <select
                                                    value={formData.experience_level}
                                                    onChange={(e) => {
                                                        if (e.target.value === "custom") {
                                                            setExpMode("custom");
                                                            setFormData({ ...formData, experience_level: "" });
                                                        } else {
                                                            setFormData({ ...formData, experience_level: e.target.value });
                                                        }
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                >
                                                    <option value="">Select Experience Level</option>
                                                    {["0-3 Years", "4-7 Years", "8+ Years", "Senior", "Lead"].map((opt) => (
                                                        <option key={opt} value={opt}>
                                                            {opt}
                                                        </option>
                                                    ))}
                                                    <option value="custom">Other (Type Custom)</option>
                                                </select>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <input
                                                        value={formData.experience_level}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, experience_level: e.target.value })
                                                        }
                                                        placeholder="e.g. 10+ Years or Principal"
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setExpMode("select");
                                                            setFormData({ ...formData, experience_level: "" });
                                                        }}
                                                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg border border-gray-300"
                                                    >
                                                        Select List
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Pay Type
                                            </label>
                                            <select
                                                value={formData.pay_type}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        pay_type: e.target.value
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="hourly">Hourly</option>
                                                <option value="salary">Salary</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Contract Duration & Start Date */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Contract Duration <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>
                                            </label>
                                            <input
                                                value={formData.contract_duration}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        contract_duration: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g. 12+ Months or Long Term"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Start Date <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.start_date}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        start_date: e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Visa Status Text Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Visa Status <span className="text-gray-400 text-xs font-normal ml-1">(optional - enter comma-separated values, e.g. USC, GC, H1B, OPT, CPT)</span>
                                        </label>
                                        <input
                                            placeholder="e.g. USC, GC, H1B, OPT, CPT"
                                            value={Array.isArray(formData.visa_status) ? formData.visa_status.join(", ") : formData.visa_status || ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const arrayVal = val ? val.split(",").map((v) => v.trim()) : [];
                                                setFormData({
                                                    ...formData,
                                                    visa_status: arrayVal,
                                                });
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </>
                            )}

                            {/* DETAILS TAB */}
                            {activeTab === "details" && (
                                <>
                                    {/* Compensation Inputs */}
                                    <div className="grid grid-cols-3 gap-4">
                                        {/* <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Minimum Pay <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>
                                            </label>
                                            <div className="relative rounded-lg shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="text-gray-500 sm:text-sm">{currencySymbol}</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    placeholder="Minimum Pay"
                                                    value={formData.pay_min}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            pay_min: e.target.value
                                                        })
                                                    }
                                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div> */}
                                        {/* <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Maximum Pay <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>
                                            </label>
                                            <div className="relative rounded-lg shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="text-gray-500 sm:text-sm">{currencySymbol}</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    placeholder="Maximum Pay"
                                                    value={formData.pay_max}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            pay_max: e.target.value
                                                        })
                                                    }
                                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div> */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Salary  Range <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>
                                            </label>
                                            <div className="relative rounded-lg shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="text-gray-500 sm:text-sm">{currencySymbol}</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder={`e.g. ${currencySymbol}65 - ${currencySymbol}85 / hr`}
                                                    value={formData.salary_range}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            salary_range: e.target.value
                                                        })
                                                    }
                                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <ReactQuill
                                            theme="snow"
                                            value={formData.description}
                                            onChange={(val) =>
                                                setFormData({
                                                    ...formData,
                                                    description: val,
                                                })
                                            }
                                            className="bg-white"
                                        />
                                    </div>

                                    {/* Requirements Textarea */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Requirements <span className="text-gray-400 text-xs font-normal ml-1">(optional - enter one requirement per line)</span>
                                        </label>
                                        <textarea
                                            value={Array.isArray(formData.requirements) ? formData.requirements.join("\n") : formData.requirements}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    requirements: e.target.value.split("\n"),
                                                })
                                            }
                                            placeholder="e.g.&#10;Bachelor's degree in Computer Science&#10;5+ years Backend development experience"
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Responsibilities Textarea */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Responsibilities <span className="text-gray-400 text-xs font-normal ml-1">(optional - enter one responsibility per line)</span>
                                        </label>
                                        <textarea
                                            value={Array.isArray(formData.responsibilities) ? formData.responsibilities.join("\n") : formData.responsibilities}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    responsibilities: e.target.value.split("\n"),
                                                })
                                            }
                                            placeholder="e.g.&#10;Design and build robust APIs using Spring Boot&#10;Collaborate with front-end engineering teams"
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Benefits Textarea */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Benefits & Perks <span className="text-gray-400 text-xs font-normal ml-1">(optional - enter one benefit per line)</span>
                                        </label>
                                        <textarea
                                            value={Array.isArray(formData.benefits) ? formData.benefits.join("\n") : formData.benefits}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    benefits: e.target.value.split("\n"),
                                                })
                                            }
                                            placeholder="e.g.&#10;Health, Dental and Vision insurance&#10;401(k) retirement savings plan"
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Recruiter Details */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Recruiter Name <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>
                                            </label>
                                            <input
                                                placeholder="Recruiter Name"
                                                value={formData.recruiter_name}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        recruiter_name: e.target.value
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Recruiter Email <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>
                                            </label>
                                            <input
                                                placeholder="Recruiter Email"
                                                value={formData.recruiter_email}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        recruiter_email: e.target.value
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Recruiter Phone <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>
                                            </label>
                                            <input
                                                placeholder="Recruiter Phone"
                                                value={formData.recruiter_phone}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        recruiter_phone: e.target.value
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Recruiter LinkedIn <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>
                                            </label>
                                            <input
                                                placeholder="Recruiter LinkedIn Profile URL"
                                                value={formData.recruiter_linkedin}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        recruiter_linkedin: e.target.value
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Company LinkedIn <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>
                                        </label>
                                        <input
                                            placeholder="Company LinkedIn Profile URL"
                                            value={formData.company_linkedin}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    company_linkedin: e.target.value
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </>
                            )}

                            {/* SKILLS TAB */}
                            {activeTab === "skills" && (
                                <>
                                    <SkillTagInput
                                        label="Primary Skills"
                                        required={true}
                                        tags={formData.skills.primary}
                                        placeholder="Type a core skill (e.g. Java) and press Enter or Comma"
                                        onChange={(newTags) =>
                                            setFormData({
                                                ...formData,
                                                skills: { ...formData.skills, primary: newTags }
                                            })
                                        }
                                    />

                                    <SkillTagInput
                                        label="Secondary Skills"
                                        required={false}
                                        tags={formData.skills.secondary}
                                        placeholder="Type an additional skill (e.g. Spring Boot) and press Enter or Comma"
                                        onChange={(newTags) =>
                                            setFormData({
                                                ...formData,
                                                skills: { ...formData.skills, secondary: newTags }
                                            })
                                        }
                                    />

                                    <SkillTagInput
                                        label="Nice to Have Skills"
                                        required={false}
                                        tags={formData.skills.nice_to_have}
                                        placeholder="Type bonus skills (e.g. Kubernetes) and press Enter or Comma"
                                        onChange={(newTags) =>
                                            setFormData({
                                                ...formData,
                                                skills: { ...formData.skills, nice_to_have: newTags }
                                            })
                                        }
                                    />

                                    <SkillTagInput
                                        label="Preferred Skills"
                                        required={false}
                                        tags={formData.preferred_skills}
                                        placeholder="Type preferred qualifications (e.g. AWS Certification) and press Enter or Comma"
                                        onChange={(newTags) =>
                                            setFormData({
                                                ...formData,
                                                preferred_skills: newTags
                                            })
                                        }
                                    />
                                </>
                            )}

                        </div>

                        {/* Footer Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                onClick={() => {
                                    setShowJobModal(false);
                                    setActiveTab("basic");
                                    setExpMode("select");
                                    setEditingJobId(null);
                                }}
                                className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateJob}
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
                            >
                                {
                                     loading
                                         ? "Saving..."
                                         : editingJobId
                                             ? "Save Changes"
                                             : "Create Job"
                                 }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobsTab;