import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  AlertCircle,
  Building,
  Calendar,
  Briefcase,
  UserPlus,
  FileText,
  Settings,
  Download,
  FileSpreadsheet,
  X,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react"

// --- NEW IMPORTS FOR EXPORT ---


// Services & Hooks
import { dashboardAPI } from "../services/dashboardService";
import { useApi } from "../hooks/useApi";

// Utils
import * as Utils from "../utils/dashboardUtils";

// Components
import OverviewSection from "../components/dashboard/sections/OverviewSection";
import EventsSection from "../components/dashboard/sections/EventsSection";
import AccommodationsSection from "../components/dashboard/sections/AccommodationsSection";
import BuySellSection from "../components/dashboard/sections/BuySellSection";
import TravelSection from "../components/dashboard/sections/TravelSection";
import CommunitiesSection from "../components/dashboard/sections/CommunitiesSection";
import CareersSection from "../components/dashboard/sections/CareersSection";
import UsersSection from "../components/dashboard/sections/UsersSection";

/* ═══════════════════════════════════════════════════════════════
   TAB CONFIGURATION
   ═══════════════════════════════════════════════════════════════ */
const TABS = [
  { key: 'overview', label: 'Overview', icon: TrendingUp },
  { key: 'accommodations', label: 'Accommodation', icon: Building },
  { key: 'events', label: 'Events', icon: Calendar },
  { key: 'buysell', label: 'Buy / Sell', icon: null },
  { key: 'travel', label: 'Travel', icon: null },
  { key: 'communities', label: 'Communities', icon: null },
  { key: 'careers', label: 'Careers', icon: Briefcase },
  { key: 'users', label: 'Users', icon: UserPlus },
];

const RANGES = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
];

const QUICK_ACTIONS = [
  { icon: Building, label: 'Add Property', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Calendar, label: 'Create Event', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Briefcase, label: 'Post Job', color: 'text-violet-600', bg: 'bg-violet-50' },
  { icon: UserPlus, label: 'Add User', color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: FileText, label: 'Reports', color: 'text-rose-600', bg: 'bg-rose-50' },
  { icon: Settings, label: 'Settings', color: 'text-slate-600', bg: 'bg-slate-100' },
];

/* ═══════════════════════════════════════════════════════════════ */

