import React from 'react';

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.55a2 2 0 010 3.1l-4.55 2.55M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
    </svg>
);

export const Header: React.FC = () => {
    return (
        <header className="text-center border-b-2 border-gray-700 pb-6">
            <div className="flex items-center justify-center gap-4">
                <CameraIcon />
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    AI News Anchor Generator
                </h1>
            </div>
            <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
                Choose a mode below. Provide a news article URL or headlines for a news roundup. Our AI will generate a script, anchor visuals, B-roll images, and social media content.
            </p>
        </header>
    );
};