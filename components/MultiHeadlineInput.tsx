import React from 'react';

const UploadIcon: React.FC<{className?: string}> = ({className}) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={`mx-auto h-8 w-8 text-gray-500 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14" />
    </svg>
);

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


interface ImageUploaderProps {
    image: string | null;
    onImageChange: (base64: string | null) => void;
    id: string;
    disabled: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ image, onImageChange, id, disabled }) => {
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
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    if (image) {
        return (
            <div className="mt-2 relative w-full border-2 border-gray-600 rounded-lg p-1">
                <img 
                    src={`data:image/jpeg;base64,${image}`} 
                    alt="Uploaded preview" 
                    className="w-full h-24 object-contain rounded-md"
                />
                <button 
                    onClick={() => onImageChange(null)}
                    className="absolute top-0.5 right-0.5 bg-black bg-opacity-60 text-white rounded-full p-1 hover:bg-opacity-80 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                    aria-label="Remove image"
                    disabled={disabled}
                >
                    <CloseIcon />
                </button>
            </div>
        )
    }

    return (
        <label 
            htmlFor={id} 
            className="mt-2 w-full flex justify-center items-center px-6 py-2 border-2 border-dashed border-gray-600 rounded-md cursor-pointer hover:border-cyan-500 hover:bg-gray-800/50 transition-colors"
        >
            <div className="text-center">
                <UploadIcon className="h-6 w-6"/>
                <p className="mt-1 text-xs text-gray-400">Add Image (Optional)</p>
            </div>
            <input 
                id={id} 
                type="file" 
                accept="image/png, image/jpeg, image/webp" 
                className="hidden" 
                onChange={handleFileChange}
                disabled={disabled}
                aria-label={`Upload image for headline`}
            />
        </label>
    );
};


interface MultiHeadlineInputProps {
    headline1: string;
    headline2: string;
    headline3: string;
    onHeadlineChange: {
        1: (value: string) => void;
        2: (value: string) => void;
        3: (value: string) => void;
    };
    onGenerate: () => void;
    isLoading: boolean;
    images: {
        1: string | null;
        2: string | null;
        3: string | null;
    };
    onImageChange: {
        1: (value: string | null) => void;
        2: (value: string | null) => void;
        3: (value: string | null) => void;
    };
}

const MultiHeadlineInput: React.FC<MultiHeadlineInputProps> = ({
    headline1,
    headline2,
    headline3,
    onHeadlineChange,
    onGenerate,
    isLoading,
    images,
    onImageChange
}) => {
    const isGenerateDisabled = isLoading || !headline1.trim() || !headline2.trim();

    return (
        <div className="flex flex-col space-y-6">
            <div>
                <label htmlFor="headline-input-1" className="text-xl font-semibold text-gray-100">
                    1. Enter 2-3 News Headlines
                </label>
                <p className="text-sm text-gray-400 mb-2">The AI will create a unified script and content. The third headline is optional.</p>
                <div className="space-y-4">
                     <div>
                         <textarea
                            id="headline-input-1"
                            value={headline1}
                            onChange={(e) => onHeadlineChange[1](e.target.value)}
                            placeholder="Headline 1 (Required, in any language)"
                            rows={2}
                            className="w-full p-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 text-gray-300 resize-y disabled:bg-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed"
                            disabled={isLoading}
                            aria-label="First news headline"
                        />
                         <ImageUploader id="image-upload-1" image={images[1]} onImageChange={onImageChange[1]} disabled={isLoading} />
                     </div>
                     <div>
                        <textarea
                            id="headline-input-2"
                            value={headline2}
                            onChange={(e) => onHeadlineChange[2](e.target.value)}
                            placeholder="Headline 2 (Required, in any language)"
                            rows={2}
                            className="w-full p-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 text-gray-300 resize-y disabled:bg-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed"
                            disabled={isLoading}
                            aria-label="Second news headline"
                        />
                        <ImageUploader id="image-upload-2" image={images[2]} onImageChange={onImageChange[2]} disabled={isLoading} />
                    </div>
                     <div>
                        <textarea
                            id="headline-input-3"
                            value={headline3}
                            onChange={(e) => onHeadlineChange[3](e.target.value)}
                            placeholder="Headline 3 (Optional, in any language)"
                            rows={2}
                            className="w-full p-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 text-gray-300 resize-y disabled:bg-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed"
                            disabled={isLoading}
                            aria-label="Third news headline (optional)"
                        />
                        <ImageUploader id="image-upload-3" image={images[3]} onImageChange={onImageChange[3]} disabled={isLoading} />
                    </div>
                </div>
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
                        Generating Roundup...
                    </>
                ) : 'Generate News Roundup'}
            </button>
        </div>
    );
};

export default MultiHeadlineInput;