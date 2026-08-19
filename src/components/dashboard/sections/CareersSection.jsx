import React from 'react';
import { Briefcase, Eye, TrendingUp } from "lucide-react";
import LineChart from "../../charts/LineChart";
import BarChart from "../../charts/BarChart";
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

const EmptyState = ({ icon: Icon, message = "No data available" }) => (
    <div className="h-64 flex items-center justify-center">
        <div className="text-center">
            {Icon && <Icon size={40} className="mx-auto mb-3 text-slate-200" />}
            <p className="text-sm text-slate-400">{message}</p>
        </div>
    </div>
);

const CareersSection = ({
    loading, getCareerJobsStats, funnelLoading, getCareerFunnelData,
    trendLoading, getCareerTrendData, mostViewedLoading, mostViewedJobs,
    adminActionsLoading, getCareerAdminActionsStats
}) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Careers Analytics</h2>
                <p className="text-sm text-slate-400 mt-0.5">Overview of job postings and application metrics.</p>
            </div>

            {/* Jobs Overview */}
            <div>
                <h3 className="text-sm font-semibold text-slate-600 mb-3">Jobs Overview (Last 90 Days)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => <LoadingCard key={i} />)
                    ) : getCareerJobsStats().length > 0 ? (
                        getCareerJobsStats().map((stat, i) => <StatCard key={i} stat={stat} index={i + 3} />)
                    ) : (
                        <div className="col-span-3"><ErrorCard message="No jobs data available" /></div>
                    )}
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Application Status Funnel">
                    {funnelLoading ? <ChartLoader /> : getCareerFunnelData().labels.length > 0 ? (
                        <BarChart data={{ labels: getCareerFunnelData().labels, values: getCareerFunnelData().values }} title="Application Transitions" height={300} />
                    ) : <EmptyState icon={Briefcase} message="No funnel data available" />}
                </ChartCard>

                <ChartCard title="Applications Trend (30 Days)">
                    {trendLoading ? <ChartLoader /> : getCareerTrendData().labels.length > 0 ? (
                        <LineChart data={getCareerTrendData()} title="Daily Applications" height={300} />
                    ) : <EmptyState icon={TrendingUp} message="No trend data available" />}
                </ChartCard>
            </div>

            {/* Most Viewed Jobs Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Most Viewed Jobs (Top 10)</h3>
                {mostViewedLoading ? (
                    <ChartLoader />
                ) : mostViewedJobs?.data?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Rank</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Job ID</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Views</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {mostViewedJobs.data.map((job, index) => (
                                    <tr key={job.job_id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-bold ${index === 0 ? 'bg-amber-50 text-amber-600' :
                                                    index === 1 ? 'bg-slate-100 text-slate-600' :
                                                        index === 2 ? 'bg-orange-50 text-orange-600' :
                                                            'bg-slate-50 text-slate-400'
                                                }`}>
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-800">{job.job_id}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Eye size={14} className="text-violet-400" />
                                                <span className="text-sm font-semibold text-slate-700">{job.views}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState icon={Eye} message="No viewed jobs data available" />
                )}
            </div>

            {/* Admin Actions */}
            <div>
                <h3 className="text-sm font-semibold text-slate-600 mb-3">Admin Actions (Last 90 Days)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {adminActionsLoading ? (
                        Array(4).fill(0).map((_, i) => <LoadingCard key={i} />)
                    ) : getCareerAdminActionsStats().length > 0 ? (
                        getCareerAdminActionsStats().map((stat, i) => <StatCard key={i} stat={stat} index={i} />)
                    ) : (
                        <div className="col-span-4"><ErrorCard message="No admin actions data available" /></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CareersSection;
