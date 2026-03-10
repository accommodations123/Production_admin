import {
    User,
    CheckCircle,
    AlertCircle,
    FileText,
    Send,
    Calendar,
    ShoppingBag,
    Plane,
    Shuffle,
    Users,
    Briefcase,
    Eye,
    RefreshCw,
    FileCheck,
    LogIn,
    Shield,
    Globe,
    Activity
} from "lucide-react";

export const getHostStats = (analyticsSummary) => {
    if (!analyticsSummary?.hosts) return [];

    return [
        {
            title: "Hosts Created",
            value: analyticsSummary.hosts.created || 0,
            icon: User,
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
        },
        {
            title: "Hosts Approved",
            value: analyticsSummary.hosts.approved || 0,
            icon: CheckCircle,
            bgColor: "bg-green-50",
            textColor: "text-green-600",
        },
        {
            title: "Hosts Rejected",
            value: analyticsSummary.hosts.rejected || 0,
            icon: AlertCircle,
            bgColor: "bg-red-50",
            textColor: "text-red-600",
        },
    ];
};

export const getPropertyStats = (analyticsSummary) => {
    if (!analyticsSummary?.properties) return [];

    return [
        {
            title: "Properties Drafted",
            value: analyticsSummary.properties.drafted || 0,
            icon: FileText,
            bgColor: "bg-purple-50",
            textColor: "text-purple-600",
        },
        {
            title: "Properties Submitted",
            value: analyticsSummary.properties.submitted || 0,
            icon: Send,
            bgColor: "bg-yellow-50",
            textColor: "text-yellow-600",
        },
        {
            title: "Properties Approved",
            value: analyticsSummary.properties.approved || 0,
            icon: CheckCircle,
            bgColor: "bg-green-50",
            textColor: "text-green-600",
        },
        {
            title: "Properties Rejected",
            value: analyticsSummary.properties.rejected || 0,
            icon: AlertCircle,
            bgColor: "bg-red-50",
            textColor: "text-red-600",
        },
    ];
};

export const getEventStats = (eventAnalyticsSummary) => {
    if (!eventAnalyticsSummary?.stats) return [];

    return [
        {
            title: "Event Drafts",
            value: eventAnalyticsSummary.stats.drafts || 0,
            icon: FileText,
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
        },
        {
            title: "Events Submitted",
            value: eventAnalyticsSummary.stats.submitted || 0,
            icon: Calendar,
            bgColor: "bg-green-50",
            textColor: "text-green-600",
        },
        {
            title: "Events Approved",
            value: eventAnalyticsSummary.stats.approved || 0,
            icon: CheckCircle,
            bgColor: "bg-purple-50",
            textColor: "text-purple-600",
        },
        {
            title: "Events Rejected",
            value: eventAnalyticsSummary.stats.rejected || 0,
            icon: AlertCircle,
            bgColor: "bg-red-50",
            textColor: "text-red-600",
        },
    ];
};

export const getLocationDataForChart = (analyticsByLocation) => {
    if (!analyticsByLocation?.length) return { labels: [], values: [] };

    return {
        labels: analyticsByLocation.slice(0, 10).map(item => `${item.country}, ${item.state}`),
        values: analyticsByLocation.slice(0, 10).map(item => item.count)
    };
};

export const getEventLocationDataForChart = (eventAnalyticsByLocation) => {
    if (!eventAnalyticsByLocation?.length) return { labels: [], values: [] };

    return {
        labels: eventAnalyticsByLocation.slice(0, 10).map(item => `${item.country}, ${item.state}`),
        values: eventAnalyticsByLocation.slice(0, 10).map(item => item.total)
    };
};

export const getPropertyStatusData = (analyticsSummary) => {
    if (!analyticsSummary?.properties) return { labels: [], values: [] };

    return {
        labels: ['Drafted', 'Submitted', 'Approved', 'Rejected'],
        values: [
            analyticsSummary.properties.drafted || 0,
            analyticsSummary.properties.submitted || 0,
            analyticsSummary.properties.approved || 0,
            analyticsSummary.properties.rejected || 0
        ]
    };
};

export const getBuySellOverviewStats = (buySellOverview) => {
    if (!buySellOverview?.stats) return [];

    let approved = 0;
    let blocked = 0;

    buySellOverview.stats.forEach((s) => {
        if (s.event_type === "BUYSELL_LISTING_APPROVED") approved = parseInt(s.total || 0, 10);
        if (s.event_type === "BUYSELL_LISTING_BLOCKED") blocked = parseInt(s.total || 0, 10);
    });

    return [
        {
            title: "Total Listings",
            value: approved + blocked,
            icon: ShoppingBag,
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
        },
        {
            title: "Listings Approved",
            value: approved,
            icon: CheckCircle,
            bgColor: "bg-green-50",
            textColor: "text-green-600",
        },
        {
            title: "Listings Blocked",
            value: blocked,
            icon: AlertCircle,
            bgColor: "bg-red-50",
            textColor: "text-red-600",
        },
    ];
};

export const getBuySellTrendData = (buySellTrend, selectedRange) => {
    if (!buySellTrend?.trend) return { labels: [], datasets: [] };

    let days = 30;
    if (selectedRange === '7d') days = 7;
    if (selectedRange === '90d') days = 90;

    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }

    const approvedMap = {};
    const blockedMap = {};

    buySellTrend.trend.forEach((item) => {
        const d = item.date;
        const val = parseInt(item.count, 10);
        if (item.event_type === "BUYSELL_LISTING_APPROVED") approvedMap[d] = val;
        else if (item.event_type === "BUYSELL_LISTING_BLOCKED") blockedMap[d] = val;
    });

    const approvedData = dates.map(date => approvedMap[date] || 0);
    const blockedData = dates.map(date => blockedMap[date] || 0);

    return {
        labels: dates,
        datasets: [
            {
                label: "Approved",
                data: approvedData,
                borderColor: "#10B981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
            },
            {
                label: "Blocked",
                data: blockedData,
                borderColor: "#EF4444",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
            },
        ],
    };
};

export const getBuySellCountryData = (buySellCountry) => {
    if (!buySellCountry?.data) return { labels: [], values: [] };

    const sorted = [...buySellCountry.data].sort((a, b) => parseInt(b.total) - parseInt(a.total));
    const top10 = sorted.slice(0, 10);

    return {
        labels: top10.map(i => i.country || "Unknown"),
        values: top10.map(i => parseInt(i.total || 0, 10)),
    };
};

export const getBuySellRatioData = (buySellRatio) => {
    if (!buySellRatio?.stats) return { labels: [], values: [] };

    let approved = 0;
    let blocked = 0;
    buySellRatio.stats.forEach((s) => {
        if (s.event_type === "BUYSELL_LISTING_APPROVED") approved = parseInt(s.total);
        if (s.event_type === "BUYSELL_LISTING_BLOCKED") blocked = parseInt(s.total);
    });

    return {
        labels: ["Approved", "Blocked"],
        values: [approved, blocked],
    };
};

export const getHostStatusData = (analyticsSummary) => {
    if (!analyticsSummary?.hosts) return { labels: [], values: [] };

    return {
        labels: ['Created', 'Approved', 'Rejected'],
        values: [
            analyticsSummary.hosts.created || 0,
            analyticsSummary.hosts.approved || 0,
            analyticsSummary.hosts.rejected || 0
        ]
    };
};

export const getTravelStats = (travelOverview) => {
    if (!travelOverview?.stats) return [];

    let created = 0;
    let requested = 0;
    let accepted = 0;

    travelOverview.stats.forEach((s) => {
        if (s.event_type === "TRAVEL_TRIP_CREATED") created = parseInt(s.total || 0, 10);
        else if (s.event_type === "TRAVEL_MATCH_REQUESTED") requested = parseInt(s.total || 0, 10);
        else if (s.event_type === "TRAVEL_MATCH_ACCEPTED") accepted = parseInt(s.total || 0, 10);
    });

    return [
        {
            title: "Trips Created",
            value: created,
            icon: Plane,
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
        },
        {
            title: "Matches Requested",
            value: requested,
            icon: Shuffle,
            bgColor: "bg-purple-50",
            textColor: "text-purple-600",
        },
        {
            title: "Matches Accepted",
            value: accepted,
            icon: CheckCircle,
            bgColor: "bg-green-50",
            textColor: "text-green-600",
        },
    ];
};

