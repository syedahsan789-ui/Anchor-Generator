import React from 'react';

interface InputPanelProps {
    url: string;
    onUrlChange: (value: string) => void;
    headline: string;
    onHeadlineChange: (value: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
    uploadedImage: string | null;
    onImageChange: (base64: string | null) => void;
}

const UploadIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14" />
    </svg>
);

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
)

const InputPanel: React.FC<InputPanelProps> = ({ url, onUrlChange, headline, onHeadlineChange, onGenerate, isLoading, uploadedImage, onImageChange }) => {
    const isGenerateDisabled = isLoading || (!url.trim() && !headline.trim());

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = (reader.result as string)?.split(',')[1];
                if (base64String) {
                    onImageChange(base64String);
                }
            };
            reader.onerror = (error) => {
                console.error("Error reading file:", error);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    return (
        <div className="flex flex-col space-y-6">
            <div>
                <label htmlFor="url-input" className="text-xl font-semibold text-gray-100">
                    1a. Enter News Article URL
                </label>
                <p className="text-sm text-gray-400 mb-2">The AI will read the article and generate a script.</p>
                <input
                    id="url-input"
                    type="url"
                    value={url}
                    onChange={(e) => onUrlChange(e.target.value)}
                    placeholder="e.g., https://www.example.com/news/article-name"
                    className="w-full p-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 text-gray-300 disabled:bg-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed"
                    disabled={isLoading || !!headline.trim()}
                    aria-label="News article URL"
                />
            </div>

            <div className="flex items-center space-x-4">
                <hr className="flex-grow border-gray-600"/>
                <span className="text-gray-400 font-semibold">OR</span>
                <hr className="flex-grow border-gray-600"/>
            </div>

            <div>
                <label htmlFor="headline-input" className="text-xl font-semibold text-gray-100">
                    1b. Enter News Headline
                </label>
                 <p className="text-sm text-gray-400 mb-2">The AI will create a script based on your headline (in any language).</p>
                <textarea
                    id="headline-input"
                    value={headline}
                    onChange={(e) => onHeadlineChange(e.target.value)}
                    placeholder="e.g., 'Una empresa tecnológica lanza un nuevo teléfono revolucionario'"
                    rows={3}
                    className="w-full p-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 text-gray-300 resize-y disabled:bg-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed"
                    disabled={isLoading || !!url.trim()}
                    aria-label="News headline in any language"
                />
            </div>

            <div>
                <label className="text-xl font-semibold text-gray-100">
                    1c. (Optional) Provide an Image
                </label>
                <p className="text-sm text-gray-400 mb-2">The AI will use this image as context for the generated scenes.</p>
                {uploadedImage ? (
                    <div className="mt-2 space-y-2">
                        <div className="relative border-2 border-gray-600 rounded-lg p-2">
                            <img 
                                src={`data:image/jpeg;base64,${uploadedImage}`} 
                                alt="Uploaded preview" 
                                className="w-full max-h-48 object-contain rounded-md"
                            />
                            <button 
                                onClick={() => onImageChange(null)}
                                className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1.5 hover:bg-opacity-80 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                                aria-label="Remove image"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                    </div>
                ) : (
                    <label 
                        htmlFor="image-upload-input" 
                        className="mt-2 w-full flex justify-center items-center px-6 py-4 border-2 border-dashed border-gray-600 rounded-md cursor-pointer hover:border-cyan-500 hover:bg-gray-800/50 transition-colors"
                    >
                        <div className="text-center">
                            <UploadIcon />
                            <p className="mt-1 text-sm text-gray-400">Click to upload an image</p>
                            <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
                        </div>
                        <input 
                            id="image-upload-input" 
                            type="file" 
                            accept="image/png, image/jpeg, image/webp" 
                            className="hidden" 
                            onChange={handleFileChange}
                            disabled={isLoading}
                            aria-label="Upload image"
                        />
                    </label>
                )}
            </div>
            
            <button
                onClick={onGenerate}
                disabled={isGenerateDisabled}
                className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                    </>
                ) : 'Generate Content'}
            </button>
        </div>
    );
};

export default InputPanel;