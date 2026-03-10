import React from 'react';
import LineChart from "../../charts/LineChart";
import BarChart from "../../charts/BarChart";
import LoadingCard from "../LoadingCard";
import StatCard from "../StatCard";
import ErrorCard from "../ErrorCard";

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
        <>
            {/* Host Analytics */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Host Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => <LoadingCard key={i} />)
                    ) : getHostStats().length > 0 ? (
                        getHostStats().map((stat, i) => <StatCard key={i} stat={stat} />)
                    ) : (
                        <div className="col-span-3">
                            <ErrorCard message="No host data available" />
                        </div>
                    )}
                </div>
            </div>

            {/* Property Analytics */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Property Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => <LoadingCard key={i} />)
                    ) : getPropertyStats().length > 0 ? (
                        getPropertyStats().map((stat, i) => <StatCard key={i} stat={stat} />)
                    ) : (
                        <div className="col-span-4">
                            <ErrorCard message="No property data available" />
                        </div>
                    )}
                </div>
            </div>

            {/* Event Analytics Summary */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Event Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => <LoadingCard key={i} />)
                    ) : getEventStats().length > 0 ? (
                        getEventStats().map((stat, i) => <StatCard key={i} stat={stat} />)
                    ) : (
                        <div className="col-span-4">
                            <ErrorCard message="No event data available" />
                        </div>
                    )}
                </div>
            </div>

            {/* Buy/Sell Analytics Summary */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Buy / Sell Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </div>

            {/* Travel Analytics Summary */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Travel Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </div>

            {/* Community Analytics Summary */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Community Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Analytics Timeseries Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Analytics Timeseries</h3>
                        <div className="flex space-x-2">
                            <select
                                value={selectedEvent}
                                onChange={(e) => setSelectedEvent(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#cb2926]"
                            >
                                <option value="HOST_CREATED">Host Created</option>
                                <option value="HOST_APPROVED">Host Approved</option>
                                <option value="HOST_REJECTED">Host Rejected</option>
                                <option value="PROPERTY_DRAFT_CREATED">Property Draft Created</option>
                                <option value="PROPERTY_SUBMITTED">Property Submitted</option>
                                <option value="PROPERTY_APPROVED">Property Approved</option>
                                <option value="PROPERTY_REJECTED">Property Rejected</option>
                            </select>
                        </div>
                    </div>
                    {timeseriesLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : analyticsTimeseries?.labels?.length > 0 ? (
                        <LineChart
                            data={analyticsTimeseries}
                            title={`${selectedEvent.replace(/_/g, ' ')} Events`}
                            height={300}
                        />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No data available
                        </div>
                    )}
                </div>

                {/* Analytics By Location Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Analytics By Location</h3>
                    </div>
                    {locationLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : analyticsByLocation?.length > 0 ? (
                        <BarChart
                            data={getLocationDataForChart()}
                            title={`${selectedEvent.replace(/_/g, ' ')} By Location`}
                            height={300}
                        />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No data available
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default OverviewSection;
