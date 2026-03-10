import React from 'react';

const ACCENT_COLORS = [
    'from-blue-500 to-indigo-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-violet-500 to-purple-500',
    'from-rose-500 to-pink-500',
    'from-cyan-500 to-sky-500',
];

const StatCard = ({ stat, index = 0 }) => {
    const gradient = ACCENT_COLORS[index % ACCENT_COLORS.length];

    return (
        <div className="group bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${gradient} opacity-80`} />

            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                        {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 tracking-tight">
                        {stat.value}
                    </p>
                    {stat.trend && (
                        <p className={`text-xs font-medium mt-1.5 flex items-center gap-1 ${stat.trend >= 0 ? 'text-emerald-600' : 'text-red-500'
                            }`}>
                            <span>{stat.trend >= 0 ? '↑' : '↓'}</span>
                            <span>{Math.abs(stat.trend)}%</span>
                            <span className="text-slate-400 font-normal ml-0.5">vs last period</span>
                        </p>
                    )}
                </div>

                <div className={`${stat.bgColor || 'bg-slate-100'} w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={stat.textColor || 'text-slate-600'} size={20} />
                </div>
            </div>
        </div>
    );
};

export default StatCard;
