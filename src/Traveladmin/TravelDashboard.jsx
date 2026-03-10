import React from "react";
import { Plane, Users, CheckCircle, AlertCircle } from "lucide-react";

const ACCENT_GRADIENTS = ['from-blue-500 to-indigo-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-violet-500 to-purple-500'];

const TravelDashboard = ({ trips = [], matches = [] }) => {
  const totalTrips = trips.length;
  const activeTrips = trips.filter((t) => t.status === "active").length;
  const pendingTrips = trips.filter((t) => t.status === "pending").length;
  const totalMatches = matches.length;

  const stats = [
    { title: "Total Trips", value: totalTrips, icon: Plane, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Active Trips", value: activeTrips, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Pending Trips", value: pendingTrips, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Matches", value: totalMatches, icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Travel Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Overview of trips & matches</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={stat.title} className="group bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${ACCENT_GRADIENTS[i]} opacity-80`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{stat.title}</p>
                </div>
                <div className={`${stat.bg} w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={stat.color} size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TravelDashboard;
