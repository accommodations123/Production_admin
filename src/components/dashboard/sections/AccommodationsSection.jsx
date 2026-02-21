import React from 'react';
import PieChart from "../../charts/PieChart";
import LoadingCard from "../LoadingCard";
import StatCard from "../StatCard";
import ErrorCard from "../ErrorCard";

const AccommodationsSection = ({
    loading,
    getPropertyStats,
    getPropertyStatusData,
    getHostStatusData
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#00162d] mb-2">Accommodations</h2>
                <p className="text-gray-600">Manage all listed accommodations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {loading ? (
                    Array(4).fill(0).map((_, i) => <LoadingCard key={i} />)
                ) : getPropertyStats().length > 0 ? (
                    getPropertyStats().map((stat, i) => <StatCard key={i} stat={stat} />)
                ) : (
                    <div className="col-span-4">
                        <ErrorCard message="No accommodation data available" />
                    </div>
                )}
            </div>

            {/* Property Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Property Status Distribution</h3>
                    </div>
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : getPropertyStatusData().labels.length > 0 ? (
                        <PieChart
                            data={getPropertyStatusData()}
                            title="Property Status"
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
                        <h3 className="text-lg font-semibold text-gray-800">Host Status Distribution</h3>
                    </div>
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : getHostStatusData().labels.length > 0 ? (
                        <PieChart
                            data={getHostStatusData()}
                            title="Host Status"
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

export default AccommodationsSection;