export const getTravelTrendData = (travelTrend) => {
    if (!travelTrend?.trend) return { labels: [], datasets: [] };

    const labelsSet = new Set();
    const createdMap = {};
    const requestedMap = {};
    const acceptedMap = {};

    travelTrend.trend.forEach((item) => {
        const d = item.date;
        labelsSet.add(d);
        const val = parseInt(item.count, 10);
        if (item.event_type === "TRAVEL_TRIP_CREATED") createdMap[d] = val;
        else if (item.event_type === "TRAVEL_MATCH_REQUESTED") requestedMap[d] = val;
        else if (item.event_type === "TRAVEL_MATCH_ACCEPTED") acceptedMap[d] = val;
    });

    const labels = Array.from(labelsSet).sort();

    return {
        labels,
        datasets: [
            {
                label: "Trips Created",
                data: labels.map(l => createdMap[l] || 0),
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
            },
            {
                label: "Matches Requested",
                data: labels.map(l => requestedMap[l] || 0),
                borderColor: "#8B5CF6",
                backgroundColor: "rgba(139, 92, 246, 0.1)",
            },
            {
                label: "Matches Accepted",
                data: labels.map(l => acceptedMap[l] || 0),
                borderColor: "#10B981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
            }
        ]
    };
};

export const getTravelCountryData = (travelCountry) => {
    if (!travelCountry?.data) return { labels: [], values: [] };

    const sorted = [...travelCountry.data].sort((a, b) => parseInt(b.total) - parseInt(a.total));
    const top10 = sorted.slice(0, 10);

    return {
        labels: top10.map(i => i.country || "Unknown"),
        values: top10.map(i => parseInt(i.total || 0, 10)),
    };
};

export const getTravelMatchConversionData = (travelMatchConversion) => {
    if (!travelMatchConversion?.stats) return { labels: [], values: [] };

    let requested = 0;
    let accepted = 0;
    let rejected = 0;

    travelMatchConversion.stats.forEach((s) => {
        if (s.event_type === "TRAVEL_MATCH_REQUESTED") requested = parseInt(s.total || 0, 10);
        else if (s.event_type === "TRAVEL_MATCH_ACCEPTED") accepted = parseInt(s.total || 0, 10);
        else if (s.event_type === "TRAVEL_MATCH_REJECTED") rejected = parseInt(s.total || 0, 10);
    });

    return {
        labels: ["Requested", "Accepted", "Rejected"],
        values: [requested, accepted, rejected],
    };
};

export const getCommunityStats = (communityOverview) => {
    if (!communityOverview?.stats) return [];

    let created = 0;
    let approved = 0;
    let rejected = 0;

    communityOverview.stats.forEach((s) => {
        if (s.event_type === "COMMUNITY_CREATED") created = parseInt(s.total || 0, 10);
        else if (s.event_type === "COMMUNITY_APPROVED") approved = parseInt(s.total || 0, 10);
        else if (s.event_type === "COMMUNITY_REJECTED") rejected = parseInt(s.total || 0, 10);
    });

    return [
        {
            title: "Communities Created",
            value: created,
            icon: Users,
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
        },
        {
            title: "Communities Approved",
            value: approved,
            icon: CheckCircle,
            bgColor: "bg-green-50",
            textColor: "text-green-600",
        },
        {
            title: "Communities Rejected",
            value: rejected,
            icon: AlertCircle,
            bgColor: "bg-red-50",
            textColor: "text-red-600",
        },
    ];
};

export const getCommunityTrendData = (communityTrend) => {
    if (!communityTrend?.trend) return { labels: [], datasets: [] };

    const labelsSet = new Set();
    const createdMap = {};
    const approvedMap = {};

    communityTrend.trend.forEach((item) => {
        const d = item.date;
        labelsSet.add(d);
        const val = parseInt(item.count, 10);
        if (item.event_type === "COMMUNITY_CREATED") createdMap[d] = val;
        else if (item.event_type === "COMMUNITY_APPROVED") approvedMap[d] = val;
    });

    const labels = Array.from(labelsSet).sort();

    return {
        labels,
        datasets: [
            {
                label: "Created",
                data: labels.map(l => createdMap[l] || 0),
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
            },
            {
                label: "Approved",
                data: labels.map(l => approvedMap[l] || 0),
                borderColor: "#10B981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
            },
        ]
    };
};

export const getCommunityCountryData = (communityCountry) => {
    if (!communityCountry?.data) return { labels: [], values: [] };
    const sorted = [...communityCountry.data].sort((a, b) => parseInt(b.total) - parseInt(a.total));
    const top10 = sorted.slice(0, 10);
    return {
        labels: top10.map(i => i.country || "Unknown"),
        values: top10.map(i => parseInt(i.total || 0, 10)),
    };
};

export const getCommunityRatioData = (communityRatio) => {
    if (!communityRatio?.stats) return { labels: [], values: [] };
    let approved = 0;
    let rejected = 0;
    communityRatio.stats.forEach(s => {
        if (s.event_type === "COMMUNITY_APPROVED") approved = parseInt(s.total);
        if (s.event_type === "COMMUNITY_REJECTED") rejected = parseInt(s.total);
    });
    return {
        labels: ["Approved", "Rejected"],
        values: [approved, rejected],
    };
};

/* =====================================================
   📊 CAREER ANALYTICS UTILITIES
===================================================== */

export const getCareerJobsStats = (careerJobsOverview) => {
    if (!careerJobsOverview?.stats) return [];

    let created = 0;
    let viewed = 0;
    let statusChanged = 0;

    careerJobsOverview.stats.forEach((s) => {
        if (s.event_type === "JOB_CREATED") created = parseInt(s.total || 0, 10);
        else if (s.event_type === "JOB_VIEWED") viewed = parseInt(s.total || 0, 10);
        else if (s.event_type === "JOB_STATUS_CHANGED") statusChanged = parseInt(s.total || 0, 10);
    });

    return [
        {
            title: "Jobs Created",
            value: created,
            icon: Briefcase,
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
        },
        {
            title: "Jobs Viewed",
            value: viewed,
            icon: Eye,
            bgColor: "bg-purple-50",
            textColor: "text-purple-600",
        },
        {
            title: "Status Changes",
            value: statusChanged,
            icon: RefreshCw,
            bgColor: "bg-yellow-50",
            textColor: "text-yellow-600",
        },
    ];
};

export const getCareerFunnelData = (careerApplicationsFunnel) => {
    if (!careerApplicationsFunnel?.funnel) return { labels: [], values: [] };

    const funnel = careerApplicationsFunnel.funnel;

    return {
        labels: funnel.map(item => item.status || "Unknown"),
        values: funnel.map(item => parseInt(item.total || 0, 10)),
    };
};

export const getCareerTrendData = (careerApplicationsTrend) => {
    if (!careerApplicationsTrend?.trend) return { labels: [], datasets: [] };

    const trend = careerApplicationsTrend.trend;

    return {
        labels: trend.map(item => item.date),
        datasets: [
            {
                label: "Applications",
                data: trend.map(item => parseInt(item.count || 0, 10)),
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
            },
        ],
    };
};

