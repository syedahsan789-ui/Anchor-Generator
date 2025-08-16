
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
             <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <p className="mt-4 text-lg font-semibold text-gray-300">Analyzing script for video prompts...</p>
        <p className="text-sm text-gray-400">This can take a few moments.</p>
    </div>
);


const CopyablePrompt: React.FC<{ label: string; text: string }> = ({ label, text }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative bg-gray-900/50 border border-gray-700 rounded-lg p-3">
            <label className="block text-xs font-semibold uppercase text-cyan-400 mb-1">{label}</label>
            <p className="text-gray-300 text-sm pr-8">{text}</p>
             <button 
                onClick={handleCopy} 
                className="absolute top-2 right-2 p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
                title={`Copy prompt`}
                aria-label={`Copy prompt`}
            >
                {copied ? <CheckIcon className="h-4 w-4 text-green-400" /> : <CopyIcon className="h-4 w-4" />}
            </button>
        </div>
    );
};

// Main component props
interface ParagraphVideoPromptsProps {
    prompts: { paragraph: string; prompt: string }[] | null;
    isLoading: boolean;
    error: string | null;
}

const ParagraphVideoPrompts: React.FC<ParagraphVideoPromptsProps> = ({ prompts, isLoading, error }) => {
    const hasContent = prompts && prompts.length > 0;
    if (isLoading && !hasContent) {
        return (
             <div className="flex flex-col space-y-4">
                <h2 className="text-2xl font-semibold text-gray-100">
                    7. Detailed Text-to-Video Prompts
                </h2>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 min-h-[200px] flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (!hasContent) {
        return null;
    }

    return (
        <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-semibold text-gray-100">
                7. Detailed Text-to-Video Prompts
            </h2>
             {error && (
                <div className="p-3 text-center bg-red-900/50 border border-red-700 rounded-lg">
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            )}
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col space-y-6">
               {prompts?.map((item, index) => (
                   <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start p-4 border-b border-gray-700 last:border-b-0">
                        <div>
                             <p className="text-gray-300 italic">"{item.paragraph}"</p>
                        </div>
                        <div>
                            <CopyablePrompt label={`Video Prompt for Paragraph ${index + 1}`} text={item.prompt} />
                        </div>
                   </div>
               ))}
            </div>
        </div>
    );
};

export default ParagraphVideoPrompts;
