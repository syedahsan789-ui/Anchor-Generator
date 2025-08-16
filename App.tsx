
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { processArticleUrl, processHeadline, generateContentImages, processMultipleHeadlines, generateImagesForMultipleHeadlines, regenerateThumbnail, generateVideoImages, generateParagraphVideoPrompts } from './services/geminiService';
import { BASE_ANCHOR_PROMPT } from './constants';
import InputPanel from './components/ScriptInput';
import { VideoDisplay } from './components/VideoDisplay';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SocialMediaContent } from './types';
import SocialMediaOutput from './components/SocialMediaOutput';
import MultiHeadlineInput from './components/MultiHeadlineInput';
import VideoBrollDisplay from './components/VideoBrollDisplay';
import SocialIntegrations from './components/SocialIntegrations';
import VideoPromptsDisplay from './components/VideoPromptsDisplay';
import ParagraphVideoPrompts from './components/ParagraphVideoPrompts';

function App() {
  // Common State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'single' | 'multi'>('single');

  // Single Story State
  const [url, setUrl] = useState<string>('');
  const [headline, setHeadline] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage16x9, setGeneratedImage16x9] = useState<string | null>(null);
  const [generatedImage9x16, setGeneratedImage9x16] = useState<string | null>(null);
  const [analyzedTopic, setAnalyzedTopic] = useState<string | null>(null);

  // Multi-Story State
  const [headline1, setHeadline1] = useState<string>('');
  const [headline2, setHeadline2] = useState<string>('');
  const [headline3, setHeadline3] = useState<string>('');
  const [uploadedImage1, setUploadedImage1] = useState<string | null>(null);
  const [uploadedImage2, setUploadedImage2] = useState<string | null>(null);
  const [uploadedImage3, setUploadedImage3] = useState<string | null>(null);
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
  const [editableThumbnailPrompt, setEditableThumbnailPrompt] = useState<string | null>(null);
  const [isRegeneratingThumbnail, setIsRegeneratingThumbnail] = useState<boolean>(false);


  // Shared Output State
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [generatedUrduScript, setGeneratedUrduScript] = useState<string | null>(null);
  const [postImages, setPostImages] = useState<(string | null)[] | null>(null);
  const [socialMediaContent, setSocialMediaContent] = useState<SocialMediaContent | null>(null);
  const [finalPrompt, setFinalPrompt] = useState<string>('');
  const [videoImages, setVideoImages] = useState<string[] | null>(null);
  const [isGeneratingVideoImages, setIsGeneratingVideoImages] = useState<boolean>(false);
  const [introVideoPrompt, setIntroVideoPrompt] = useState<string | null>(null);
  const [storyVideoPrompts, setStoryVideoPrompts] = useState<string[] | null>(null);
  const [paragraphPrompts, setParagraphPrompts] = useState<{paragraph: string, prompt: string}[] | null>(null);
  const [isGeneratingParagraphPrompts, setIsGeneratingParagraphPrompts] = useState<boolean>(false);
  const [paragraphPromptsError, setParagraphPromptsError] = useState<string | null>(null);

  // Speech Synthesis State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Effect to load speech synthesis voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));
        setVoices(englishVoices);
        if (!selectedVoiceURI && englishVoices.length > 0) {
          const googleVoice = englishVoices.find(v => v.name.includes('Google'));
          setSelectedVoiceURI(googleVoice ? googleVoice.voiceURI : englishVoices[0].voiceURI);
        }
      }
    };
    
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedVoiceURI]);

  // Effect to generate detailed, paragraph-by-paragraph video prompts
  useEffect(() => {
    const generatePrompts = async () => {
        if (generatedScript && !isLoading) { // Only run when script is set and main loading is done
            try {
                setIsGeneratingParagraphPrompts(true);
                setParagraphPromptsError(null);
                setParagraphPrompts(null); // Reset previous prompts
                
                let scriptToProcess = generatedScript;
                // For multi-story, we only want the main script part for detailed prompts
                if (mode === 'multi' && generatedScript.includes('FULL SCRIPT:')) {
                    scriptToProcess = generatedScript.split('FULL SCRIPT:')[1].trim();
                }

                if (scriptToProcess) {
                    const prompts = await generateParagraphVideoPrompts(scriptToProcess);
                    setParagraphPrompts(prompts);
                }

            } catch (e) {
                console.error("Failed to generate paragraph prompts:", e);
                const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
                setParagraphPromptsError(`Failed to generate detailed video prompts. ${errorMessage}`);
            } finally {
                setIsGeneratingParagraphPrompts(false);
            }
        }
    };
    generatePrompts();
  }, [generatedScript, isLoading, mode]);

  const resetState = () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsLoading(true);
      setError(null);
      setGeneratedImage16x9(null);
      setGeneratedImage9x16(null);
      setGeneratedThumbnail(null);
      setPostImages(null);
      setSocialMediaContent(null);
      setGeneratedScript(null);
      setGeneratedUrduScript(null);
      setFinalPrompt('');
      setEditableThumbnailPrompt(null);
      setAnalyzedTopic(null);
      setVideoImages(null);
      setIsGeneratingVideoImages(false);
      setIntroVideoPrompt(null);
      setStoryVideoPrompts(null);
      setIsSpeaking(false);
      setIsDownloading(false);
      utteranceRef.current = null;
      setParagraphPrompts(null);
      setIsGeneratingParagraphPrompts(false);
      setParagraphPromptsError(null);
  }

  const handleGenerateSingle = useCallback(async () => {
    const hasUrl = url.trim().length > 0;
    const hasHeadline = headline.trim().length > 0;

    if (!hasUrl && !hasHeadline) {
      setError('Please enter a news article URL or a headline.');
      return;
    }

    if (hasUrl) {
      try {
        new URL(url);
      } catch (_) {
        setError('Please enter a valid URL (e.g., https://example.com).');
        return;
      }
    }

    resetState();

    try {
      let content;
      if (hasHeadline) {
          content = await processHeadline(headline, uploadedImage);
      } else {
          content = await processArticleUrl(url, uploadedImage);
      }
      
      const { 
        script: newScript, 
        topic, 
        backgroundDescription, 
        postImageDescription,
        socialMediaContent: newSocialContent,
        videoImagePrompts,
        storyVideoPrompts: newStoryPrompts,
      } = content;
      
      setGeneratedScript(newScript);
      setAnalyzedTopic(topic);
      setSocialMediaContent(newSocialContent);
      setStoryVideoPrompts(newStoryPrompts);
      
      const imageResults = await generateContentImages(
        backgroundDescription, 
        postImageDescription, 
        BASE_ANCHOR_PROMPT
      );

      setFinalPrompt(imageResults.finalPrompt);
      setGeneratedImage16x9(imageResults.image16x9);
      setGeneratedImage9x16(imageResults.image9x16);
      setPostImages(imageResults.postImage ? [imageResults.postImage] : null);

      // Generate B-Roll Video Images
      if (videoImagePrompts && videoImagePrompts.length > 0) {
        setIsGeneratingVideoImages(true);
        try {
            const bRollImages = await generateVideoImages(videoImagePrompts);
            setVideoImages(bRollImages);
        } catch (e) {
            console.error(e);
            const bRollError = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(prevError => {
                const newError = `Failed to generate B-Roll images. ${bRollError}`;
                return prevError ? `${prevError}\n${newError}` : newError;
            });
        } finally {
            setIsGeneratingVideoImages(false);
        }
      }

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate content. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [url, headline, uploadedImage]);

  const handleGenerateMulti = useCallback(async () => {
    if (!headline1.trim() || !headline2.trim()) {
        setError('Please fill in at least two headlines for the roundup.');
        return;
    }
    
    resetState();
    
    try {
        const content = await processMultipleHeadlines(headline1, headline2, headline3, uploadedImage1, uploadedImage2, uploadedImage3);
        const {
            introScript,
            mainScript,
            urduScript,
            thumbnailPrompt,
            postImageDescriptions,
            socialMediaContent: newSocialContent,
            videoImagePrompts,
            introVideoPrompt,
            storyVideoPrompts,
        } = content;

        setGeneratedScript(`INTRO:\n${introScript}\n\n---\n\nFULL SCRIPT:\n${mainScript}`);
        setGeneratedUrduScript(urduScript);
        setSocialMediaContent(newSocialContent);
        setFinalPrompt(thumbnailPrompt);
        setEditableThumbnailPrompt(thumbnailPrompt);
        setIntroVideoPrompt(introVideoPrompt);
        setStoryVideoPrompts(storyVideoPrompts);
        
        const imageResults = await generateImagesForMultipleHeadlines(thumbnailPrompt, postImageDescriptions);
        setGeneratedThumbnail(imageResults.thumbnail);
        setPostImages(imageResults.postImages);
        
        if (!imageResults.thumbnail) {
            setError(prevError => {
                const newError = "The YouTube thumbnail could not be generated. This is often due to safety filters. You can try editing the prompt and regenerating it below.";
                return prevError ? `${prevError}\n${newError}` : newError;
            });
        }
        
        // Generate B-Roll Video Images
        if (videoImagePrompts && videoImagePrompts.length > 0) {
            setIsGeneratingVideoImages(true);
            try {
                const bRollImages = await generateVideoImages(videoImagePrompts);
                setVideoImages(bRollImages);
            } catch (e) {
                console.error(e);
                const bRollError = e instanceof Error ? e.message : 'An unknown error occurred.';
                setError(prevError => {
                    const newError = `Failed to generate B-Roll images. ${bRollError}`;
                    return prevError ? `${prevError}\n${newError}` : newError;
                });
            } finally {
                setIsGeneratingVideoImages(false);
            }
        }

    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`Failed to generate multi-story content. ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [headline1, headline2, headline3, uploadedImage1, uploadedImage2, uploadedImage3]);
  
  const handleRegenerateThumbnail = useCallback(async () => {
    if (!editableThumbnailPrompt) {
        setError("Thumbnail prompt is empty. Cannot regenerate.");
        return;
    }

    setIsRegeneratingThumbnail(true);
    setError(null);

    try {
        const newThumbnail = await regenerateThumbnail(editableThumbnailPrompt);
        if (newThumbnail) {
            setGeneratedThumbnail(newThumbnail);
        } else {
            throw new Error("The image generation failed. This is often due to safety filters. Please try revising your prompt to be more general or less sensitive.");
        }
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`Failed to regenerate thumbnail. ${errorMessage}`);
    } finally {
        setIsRegeneratingThumbnail(false);
    }
  }, [editableThumbnailPrompt]);


  const handlePlayPauseAudio = useCallback(() => {
    const synth = window.speechSynthesis;
    if (!generatedScript || !synth) return;

    if (synth.speaking) {
      synth.cancel();
      return;
    }

    const newUtterance = new SpeechSynthesisUtterance(generatedScript);
    const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
    if (selectedVoice) {
      newUtterance.voice = selectedVoice;
    }
    
    newUtterance.onstart = () => setIsSpeaking(true);
    newUtterance.onend = () => setIsSpeaking(false);
    newUtterance.onerror = (event) => {
      if (event.error !== 'interrupted') {
        console.error("SpeechSynthesis Error:", event.error);
      }
      setIsSpeaking(false);
    };
    
    utteranceRef.current = newUtterance;
    synth.speak(newUtterance);
  }, [generatedScript, selectedVoiceURI, voices]);

  const handleDownloadAudio = useCallback(() => {
    if (!generatedScript) {
      setError("Cannot download audio, no script has been generated.");
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const encodedScript = encodeURIComponent(generatedScript);

      if (encodedScript.length > 1800) { 
        setError("Download failed. The generated script is too long for the TTS service.");
        setIsDownloading(false);
        return;
      }
      
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedScript}&tl=en&client=tw-ob`;

      const a = document.createElement('a');
      a.href = ttsUrl;
      a.download = `news-script.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => {
        setIsDownloading(false);
      }, 2000);

    } catch (e) {
      console.error('Download audio error:', e);
      const message = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Download failed. An unexpected error occurred: ${message}`);
      setIsDownloading(false);
    }
  }, [generatedScript]);


  const renderInputPanel = () => {
    if (mode === 'single') {
        return (
            <InputPanel
                url={url}
                onUrlChange={setUrl}
                headline={headline}
                onHeadlineChange={setHeadline}
                onGenerate={handleGenerateSingle}
                isLoading={isLoading}
                uploadedImage={uploadedImage}
                onImageChange={setUploadedImage}
            />
        );
    }
    return (
        <MultiHeadlineInput
            headline1={headline1}
            headline2={headline2}
            headline3={headline3}
            onHeadlineChange={{
                1: setHeadline1,
                2: setHeadline2,
                3: setHeadline3,
            }}
            onGenerate={handleGenerateMulti}
            isLoading={isLoading}
            images={{ 1: uploadedImage1, 2: uploadedImage2, 3: uploadedImage3 }}
            onImageChange={{
                1: setUploadedImage1,
                2: setUploadedImage2,
                3: setUploadedImage3,
            }}
        />
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-900 text-gray-200 font-sans">
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 px-4 py-2 rounded-lg text-white font-extrabold text-xl z-10 shadow-lg">
        ANZAR TV 3.0
      </div>
      <div className="container mx-auto px-4 py-8">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="flex mb-4 border-b-2 border-gray-700">
                <button 
                    onClick={() => setMode('single')}
                    disabled={isLoading}
                    className={`px-4 py-2 text-lg font-semibold rounded-t-lg transition-colors ${mode === 'single' ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
                >
                    Single Story
                </button>
                <button 
                    onClick={() => setMode('multi')}
                    disabled={isLoading}
                    className={`px-4 py-2 text-lg font-semibold rounded-t-lg transition-colors ${mode === 'multi' ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
                >
                    Multi-Story Roundup
                </button>
            </div>
            {renderInputPanel()}
          </div>
          <VideoDisplay
            isLoading={isLoading}
            generatedImage16x9={generatedImage16x9}
            generatedImage9x16={generatedImage9x16}
            generatedThumbnail={generatedThumbnail}
            generatedScript={generatedScript}
            generatedUrduScript={generatedUrduScript}
            finalPrompt={finalPrompt}
            analyzedTopic={analyzedTopic}
            error={error}
            isSpeaking={isSpeaking}
            onPlayPauseAudio={handlePlayPauseAudio}
            voices={voices}
            selectedVoiceURI={selectedVoiceURI}
            onVoiceChange={setSelectedVoiceURI}
            isDownloading={isDownloading}
            onDownloadAudio={handleDownloadAudio}
            editableThumbnailPrompt={editableThumbnailPrompt}
            onEditableThumbnailPromptChange={setEditableThumbnailPrompt}
            isRegeneratingThumbnail={isRegeneratingThumbnail}
            onRegenerateThumbnail={handleRegenerateThumbnail}
          />
        </main>
        <div className="mt-12">
            <SocialMediaOutput socialMediaContent={socialMediaContent} isLoading={isLoading} />
        </div>
        <div className="mt-12">
            <SocialIntegrations postImages={postImages} isLoading={isLoading} socialMediaContent={socialMediaContent} />
        </div>
        <div className="mt-12">
            <VideoBrollDisplay 
                images={videoImages} 
                isLoading={isGeneratingVideoImages || (isLoading && !videoImages)}
            />
        </div>
        <div className="mt-12">
            <VideoPromptsDisplay 
                introVideoPrompt={introVideoPrompt}
                storyVideoPrompts={storyVideoPrompts}
                isLoading={isLoading}
            />
        </div>
        <div className="mt-12">
            <ParagraphVideoPrompts
                prompts={paragraphPrompts}
                isLoading={isGeneratingParagraphPrompts}
                error={paragraphPromptsError}
            />
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default App;
