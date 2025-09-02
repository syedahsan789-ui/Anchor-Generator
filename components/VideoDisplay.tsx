import React, { useState, useRef, useEffect } from 'react';

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

const PlayIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 0111 8v4a1 1 0 01-1.445.894l-3-2A1 1 0 016 9v-1a1 1 0 01.555-.894l3-2z" />
    </svg>
);

const PauseIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 20 20">
       <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" />
    </svg>
);

const VolumeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
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

const AudioPlayer: React.FC<{
    generatedScript: string | null;
    isDownloading: boolean;
    onDownloadAudio: () => void;
}> = ({ generatedScript, isDownloading, onDownloadAudio }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const [audioError, setAudioError] = useState<string | null>(null);

    useEffect(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setAudioError(null);

        if (generatedScript) {
            const scriptForUrl = generatedScript.length > 200 ? generatedScript.substring(0, 200) : generatedScript;
            const encodedScript = encodeURIComponent(scriptForUrl);
            
            if (generatedScript.length > 200) {
                setAudioError("Audio preview is limited to the first 200 characters.");
            }

            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedScript}&tl=en&client=tw-ob`;
            setAudioSrc(ttsUrl);
        } else {
            setAudioSrc(null);
        }
    }, [generatedScript]);

    const togglePlayPause = () => {
        if (!audioRef.current || !audioRef.current.src) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            const newTime = Number(e.target.value);
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            const newVolume = Number(e.target.value);
            audioRef.current.volume = newVolume;
            setVolume(newVolume);
        }
    };

    const formatTime = (timeInSeconds: number) => {
        if (isNaN(timeInSeconds) || timeInSeconds === 0) return '00:00';
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <div className="mt-4 flex flex-col gap-3">
            {audioSrc && <audio 
                ref={audioRef} 
                src={audioSrc}
                onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
            />}
            <div className="flex items-center gap-3 bg-gray-700/50 p-2 rounded-lg">
                <button 
                    onClick={togglePlayPause}
                    disabled={!audioSrc || isDownloading}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
                    aria-label={isPlaying ? "Pause script reading" : "Play script reading"}
                    title={isPlaying ? "Pause script" : "Play script (English preview)"}
                >
                    {isPlaying ? <PauseIcon className="h-8 w-8" /> : <PlayIcon className="h-8 w-8" />}
                </button>
                <div className="flex-grow flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono w-10 text-center">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        value={currentTime}
                        max={duration || 1}
                        onChange={handleProgressChange}
                        disabled={!audioSrc || isDownloading}
                        aria-label="Audio progress"
                        className="w-full"
                    />
                    <span className="text-xs text-gray-400 font-mono w-10 text-center">{formatTime(duration)}</span>
                </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-700/50 p-2 rounded-lg">
                 <VolumeIcon />
                 <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    disabled={!audioSrc || isDownloading}
                    aria-label="Volume control"
                    className="w-24"
                />
                 <div className="flex-grow"></div>
                 <button 
                    onClick={onDownloadAudio} 
                    className="text-cyan-400 hover:text-cyan-300 transition-colors p-2 rounded-full bg-gray-700/50 hover:bg-gray-700 disabled:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={isDownloading ? "Downloading audio..." : "Download full audio"}
                    title={isDownloading ? "Downloading..." : "Download full audio (MP3, English)"}
                    disabled={isDownloading || isPlaying || !generatedScript}
                >
                    {isDownloading ? <SpinnerIcon /> : <DownloadIcon />}
                </button>
            </div>
            <p className="text-xs text-gray-500 text-center">
                {audioError ? audioError : 'Audio features are for English script preview only.'}
            </p>
        </div>
    );
}


export const VideoDisplay: React.FC<VideoDisplayProps> = ({ 
    isLoading, generatedImage16x9, generatedImage9x16, generatedThumbnail, 
    generatedScript, generatedUrduScript, finalPrompt, analyzedTopic, error,
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
                    <h3 className="mt-2 text-lg font-semibold text-red-300">An Error Occurred</h3>
                    <pre className="mt-2 text-sm text-gray-400 whitespace-pre-wrap text-left bg-gray-900/50 p-2 rounded-md">{error}</pre>
                </div>
            );
        }
        if (!generatedImage16x9 && !generatedImage9x16 && !generatedThumbnail) {
            return <Placeholder />;
        }

        return (
            <div className="flex flex-col space-y-4 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {generatedImage16x9 && (
                        <ImageCard src={generatedImage16x9} alt="Generated 16x9 Image" title="16:9 (Desktop)" />
                    )}
                    {generatedImage9x16 && (
                        <ImageCard src={generatedImage9x16} alt="Generated 9x16 Image" title="9:16 (Mobile)" />
                    )}
                     {generatedThumbnail && (
                        <ImageCard src={generatedThumbnail} alt="Generated YouTube Thumbnail" title="YouTube Thumbnail (16:9)" className="sm:col-span-2" />
                    )}
                </div>

                {generatedScript && (
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <div className="flex mb-2 border-b border-gray-600">
                             <button 
                                onClick={() => setActiveScriptTab('english')}
                                className={`px-3 py-1 text-sm font-semibold rounded-t-md ${activeScriptTab === 'english' ? 'bg-gray-700 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                English Script
                            </button>
                            {generatedUrduScript && (
                                <button 
                                    onClick={() => setActiveScriptTab('urdu')}
                                    className={`px-3 py-1 text-sm font-semibold rounded-t-md ${activeScriptTab === 'urdu' ? 'bg-gray-700 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Urdu Script
                                </button>
                            )}
                        </div>
                        <div className="mt-2 text-gray-300 whitespace-pre-wrap max-h-48 overflow-y-auto p-2 bg-gray-900/50 rounded-md">
                            {activeScriptTab === 'english' ? generatedScript : generatedUrduScript}
                        </div>
                        <AudioPlayer 
                           generatedScript={generatedScript}
                           isDownloading={isDownloading}
                           onDownloadAudio={onDownloadAudio}
                        />
                    </div>
                )}
                
                {editableThumbnailPrompt && (
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 space-y-2">
                        <label htmlFor="thumbnail-prompt" className="text-sm font-semibold text-gray-300">Edit & Regenerate Thumbnail Prompt:</label>
                        <textarea
                            id="thumbnail-prompt"
                            value={editableThumbnailPrompt}
                            onChange={(e) => onEditableThumbnailPromptChange(e.target.value)}
                            rows={3}
                            className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500"
                        />
                        <button
                            onClick={onRegenerateThumbnail}
                            disabled={isRegeneratingThumbnail}
                            className="w-full flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600"
                        >
                            {isRegeneratingThumbnail ? <SpinnerIcon className="h-5 w-5"/> : 'Regenerate Thumbnail'}
                        </button>
                    </div>
                )}

                 <details className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 text-sm">
                    <summary className="cursor-pointer font-semibold text-gray-400 hover:text-white">Generation Details</summary>
                    <div className="mt-2 pt-2 border-t border-gray-600 space-y-2">
                        {analyzedTopic && <p><strong className="text-gray-400">Analyzed Topic:</strong> {analyzedTopic}</p>}
                        {finalPrompt && <p><strong className="text-gray-400">Final Anchor Prompt:</strong> {finalPrompt}</p>}
                    </div>
                </details>
            </div>
        );
    };

    return (
        <div className="sticky top-8 bg-gray-800 p-4 rounded-lg border border-gray-700 min-h-[400px] flex items-center justify-center">
            {renderDisplayContent()}
        </div>
    );
};