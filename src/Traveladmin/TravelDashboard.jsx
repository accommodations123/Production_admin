import React, { useMemo } from "react";
import { Plane, Users, CheckCircle, AlertCircle } from "lucide-react";

const TravelDashboard = ({ trips = [], matches = [] }) => {
  const totalTrips = trips.length;
  const activeTrips = trips.filter((t) => t.status === "active").length;
  const pendingTrips = trips.filter((t) => t.status === "pending").length;
  const totalMatches = matches.length;

  const StatCard = ({ title, value, icon }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border">
      <div className="p-3 bg-[#00162d] text-white w-fit rounded-lg mb-3">
        {icon}
      </div>
      <h3 className="text-2xl font-bold">{value}</h3>
      <p className="text-gray-500 text-sm">{title}</p>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-3xl font-bold">Travel Dashboard</h1>
      <p className="text-gray-600 mb-6">Overview of trips & matches</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Trips" value={totalTrips} icon={<Plane />} />
        <StatCard title="Active Trips" value={activeTrips} icon={<CheckCircle />} />
        <StatCard title="Pending Trips" value={pendingTrips} icon={<AlertCircle />} />
        <StatCard title="Matches" value={totalMatches} icon={<Users />} />
      </div>
    </div>
  );
};

export default TravelDashboard;
