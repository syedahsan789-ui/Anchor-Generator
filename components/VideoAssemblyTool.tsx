import React, { useState, useCallback } from 'react';
import JSZip from 'jszip';

// Icons
const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);
const SpinnerIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={`animate-spin h-5 w-5 text-white ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
const CheckIcon: React.FC<{className?: string}> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${className} mr-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);
const ExternalLinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);


interface VideoAssemblyToolProps {
    timelineScript: string | null;
    anchorImage: string | null;
    bRollImages: string[];
}

const otherServices = [
    { name: 'Google Veo', link: 'https://deepmind.google/technologies/veo/' },
    { name: 'Runway', link: 'https://runwayml.com/' },
    { name: 'Synthesia', link: 'https://www.synthesia.io/' },
];

const VideoAssemblyTool: React.FC<VideoAssemblyToolProps> = ({ timelineScript, anchorImage, bRollImages }) => {
    const [isZipping, setIsZipping] = useState(false);
    const [zipSuccess, setZipSuccess] = useState(false);

    const handleDownload = useCallback(async () => {
        if (!timelineScript || (!anchorImage && bRollImages.length === 0)) return;

        setIsZipping(true);
        setZipSuccess(false);

        try {
            const zip = new JSZip();
            zip.file("script.txt", timelineScript);

            // Helper to convert base64 to blob
            const base64ToBlob = async (base64: string) => {
                const res = await fetch(base64);
                return await res.blob();
            };

            if (anchorImage) {
                const blob = await base64ToBlob(anchorImage);
                zip.file("anchor.jpg", blob);
            }

            if (bRollImages.length > 0) {
                const bRollFolder = zip.folder("b-roll");
                if (bRollFolder) {
                    await Promise.all(bRollImages.map(async (img, index) => {
                        const blob = await base64ToBlob(img);
                        const fileName = `image_${String(index + 1).padStart(2, '0')}.jpg`;
                        bRollFolder.file(fileName, blob);
                    }));
                }
            }

            const content = await zip.generateAsync({ type: "blob" });
            
            const link = document.createElement("a");
            link.href = URL.createObjectURL(content);
            link.download = "ai_news_assets.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setZipSuccess(true);
            setTimeout(() => setZipSuccess(false), 3000);

        } catch (error) {
            console.error("Failed to create zip file:", error);
            // You might want to set an error state here to show in the UI
        } finally {
            setIsZipping(false);
        }
    }, [timelineScript, anchorImage, bRollImages]);


    if (!timelineScript) {
        return null;
    }

    const hasImages = anchorImage || bRollImages.length > 0;

    return (
        <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-semibold text-gray-100">
                10. Assemble & Create Your Video
            </h2>
             <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Assets */}
                <div className="flex flex-col space-y-4">
                    <h3 className="font-semibold text-xl text-gray-200">Video Assets</h3>
                    {anchorImage && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Anchor Image</h4>
                            <div className="bg-black rounded-lg overflow-hidden aspect-video shadow-lg">
                                <img src={anchorImage} alt="Anchor" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    )}
                    {bRollImages.length > 0 && (
                        <div>
                             <h4 className="text-sm font-medium text-gray-400 mb-2">B-Roll & Story Images</h4>
                             <div className="flex overflow-x-auto space-x-3 pb-2 -mb-2">
                                {bRollImages.map((src, index) => (
                                    <div key={index} className="flex-shrink-0 w-40 h-24 bg-black rounded-md overflow-hidden shadow-md">
                                        <img src={src} alt={`B-roll image ${index + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {!hasImages && (
                        <div className="text-center py-10 bg-gray-900/50 rounded-lg">
                            <p className="text-gray-500">No images were generated.</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Script & Actions */}
                <div className="flex flex-col space-y-4">
                    <h3 className="font-semibold text-xl text-gray-200">Timeline Script & Actions</h3>
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 h-64 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-gray-300 text-sm font-sans">{timelineScript}</pre>
                    </div>
                    <div className="space-y-3">
                         <button
                            onClick={handleDownload}
                            disabled={isZipping || zipSuccess}
                            className="w-full flex justify-center items-center px-6 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {isZipping ? <SpinnerIcon className="mr-2" /> : zipSuccess ? <CheckIcon /> : <DownloadIcon />}
                            {isZipping ? 'Packaging Assets...' : zipSuccess ? 'Downloaded!' : 'Download Asset Package (.zip)'}
                        </button>
                        <a 
                            href="https://pika.art/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 transition-all duration-200"
                        >
                            Create Video with Pika
                            <ExternalLinkIcon />
                        </a>
                    </div>
                     <div className="text-xs text-gray-500 text-center pt-2">
                        <p className="font-bold">How to use:</p>
                        <p>1. Download the asset package. 2. Use the script for voice-over and the images as scenes in your chosen AI video editor.</p>
                    </div>
                    <div className="border-t border-gray-700 pt-3 flex items-center justify-center space-x-4">
                         <span className="text-sm text-gray-400">Other great services:</span>
                         {otherServices.map(s => (
                             <a key={s.name} href={s.link} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:underline">{s.name}</a>
                         ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoAssemblyTool;
