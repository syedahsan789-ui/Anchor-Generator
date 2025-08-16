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

// Reusable Component
const CopyableField: React.FC<{ label: string; text: string; isTextarea?: boolean }> = ({ label, text, isTextarea = false }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-400">{label}</label>
            <div className="relative">
                <div className={`w-full p-3 pr-10 bg-gray-900/50 border border-gray-700 rounded-md text-gray-300 text-sm whitespace-pre-wrap break-words ${isTextarea ? 'min-h-[100px]' : ''}`}>
                    {text}
                </div>
                 <button 
                    onClick={handleCopy} 
                    className="absolute top-2 right-2 p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
                    title={`Copy ${label}`}
                    aria-label={`Copy ${label}`}
                >
                    {copied ? <CheckIcon className="h-4 w-4 text-green-400" /> : <CopyIcon className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );
};

// Main component props
interface VideoPromptsDisplayProps {
    introVideoPrompt: string | null;
    storyVideoPrompts: string[] | null;
    isLoading: boolean;
}

const VideoPromptsDisplay: React.FC<VideoPromptsDisplayProps> = ({ introVideoPrompt, storyVideoPrompts, isLoading }) => {
    const hasContent = introVideoPrompt || (storyVideoPrompts && storyVideoPrompts.length > 0);
    if (isLoading || !hasContent) {
        return null;
    }

    return (
        <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-semibold text-gray-100">
                6. Generated Text-to-Video Prompts
            </h2>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col space-y-4">
                {introVideoPrompt && (
                     <CopyableField 
                        label="Intro Video Prompt" 
                        text={introVideoPrompt} 
                        isTextarea 
                    />
                )}
                {storyVideoPrompts && storyVideoPrompts.length > 0 && (
                    <>
                        {introVideoPrompt && <hr className="border-gray-600 my-2" />}
                        <h3 className="font-semibold text-lg text-cyan-400">
                            {introVideoPrompt ? "Story-by-Story Video Prompts" : "Story Video Prompts"}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {storyVideoPrompts.map((prompt, index) => (
                             <CopyableField 
                                key={index} 
                                label={`Story ${index + 1} Prompt`} 
                                text={prompt} 
                                isTextarea
                            />
                        ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VideoPromptsDisplay;