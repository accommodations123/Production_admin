import axios from "axios";

/* ======================================================
   AXIOS INSTANCE
====================================================== */

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://35.153.223.230:5000";

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("admin-auth");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
   DASHBOARD API
====================================================== */

export const dashboardAPI = {
    getAnalyticsSummary: () =>
        api.get("/analytics/summary").then((r) => r.data),

    getAnalyticsTimeseries: (event, range) =>
        api
            .get(`/analytics/timeseries?event=${event}&range=${range}`)
            .then((r) => r.data),

    getAnalyticsByLocation: (event) =>
        api
            .get(`/analytics/by-location?event=${event}`)
            .then((r) => r.data),

    getEventAnalyticsSummary: () =>
        api.get("/eventanalytics/summary").then((r) => r.data),

    getEventEngagementTimeseries: (type, days) =>
        api
            .get(`/eventanalytics/engagement?type=${type}&days=${days}`)
            .then((r) => r.data),

    getEventAnalyticsByLocation: () =>
        api.get("/eventanalytics/by-location").then((r) => r.data),

    getBuySellOverview: (range) =>
        api.get(`/buysellanalytics/overview?range=${range}`).then((r) => r.data),

    getBuySellDailyTrend: (range) =>
        api.get(`/buysellanalytics/trend?range=${range}`).then((r) => r.data),

    getBuySellByCountry: () =>
        api.get("/buysellanalytics/country").then((r) => r.data),

    getBuySellApprovalRatio: () =>
        api.get("/buysellanalytics/ratio").then((r) => r.data),

    getTravelOverview: (range) =>
        api.get(`/travelanalytics/analytics/travel/overview?range=${range}`).then((r) => r.data),

    getTravelDailyTrend: (range) =>
        api.get(`/travelanalytics/analytics/travel/trend?range=${range}`).then((r) => r.data),

    getTravelByCountry: () =>
        api.get("/travelanalytics/analytics/travel/countries").then((r) => r.data),

    getTravelMatchConversion: () =>
        api.get("/travelanalytics/analytics/travel/match-conversion").then((r) => r.data),


    // Career Analytics
    getCareerJobsOverview: () =>
        api.get("/carreranalytics/jobs/overview").then((r) => r.data),

    getCareerApplicationsFunnel: () =>
        api.get("/carreranalytics/applications/funnel").then((r) => r.data),

    getCareerApplicationsTrend: (days = 30) =>
        api.get(`/carreranalytics/applications/trend?days=${days}`).then((r) => r.data),

    getCareerMostViewedJobs: () =>
        api.get("/carreranalytics/jobs/top-viewed").then((r) => r.data),

    getCareerAdminActions: () =>
        api.get("/carreranalytics/admin/actions").then((r) => r.data),

    // Users Analytics
    getUsersOverview: () =>
        api.get("/users/analytics/overview").then((r) => r.data),

    getUserSignupTrend: (days = 30) =>
        api.get(`/users/analytics/signup-trend?days=${days}`).then((r) => r.data),

    getOtpFunnel: () =>
        api.get("/users/analytics/otp-funnel").then((r) => r.data),

    getDailyActiveUsers: (days = 30) =>
        api.get(`/users/analytics/daily-active?days=${days}`).then((r) => r.data),

    getUsersByCountry: () =>
        api.get("/users/analytics/by-country").then((r) => r.data),
};