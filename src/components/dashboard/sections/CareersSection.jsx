import React from 'react';
import { Briefcase, Eye, TrendingUp } from "lucide-react";
import LineChart from "../../charts/LineChart";
import BarChart from "../../charts/BarChart";
import LoadingCard from "../LoadingCard";
import StatCard from "../StatCard";
import ErrorCard from "../ErrorCard";

const CareersSection = ({
    loading,
    getCareerJobsStats,
    funnelLoading,
    getCareerFunnelData,
    trendLoading,
    getCareerTrendData,
    mostViewedLoading,
    mostViewedJobs,
    adminActionsLoading,
    getCareerAdminActionsStats
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#00162d] mb-2">Careers Analytics</h2>
                <p className="text-gray-600">Overview of job postings and application metrics.</p>
            </div>

            {/* Jobs Overview Stats Cards */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Jobs Overview (Last 90 Days)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {loading ? (
                    Array(3).fill(0).map((_, i) => <LoadingCard key={i} />)
                ) : getCareerJobsStats().length > 0 ? (
                    getCareerJobsStats().map((stat, i) => <StatCard key={i} stat={stat} />)
                ) : (
                    <div className="col-span-3">
                        <ErrorCard message="No jobs data available" />
                    </div>
                )}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Applications Funnel */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Application Status Funnel</h3>
                    </div>
                    {funnelLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : getCareerFunnelData().labels.length > 0 ? (
                        <BarChart
                            data={{
                                labels: getCareerFunnelData().labels,
                                values: getCareerFunnelData().values
                            }}
                            title="Application Transitions"
                            height={300}
                        />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>No funnel data available</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Applications Daily Trend */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Applications Trend (30 Days)</h3>
                    </div>
                    {trendLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : getCareerTrendData().labels.length > 0 ? (
                        <LineChart
                            data={getCareerTrendData()}
                            title="Daily Applications"
                            height={300}
                        />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>No trend data available</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Most Viewed Jobs Table */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Most Viewed Jobs (Top 10)</h3>
                </div>
                {mostViewedLoading ? (
                    <div className="h-48 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                    </div>
                ) : mostViewedJobs?.data?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rank
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Job ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Views
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {mostViewedJobs.data.map((job, index) => (
                                    <tr key={job.job_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                    index === 1 ? 'bg-gray-100 text-gray-800' :
                                                        index === 2 ? 'bg-orange-100 text-orange-800' :
                                                            'bg-gray-50 text-gray-600'
                                                } text-xs font-medium`}>
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {job.job_id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Eye size={16} className="text-purple-500 mr-2" />
                                                <span className="text-sm font-semibold text-gray-900">{job.views}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="h-48 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <Eye size={48} className="mx-auto mb-4 text-gray-300" />
                            <p>No viewed jobs data available</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Admin Actions Summary */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Admin Actions (Last 90 Days)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {adminActionsLoading ? (
                    Array(4).fill(0).map((_, i) => <LoadingCard key={i} />)
                ) : getCareerAdminActionsStats().length > 0 ? (
                    getCareerAdminActionsStats().map((stat, i) => <StatCard key={i} stat={stat} />)
                ) : (
                    <div className="col-span-4">
                        <ErrorCard message="No admin actions data available" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CareersSection;
