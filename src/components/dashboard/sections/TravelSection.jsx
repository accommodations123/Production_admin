import React from 'react';
import LineChart from "../../charts/LineChart";
import BarChart from "../../charts/BarChart";
import PieChart from "../../charts/PieChart";
import LoadingCard from "../LoadingCard";
import StatCard from "../StatCard";
import ErrorCard from "../ErrorCard";

const TravelSection = ({
    loading,
    getTravelStats,
    travelTrendLoading,
    getTravelTrendData,
    travelCountryLoading,
    getTravelCountryData,
    travelMatchConversionLoading,
    getTravelMatchConversionData
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#00162d] mb-2">Travel Analytics</h2>
                <p className="text-gray-600">Insights into trips, matches, and global activity.</p>
            </div>

            {/* Travel Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => <LoadingCard key={i} />)
                ) : getTravelStats().length > 0 ? (
                    getTravelStats().map((stat, i) => <StatCard key={i} stat={stat} />)
                ) : (
                    <div className="col-span-3">
                        <ErrorCard message="No travel data available" />
                    </div>
                )}
            </div>

            {/* Travel Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Daily Trend */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Trip & Match Activity</h3>
                    </div>
                    {travelTrendLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : getTravelTrendData().labels.length > 0 ? (
                        <LineChart
                            data={getTravelTrendData()}
                            title="Activity Trend"
                            height={300}
                        />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No activity data available
                        </div>
                    )}
                </div>

                {/* Country Distribution */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Popular Destinations</h3>
                    </div>
                    {travelCountryLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : getTravelCountryData().labels.length > 0 ? (
                        <BarChart
                            data={getTravelCountryData()}
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

            {/* Match Conversion */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Match Conversion Status</h3>
                    </div>
                    {travelMatchConversionLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : getTravelMatchConversionData().labels.length > 0 ? (
                        <PieChart
                            data={getTravelMatchConversionData()}
                            title="Match Status"
                            height={300}
                        />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No match data available
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default TravelSection;
