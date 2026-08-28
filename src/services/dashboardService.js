import axios from "axios";
import { supabase } from "../lib/supabase";

/* ======================================================
   AXIOS INSTANCE
====================================================== */

const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://api.nextkinlife.live";

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        config.headers = config.headers || {};
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtaHhudXhsb2Rzc2hka3VubmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NDEwOTEsImV4cCI6MjEwMzExNzA5MX0.3HYB8stLkxNE4j32PVwKL6s8bwulfIJI247MbBE6hqw';
        if (supabaseKey && !config.headers["apikey"]) {
            config.headers["apikey"] = supabaseKey;
        }

        const token = localStorage.getItem("admin-auth");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else if (supabaseKey && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${supabaseKey}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("admin-logged-in");
            localStorage.removeItem("admin-role");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

/* ======================================================
   HELPER: Safe API / Supabase Fallback Runner
====================================================== */
async function runWithSupabaseFallback(apiCall, supabaseFallback) {
    try {
        const res = await apiCall();
        if (res) return res;
    } catch {
        // Fallback directly to Supabase table query
    }
    try {
        return await supabaseFallback();
    } catch (err) {
        console.warn("Supabase fallback note:", err);
        return null;
    }
}

/* ======================================================
   DASHBOARD API (Direct Supabase Tables + API Fallback)
====================================================== */

export const dashboardAPI = {
    getAnalyticsSummary: () =>
        runWithSupabaseFallback(
            () => api.get("/analytics/summary").then((r) => r.data),
            async () => {
                const [profilesRes, propertiesRes] = await Promise.all([
                    supabase.from("profiles").select("role, status, is_approved"),
                    supabase.from("properties").select("status, is_approved"),
                ]);

                const profiles = profilesRes.data || [];
                const properties = propertiesRes.data || [];

                const hosts = profiles.filter((p) => p.role === "host" || p.role === "admin");
                const hostsApproved = hosts.filter((h) => h.is_approved || h.status === "approved").length;
                const hostsRejected = hosts.filter((h) => h.status === "rejected").length;

                const propsApproved = properties.filter((p) => p.is_approved || p.status === "approved").length;
                const propsRejected = properties.filter((p) => p.status === "rejected").length;
                const propsSubmitted = properties.filter((p) => p.status === "pending").length;
                const propsDrafted = properties.filter((p) => p.status === "draft").length;

                return {
                    hosts: {
                        created: hosts.length,
                        approved: hostsApproved,
                        rejected: hostsRejected,
                    },
                    properties: {
                        drafted: propsDrafted,
                        submitted: propsSubmitted,
                        approved: propsApproved,
                        rejected: propsRejected,
                    },
                };
            }
        ),

    getAnalyticsTimeseries: (event, range) =>
        runWithSupabaseFallback(
            () => api.get(`/analytics/timeseries?event=${event}&range=${range}`).then((r) => r.data),
            async () => {
                const isHost = event === "HOST_CREATED";
                const table = isHost ? "profiles" : "properties";
                const { data } = await supabase.from(table).select("created_at");

                const grouped = {};
                (data || []).forEach((item) => {
                    const date = item.created_at ? item.created_at.split("T")[0] : "Recent";
                    grouped[date] = (grouped[date] || 0) + 1;
                });

                const series = Object.keys(grouped).map((date) => ({
                    date,
                    count: grouped[date],
                }));

                return { series: series.length > 0 ? series : [{ date: "Today", count: 0 }] };
            }
        ),

    getAnalyticsByLocation: (event) =>
        runWithSupabaseFallback(
            () => api.get(`/analytics/by-location?event=${event}`).then((r) => r.data),
            async () => {
                const isHost = event === "HOST_CREATED";
                const table = isHost ? "profiles" : "properties";
                const { data } = await supabase.from(table).select("country, city");

                const counts = {};
                (data || []).forEach((item) => {
                    const loc = item.country || item.city || "Unknown";
                    counts[loc] = (counts[loc] || 0) + 1;
                });

                return Object.keys(counts).map((location) => ({
                    location,
                    count: counts[location],
                }));
            }
        ),

    getEventAnalyticsSummary: () =>
        runWithSupabaseFallback(
            () => api.get("/eventanalytics/summary").then((r) => r.data),
            async () => {
                const { data } = await supabase.from("events").select("status, is_approved");
                const events = data || [];
                return {
                    stats: {
                        drafts: events.filter((e) => e.status === "draft").length,
                        submitted: events.filter((e) => e.status === "pending").length,
                        approved: events.filter((e) => e.is_approved || e.status === "approved").length,
                        rejected: events.filter((e) => e.status === "rejected").length,
                        live: events.filter((e) => e.status === "live" || e.status === "approved").length,
                        completed: events.filter((e) => e.status === "completed").length,
                    },
                };
            }
        ),

    getEventEngagementTimeseries: (type, days) =>
        runWithSupabaseFallback(
            () => api.get(`/eventanalytics/engagement?type=${type}&days=${days}`).then((r) => r.data),
            async () => {
                const { data } = await supabase.from("events").select("created_at");
                const grouped = {};
                (data || []).forEach((e) => {
                    const date = e.created_at ? e.created_at.split("T")[0] : "Recent";
                    grouped[date] = (grouped[date] || 0) + 1;
                });
                return {
                    series: Object.keys(grouped).map((date) => ({ date, count: grouped[date] })),
                };
            }
        ),

    getEventAnalyticsByLocation: () =>
        runWithSupabaseFallback(
            () => api.get("/eventanalytics/by-location").then((r) => r.data),
            async () => {
                const { data } = await supabase.from("events").select("country, city");
                const counts = {};
                (data || []).forEach((e) => {
                    const loc = e.country || e.city || "Unknown";
                    counts[loc] = (counts[loc] || 0) + 1;
                });
                return Object.keys(counts).map((location) => ({ location, count: counts[location] }));
            }
        ),

    getBuySellOverview: (range) =>
        runWithSupabaseFallback(
            () => api.get(`/buysellanalytics/overview?range=${range}`).then((r) => r.data),
            async () => {
                const { data } = await supabase.from("buy_sell").select("status");
                const items = data || [];
                return {
                    totalListings: items.length,
                    activeListings: items.filter((i) => i.status === "approved" || i.status === "active").length,
                    pendingListings: items.filter((i) => i.status === "pending").length,
                    blockedListings: items.filter((i) => i.status === "rejected" || i.status === "blocked").length,
                };
            }
        ),

    getBuySellDailyTrend: (range) =>
        runWithSupabaseFallback(
            () => api.get(`/buysellanalytics/trend?range=${range}`).then((r) => r.data),
            async () => {
                const { data } = await supabase.from("buy_sell").select("created_at");
                const grouped = {};
                (data || []).forEach((i) => {
                    const date = i.created_at ? i.created_at.split("T")[0] : "Recent";
                    grouped[date] = (grouped[date] || 0) + 1;
                });
                return {
                    series: Object.keys(grouped).map((date) => ({ date, count: grouped[date] })),
                };
            }
        ),

    getBuySellByCountry: () =>
        runWithSupabaseFallback(
            () => api.get("/buysellanalytics/country").then((r) => r.data),
            async () => {
                const { data } = await supabase.from("buy_sell").select("country, location");
                const counts = {};
                (data || []).forEach((i) => {
                    const loc = i.country || i.location || "Unknown";
                    counts[loc] = (counts[loc] || 0) + 1;
                });
                return Object.keys(counts).map((country) => ({ country, count: counts[country] }));
            }
        ),

    getBuySellApprovalRatio: () =>
        runWithSupabaseFallback(
            () => api.get("/buysellanalytics/ratio").then((r) => r.data),
            async () => {
                const { data } = await supabase.from("buy_sell").select("status");
                const items = data || [];
                const approved = items.filter((i) => i.status === "approved" || i.status === "active").length;
                const rejected = items.filter((i) => i.status === "rejected" || i.status === "blocked").length;
                return { approved, rejected, ratio: items.length > 0 ? (approved / items.length) * 100 : 0 };
            }
        ),

    getTravelOverview: (range) =>
        runWithSupabaseFallback(
            () => api.get(`/travelanalytics/analytics/travel/overview?range=${range}`).then((r) => r.data),
            async () => {
                const { data } = await supabase.from("travel_trips").select("status");
                const trips = data || [];
                return {
                    totalTrips: trips.length,
                    activeTrips: trips.filter((t) => t.status === "approved" || t.status === "active").length,
                    pendingTrips: trips.filter((t) => t.status === "pending").length,
                    completedTrips: trips.filter((t) => t.status === "completed").length,
                };
            }
        ),

    getTravelDailyTrend: (range) =>
        runWithSupabaseFallback(
            () => api.get(`/travelanalytics/analytics/travel/trend?range=${range}`).then((r) => r.data),
            async () => {
                const { data } = await supabase.from("travel_trips").select("created_at");
                const grouped = {};
                (data || []).forEach((t) => {
                    const date = t.created_at ? t.created_at.split("T")[0] : "Recent";
                    grouped[date] = (grouped[date] || 0) + 1;
                });
                return {
                    series: Object.keys(grouped).map((date) => ({ date, count: grouped[date] })),
                };
            }
        ),

    getTravelByCountry: () =>
        runWithSupabaseFallback(
            () => api.get("/travelanalytics/analytics/travel/countries").then((r) => r.data),
            async () => {
                const { data } = await supabase.from("travel_trips").select("origin, destination");
                const counts = {};
                (data || []).forEach((t) => {
                    const loc = t.destination || t.origin || "Unknown";
                    counts[loc] = (counts[loc] || 0) + 1;
                });
                return Object.keys(counts).map((country) => ({ country, count: counts[country] }));
            }
        ),

    getTravelMatchConversion: () =>
        runWithSupabaseFallback(
            () => api.get("/travelanalytics/analytics/travel/match-conversion").then((r) => r.data),
            async () => {
                const { data } = await supabase.from("travel_trips").select("status");
                const trips = data || [];
                return {
                    matchesRequested: trips.length,
                    matchesCompleted: trips.filter((t) => t.status === "completed").length,
                    conversionRate: 100,
                };
            }
        ),

    // Career Analytics
    getCareerJobsOverview: () =>
        runWithSupabaseFallback(
            () => api.get("/carreranalytics/jobs/overview").then((r) => r.data),
            async () => {
                const [jobsRes, appsRes] = await Promise.all([
                    supabase.from("jobs").select("status"),
                    supabase.from("job_applications").select("status"),
                ]);
                const jobs = jobsRes.data || [];
                const apps = appsRes.data || [];
                return {
                    totalJobs: jobs.length,
                    activeJobs: jobs.filter((j) => j.status === "Active" || j.status === "active").length,
                    totalApplications: apps.length,
                    shortlisted: apps.filter((a) => a.status === "Shortlisted" || a.status === "Interview").length,
                    hired: apps.filter((a) => a.status === "Hired").length,
                };
            }
        ),

    getCareerApplicationsFunnel: () =>
        runWithSupabaseFallback(
            () => api.get("/carreranalytics/applications/funnel").then((r) => r.data),
            async () => {
                const { data } = await supabase.from("job_applications").select("status");
                const apps = data || [];
                return [
                    { stage: "Applied", count: apps.length },
                    { stage: "Reviewing", count: apps.filter((a) => a.status === "Reviewing" || a.status === "pending").length },
                    { stage: "Interview", count: apps.filter((a) => a.status === "Interview" || a.status === "Shortlisted").length },
                    { stage: "Hired", count: apps.filter((a) => a.status === "Hired").length },
                ];
            }
        ),

    getCareerApplicationsTrend: (days = 30) =>
        runWithSupabaseFallback(
            () => api.get(`/carreranalytics/applications/trend?days=${days}`).then((r) => r.data),
            async () => {
                const { data } = await supabase.from("job_applications").select("created_at");
                const grouped = {};
                (data || []).forEach((a) => {
                    const date = a.created_at ? a.created_at.split("T")[0] : "Recent";
                    grouped[date] = (grouped[date] || 0) + 1;
                });
                return {
                    series: Object.keys(grouped).map((date) => ({ date, count: grouped[date] })),
                };
            }
        ),

    getCareerMostViewedJobs: () =>
        runWithSupabaseFallback(
            () => api.get("/carreranalytics/jobs/top-viewed").then((r) => r.data),
            async () => {
                const { data } = await supabase.from("jobs").select("id, title, department, status").limit(5);
                return data || [];
            }
        ),

    getCareerAdminActions: () =>
        runWithSupabaseFallback(
            () => api.get("/carreranalytics/admin/actions").then((r) => r.data),
            async () => {
                const { data } = await supabase.from("jobs").select("title, created_at").limit(5);
                return (data || []).map((j) => ({
                    action: `Job Posted: ${j.title}`,
                    timestamp: j.created_at,
                }));
            }
        ),

    // Users Analytics
    getUsersOverview: () =>
        runWithSupabaseFallback(
            () => api.get("/users/analytics/overview").then((r) => r.data),
            async () => {
                const { data } = await supabase.from("profiles").select("role, is_verified, is_approved, is_blocked");
                const profiles = data || [];
                return {
                    totalUsers: profiles.length,
                    activeUsers: profiles.filter((p) => !p.is_blocked).length,
                    verifiedUsers: profiles.filter((p) => p.is_verified).length,
                    hosts: profiles.filter((p) => p.role === "host").length,
                    blockedUsers: profiles.filter((p) => p.is_blocked).length,
                };
            }
        ),

    getUserSignupTrend: (days = 30) =>
        runWithSupabaseFallback(
            () => api.get(`/users/analytics/signup-trend?days=${days}`).then((r) => r.data),
            async () => {
                const { data } = await supabase.from("profiles").select("created_at");
                const grouped = {};
                (data || []).forEach((p) => {
                    const date = p.created_at ? p.created_at.split("T")[0] : "Recent";
                    grouped[date] = (grouped[date] || 0) + 1;
                });
                return {
                    series: Object.keys(grouped).map((date) => ({ date, count: grouped[date] })),
                };
            }
        ),

    getOtpFunnel: () =>
        runWithSupabaseFallback(
            () => api.get("/users/analytics/otp-funnel").then((r) => r.data),
            async () => {
                const { data } = await supabase.from("profiles").select("is_verified");
                const profiles = data || [];
                const verified = profiles.filter((p) => p.is_verified).length;
                return {
                    sent: profiles.length,
                    verified,
                    conversionRate: profiles.length > 0 ? (verified / profiles.length) * 100 : 100,
                };
            }
        ),

    getDailyActiveUsers: (days = 30) =>
        runWithSupabaseFallback(
            () => api.get(`/users/analytics/daily-active?days=${days}`).then((r) => r.data),
            async () => {
                const { data } = await supabase.from("profiles").select("created_at");
                const grouped = {};
                (data || []).forEach((p) => {
                    const date = p.created_at ? p.created_at.split("T")[0] : "Recent";
                    grouped[date] = (grouped[date] || 0) + 1;
                });
                return {
                    series: Object.keys(grouped).map((date) => ({ date, count: grouped[date] })),
                };
            }
        ),

    getUsersByCountry: () =>
        runWithSupabaseFallback(
            () => api.get("/users/analytics/by-country").then((r) => r.data),
            async () => {
                const { data } = await supabase.from("profiles").select("country, city");
                const counts = {};
                (data || []).forEach((p) => {
                    const loc = p.country || p.city || "Unknown";
                    counts[loc] = (counts[loc] || 0) + 1;
                });
                return Object.keys(counts).map((country) => ({ country, count: counts[country] }));
            }
        ),
};