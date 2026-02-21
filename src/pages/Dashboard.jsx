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

const Dashboard = () => {
  const [timeGreeting, setTimeGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedEvent, setSelectedEvent] = useState("HOST_CREATED");
  const [selectedRange, setSelectedRange] = useState("30d");

  // State for Export Menu
  const [showExportMenu, setShowExportMenu] = useState(false);

  // --- API Calls (Existing Logic) ---
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

    // 1. Summary Sheet
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

    // 2. Timeseries Sheet
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

    // 3. Location Sheet
    if (analyticsByLocation?.length > 0) {
      const wsLocation = XLSX.utils.json_to_sheet(analyticsByLocation);
      XLSX.utils.book_append_sheet(wb, wsLocation, "By Location");
    }

    // 4. Buy/Sell Data
    if (buySellOverview?.length > 0) {
      const wsBuySell = XLSX.utils.json_to_sheet(buySellOverview);
      XLSX.utils.book_append_sheet(wb, wsBuySell, "Buy/Sell Details");
    }

    // 5. Travel Data
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

    // Title
    doc.setFontSize(18);
    doc.text("Platform Analytics Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // 1. Summary Table
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

    // 2. Timeseries Table (Flattened)
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

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#00162d] to-[#002a4d] rounded-xl p-6 text-white shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0">
                <h1 className="text-3xl font-bold mb-2">{timeGreeting}, Admin!</h1>
                <p className="text-blue-100">Here's your platform overview and key insights.</p>
                <p className="text-sm text-blue-200 mt-2">
                  {currentTime.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })} at {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="flex space-x-3 relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-medium hover:bg-white/30 transition-colors flex items-center text-white relative"
                >
                  <Download size={16} className="mr-2" />
                  Export Report
                </button>

                {/* EXPORT DROPDOWN MENU */}
                {showExportMenu && (
                  <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <button
                      onClick={handleExportExcel}
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FileSpreadsheet size={16} className="mr-3 text-green-600" />
                      Download Excel
                    </button>
                    <button
                      onClick={handleExportPdf}
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                    >
                      <FileText size={16} className="mr-3 text-red-600" />
                      Download PDF
                    </button>
                  </div>
                )}

                <button
                  onClick={handleRefresh}
                  className={`bg-[#cb2926] rounded-lg px-4 py-2 text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center ${refreshing ? 'opacity-70' : ''}`}
                >
                  <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {hasError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 p-4 rounded-lg text-red-600">
              <AlertCircle size={18} />
              {summaryError}
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm p-2">
            <div className="flex space-x-1">
              {['overview', 'accommodations', 'events', 'buysell', 'travel', 'communities', 'careers', 'users'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${activeSection === section ? 'bg-[#00162d] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1).replace('buysell', 'Buy / Sell')}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {['day', 'week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedRange(range === 'day' ? '7d' : range === 'week' ? '7d' : range === 'month' ? '30d' : '90d')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedRange.includes(range.slice(0, -1)) ? 'bg-[#00162d] text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* CONTENT SECTIONS */}
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

          {/* QUICK ACTIONS */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Building className="text-blue-500 mb-2" size={24} />
                <span className="text-xs text-gray-700">Add Property</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Calendar className="text-green-500 mb-2" size={24} />
                <span className="text-xs text-gray-700">Create Event</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Briefcase className="text-purple-500 mb-2" size={24} />
                <span className="text-xs text-gray-700">Post Job</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <UserPlus className="text-orange-500 mb-2" size={24} />
                <span className="text-xs text-gray-700">Add User</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <FileText className="text-red-500 mb-2" size={24} />
                <span className="text-xs text-gray-700">Reports</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Settings className="text-gray-500 mb-2" size={24} />
                <span className="text-xs text-gray-700">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </main >
    </div >
  );
};

export default Dashboard;