const Dashboard = () => {
  const [timeGreeting, setTimeGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedEvent, setSelectedEvent] = useState("HOST_CREATED");
  const [selectedRange, setSelectedRange] = useState("30d");

  // State for Export Menu
  const [showExportMenu, setShowExportMenu] = useState(false);

  // --- API Calls (Existing Logic — UNCHANGED) ---
  const {
    data: analyticsSummary,
    loading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useApi(() => dashboardAPI.getAnalyticsSummary(), []);

  const {
    data: analyticsTimeseries,
    loading: timeseriesLoading,
    refetch: refetchTimeseries,
  } = useApi(
    () => dashboardAPI.getAnalyticsTimeseries(selectedEvent, selectedRange),
    [selectedEvent, selectedRange]
  );

  const {
    data: analyticsByLocation,
    loading: locationLoading,
    refetch: refetchLocation,
  } = useApi(() => dashboardAPI.getAnalyticsByLocation(selectedEvent), [selectedEvent]);

  const {
    data: eventAnalyticsSummary,
    loading: eventSummaryLoading,
    refetch: refetchEventSummary,
  } = useApi(() => dashboardAPI.getEventAnalyticsSummary(), []);

  const {
    data: eventEngagementTimeseries,
    loading: eventEngagementLoading,
    refetch: refetchEventEngagement,
  } = useApi(() => dashboardAPI.getEventEngagementTimeseries("EVENT_JOINED", 30), []);

  const {
    data: eventAnalyticsByLocation,
    loading: eventLocationLoading,
    refetch: refetchEventLocation,
  } = useApi(() => dashboardAPI.getEventAnalyticsByLocation(), []);

  const {
    data: buySellOverview,
    loading: buySellOverviewLoading,
    refetch: refetchBuySellOverview,
  } = useApi(() => dashboardAPI.getBuySellOverview(selectedRange), [selectedRange]);

  const {
    data: buySellTrend,
    loading: buySellTrendLoading,
    refetch: refetchBuySellTrend,
  } = useApi(() => dashboardAPI.getBuySellDailyTrend(selectedRange), [selectedRange]);

  const {
    data: buySellCountry,
    loading: buySellCountryLoading,
    refetch: refetchBuySellCountry,
  } = useApi(() => dashboardAPI.getBuySellByCountry(), []);

  const {
    data: buySellRatio,
    loading: buySellRatioLoading,
    refetch: refetchBuySellRatio,
  } = useApi(() => dashboardAPI.getBuySellApprovalRatio(), []);

  const {
    data: travelOverview,
    loading: travelOverviewLoading,
    refetch: refetchTravelOverview,
  } = useApi(() => dashboardAPI.getTravelOverview(selectedRange), [selectedRange]);

  const {
    data: travelTrend,
    loading: travelTrendLoading,
    refetch: refetchTravelTrend,
  } = useApi(() => dashboardAPI.getTravelDailyTrend(selectedRange), [selectedRange]);

  const {
    data: travelCountry,
    loading: travelCountryLoading,
    refetch: refetchTravelCountry,
  } = useApi(() => dashboardAPI.getTravelByCountry(), []);

  const {
    data: travelMatchConversion,
    loading: travelMatchConversionLoading,
    refetch: refetchTravelMatchConversion,
  } = useApi(() => dashboardAPI.getTravelMatchConversion(), []);

  const {
    data: communityOverview,
    loading: communityOverviewLoading,
    refetch: refetchCommunityOverview,
  } = useApi(() => dashboardAPI.getCommunityOverview(selectedRange), [selectedRange]);

  const {
    data: communityTrend,
    loading: communityTrendLoading,
    refetch: refetchCommunityTrend,
  } = useApi(() => dashboardAPI.getCommunityDailyTrend(selectedRange), [selectedRange]);

  const {
    data: communityCountry,
    loading: communityCountryLoading,
    refetch: refetchCommunityCountry,
  } = useApi(() => dashboardAPI.getCommunityByCountry(), []);

  const {
    data: communityRatio,
    loading: communityRatioLoading,
    refetch: refetchCommunityRatio,
  } = useApi(() => dashboardAPI.getCommunityApprovalRatio(), []);

  const {
    data: communityMembership,
    loading: communityMembershipLoading,
    refetch: refetchCommunityMembership,
  } = useApi(() => dashboardAPI.getCommunityMembershipActivity(), []);

  // Career Analytics
  const {
    data: careerJobsOverview,
    loading: careerJobsLoading,
    refetch: refetchCareerJobs,
  } = useApi(() => dashboardAPI.getCareerJobsOverview(), []);

  const {
    data: careerApplicationsFunnel,
    loading: careerFunnelLoading,
    refetch: refetchCareerFunnel,
  } = useApi(() => dashboardAPI.getCareerApplicationsFunnel(), []);

  const {
    data: careerApplicationsTrend,
    loading: careerTrendLoading,
    refetch: refetchCareerTrend,
  } = useApi(() => dashboardAPI.getCareerApplicationsTrend(30), []);

  const {
    data: careerMostViewedJobs,
    loading: careerMostViewedLoading,
    refetch: refetchCareerMostViewed,
  } = useApi(() => dashboardAPI.getCareerMostViewedJobs(), []);

  const {
    data: careerAdminActions,
    loading: careerAdminActionsLoading,
    refetch: refetchCareerAdminActions,
  } = useApi(() => dashboardAPI.getCareerAdminActions(), []);

  // Users Analytics
  const {
    data: usersOverview,
    loading: usersOverviewLoading,
    refetch: refetchUsersOverview,
  } = useApi(() => dashboardAPI.getUsersOverview(), []);

  const {
    data: userSignupTrend,
    loading: signupTrendLoading,
    refetch: refetchSignupTrend,
  } = useApi(() => dashboardAPI.getUserSignupTrend(30), []);

  const {
    data: otpFunnel,
    loading: otpFunnelLoading,
    refetch: refetchOtpFunnel,
  } = useApi(() => dashboardAPI.getOtpFunnel(), []);

  const {
    data: dailyActiveUsers,
    loading: dauLoading,
    refetch: refetchDau,
  } = useApi(() => dashboardAPI.getDailyActiveUsers(30), []);

  const {
    data: usersByCountry,
    loading: usersCountryLoading,
    refetch: refetchUsersCountry,
  } = useApi(() => dashboardAPI.getUsersByCountry(), []);

  const hasError = summaryError;

  // --- REFRESH LOGIC ---
  const handleRefresh = () => {
    setRefreshing(true);
    refetchSummary();
    refetchTimeseries();
    refetchLocation();
    refetchEventSummary();
    refetchEventEngagement();
    refetchEventLocation();
    refetchBuySellOverview();
    refetchBuySellTrend();
    refetchBuySellCountry();
    refetchBuySellRatio();
    refetchTravelOverview();
    refetchTravelTrend();
    refetchTravelCountry();
    refetchTravelMatchConversion();
    refetchCommunityOverview();
    refetchCommunityTrend();
    refetchCommunityCountry();
    refetchCommunityRatio();
    refetchCommunityMembership();
    refetchCareerJobs();
    refetchCareerFunnel();
    refetchCareerTrend();
    refetchCareerMostViewed();
    refetchCareerAdminActions();
    refetchUsersOverview();
    refetchSignupTrend();
    refetchOtpFunnel();
    refetchDau();
    refetchUsersCountry();

    setTimeout(() => setRefreshing(false), 1200);
  };

  // --- EXPORT TO EXCEL LOGIC ---
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const summaryData = [
      ...Utils.getHostStats(analyticsSummary).map(s => ({ Section: "Host", ...s })),
      ...Utils.getPropertyStats(analyticsSummary).map(s => ({ Section: "Property", ...s })),
      ...Utils.getEventStats(eventAnalyticsSummary).map(s => ({ Section: "Event", ...s })),
      ...Utils.getBuySellOverviewStats(buySellOverview).map(s => ({ Section: "Buy/Sell", ...s })),
      ...Utils.getTravelStats(travelOverview).map(s => ({ Section: "Travel", ...s })),
      ...Utils.getCommunityStats(communityOverview).map(s => ({ Section: "Community", ...s }))
    ];
    if (summaryData.length > 0) {
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Overview Summary");
    }
    if (analyticsTimeseries?.labels) {
      const timeseriesTable = analyticsTimeseries.labels.map((label, index) => {
        let row = { Date: label };
        analyticsTimeseries.datasets.forEach(dataset => {
          row[dataset.label] = dataset.data[index];
        });
        return row;
      });
      const wsTimeseries = XLSX.utils.json_to_sheet(timeseriesTable);
      XLSX.utils.book_append_sheet(wb, wsTimeseries, "Time Series");
    }
    if (analyticsByLocation?.length > 0) {
      const wsLocation = XLSX.utils.json_to_sheet(analyticsByLocation);
      XLSX.utils.book_append_sheet(wb, wsLocation, "By Location");
    }
    if (buySellOverview?.length > 0) {
      const wsBuySell = XLSX.utils.json_to_sheet(buySellOverview);
      XLSX.utils.book_append_sheet(wb, wsBuySell, "Buy/Sell Details");
    }
    if (travelOverview?.length > 0) {
      const wsTravel = XLSX.utils.json_to_sheet(travelOverview);
      XLSX.utils.book_append_sheet(wb, wsTravel, "Travel Details");
    }
    XLSX.writeFile(wb, `Dashboard_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setShowExportMenu(false);
  };

  // --- EXPORT TO PDF LOGIC ---
  const handleExportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Platform Analytics Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    const summaryData = [
      ...Utils.getHostStats(analyticsSummary).map(s => ({ ...s })),
      ...Utils.getPropertyStats(analyticsSummary).map(s => ({ ...s })),
      ...Utils.getEventStats(eventAnalyticsSummary).map(s => ({ ...s })),
    ];
    if (summaryData.length > 0) {
      doc.autoTable({
        head: [['Label', 'Value', 'Trend']],
        body: summaryData.map(s => [s.label, s.value, s.trend || '-']),
        startY: 40,
      });
    }
    if (analyticsTimeseries?.labels) {
      const flatData = analyticsTimeseries.labels.map((label, index) => {
        let row = { Date: label };
        analyticsTimeseries.datasets.forEach(ds => {
          row[ds.label] = ds.data[index];
        });
        return row;
      });
      const headers = Object.keys(flatData[0] || {});
      doc.autoTable({
        head: [headers],
        body: flatData.map(row => headers.map(h => row[h])),
        startY: doc.lastAutoTable.finalY + 20,
      });
    }
    doc.save(`Dashboard_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    setShowExportMenu(false);
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeGreeting("Good morning");
    else if (hour < 18) setTimeGreeting("Good afternoon");
    else setTimeGreeting("Good evening");

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isLoading = summaryLoading || timeseriesLoading || locationLoading ||
    eventSummaryLoading || eventEngagementLoading || eventLocationLoading ||
    buySellOverviewLoading || buySellTrendLoading || buySellCountryLoading || buySellRatioLoading ||
    travelOverviewLoading || travelTrendLoading || travelCountryLoading || travelMatchConversionLoading ||
    communityOverviewLoading || communityTrendLoading || communityCountryLoading || communityRatioLoading || communityMembershipLoading;

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen relative">
      <main className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ── Welcome Card ──────────────────────────────────── */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {timeGreeting}, Admin
                  </h1>
                  <span className="text-2xl">👋</span>
                </div>
                <p className="text-slate-500 text-sm">
                  Here's what's happening across your platform today.
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {currentTime.toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })} at {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 relative">
                {/* Export Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                  >
                    <Download size={15} />
                    Export
                  </button>

                  {showExportMenu && (
                    <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-slide-up">
                      <button
                        onClick={handleExportExcel}
                        className="w-full flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <FileSpreadsheet size={15} className="mr-3 text-emerald-600" />
                        Excel (.xlsx)
                      </button>
                      <button
                        onClick={handleExportPdf}
                        className="w-full flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-100"
                      >
                        <FileText size={15} className="mr-3 text-rose-500" />
                        PDF Report
                      </button>
                    </div>
                  )}
                </div>

                {/* Refresh */}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className={`inline-flex items-center gap-2 px-4 py-2 bg-[#cb2926] text-white rounded-xl text-sm font-medium 
                    hover:bg-[#a71f1c] transition-all shadow-sm shadow-red-200 disabled:opacity-60 ${refreshing ? 'cursor-wait' : ''}`}
                >
                  <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* ── Error Banner ──────────────────────────────────── */}
          {hasError && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 text-sm animate-fade-in">
              <AlertCircle size={18} className="shrink-0" />
              <span className="flex-1">{summaryError}</span>
              <button onClick={() => { }} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
                <X size={14} />
              </button>
            </div>
          )}

          {/* ── Tab Bar + Range Selector ──────────────────────── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Tabs */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-1.5 flex gap-1 overflow-x-auto no-scrollbar">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSection(tab.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
                    ${activeSection === tab.key
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Range Selector */}
            <div className="flex gap-1 bg-white border border-slate-200/80 rounded-xl p-1">
              {RANGES.map((range) => (
                <button
                  key={range.key}
                  onClick={() => setSelectedRange(range.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                    ${selectedRange === range.key
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── CONTENT SECTIONS (unchanged props) ────────────── */}
          <div className="animate-fade-in">
            {activeSection === 'overview' && (
              <OverviewSection
                loading={summaryLoading}
                error={summaryError}
                getHostStats={() => Utils.getHostStats(analyticsSummary)}
                getPropertyStats={() => Utils.getPropertyStats(analyticsSummary)}
                getEventStats={() => Utils.getEventStats(eventAnalyticsSummary)}
                getBuySellOverviewStats={() => Utils.getBuySellOverviewStats(buySellOverview)}
                getTravelStats={() => Utils.getTravelStats(travelOverview)}
                getCommunityStats={() => Utils.getCommunityStats(communityOverview)}
                analyticsTimeseries={analyticsTimeseries}
                timeseriesLoading={timeseriesLoading}
                selectedEvent={selectedEvent}
                setSelectedEvent={setSelectedEvent}
                analyticsByLocation={analyticsByLocation}
                locationLoading={locationLoading}
                getLocationDataForChart={() => Utils.getLocationDataForChart(analyticsByLocation)}
              />
            )}

            {activeSection === 'events' && (
              <EventsSection
                loading={eventSummaryLoading}
                getEventStats={() => Utils.getEventStats(eventAnalyticsSummary)}
                eventEngagementTimeseries={eventEngagementTimeseries}
                eventEngagementLoading={eventEngagementLoading}
                eventAnalyticsByLocation={eventAnalyticsByLocation}
                eventLocationLoading={eventLocationLoading}
                getEventLocationDataForChart={() => Utils.getEventLocationDataForChart(eventAnalyticsByLocation)}
              />
            )}

            {activeSection === 'accommodations' && (
              <AccommodationsSection
                loading={summaryLoading}
                getPropertyStats={() => Utils.getPropertyStats(analyticsSummary)}
                getPropertyStatusData={() => Utils.getPropertyStatusData(analyticsSummary)}
                getHostStatusData={() => Utils.getHostStatusData(analyticsSummary)}
              />
            )}

            {activeSection === 'buysell' && (
              <BuySellSection
                loading={buySellOverviewLoading}
                getBuySellOverviewStats={() => Utils.getBuySellOverviewStats(buySellOverview)}
                buySellTrendLoading={buySellTrendLoading}
                getBuySellTrendData={() => Utils.getBuySellTrendData(buySellTrend, selectedRange)}
                buySellCountryLoading={buySellCountryLoading}
                getBuySellCountryData={() => Utils.getBuySellCountryData(buySellCountry)}
                buySellRatioLoading={buySellRatioLoading}
                getBuySellRatioData={() => Utils.getBuySellRatioData(buySellRatio)}
              />
            )}

            {activeSection === 'travel' && (
              <TravelSection
                loading={travelOverviewLoading}
                getTravelStats={() => Utils.getTravelStats(travelOverview)}
                travelTrendLoading={travelTrendLoading}
                getTravelTrendData={() => Utils.getTravelTrendData(travelTrend)}
                travelCountryLoading={travelCountryLoading}
                getTravelCountryData={() => Utils.getTravelCountryData(travelCountry)}
                travelMatchConversionLoading={travelMatchConversionLoading}
                getTravelMatchConversionData={() => Utils.getTravelMatchConversionData(travelMatchConversion)}
              />
            )}

            {activeSection === 'communities' && (
              <CommunitiesSection
                loading={communityOverviewLoading}
                getCommunityStats={() => Utils.getCommunityStats(communityOverview)}
                communityTrendLoading={communityTrendLoading}
                getCommunityTrendData={() => Utils.getCommunityTrendData(communityTrend)}
                communityCountryLoading={communityCountryLoading}
                getCommunityCountryData={() => Utils.getCommunityCountryData(communityCountry)}
                communityRatioLoading={communityRatioLoading}
                getCommunityRatioData={() => Utils.getCommunityRatioData(communityRatio)}
              />
            )}

            {activeSection === 'careers' && (
              <CareersSection
                loading={careerJobsLoading}
                getCareerJobsStats={() => Utils.getCareerJobsStats(careerJobsOverview)}
                funnelLoading={careerFunnelLoading}
                getCareerFunnelData={() => Utils.getCareerFunnelData(careerApplicationsFunnel)}
                trendLoading={careerTrendLoading}
                getCareerTrendData={() => Utils.getCareerTrendData(careerApplicationsTrend)}
                mostViewedLoading={careerMostViewedLoading}
                mostViewedJobs={careerMostViewedJobs}
                adminActionsLoading={careerAdminActionsLoading}
                getCareerAdminActionsStats={() => Utils.getCareerAdminActionsStats(careerAdminActions)}
              />
            )}

            {activeSection === 'users' && (
              <UsersSection
                loading={usersOverviewLoading}
                getUsersOverviewStats={() => Utils.getUsersOverviewStats(usersOverview)}
                signupTrendLoading={signupTrendLoading}
                getUserSignupTrendData={() => Utils.getUserSignupTrendData(userSignupTrend)}
                otpFunnelLoading={otpFunnelLoading}
                getOtpFunnelData={() => Utils.getOtpFunnelData(otpFunnel)}
                dauLoading={dauLoading}
                getDailyActiveUsersData={() => Utils.getDailyActiveUsersData(dailyActiveUsers)}
                countryLoading={usersCountryLoading}
                getUsersByCountryData={() => Utils.getUsersByCountryData(usersByCountry)}
              />
            )}
          </div>

          {/* ── Quick Actions ─────────────────────────────────── */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  className="group flex flex-col items-center gap-2.5 p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className={`${action.bg} w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon className={action.color} size={18} />
                  </div>
                  <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;