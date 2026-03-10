import React from 'react';

const LoadingCard = () => (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 relative overflow-hidden">
        {/* Top accent shimmer */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
        <div className="animate-pulse">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="h-3 bg-slate-100 rounded-full w-20 mb-3" />
                    <div className="h-7 bg-slate-100 rounded-lg w-16 mb-2" />
                    <div className="h-3 bg-slate-50 rounded-full w-28" />
                </div>
                <div className="w-11 h-11 bg-slate-100 rounded-xl" />
            </div>
        </div>
    </div>
);

export default LoadingCard;
