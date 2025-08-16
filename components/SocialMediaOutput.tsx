
import React, { useState } from 'react';
import { SocialMediaContent } from '../types';

interface SocialMediaOutputProps {
    socialMediaContent: SocialMediaContent | null;
    isLoading: boolean;
}

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
                <div className={`w-full p-2 pr-10 bg-gray-900/50 border border-gray-700 rounded-md text-gray-300 text-sm whitespace-pre-wrap break-words ${isTextarea ? 'min-h-[100px]' : ''}`}>
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

const TagList: React.FC<{ label: string; tags: string[]; separator?: string }> = ({ label, tags, separator = ' ' }) => {
    const [copied, setCopied] = useState(false);
    const textToCopy = tags.join(separator);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-400">{label}</label>
                <button 
                    onClick={handleCopy} 
                    className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
                    title={`Copy ${label}`}
                    aria-label={`Copy ${label}`}
                >
                     {copied ? <CheckIcon className="h-4 w-4 text-green-400" /> : <CopyIcon className="h-4 w-4" />}
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-cyan-900/50 text-cyan-300 text-xs font-mono rounded-full">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};


const SocialMediaOutput: React.FC<SocialMediaOutputProps> = ({ socialMediaContent, isLoading }) => {
    if (isLoading || !socialMediaContent) {
        return null;
    }

    const { youtube, facebook, instagram } = socialMediaContent;

    return (
        <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-semibold text-gray-100">
                3. Generated Social Media Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* YouTube Card */}
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col space-y-4">
                    <h3 className="font-semibold text-xl text-red-500 flex items-center gap-2">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>
                        YouTube
                    </h3>
                    <CopyableField label="Title" text={youtube.title} />
                    <CopyableField label="Description" text={youtube.description} isTextarea />
                    <TagList label="Keywords" tags={youtube.keywords} separator=", " />
                    <TagList label="Hashtags" tags={youtube.hashtags} />
                </div>

                {/* Facebook Card */}
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col space-y-4">
                    <h3 className="font-semibold text-xl text-blue-500 flex items-center gap-2">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"></path></svg>
                        Facebook
                    </h3>
                    <CopyableField label="Post" text={facebook.post} isTextarea />
                </div>

                {/* Instagram Card */}
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col space-y-4">
                    <h3 className="font-semibold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center gap-2">
                         <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.058 1.644.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"></path></svg>
                        Instagram
                    </h3>
                    <CopyableField label="Post Caption" text={instagram.post} isTextarea />
                </div>

            </div>
        </div>
    );
}

export default SocialMediaOutput;
