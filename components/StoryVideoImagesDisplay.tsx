
import React from 'react';

interface StoryVideoImagesDisplayProps {
    images: string[] | null;
    isLoading: boolean;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-center h-48">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-500 border-dashed rounded-full animate-spin"></div>
             <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <p className="mt-4 text-lg font-semibold text-gray-300">Generating story video images...</p>
        <p className="text-sm text-gray-400">This may take a minute or two.</p>
    </div>
);

const StoryVideoImagesDisplay: React.FC<StoryVideoImagesDisplayProps> = ({ images, isLoading }) => {
    if (!isLoading && (!images || images.length === 0)) {
        return null;
    }

    return (
        <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-semibold text-gray-100">
                7. Story Video Concept Images
            </h2>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 min-h-[200px] flex items-center justify-center">
                {isLoading && (!images || images.length === 0) ? (
                    <LoadingSpinner />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                        {images?.map((src, index) => (
                            <div key={index} className="bg-black rounded-lg overflow-hidden aspect-video shadow-lg hover:shadow-cyan-500/20 transition-shadow duration-300">
                                <img src={src} alt={`Story video image ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                         {isLoading && images && images.length > 0 && (
                            <div className="flex flex-col items-center justify-center text-center rounded-lg bg-black aspect-video">
                                <div className="w-8 h-8 border-2 border-cyan-500 border-dashed rounded-full animate-spin"></div>
                                <p className="mt-2 text-xs font-semibold text-gray-400">Generating more...</p>
                            </div>
                         )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoryVideoImagesDisplay;
