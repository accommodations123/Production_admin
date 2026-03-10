import React from 'react';
import { Users, TrendingUp, Globe, Activity, Shield } from "lucide-react";
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

const EmptyState = ({ icon: Icon, message = "No data available" }) => (
    <div className="h-64 flex items-center justify-center">
        <div className="text-center">
            {Icon && <Icon size={40} className="mx-auto mb-3 text-slate-200" />}
            <p className="text-sm text-slate-400">{message}</p>
        </div>
    </div>
);

const UsersSection = ({
    loading, getUsersOverviewStats, signupTrendLoading, getUserSignupTrendData,
    otpFunnelLoading, getOtpFunnelData, dauLoading, getDailyActiveUsersData,
    countryLoading, getUsersByCountryData
}) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Users Analytics</h2>
                <p className="text-sm text-slate-400 mt-0.5">Overview of user registrations, activity, and engagement.</p>
            </div>

            {/* Overview */}
            <div>
                <h3 className="text-sm font-semibold text-slate-600 mb-3">Users Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => <LoadingCard key={i} />)
                    ) : getUsersOverviewStats().length > 0 ? (
                        getUsersOverviewStats().map((stat, i) => <StatCard key={i} stat={stat} index={i} />)
                    ) : (
                        <div className="col-span-3"><ErrorCard message="No user data available" /></div>
                    )}
                </div>
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Signup Trend (30 Days)">
                    {signupTrendLoading ? <ChartLoader /> : getUserSignupTrendData().labels.length > 0 ? (
                        <LineChart data={getUserSignupTrendData()} title="Daily Signups" height={300} />
                    ) : <EmptyState icon={TrendingUp} message="No signup trend data available" />}
                </ChartCard>

                <ChartCard title="Daily Active Users (30 Days)">
                    {dauLoading ? <ChartLoader /> : getDailyActiveUsersData().labels.length > 0 ? (
                        <LineChart data={getDailyActiveUsersData()} title="Daily Active Users" height={300} />
                    ) : <EmptyState icon={Activity} message="No DAU data available" />}
                </ChartCard>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="OTP Verification Funnel">
                    {otpFunnelLoading ? <ChartLoader /> : getOtpFunnelData().labels.length > 0 ? (
                        <PieChart data={getOtpFunnelData()} title="OTP Status" height={300} />
                    ) : <EmptyState icon={Shield} message="No OTP funnel data available" />}
                </ChartCard>

                <ChartCard title="Users by Country (Top 10)">
                    {countryLoading ? <ChartLoader /> : getUsersByCountryData().labels.length > 0 ? (
                        <BarChart data={{ labels: getUsersByCountryData().labels, values: getUsersByCountryData().values }} title="Top Countries" height={300} />
                    ) : <EmptyState icon={Globe} message="No country data available" />}
                </ChartCard>
            </div>
        </div>
    );
};

export default UsersSection;
