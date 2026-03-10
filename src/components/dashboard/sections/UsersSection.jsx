import React from 'react';
import { Users, TrendingUp, Globe, Activity, Shield } from "lucide-react";
import LineChart from "../../charts/LineChart";
import BarChart from "../../charts/BarChart";
import PieChart from "../../charts/PieChart";
import LoadingCard from "../LoadingCard";
import StatCard from "../StatCard";
import ErrorCard from "../ErrorCard";

const UsersSection = ({
    loading,
    getUsersOverviewStats,
    signupTrendLoading,
    getUserSignupTrendData,
    otpFunnelLoading,
    getOtpFunnelData,
    dauLoading,
    getDailyActiveUsersData,
    countryLoading,
    getUsersByCountryData
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#00162d] mb-2">Users Analytics</h2>
                <p className="text-gray-600">Overview of user registrations, activity, and engagement.</p>
            </div>

            {/* Users Overview Stats Cards */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Users Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {loading ? (
                    Array(3).fill(0).map((_, i) => <LoadingCard key={i} />)
                ) : getUsersOverviewStats().length > 0 ? (
                    getUsersOverviewStats().map((stat, i) => <StatCard key={i} stat={stat} />)
                ) : (
                    <div className="col-span-3">
                        <ErrorCard message="No user data available" />
                    </div>
                )}
            </div>

            {/* Charts Grid - Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* User Signup Trend */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Signup Trend (30 Days)</h3>
                    </div>
                    {signupTrendLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : getUserSignupTrendData().labels.length > 0 ? (
                        <LineChart
                            data={getUserSignupTrendData()}
                            title="Daily Signups"
                            height={300}
                        />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>No signup trend data available</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Daily Active Users */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Daily Active Users (30 Days)</h3>
                    </div>
                    {dauLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : getDailyActiveUsersData().labels.length > 0 ? (
                        <LineChart
                            data={getDailyActiveUsersData()}
                            title="Daily Active Users"
                            height={300}
                        />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <Activity size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>No DAU data available</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Charts Grid - Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* OTP Funnel */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">OTP Verification Funnel</h3>
                    </div>
                    {otpFunnelLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : getOtpFunnelData().labels.length > 0 ? (
                        <PieChart
                            data={getOtpFunnelData()}
                            title="OTP Status"
                            height={300}
                        />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <Shield size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>No OTP funnel data available</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Users by Country */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Users by Country (Top 10)</h3>
                    </div>
                    {countryLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00162d]"></div>
                        </div>
                    ) : getUsersByCountryData().labels.length > 0 ? (
                        <BarChart
                            data={{
                                labels: getUsersByCountryData().labels,
                                values: getUsersByCountryData().values
                            }}
                            title="Top Countries"
                            height={300}
                        />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <Globe size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>No country data available</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UsersSection;
