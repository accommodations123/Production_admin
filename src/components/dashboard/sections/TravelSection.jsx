import React from 'react';
import LineChart from "../../charts/LineChart";
import BarChart from "../../charts/BarChart";
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

const TravelSection = ({
    loading, getTravelStats, travelTrendLoading, getTravelTrendData,
    travelCountryLoading, getTravelCountryData, travelMatchConversionLoading, getTravelMatchConversionData
}) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Travel Analytics</h2>
                <p className="text-sm text-slate-400 mt-0.5">Insights into trips, matches, and global activity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => <LoadingCard key={i} />)
                ) : getTravelStats().length > 0 ? (
                    getTravelStats().map((stat, i) => <StatCard key={i} stat={stat} index={i + 4} />)
                ) : (
                    <div className="col-span-3"><ErrorCard message="No travel data available" /></div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Trip & Match Activity">
                    {travelTrendLoading ? <ChartLoader /> : getTravelTrendData().labels.length > 0 ? (
                        <LineChart data={getTravelTrendData()} title="Activity Trend" height={300} />
                    ) : <EmptyState message="No activity data available" />}
                </ChartCard>

                <ChartCard title="Popular Destinations">
                    {travelCountryLoading ? <ChartLoader /> : getTravelCountryData().labels.length > 0 ? (
                        <BarChart data={getTravelCountryData()} title="Top Countries" height={300} />
                    ) : <EmptyState message="No country data available" />}
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Match Conversion Status">
                    {travelMatchConversionLoading ? <ChartLoader /> : getTravelMatchConversionData().labels.length > 0 ? (
                        <PieChart data={getTravelMatchConversionData()} title="Match Status" height={300} />
                    ) : <EmptyState message="No match data available" />}
                </ChartCard>
            </div>
        </div>
    );
};

export default TravelSection;
