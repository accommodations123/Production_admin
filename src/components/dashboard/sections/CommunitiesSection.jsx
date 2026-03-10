import React from 'react';
import LineChart from "../../charts/LineChart";
import BarChart from "../../charts/BarChart";
import PieChart from "../../charts/PieChart";
import LoadingCard from "../LoadingCard";
import StatCard from "../StatCard";
import ErrorCard from "../ErrorCard";

const CommunitiesSection = ({
    loading,
    getCommunityStats,
    communityTrendLoading,
    getCommunityTrendData,
    communityCountryLoading,
    getCommunityCountryData,
    communityRatioLoading,
    getCommunityRatioData
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#00162d] mb-2">Community Analytics</h2>
                <p className="text-gray-600">Overview of communities, memberships, and engagement.</p>
            </div>

            {/* Community Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => <LoadingCard key={i} />)
                ) : getCommunityStats().length > 0 ? (
                    getCommunityStats().map((stat, i) => <StatCard key={i} stat={stat} />)
                ) : (
                    <div className="col-span-3">
                        <ErrorCard message="No community data available" />
                    </div>
                )}
            </div>

            {/* Community Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Growth Trend</h3>
                    </div>
                    {communityTrendLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : getCommunityTrendData().labels.length > 0 ? (
                        <LineChart
                            data={getCommunityTrendData()}
                            title="Community Growth"
                            height={300}
                        />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No trend data available
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Communities by Country</h3>
                    </div>
                    {communityCountryLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : getCommunityCountryData().labels.length > 0 ? (
                        <BarChart
                            data={getCommunityCountryData()}
                            title="Top Countries"
                            height={300}
                        />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No country data available
                        </div>
                    )}
                </div>
            </div>

            {/* Approval Ratio */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Approval Ratio</h3>
                    </div>
                    {communityRatioLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : getCommunityRatioData().labels.length > 0 ? (
                        <PieChart
                            data={getCommunityRatioData()}
                            title="Approval Ratio"
                            height={300}
                        />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No ratio data available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunitiesSection;
