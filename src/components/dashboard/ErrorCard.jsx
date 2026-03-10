import React from 'react';
import { AlertCircle } from "lucide-react";

const ErrorCard = ({ message }) => (
    <div className="bg-red-50 rounded-2xl border border-red-200/60 p-5">
        <div className="flex items-center gap-2.5 text-red-500">
            <AlertCircle size={18} className="shrink-0" />
            <span className="text-sm font-medium">{message || 'Failed to load data'}</span>
        </div>
    </div>
);

export default ErrorCard;