export const getCareerAdminActionsStats = (careerAdminActions) => {
    if (!careerAdminActions?.stats) return [];

    let jobCreated = 0;
    let jobStatusChanged = 0;
    let appStatusChanged = 0;
    let userNotified = 0;

    careerAdminActions.stats.forEach((s) => {
        if (s.event_type === "JOB_CREATED") jobCreated = parseInt(s.total || 0, 10);
        else if (s.event_type === "JOB_STATUS_CHANGED") jobStatusChanged = parseInt(s.total || 0, 10);
        else if (s.event_type === "APPLICATION_STATUS_CHANGED") appStatusChanged = parseInt(s.total || 0, 10);
        else if (s.event_type === "APPLICATION_USER_NOTIFIED") userNotified = parseInt(s.total || 0, 10);
    });

    return [
        {
            title: "Jobs Created",
            value: jobCreated,
            icon: Briefcase,
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
        },
        {
            title: "Job Status Changes",
            value: jobStatusChanged,
            icon: RefreshCw,
            bgColor: "bg-yellow-50",
            textColor: "text-yellow-600",
        },
        {
            title: "App Status Changes",
            value: appStatusChanged,
            icon: FileCheck,
            bgColor: "bg-green-50",
            textColor: "text-green-600",
        },
        {
            title: "Users Notified",
            value: userNotified,
            icon: Send,
            bgColor: "bg-purple-50",
            textColor: "text-purple-600",
        },
    ];
};

/* =====================================================
   👤 USER ANALYTICS UTILITIES
===================================================== */

export const getUsersOverviewStats = (usersOverview) => {
    if (!usersOverview?.stats) return [];

    let registered = 0;
    let verified = 0;
    let logins = 0;

    usersOverview.stats.forEach((s) => {
        if (s.event_type === "USER_REGISTERED") registered = parseInt(s.total || 0, 10);
        else if (s.event_type === "OTP_VERIFIED") verified = parseInt(s.total || 0, 10);
        else if (s.event_type === "USER_LOGIN") logins = parseInt(s.total || 0, 10);
    });

    return [
        {
            title: "Users Registered",
            value: registered,
            icon: User,
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
        },
        {
            title: "OTP Verified",
            value: verified,
            icon: Shield,
            bgColor: "bg-green-50",
            textColor: "text-green-600",
        },
        {
            title: "User Logins",
            value: logins,
            icon: LogIn,
            bgColor: "bg-purple-50",
            textColor: "text-purple-600",
        },
    ];
};

export const getUserSignupTrendData = (signupTrend) => {
    if (!signupTrend?.trend) return { labels: [], datasets: [] };

    const trend = signupTrend.trend;

    return {
        labels: trend.map(item => item.date),
        datasets: [
            {
                label: "Signups",
                data: trend.map(item => parseInt(item.count || 0, 10)),
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
            },
        ],
    };
};

export const getOtpFunnelData = (otpFunnel) => {
    if (!otpFunnel?.funnel) return { labels: [], values: [] };

    let sent = 0;
    let verified = 0;
    let failed = 0;

    otpFunnel.funnel.forEach((s) => {
        if (s.event_type === "OTP_SENT") sent = parseInt(s.total || 0, 10);
        else if (s.event_type === "OTP_VERIFIED") verified = parseInt(s.total || 0, 10);
        else if (s.event_type === "OTP_VERIFICATION_FAILED") failed = parseInt(s.total || 0, 10);
    });

    return {
        labels: ["OTP Sent", "OTP Verified", "OTP Failed"],
        values: [sent, verified, failed],
    };
};

export const getDailyActiveUsersData = (dauData) => {
    if (!dauData?.data) return { labels: [], datasets: [] };

    const data = dauData.data;

    return {
        labels: data.map(item => item.date),
        datasets: [
            {
                label: "Active Users",
                data: data.map(item => parseInt(item.active_users || 0, 10)),
                borderColor: "#10B981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
            },
        ],
    };
};

export const getUsersByCountryData = (countryData) => {
    if (!countryData?.data) return { labels: [], values: [] };

    const sorted = [...countryData.data].sort((a, b) => parseInt(b.total) - parseInt(a.total));
    const top10 = sorted.slice(0, 10);

    return {
        labels: top10.map(i => i.country || "Unknown"),
        values: top10.map(i => parseInt(i.total || 0, 10)),
    };
};
