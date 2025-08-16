
import React, { useState } from 'react';
import { SocialMediaContent } from '../types';

interface SocialIntegrationsProps {
    postImages: (string | null)[] | null;
    isLoading: boolean;
    socialMediaContent: SocialMediaContent | null;
}

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const SpinnerIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={`animate-spin h-5 w-5 text-white ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const CheckIcon: React.FC<{className?: string}> = ({ className="h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);


const SocialIntegrations: React.FC<SocialIntegrationsProps> = ({ postImages, isLoading, socialMediaContent }) => {
    const [isPostingFb, setIsPostingFb] = useState<{ [key: number]: boolean }>({});
    const [postedFb, setPostedFb] = useState<{ [key: number]: boolean }>({});
    const [isPostingIg, setIsPostingIg] = useState<{ [key: number]: boolean }>({});
    const [postedIg, setPostedIg] = useState<{ [key: number]: boolean }>({});

    if (isLoading || !socialMediaContent || !postImages || postImages.every(p => !p)) {
        return null;
    }

    const handlePost = (platform: 'facebook' | 'instagram', index: number) => {
        const setIsPosting = platform === 'facebook' ? setIsPostingFb : setIsPostingIg;
        const setPosted = platform === 'facebook' ? setPostedFb : setPostedIg;

        setIsPosting(p => ({ ...p, [index]: true }));
        setPosted(p => ({ ...p, [index]: false }));

        setTimeout(() => {
            setIsPosting(p => ({ ...p, [index]: false }));
            setPosted(p => ({ ...p, [index]: true }));
            setTimeout(() => setPosted(p => ({ ...p, [index]: false })), 3000);
        }, 2000);
    };

    const handleDownload = (image: string, index: number) => {
        const a = document.createElement('a');
        a.href = image;
        a.download = `social-media-post-${index + 1}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };


    return (
        <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-semibold text-gray-100">
                4. Social Media Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {postImages.map((image, index) => {
                    if (!image) return null;

                    const postingFb = isPostingFb[index];
                    const hasPostedFb = postedFb[index];
                    const postingIg = isPostingIg[index];
                    const hasPostedIg = postedIg[index];
                    const isAnyPosting = Object.values(isPostingFb).some(Boolean) || Object.values(isPostingIg).some(Boolean);

                    return (
                        <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col space-y-4">
                            <h3 className="font-semibold text-xl text-gray-300">Social Post {index + 1}</h3>
                            <div className="w-full aspect-square bg-gray-900 rounded-md overflow-hidden flex items-center justify-center">
                                <img src={image} alt={`Social media post ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={() => handleDownload(image, index)}
                                    className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition-all duration-200"
                                >
                                    <DownloadIcon />
                                    Download Image
                                </button>
                                <button
                                    onClick={() => handlePost('facebook', index)}
                                    disabled={isAnyPosting}
                                    className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {postingFb ? (
                                    <><SpinnerIcon /> Posting...</>
                                    ) : hasPostedFb ? (
                                        <><CheckIcon /> Posted!</>
                                    ) : (
                                    'Post to Facebook'
                                    )}
                                </button>
                                <button
                                    onClick={() => handlePost('instagram', index)}
                                    disabled={isAnyPosting}
                                    className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-pink-500 disabled:bg-none disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {postingIg ? (
                                    <><SpinnerIcon /> Posting...</>
                                    ) : hasPostedIg ? (
                                        <><CheckIcon /> Posted!</>
                                    ) : (
                                    'Post to Instagram'
                                    )}
                                </button>
                            </div>
                             <p className="text-xs text-center text-gray-500 !mt-3">Posts use the combined text from section 3.</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default SocialIntegrations;
