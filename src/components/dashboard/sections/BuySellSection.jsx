import React from 'react';
import LineChart from "../../charts/LineChart";
import BarChart from "../../charts/BarChart";
import PieChart from "../../charts/PieChart";
import LoadingCard from "../LoadingCard";
import StatCard from "../StatCard";
import ErrorCard from "../ErrorCard";

const BuySellSection = ({
    loading,
    getBuySellOverviewStats,
    buySellTrendLoading,
    getBuySellTrendData,
    buySellCountryLoading,
    getBuySellCountryData,
    buySellRatioLoading,
    getBuySellRatioData
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#00162d] mb-2">Buy / Sell Analytics</h2>
                <p className="text-gray-600">Overview of marketplace activity and listings.</p>
            </div>

            {/* Buy/Sell Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => <LoadingCard key={i} />)
                ) : getBuySellOverviewStats().length > 0 ? (
                    getBuySellOverviewStats().map((stat, i) => <StatCard key={i} stat={stat} />)
                ) : (
                    <div className="col-span-3">
                        <ErrorCard message="No buy/sell data available" />
                    </div>
                )}
            </div>

            {/* Buy/Sell Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Daily Trend */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Daily Trend</h3>
                    </div>
                    {buySellTrendLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : getBuySellTrendData().labels.length > 0 ? (
                        <LineChart
                            data={getBuySellTrendData()} // Passing formatted object directly
                            title="Listings Trend"
                            height={300}
                        />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No trend data available
                        </div>
                    )}
                </div>

                {/* Country Distribution */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Listings by Country (Approved)</h3>
                    </div>
                    {buySellCountryLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : getBuySellCountryData().labels.length > 0 ? (
                        <BarChart
                            data={getBuySellCountryData()}
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
                        <h3 className="text-lg font-semibold text-gray-800">Approval vs Block Ratio</h3>
                    </div>
                    {buySellRatioLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : getBuySellRatioData().labels.length > 0 ? (
                        <PieChart
                            data={getBuySellRatioData()}
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

export default BuySellSection;
