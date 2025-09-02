
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
        <p className="mt-4 text-lg font-semibold text-gray-300">Generating detailed video prompts...</p>
        <p className="text-sm text-gray-400">This can take a few moments.</p>
    </div>
);

const CopyablePrompt: React.FC<{ paragraph: string; prompt: string }> = ({ paragraph, prompt }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-3">
            <p className="text-gray-300 italic">"{paragraph}"</p>
            <div className="relative">
                <p className="text-sm text-cyan-300 bg-gray-800 p-3 pr-10 rounded-md font-mono whitespace-pre-wrap">{prompt}</p>
                 <button 
                    onClick={handleCopy} 
                    className="absolute top-2 right-2 p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
                    title="Copy Prompt"
                    aria-label="Copy prompt"
                >
                    {copied ? <CheckIcon className="h-4 w-4 text-green-400" /> : <CopyIcon className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );
};

interface ParagraphVideoPromptsProps {
    prompts: { paragraph: string; prompt: string }[] | null;
    isLoading: boolean;
    error: string | null;
}

const ParagraphVideoPrompts: React.FC<ParagraphVideoPromptsProps> = ({ prompts, isLoading, error }) => {
     if (isLoading && !prompts) {
        return (
             <div className="flex flex-col space-y-4">
                <h2 className="text-2xl font-semibold text-gray-100">
                    8. Detailed Video Prompts
                </h2>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 min-h-[200px] flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }
    
    if (!prompts || prompts.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-semibold text-gray-100">
                8. Detailed Video Prompts
            </h2>
             {error && (
                <div className="p-3 text-center bg-red-900/50 border border-red-700 rounded-lg">
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prompts.map((p, index) => (
                    <CopyablePrompt key={index} paragraph={p.paragraph} prompt={p.prompt} />
                ))}
            </div>
        </div>
    );
};

export default ParagraphVideoPrompts;
