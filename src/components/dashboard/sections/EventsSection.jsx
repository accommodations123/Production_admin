import React from 'react';
import LineChart from "../../charts/LineChart";
import PieChart from "../../charts/PieChart";
import LoadingCard from "../LoadingCard";
import StatCard from "../StatCard";
import ErrorCard from "../ErrorCard";

const EventsSection = ({
    loading,
    getEventStats,
    eventEngagementTimeseries,
    eventEngagementLoading,
    eventAnalyticsByLocation,
    eventLocationLoading,
    getEventLocationDataForChart
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#00162d] mb-2">Events Analytics</h2>
                <p className="text-gray-600">Manage and analyze all platform events.</p>
            </div>

            {/* Event Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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

            {/* Event Engagement Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Event Engagement Timeseries</h3>
                    </div>
                    {eventEngagementLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : eventEngagementTimeseries?.labels?.length > 0 ? (
                        <LineChart
                            data={eventEngagementTimeseries}
                            title="Event Engagement"
                            height={300}
                        />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No data available
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Event Analytics By Location</h3>
                    </div>
                    {eventLocationLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : eventAnalyticsByLocation?.length > 0 ? (
                        <PieChart
                            data={getEventLocationDataForChart()}
                            title="Events By Location"
                            height={300}
                        />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No data available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventsSection;
