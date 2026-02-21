import React from 'react';

const StatCard = ({ stat }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center mb-4">
            <div className={`${stat.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mr-4`}>
                <stat.icon className={stat.textColor} size={24} />
            </div>
            <div>
                <h3 className="text-gray-500 text-sm">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
            </div>
        </div>
    </div>
);

export default StatCard;
