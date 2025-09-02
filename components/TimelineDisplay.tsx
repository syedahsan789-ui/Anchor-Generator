
import React, { useState } from 'react';

// Icons
const CopyIcon: React.FC<{className?: string}> = ({ className="h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);
const CheckIcon: React.FC<{className?: string}> = ({ className="h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-center h-48">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-500 border-dashed rounded-full animate-spin"></div>
             <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <p className="mt-4 text-lg font-semibold text-gray-300">Generating video timeline script...</p>
        <p className="text-sm text-gray-400">This can take a few moments.</p>
    </div>
);

interface TimelineDisplayProps {
    timelineScript: string | null;
    isLoading: boolean;
    error: string | null;
}

const TimelineDisplay: React.FC<TimelineDisplayProps> = ({ timelineScript, isLoading, error }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (timelineScript) {
            navigator.clipboard.writeText(timelineScript);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    
    if (isLoading && !timelineScript) {
        return (
             <div className="flex flex-col space-y-4">
                <h2 className="text-2xl font-semibold text-gray-100">
                    9. Video Timeline Script
                </h2>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 min-h-[200px] flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (!timelineScript) {
        return null;
    }

    return (
        <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-semibold text-gray-100">
                9. Video Timeline Script
            </h2>
             {error && (
                <div className="p-3 text-center bg-red-900/50 border border-red-700 rounded-lg">
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            )}
            <div className="relative bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <button 
                    onClick={handleCopy} 
                    className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 bg-gray-900 hover:text-white hover:bg-gray-700 transition-colors"
                    title="Copy full script"
                    aria-label="Copy full timeline script"
                >
                    {copied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <CopyIcon className="h-5 w-5" />}
                </button>
               <div className="whitespace-pre-wrap text-gray-300">
                   {timelineScript}
               </div>
                <p className="text-xs text-center text-gray-500 pt-4 mt-4 border-t border-gray-700">
                    Use this timeline script with AI voice generators and the recommended text-to-video services below.
                </p>
            </div>
        </div>
    );
};

export default TimelineDisplay;
