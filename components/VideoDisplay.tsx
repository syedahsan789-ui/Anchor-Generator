import React, { useState } from 'react';

interface VideoDisplayProps {
    isLoading: boolean;
    generatedImage16x9: string | null;
    generatedImage9x16: string | null;
    generatedThumbnail: string | null;
    generatedScript: string | null;
    generatedUrduScript: string | null;
    finalPrompt: string;
    analyzedTopic: string | null;
    error: string | null;
    isSpeaking: boolean;
    onPlayPauseAudio: () => void;
    voices: SpeechSynthesisVoice[];
    selectedVoiceURI: string | null;
    onVoiceChange: (uri: string) => void;
    isDownloading: boolean;
    onDownloadAudio: () => void;
    editableThumbnailPrompt: string | null;
    onEditableThumbnailPromptChange: (prompt: string) => void;
    isRegeneratingThumbnail: boolean;
    onRegenerateThumbnail: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-center">
        <div className="relative">
            <div className="w-24 h-24 border-4 border-cyan-500 border-dashed rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.55a2 2 0 010 3.1l-4.55 2.55M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
                </svg>
            </div>
        </div>
        <p className="mt-4 text-lg font-semibold text-gray-300">Generating your news scene...</p>
        <p className="text-gray-400">This can take up to 45 seconds.</p>
    </div>
);

const Placeholder: React.FC = () => (
     <div className="flex flex-col items-center justify-center text-center text-gray-500 h-full p-4">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14m6-6l.01.01" />
        </svg>
        <p className="mt-4 text-lg font-semibold">Your generated images will appear here.</p>
        <p>Your generated output will be shown once processing is complete.</p>
    </div>
);

const PlayIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 0111 8v4a1 1 0 01-1.445.894l-3-2A1 1 0 016 9v-1a1 1 0 01.555-.894l3-2z" />
    </svg>
);

const PauseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
       <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" />
    </svg>
);

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const SpinnerIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={`animate-spin h-6 w-6 text-white ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ImageCard: React.FC<{ src: string; alt: string; title: string, className?: string }> = ({ src, alt, title, className }) => (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
        <h4 className="font-semibold text-gray-300">{title}</h4>
        <div className="bg-black rounded-lg overflow-hidden w-full flex justify-center items-center">
            <img src={src} alt={alt} className="object-contain max-w-full max-h-[300px]" />
        </div>
    </div>
);

export const VideoDisplay: React.FC<VideoDisplayProps> = ({ 
    isLoading, generatedImage16x9, generatedImage9x16, generatedThumbnail, 
    generatedScript, generatedUrduScript, finalPrompt, analyzedTopic, error,
    isSpeaking, onPlayPauseAudio, voices, selectedVoiceURI, onVoiceChange, 
    isDownloading, onDownloadAudio, editableThumbnailPrompt, onEditableThumbnailPromptChange,
    isRegeneratingThumbnail, onRegenerateThumbnail
}) => {
    
    const [activeScriptTab, setActiveScriptTab] = useState<'english' | 'urdu'>('english');
    
    const renderDisplayContent = () => {
        if (isLoading) {
            return <LoadingSpinner />;
        }
        if (error && !generatedImage16x9 && !generatedImage9x16 && !generatedThumbnail) {
            return (
                <div className="p-4 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-2 text-red-400 font-semibold">Generation Failed</p>
                    <p className="text-sm text-red-500 max-w-md mx-auto">{error}</p>
                </div>
            );
        }
        if (generatedThumbnail) {
             return (
                 <div className="flex flex-col items-center space-y-2 w-full p-2">
                    <h4 className="font-semibold text-gray-300">YouTube Thumbnail (16:9)</h4>
                    <div className="relative bg-black rounded-lg overflow-hidden w-full flex justify-center items-center">
                        <img src={generatedThumbnail} alt="Generated YouTube thumbnail for multi-story news" className="object-contain max-w-full max-h-[300px]" />
                        {isRegeneratingThumbnail && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                <SpinnerIcon className="h-10 w-10" />
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        if (generatedImage16x9 || generatedImage9x16) {
            return (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full p-2">
                    {generatedImage16x9 && (
                        <ImageCard 
                            src={generatedImage16x9} 
                            alt="Generated news anchor in 16:9 format"
                            title="YouTube (16:9)"
                        />
                    )}
                     {generatedImage9x16 && (
                        <ImageCard 
                            src={generatedImage9x16} 
                            alt="Generated news anchor in 9:16 format"
                            title="Shorts (9:16)"
                        />
                    )}
                 </div>
            )
        }
        return <Placeholder />;
    };

    const showScript = generatedScript && !isLoading;
    const showDetails = (analyzedTopic || finalPrompt) && !isLoading;

    return (
        <div className="flex flex-col space-y-4 mt-8 lg:mt-0">
            <h2 className="text-2xl font-semibold text-gray-100">
                2. Generated Output
            </h2>
            <div className="w-full min-h-[300px] bg-gray-800 border-2 border-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                {renderDisplayContent()}
            </div>
             {error && (generatedImage16x9 || generatedImage9x16 || generatedThumbnail) && (
                <div className="p-3 text-center bg-red-900/50 border border-red-700 rounded-lg">
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            )}
            
            {editableThumbnailPrompt && (
                 <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 space-y-3">
                     <h3 className="font-semibold text-cyan-400">Edit Thumbnail Prompt:</h3>
                      <textarea
                        value={editableThumbnailPrompt}
                        onChange={(e) => onEditableThumbnailPromptChange(e.target.value)}
                        rows={4}
                        className="w-full p-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 text-gray-300 text-sm resize-y"
                        disabled={isRegeneratingThumbnail}
                        aria-label="Editable thumbnail prompt"
                    />
                    <button 
                        onClick={onRegenerateThumbnail}
                        disabled={isRegeneratingThumbnail}
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-cyan-700 hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {isRegeneratingThumbnail ? <><SpinnerIcon className="-ml-1 mr-2 h-5 w-5"/> Regenerating...</> : 'Regenerate Thumbnail'}
                    </button>
                 </div>
            )}

            {showScript && (
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                         <h3 className="font-semibold text-cyan-400">Generated News Script:</h3>
                         {generatedUrduScript && (
                             <div className="flex border border-gray-600 rounded-lg">
                                 <button onClick={() => setActiveScriptTab('english')} className={`px-3 py-1 text-sm rounded-l-md ${activeScriptTab === 'english' ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>English</button>
                                 <button onClick={() => setActiveScriptTab('urdu')} className={`px-3 py-1 text-sm rounded-r-md ${activeScriptTab === 'urdu' ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Urdu</button>
                             </div>
                         )}
                    </div>
                    
                    {activeScriptTab === 'english' && (
                        <p className="text-gray-300 mt-3 italic whitespace-pre-wrap">"{generatedScript}"</p>
                    )}
                     {activeScriptTab === 'urdu' && (
                        <p className="text-gray-300 mt-3 italic whitespace-pre-wrap" dir="rtl">"{generatedUrduScript}"</p>
                    )}
                   
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                        <select
                            value={selectedVoiceURI ?? ''}
                            onChange={(e) => onVoiceChange(e.target.value)}
                            disabled={voices.length === 0 || isDownloading || isSpeaking}
                            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none flex-grow disabled:opacity-50"
                            aria-label="Select voice"
                        >
                            {voices.length > 0 ? (
                                voices.map(voice => (
                                    <option key={voice.voiceURI} value={voice.voiceURI}>
                                        {voice.name} ({voice.lang})
                                    </option>
                                ))
                            ) : (
                                <option>No voices available</option>
                            )}
                        </select>
                         <div className="flex items-center gap-2">
                             <button 
                                onClick={onPlayPauseAudio} 
                                className="text-cyan-400 hover:text-cyan-300 transition-colors disabled:text-gray-600 disabled:cursor-not-allowed p-2 rounded-full bg-gray-700/50 hover:bg-gray-700 disabled:opacity-50"
                                aria-label={isSpeaking ? "Pause script reading" : "Play script reading"}
                                title={isSpeaking ? "Pause script" : "Play script (English only)"}
                                disabled={isDownloading}
                            >
                                {isSpeaking ? <PauseIcon /> : <PlayIcon />}
                            </button>
                             <button 
                                onClick={onDownloadAudio} 
                                className="text-cyan-400 hover:text-cyan-300 transition-colors p-2 rounded-full bg-gray-700/50 hover:bg-gray-700 disabled:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label={isDownloading ? "Downloading audio..." : "Download audio"}
                                title={isDownloading ? "Downloading..." : "Download audio (MP3, standard voice, English only)"}
                                disabled={isDownloading || isSpeaking}
                            >
                                {isDownloading ? <SpinnerIcon /> : <DownloadIcon />}
                            </button>
                         </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-right">
                        Audio features are for English script only.
                    </p>
                </div>
            )}

            {showDetails && !editableThumbnailPrompt && (
                 <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                     <h3 className="font-semibold text-cyan-400">Generation Details:</h3>
                     {analyzedTopic && <p className="text-sm text-gray-300 mt-2">
                         <span className="font-medium text-gray-400">Analyzed Topic:</span>
                         <span className="ml-2 bg-cyan-900/50 text-cyan-300 px-2 py-1 rounded-full text-xs font-mono">{analyzedTopic}</span>
                     </p>}
                     {finalPrompt && <p className="text-sm text-gray-400 mt-2">
                         <span className="font-medium">Final Prompt:</span> {finalPrompt}
                     </p>}
                 </div>
            )}
        </div>
    );
};