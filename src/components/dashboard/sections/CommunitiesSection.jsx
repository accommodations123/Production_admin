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

const CommunitiesSection = ({
    loading, getCommunityStats, communityTrendLoading, getCommunityTrendData,
    communityCountryLoading, getCommunityCountryData, communityRatioLoading, getCommunityRatioData
}) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Community Analytics</h2>
                <p className="text-sm text-slate-400 mt-0.5">Overview of communities, memberships, and engagement.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => <LoadingCard key={i} />)
                ) : getCommunityStats().length > 0 ? (
                    getCommunityStats().map((stat, i) => <StatCard key={i} stat={stat} index={i + 5} />)
                ) : (
                    <div className="col-span-3"><ErrorCard message="No community data available" /></div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Growth Trend">
                    {communityTrendLoading ? <ChartLoader /> : getCommunityTrendData().labels.length > 0 ? (
                        <LineChart data={getCommunityTrendData()} title="Community Growth" height={300} />
                    ) : <EmptyState message="No trend data available" />}
                </ChartCard>

                <ChartCard title="Communities by Country">
                    {communityCountryLoading ? <ChartLoader /> : getCommunityCountryData().labels.length > 0 ? (
                        <BarChart data={getCommunityCountryData()} title="Top Countries" height={300} />
                    ) : <EmptyState message="No country data available" />}
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Approval Ratio">
                    {communityRatioLoading ? <ChartLoader /> : getCommunityRatioData().labels.length > 0 ? (
                        <PieChart data={getCommunityRatioData()} title="Approval Ratio" height={300} />
                    ) : <EmptyState message="No ratio data available" />}
                </ChartCard>
            </div>
        </div>
    );
};

export default CommunitiesSection;
