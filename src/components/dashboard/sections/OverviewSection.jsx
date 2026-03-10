import React from 'react';
import LineChart from "../../charts/LineChart";
import BarChart from "../../charts/BarChart";
import LoadingCard from "../LoadingCard";
import StatCard from "../StatCard";
import ErrorCard from "../ErrorCard";

/* ═══════════════════════════════════════════════════════════════
   Reusable Section Header
   ═══════════════════════════════════════════════════════════════ */
const SectionHeader = ({ title, subtitle }) => (
    <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
);

/* Chart Card Wrapper */
const ChartCard = ({ title, children, rightContent }) => (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md hover:shadow-slate-100/50 transition-shadow">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
            {rightContent}
        </div>
        {children}
    </div>
);

/* Loading Spinner */
const ChartLoader = () => (
    <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-[#cb2926] rounded-full animate-spin" />
    </div>
);

/* Empty State */
const EmptyState = ({ message = "No data available" }) => (
    <div className="h-64 flex items-center justify-center">
        <p className="text-sm text-slate-400">{message}</p>
    </div>
);

const OverviewSection = ({
    loading,
    error,
    getHostStats,
    getPropertyStats,
    getEventStats,
    getBuySellOverviewStats,
    getTravelStats,
    getCommunityStats,
    analyticsTimeseries,
    timeseriesLoading,
    selectedEvent,
    setSelectedEvent,
    analyticsByLocation,
    locationLoading,
    getLocationDataForChart
}) => {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Host Analytics */}
            <div>
                <SectionHeader title="Host Analytics" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => <LoadingCard key={i} />)
                    ) : getHostStats().length > 0 ? (
                        getHostStats().map((stat, i) => <StatCard key={i} stat={stat} index={i} />)
                    ) : (
                        <div className="col-span-3"><ErrorCard message="No host data available" /></div>
                    )}
                </div>
            </div>

            {/* Property Analytics */}
            <div>
                <SectionHeader title="Property Analytics" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => <LoadingCard key={i} />)
                    ) : getPropertyStats().length > 0 ? (
                        getPropertyStats().map((stat, i) => <StatCard key={i} stat={stat} index={i + 3} />)
                    ) : (
                        <div className="col-span-4"><ErrorCard message="No property data available" /></div>
                    )}
                </div>
            </div>

            {/* Event Analytics */}
            <div>
                <SectionHeader title="Event Analytics" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => <LoadingCard key={i} />)
                    ) : getEventStats().length > 0 ? (
                        getEventStats().map((stat, i) => <StatCard key={i} stat={stat} index={i + 1} />)
                    ) : (
                        <div className="col-span-4"><ErrorCard message="No event data available" /></div>
                    )}
                </div>
            </div>

            {/* Buy/Sell Analytics */}
            <div>
                <SectionHeader title="Buy / Sell Analytics" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => <LoadingCard key={i} />)
                    ) : getBuySellOverviewStats().length > 0 ? (
                        getBuySellOverviewStats().map((stat, i) => <StatCard key={i} stat={stat} index={i + 2} />)
                    ) : (
                        <div className="col-span-3"><ErrorCard message="No buy/sell data available" /></div>
                    )}
                </div>
            </div>

            {/* Travel Analytics */}
            <div>
                <SectionHeader title="Travel Analytics" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => <LoadingCard key={i} />)
                    ) : getTravelStats().length > 0 ? (
                        getTravelStats().map((stat, i) => <StatCard key={i} stat={stat} index={i + 4} />)
                    ) : (
                        <div className="col-span-3"><ErrorCard message="No travel data available" /></div>
                    )}
                </div>
            </div>

            {/* Community Analytics */}
            <div>
                <SectionHeader title="Community Analytics" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => <LoadingCard key={i} />)
                    ) : getCommunityStats().length > 0 ? (
                        getCommunityStats().map((stat, i) => <StatCard key={i} stat={stat} index={i + 5} />)
                    ) : (
                        <div className="col-span-3"><ErrorCard message="No community data available" /></div>
                    )}
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard
                    title="Analytics Timeseries"
                    rightContent={
                        <select
                            value={selectedEvent}
                            onChange={(e) => setSelectedEvent(e.target.value)}
                            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-100"
                        >
                            <option value="HOST_CREATED">Host Created</option>
                            <option value="HOST_APPROVED">Host Approved</option>
                            <option value="HOST_REJECTED">Host Rejected</option>
                            <option value="PROPERTY_DRAFT_CREATED">Property Draft Created</option>
                            <option value="PROPERTY_SUBMITTED">Property Submitted</option>
                            <option value="PROPERTY_APPROVED">Property Approved</option>
                            <option value="PROPERTY_REJECTED">Property Rejected</option>
                        </select>
                    }
                >
                    {timeseriesLoading ? <ChartLoader /> : analyticsTimeseries?.labels?.length > 0 ? (
                        <LineChart data={analyticsTimeseries} title={`${selectedEvent.replace(/_/g, ' ')} Events`} height={300} />
                    ) : <EmptyState />}
                </ChartCard>

                <ChartCard title="Analytics By Location">
                    {locationLoading ? <ChartLoader /> : analyticsByLocation?.length > 0 ? (
                        <BarChart data={getLocationDataForChart()} title={`${selectedEvent.replace(/_/g, ' ')} By Location`} height={300} />
                    ) : <EmptyState />}
                </ChartCard>
            </div>
        </div>
    );
};

export default OverviewSection;
