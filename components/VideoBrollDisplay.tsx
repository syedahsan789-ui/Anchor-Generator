import React from 'react';

interface VideoBrollDisplayProps {
    images: string[] | null;
    isLoading: boolean;
    onGenerate: () => void;
    canGenerate: boolean;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-center h-48">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-500 border-dashed rounded-full animate-spin"></div>
             <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14m6-6l.01.01" /></svg>
        </div>
        <p className="mt-4 text-lg font-semibold text-gray-300">Generating B-Roll images...</p>
        <p className="text-sm text-gray-400">This may take a minute or two.</p>
    </div>
);

const GenerateButton: React.FC<{ onClick: () => void; disabled: boolean; children: React.ReactNode }> = ({ onClick, disabled, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200"
    >
        {children}
    </button>
);


const VideoBrollDisplay: React.FC<VideoBrollDisplayProps> = ({ images, isLoading, onGenerate, canGenerate }) => {
    // Don't render the section at all if there's nothing to generate and nothing to show
    if (!canGenerate && !isLoading && (!images || images.length === 0)) {
        return null;
    }
    
    const hasImages = images && images.length > 0;

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-100">
                    5. Video B-Roll Images
                </h2>
                {hasImages && !isLoading && (
                     <button
                        onClick={onGenerate}
                        className="px-4 py-2 text-sm font-medium rounded-md text-cyan-300 bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                        Regenerate
                    </button>
                )}
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 min-h-[200px] flex items-center justify-center">
                {isLoading ? (
                    <LoadingSpinner />
                ) : hasImages ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                        {images.map((src, index) => (
                            <div key={index} className="bg-black rounded-lg overflow-hidden aspect-video shadow-lg hover:shadow-cyan-500/20 transition-shadow duration-300">
                                <img src={src} alt={`B-roll image ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-gray-400 mb-4">Generate B-Roll images based on the generated script.</p>
                        <GenerateButton onClick={onGenerate} disabled={!canGenerate}>
                            Generate B-Roll Images
                        </GenerateButton>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoBrollDisplay;