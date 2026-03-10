import React from 'react';
import LineChart from "../../charts/LineChart";
import PieChart from "../../charts/PieChart";
import LoadingCard from "../LoadingCard";
import StatCard from "../StatCard";
import ErrorCard from "../ErrorCard";

const ChartCard = ({ title, children }) => (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md hover:shadow-slate-100/50 transition-shadow">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
        {children}
    </div>
);

const ChartLoader = () => (
    <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-[#cb2926] rounded-full animate-spin" />
    </div>
);

const EmptyState = ({ message = "No data available" }) => (
    <div className="h-64 flex items-center justify-center">
        <p className="text-sm text-slate-400">{message}</p>
    </div>
);

const EventsSection = ({
    loading, getEventStats, eventEngagementTimeseries, eventEngagementLoading,
    eventAnalyticsByLocation, eventLocationLoading, getEventLocationDataForChart
}) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Events Analytics</h2>
                <p className="text-sm text-slate-400 mt-0.5">Manage and analyze all platform events.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {loading ? (
                    Array(4).fill(0).map((_, i) => <LoadingCard key={i} />)
                ) : getEventStats().length > 0 ? (
                    getEventStats().map((stat, i) => <StatCard key={i} stat={stat} index={i + 1} />)
                ) : (
                    <div className="col-span-4"><ErrorCard message="No event data available" /></div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Event Engagement Timeseries">
                    {eventEngagementLoading ? <ChartLoader /> : eventEngagementTimeseries?.labels?.length > 0 ? (
                        <LineChart data={eventEngagementTimeseries} title="Event Engagement" height={300} />
                    ) : <EmptyState />}
                </ChartCard>

                <ChartCard title="Event Analytics By Location">
                    {eventLocationLoading ? <ChartLoader /> : eventAnalyticsByLocation?.length > 0 ? (
                        <PieChart data={getEventLocationDataForChart()} title="Events By Location" height={300} />
                    ) : <EmptyState />}
                </ChartCard>
            </div>
        </div>
    );
};

export default EventsSection;
