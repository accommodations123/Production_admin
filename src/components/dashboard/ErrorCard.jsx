import React from 'react';
import { AlertCircle } from "lucide-react";

const ErrorCard = ({ message }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-red-200">
        <div className="flex items-center text-red-600">
            <AlertCircle size={20} className="mr-2" />
            <span className="text-sm">{message || 'Failed to load data'}</span>
        </div>
    </div>
);

export default ErrorCard;
