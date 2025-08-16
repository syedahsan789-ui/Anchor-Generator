
import { GoogleGenAI, GenerateContentResponse, GenerateImagesResponse, Type } from "@google/genai";
import { NewsTopic, SocialMediaContent } from '../types';
import { BASE_ANCHOR_PROMPT } from "../constants";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const validTopics = Object.values(NewsTopic).filter(t => t !== 'default').join(', ');

/**
 * A wrapper function to retry an async operation with exponential backoff.
 * @param fn The async function to execute.
 * @param maxRetries The maximum number of retries.
 * @param initialDelay The initial delay in milliseconds.
 * @returns A promise that resolves with the result of the function.
 */
const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 5000): Promise<T> => {
    let retries = 0;
    while (true) {
        try {
            return await fn();
        } catch (e: any) {
            const errorMessage = (e.message || '').toLowerCase();
            const isRateLimitError = errorMessage.includes('429') || errorMessage.includes('resource_exhausted') || errorMessage.includes('rate limit');
            const isInternalError = errorMessage.includes('500') || errorMessage.includes('internal error');
            
            if ((isRateLimitError || isInternalError) && retries < maxRetries) {
                retries++;
                const delay = initialDelay * Math.pow(2, retries - 1);
                const errorType = isInternalError ? "Internal error" : "Rate limit";
                console.warn(`${errorType} detected. Retrying in ${delay}ms... (Attempt ${retries}/${maxRetries})`);
                await new Promise(res => setTimeout(res, delay));
            } else {
                throw e; // Re-throw if not a retryable error or max retries are exceeded
            }
        }
    }
};


/**
 * Processes a news article URL to generate a script, topic, descriptions, and social media content.
 * @param url The URL of the news article.
 * @param imageBase64 Optional base64 encoded image for visual context.
 * @returns A promise that resolves to the processed content.
 */
export const processArticleUrl = async (url: string, imageBase64: string | null): Promise<{ 
    script: string; 
    topic: string; 
    backgroundDescription: string; 
    postImageDescription: string;
    socialMediaContent: SocialMediaContent; 
    videoImagePrompts: string[];
    storyVideoPrompts: string[];
}> => {
    const parts: any[] = [];
    
    let prompt = `
        Analyze the content at the URL "${url}". Based on the article, generate a response in a specific JSON format.
    `;

     if (imageBase64) {
        prompt += `
            An image has also been provided. Use this image as the PRIMARY visual context. The 'backgroundDescription' and 'postImageDescription' MUST be derived from this image, while also being relevant to the news article.
        `;
        parts.push({ 
            inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64,
            }
        });
    }

    prompt += `
        The JSON object must contain these top-level properties:
        1.  "script": A 3-4 sentence news summary written for a news anchor. This should be a direct report of the news. Do NOT mention the source article.
        2.  "topic": The single most relevant topic from this list: ${validTopics}.
        3.  "backgroundDescription": A short, vivid description for a background image behind the news anchor. This must be safe for work and should NOT describe people, graphic events, or violence. Focus on locations, objects, or abstract concepts.
        4.  "postImageDescription": A detailed prompt for an AI image generator to create an eye-catching 1:1 social media post image related to the story. This prompt MUST include a short, high-impact text phrase (like 'BREAKING NEWS' or 'MAJOR UPDATE') to be visibly rendered on the image.
        5.  "socialMediaContent": An object containing content for various social media platforms.
        6.  "videoImagePrompts": An array of 3-4 detailed, photorealistic image prompts for 16:9 video B-roll. The prompts should describe scenes, objects, or abstract concepts related to the news story. DO NOT include people or text in the prompts.
        7.  "storyVideoPrompts": An array of 1-2 cinematic, detailed text-to-video prompts based on the main news script. These prompts should describe actions, camera movements, and moods.

        The "socialMediaContent" object must have the nested structure defined in the example.

        CRITICAL INSTRUCTIONS:
        - Your entire response MUST be a single, raw, valid JSON object.
        - Do NOT include any text, conversation, or markdown (like \`\`\`json) outside of the JSON object.

        EXAMPLE OF A PERFECTLY FORMATTED RESPONSE:
        {
          "script": "Innovate Inc. has unveiled a revolutionary quantum computer, promising to solve complex problems millions of times faster than current supercomputers.",
          "topic": "technology",
          "backgroundDescription": "A sleek, futuristic quantum computer with glowing blue qubits in a modern, high-tech laboratory.",
          "postImageDescription": "A dramatic, high-contrast image of a futuristic quantum computer, with the text 'QUANTUM LEAP!' overlaid in a bold, modern font.",
          "socialMediaContent": {
            "youtube": {
              "title": "Quantum Leap: The Computer That Will Change Everything!",
              "description": "Innovate Inc. just changed the game with their new quantum computer. We dive into what this means for technology, science, and the future of computing.",
              "keywords": ["quantum computing", "Innovate Inc", "supercomputer", "technology", "breakthrough", "science", "future tech"],
              "hashtags": ["#QuantumComputing", "#TechNews", "#FutureTech"]
            },
            "facebook": {
              "post": "Mind-blowing news from the tech world! 🤯 Innovate Inc. has just announced a new quantum computer that could solve problems we previously thought were impossible. This is a massive step forward for science and technology! #QuantumComputing #Innovation #Tech"
            },
            "instagram": {
              "post": "The future is now! 🤖✨ Innovate Inc. just revealed their groundbreaking quantum computer. This isn't just an upgrade; it's a whole new era of computing power. #QuantumComputing #QuantumLeap #TechBreakthrough #Innovation #FutureIsNow #ScienceAndTechnology"
            }
          },
          "videoImagePrompts": [
            "A detailed schematic of a quantum circuit on a futuristic holographic display.",
            "Close-up of a cryogenic chamber used to cool quantum processors.",
            "An abstract representation of data bits flowing through quantum entanglement."
          ],
          "storyVideoPrompts": [
            "A dynamic panning shot across a high-tech laboratory, settling on a glowing quantum computer, with lens flares and a sense of awe.",
            "Extreme close-up on the quantum processor, with pulsating blue light and data streams flowing visibly, conveying immense computational power."
          ]
        }
    `;
    
    parts.unshift({ text: prompt });

    const config: any = {
        temperature: 0.3,
    };

    if (!imageBase64) {
        config.tools = [{ googleSearch: {} }];
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts },
            config: config,
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }
        
        const startIndex = jsonStr.indexOf('{');
        const endIndex = jsonStr.lastIndexOf('}');

        if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
            throw new Error(`Could not find a valid JSON object in the AI's response. Raw response: ${response.text}`);
        }

        const jsonContent = jsonStr.substring(startIndex, endIndex + 1);
        const parsedData = JSON.parse(jsonContent);

        const social = parsedData.socialMediaContent;
        if (parsedData && typeof parsedData.script === 'string' && typeof parsedData.topic === 'string' && typeof parsedData.backgroundDescription === 'string' && typeof parsedData.postImageDescription === 'string' && social && social.youtube && social.facebook && social.instagram && Array.isArray(parsedData.videoImagePrompts) && Array.isArray(parsedData.storyVideoPrompts)) {
            const topic = parsedData.topic.toLowerCase();
            if (Object.values(NewsTopic).includes(topic as NewsTopic)) {
                return { 
                    script: parsedData.script.trim(), 
                    topic,
                    backgroundDescription: parsedData.backgroundDescription.trim(),
                    postImageDescription: parsedData.postImageDescription.trim(),
                    socialMediaContent: parsedData.socialMediaContent,
                    videoImagePrompts: parsedData.videoImagePrompts,
                    storyVideoPrompts: parsedData.storyVideoPrompts,
                };
            }
        }
        
        throw new Error("AI returned an invalid or incomplete data structure.");

    } catch (e) {
        console.error("Failed to process article URL:", e);
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        throw new Error(`Could not process the article URL. Details: ${errorMessage}`);
    }
};

/**
 * Processes a news headline to generate a script, topic, descriptions, and social media content.
 * @param headline The news headline, in any language.
 * @param imageBase64 Optional base64 encoded image for visual context.
 * @returns A promise that resolves to the processed content.
 */
export const processHeadline = async (headline: string, imageBase64: string | null): Promise<{ 
    script: string; 
    topic: string; 
    backgroundDescription: string; 
    postImageDescription: string;
    socialMediaContent: SocialMediaContent;
    videoImagePrompts: string[];
    storyVideoPrompts: string[];
}> => {
    // Define the expected JSON structure for the AI's response.
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            script: { type: Type.STRING, description: "A 3-4 sentence news summary written for a news anchor, based on the headline." },
            topic: { type: Type.STRING, description: `The single most relevant topic from this list: ${validTopics}.` },
            backgroundDescription: { type: Type.STRING, description: "A short, vivid description for a background image behind the news anchor. Must be safe for work and should NOT describe people, graphic events, or violence." },
            postImageDescription: { type: Type.STRING, description: "A detailed prompt for an AI image generator to create an eye-catching 1:1 social media post image related to the story. This prompt MUST include a short, high-impact text phrase (like 'BREAKING NEWS' or 'MAJOR UPDATE') to be visibly rendered on the image." },
            socialMediaContent: {
                type: Type.OBJECT,
                properties: {
                    youtube: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ["title", "description", "keywords", "hashtags"]
                    },
                    facebook: {
                        type: Type.OBJECT,
                        properties: {
                            post: { type: Type.STRING },
                        },
                        required: ["post"]
                    },
                    instagram: {
                        type: Type.OBJECT,
                        properties: {
                            post: { type: Type.STRING },
                        },
                        required: ["post"]
                    },
                },
                required: ["youtube", "facebook", "instagram"]
            },
            videoImagePrompts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of 3-4 detailed, photorealistic image prompts for 16:9 video B-roll. The prompts should describe scenes, objects, or abstract concepts related to the news story. DO NOT include people or text in the prompts."
            },
            storyVideoPrompts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of 1-2 cinematic, detailed text-to-video prompts based on the main script. These prompts should describe actions, camera movements, and moods."
            },
        },
        required: ["script", "topic", "backgroundDescription", "postImageDescription", "socialMediaContent", "videoImagePrompts", "storyVideoPrompts"]
    };

    let prompt = `
        You are a creative news content generator. You will be given a news headline, and optionally an image. Your task is to expand on this headline to create a full news segment.
    `;
    
    if (imageBase64) {
        prompt += `
            An image has been provided. It is the primary source of visual context. The headline provides additional context. Your 'backgroundDescription' and 'postImageDescription' MUST be based on the provided image, and the 'script' should creatively connect the headline to the image.
        `;
    }

    prompt += `
        First, if the headline is not in English, translate it to English. Then, use the English headline (and the image if provided) to creatively generate the content, adhering strictly to the provided JSON schema.

        The user-provided headline is: "${headline}"
    `;
    
    const contents: any = { parts: [{ text: prompt }] };

    if (imageBase64) {
        contents.parts.push({
            inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64,
            }
        });
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                temperature: 0.5,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonStr = response.text.trim();
        const parsedData = JSON.parse(jsonStr);

        const social = parsedData.socialMediaContent;
        if (parsedData && typeof parsedData.script === 'string' && typeof parsedData.topic === 'string' && typeof parsedData.backgroundDescription === 'string' && typeof parsedData.postImageDescription === 'string' && social && social.youtube && social.facebook && social.instagram && Array.isArray(parsedData.videoImagePrompts) && Array.isArray(parsedData.storyVideoPrompts)) {
            const topic = parsedData.topic.toLowerCase();
            // Checking if the topic is valid is a good idea.
            if (Object.values(NewsTopic).includes(topic as NewsTopic)) {
                return { 
                    script: parsedData.script.trim(), 
                    topic,
                    backgroundDescription: parsedData.backgroundDescription.trim(),
                    postImageDescription: parsedData.postImageDescription.trim(),
                    socialMediaContent: parsedData.socialMediaContent,
                    videoImagePrompts: parsedData.videoImagePrompts,
                    storyVideoPrompts: parsedData.storyVideoPrompts,
                };
            } else {
                 // Fallback if the model returns a topic not in the list
                 console.warn(`AI returned an unknown topic: '${topic}'. Defaulting to 'default'.`)
                 return { 
                    script: parsedData.script.trim(), 
                    topic: NewsTopic.Default,
                    backgroundDescription: parsedData.backgroundDescription.trim(),
                    postImageDescription: parsedData.postImageDescription.trim(),
                    socialMediaContent: parsedData.socialMediaContent,
                    videoImagePrompts: parsedData.videoImagePrompts,
                    storyVideoPrompts: parsedData.storyVideoPrompts,
                };
            }
        }
        
        throw new Error("AI returned an invalid or incomplete data structure despite the schema.");

    } catch (e) {
        console.error("Failed to process headline:", e);
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        if (e instanceof SyntaxError) {
             throw new Error(`The AI failed to return valid JSON. Please try again. Details: ${errorMessage}`);
        }
        throw new Error(`Could not process the headline. Details: ${errorMessage}`);
    }
};

/**
 * Generates all necessary content images (16:9, 9:16, 1:1) sequentially to avoid rate limits.
 * @param backgroundDescription Description for the news anchor's background.
 * @param postImageDescription Description for the social media post image.
 * @param baseAnchorPrompt The base prompt for the news anchor.
 * @returns An object containing all generated images, a final prompt, and a fallback flag.
 */
export const generateContentImages = async (
    backgroundDescription: string,
    postImageDescription: string,
    baseAnchorPrompt: string
): Promise<{ 
    image16x9: string | null; 
    image9x16: string | null; 
    postImage: string | null;
    finalPrompt: string;
}> => {

    const generate = async (prompt: string, aspectRatio: '16:9' | '9:16' | '1:1'): Promise<GenerateImagesResponse | null> => {
        try {
            return await withRetry(() => ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio,
                },
            }));
        } catch (e) {
            console.error(`Image generation failed for aspect ratio ${aspectRatio}:`, e);
            return null; // Return null on failure
        }
    };

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    // --- Define Prompts ---
    const primaryAnchorPrompt16x9 = `${baseAnchorPrompt}, with a background of ${backgroundDescription}`;
    const primaryAnchorPrompt9x16 = `Medium close-up shot of ${baseAnchorPrompt}, with a background of ${backgroundDescription}`;
    const postImagePrompt = `A high-quality, photorealistic image representing: ${postImageDescription}. Clean, professional, editorial style.`;

    let finalPrompt = primaryAnchorPrompt16x9;
    let fallbackUsed = false;

    // --- Sequential Generation ---
    console.log("Generating 16:9 image...");
    let result16x9 = await generate(primaryAnchorPrompt16x9, '16:9');
    
    await delay(15000); // Add a longer delay to avoid rate-limiting

    console.log("Generating 9:16 image...");
    let result9x16 = await generate(primaryAnchorPrompt9x16, '9:16');
    
    await delay(15000); // Add a longer delay to avoid rate-limiting
    
    console.log("Generating 1:1 post image...");
    let resultPostImage = await generate(postImagePrompt, '1:1');

    // --- Sequential Fallback for Anchor Images ---
    if (!result16x9?.generatedImages?.[0]) {
        console.warn("Primary 16:9 anchor image generation failed. Attempting fallback.");
        const fallbackAnchorPrompt = `${baseAnchorPrompt}, with a background of a generic news studio.`;
        if (!fallbackUsed) {
            finalPrompt = `${fallbackAnchorPrompt} (Fallback to generic background due to content policy)`;
            fallbackUsed = true;
        }
        await delay(15000); // Add a longer delay to avoid rate-limiting
        result16x9 = await generate(fallbackAnchorPrompt, '16:9');
    }
    
    if (!result9x16?.generatedImages?.[0]) {
        console.warn("Primary 9:16 anchor image generation failed. Attempting fallback.");
        const fallbackAnchorPrompt = `${baseAnchorPrompt}, with a background of a generic news studio.`;
         if (!fallbackUsed) {
            finalPrompt = `${fallbackAnchorPrompt} (Fallback to generic background due to content policy)`;
            fallbackUsed = true;
        }
        await delay(15000); // Add a longer delay to avoid rate-limiting
        result9x16 = await generate(fallbackAnchorPrompt, '9:16');
    }

    const image16x9 = result16x9?.generatedImages?.[0]?.image?.imageBytes ? `data:image/jpeg;base64,${result16x9.generatedImages[0].image.imageBytes}` : null;
    const image9x16 = result9x16?.generatedImages?.[0]?.image?.imageBytes ? `data:image/jpeg;base64,${result9x16.generatedImages[0].image.imageBytes}` : null;
    const postImage = resultPostImage?.generatedImages?.[0]?.image?.imageBytes ? `data:image/jpeg;base64,${resultPostImage.generatedImages[0].image.imageBytes}` : null;

    if (!image16x9 && !image9x16 && !postImage) {
        throw new Error("All image generation attempts failed. The topic may be too sensitive for the image safety filters or there may be a persistent API issue.");
    }
    
    return { image16x9, image9x16, postImage, finalPrompt };
};

/**
 * Generates an array of B-roll images for video content.
 * @param prompts An array of image generation prompts.
 * @returns A promise that resolves to an array of base64 encoded image strings.
 */
export const generateVideoImages = async (prompts: string[]): Promise<string[]> => {
    const generatedImages: string[] = [];

    // Use a for...of loop to process sequentially and respect rate limits
    for (const prompt of prompts) {
        console.log(`Generating video image for prompt: "${prompt}"`);
        try {
            // Use withRetry wrapper for resilience
            const result = await withRetry(() => ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: `${prompt}. Photorealistic, cinematic, 16:9 aspect ratio.`, // Enhance prompt
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '16:9',
                },
            }));
            
            if (result?.generatedImages?.[0]?.image?.imageBytes) {
                generatedImages.push(`data:image/jpeg;base64,${result.generatedImages[0].image.imageBytes}`);
            } else {
                console.warn(`Image generation returned no image for prompt: "${prompt}"`);
            }
        } catch (error) {
            console.error(`Failed to generate image for prompt "${prompt}":`, error);
            // Continue to the next image even if one fails
        }
        // Add a delay between each call to avoid rate limit issues
        await new Promise(res => setTimeout(res, 15000));
    }
    return generatedImages;
};


/**
 * Processes two or three headlines to generate a unified script, social media content, and image prompts.
 * @returns A promise resolving to the processed content.
 */
export const processMultipleHeadlines = async (
    headline1: string, 
    headline2: string, 
    headline3: string,
    image1: string | null,
    image2: string | null,
    image3: string | null
): Promise<{
    introScript: string;
    mainScript: string;
    urduScript: string;
    thumbnailPrompt: string;
    postImageDescriptions: string[];
    socialMediaContent: SocialMediaContent;
    videoImagePrompts: string[];
    introVideoPrompt: string;
    storyVideoPrompts: string[];
}> => {
    const hasHeadline3 = headline3.trim() !== '';
    const numberOfStories = hasHeadline3 ? 'three' : 'two';
    const storyCountText = hasHeadline3 ? '3' : '2';
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            introScript: { type: Type.STRING, description: "A short, engaging 15-20 second introduction that hooks the viewer by teasing all the provided news stories." },
            mainScript: { type: Type.STRING, description: `A detailed, long-form news script covering each of the ${numberOfStories} stories in depth. Use clear separators.` },
            urduScript: { type: Type.STRING, description: "A complete and accurate Urdu translation of the entire 'mainScript'." },
            thumbnailPrompt: { type: Type.STRING, description: `A detailed prompt for an AI image generator to create an eye-catching 16:9 YouTube thumbnail. This prompt MUST include a short, high-impact text phrase (like 'WORLD SHOCKED!' or '${storyCountText} HUGE STORIES') to be visibly rendered on the thumbnail. If images were provided, this prompt should describe a scene that creatively combines elements from them.` },
            postImageDescriptions: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: `An array of short (5-7 words) descriptions, one for each news story provided. Each description is for a photorealistic square social media image and MUST include a short, catchy text phrase to be rendered on the image.`
            },
            socialMediaContent: {
                type: Type.OBJECT,
                properties: {
                    youtube: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ["title", "description", "keywords", "hashtags"]
                    },
                    facebook: { type: Type.OBJECT, properties: { post: { type: Type.STRING } }, required: ["post"] },
                    instagram: { type: Type.OBJECT, properties: { post: { type: Type.STRING } }, required: ["post"] },
                },
                required: ["youtube", "facebook", "instagram"]
            },
            videoImagePrompts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: `An array of 5-6 detailed, photorealistic image prompts for 16:9 video B-roll. The prompts should describe scenes, objects, or abstract concepts related to the news stories. DO NOT include people or text in the prompts.`
            },
            introVideoPrompt: {
                type: Type.STRING,
                description: "A single, cinematic text-to-video prompt for the intro script. It should be dynamic and engaging, setting the stage for the news roundup. Describe camera movements like 'fast-paced montage' or 'dramatic zoom'."
            },
            storyVideoPrompts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of cinematic text-to-video prompts, one for each news story in the main script. The length of this array must match the number of stories provided. Each prompt should be detailed and describe action and mood."
            },
        },
        required: ["introScript", "mainScript", "urduScript", "thumbnailPrompt", "postImageDescriptions", "socialMediaContent", "videoImagePrompts", "introVideoPrompt", "storyVideoPrompts"]
    };

    let prompt = `
        You are an expert news producer creating a content package for a YouTube video covering ${numberOfStories} stories.
        The headlines are:
        1. "${headline1}"
        2. "${headline2}"
    `;

    if (hasHeadline3) {
        prompt += `
        3. "${headline3}"`;
    }
    
    if (image1 || image2 || image3) {
        prompt += `

Images have been provided for one or more headlines. Use them as the primary visual inspiration. The 'thumbnailPrompt' you create should describe a single, compelling scene or collage that creatively incorporates elements from the provided images.`
    }

    prompt += `

Translate any non-English headlines to English before processing. Your entire response MUST be a single, raw, valid JSON object that strictly follows the provided schema. The 'postImageDescriptions' array MUST have the same number of items as headlines provided. You must provide an Urdu translation for the main script.`;

    const parts: any[] = [{ text: prompt }];

    const images = [image1, image2, image3];
    images.forEach(img => {
        if (img) {
            parts.push({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: img,
                }
            });
        }
    });

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts },
            config: {
                temperature: 0.6,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonStr = response.text.trim();
        const parsedData = JSON.parse(jsonStr);

        if (parsedData.introScript && parsedData.mainScript && parsedData.urduScript && parsedData.thumbnailPrompt && Array.isArray(parsedData.postImageDescriptions) && parsedData.socialMediaContent && Array.isArray(parsedData.videoImagePrompts) && parsedData.introVideoPrompt && Array.isArray(parsedData.storyVideoPrompts)) {
            return parsedData;
        } else {
            throw new Error("AI returned incomplete data structure for multi-headline request.");
        }
    } catch (e) {
        console.error("Failed to process multiple headlines:", e);
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        throw new Error(`Could not process headlines. Details: ${errorMessage}`);
    }
};

/**
 * Generates a thumbnail and social post image for a multi-story roundup.
 * @param thumbnailPrompt The detailed prompt for the 16:9 YouTube thumbnail.
 * @param postImageDescriptions An array of short descriptions for the 1:1 social media post images.
 * @returns An object containing the base64 encoded images.
 */
export const generateImagesForMultipleHeadlines = async (
    thumbnailPrompt: string,
    postImageDescriptions: string[]
): Promise<{
    thumbnail: string | null;
    postImages: (string | null)[];
}> => {
    const generate = async (prompt: string, aspectRatio: '16:9' | '1:1'): Promise<GenerateImagesResponse | null> => {
        try {
            return await withRetry(() => ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio,
                },
            }));
        } catch (e) {
            console.error(`Image generation failed for prompt "${prompt}":`, e);
            return null;
        }
    };
    
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    // --- Thumbnail Generation with Fallback ---
    console.log("Generating 16:9 thumbnail for multi-story roundup...");
    let thumbnailResult = await generate(thumbnailPrompt, '16:9');

    if (!thumbnailResult?.generatedImages?.[0]) {
        console.warn("Primary thumbnail generation failed. Attempting fallback.");
        const fallbackTheme = postImageDescriptions[0] || 'news stories';
        const fallbackThumbnailPrompt = `A professional and eye-catching YouTube thumbnail for a news roundup. The main theme is '${fallbackTheme}'. Feature bold text saying 'Breaking News'. Graphic design, high contrast.`;
        await delay(15000);
        thumbnailResult = await generate(fallbackThumbnailPrompt, '16:9');
    }

    await delay(15000); // Delay between thumbnail and post images
    
    // --- Post Image Generation ---
    const postImages: (string | null)[] = [];
    for (const [index, description] of postImageDescriptions.entries()) {
        if (!description) {
            postImages.push(null);
            continue;
        };

        const postImagePrompt = `A high-quality, photorealistic image for a social media post about: ${description}. Clean, professional, editorial style, with eye-catching text integrated into the image. 1:1 aspect ratio.`;
        console.log(`Generating 1:1 post image for: "${description}"`);
        let postImageResult = await generate(postImagePrompt, '1:1');
        
        if (!postImageResult?.generatedImages?.[0]) {
            console.warn(`Primary post image generation failed for "${description}". Attempting fallback.`);
            const fallbackPostImagePrompt = "An abstract graphic design with news-related symbols and bold text saying 'News Update'. 1:1 aspect ratio, clean, modern.";
            await delay(15000);
            postImageResult = await generate(fallbackPostImagePrompt, '1:1');
        }

        const image = postImageResult?.generatedImages?.[0]?.image?.imageBytes
            ? `data:image/jpeg;base64,${postImageResult.generatedImages[0].image.imageBytes}`
            : null;
        postImages.push(image);
        
        // Add delay between each call to avoid rate limit issues, but not after the last one
        if (index < postImageDescriptions.length - 1) {
            await delay(15000);
        }
    }

    const thumbnail = thumbnailResult?.generatedImages?.[0]?.image?.imageBytes
        ? `data:image/jpeg;base64,${thumbnailResult.generatedImages[0].image.imageBytes}`
        : null;
        
    if (!thumbnail && postImages.every(img => img === null)) {
        throw new Error("All image generation attempts, including fallbacks, have failed for the multi-story roundup. This might be due to persistent safety filters or a network issue. Please try different headlines.");
    }
    
    return { thumbnail, postImages };
};

/**
 * Regenerates a single 16:9 thumbnail image from a prompt.
 * @param prompt The prompt for the thumbnail.
 * @returns The base64 encoded image string or null on failure.
 */
export const regenerateThumbnail = async (prompt: string): Promise<string | null> => {
    try {
        const result = await withRetry(() => ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        }));

        if (result?.generatedImages?.[0]?.image?.imageBytes) {
            return `data:image/jpeg;base64,${result.generatedImages[0].image.imageBytes}`;
        }
        return null;
    } catch (e) {
        console.error("Thumbnail regeneration failed:", e);
        throw e;
    }
};

/**
 * Takes a script and generates a text-to-video prompt for each paragraph.
 * @param script The news script to process.
 * @returns A promise that resolves to an array of objects, each containing a paragraph and its prompt.
 */
export const generateParagraphVideoPrompts = async (script: string): Promise<{ paragraph: string; prompt: string }[]> => {
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            prompts: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        paragraph: { type: Type.STRING, description: "A paragraph from the original script." },
                        prompt: { type: Type.STRING, description: "A detailed, cinematic text-to-video prompt based on the corresponding paragraph." }
                    },
                    required: ["paragraph", "prompt"]
                }
            }
        },
        required: ["prompts"]
    };

    const prompt = `
        You are a video production assistant. Your task is to take a news script, break it down into logical paragraphs, and generate a cinematic text-to-video prompt for each paragraph.

        The script is:
        ---
        ${script}
        ---

        For each paragraph, create a detailed and engaging text-to-video prompt that visually represents the content of that paragraph. Describe camera movements, angles, lighting, and mood. The prompts should be suitable for a modern text-to-video AI generator.

        Return the result as a JSON object that adheres to the provided schema. The 'prompts' array should contain objects, each with a 'paragraph' and its corresponding 'prompt'.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: prompt }] },
            config: {
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonStr = response.text.trim();
        const parsedData = JSON.parse(jsonStr);

        if (parsedData.prompts && Array.isArray(parsedData.prompts)) {
            const arePromptsValid = parsedData.prompts.every(
                (p: any) => typeof p.paragraph === 'string' && typeof p.prompt === 'string'
            );
            if (arePromptsValid) {
                return parsedData.prompts;
            }
        }
        
        throw new Error("AI returned an invalid or incomplete data structure for paragraph prompts.");

    } catch (e) {
        console.error("Failed to generate paragraph video prompts:", e);
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        throw new Error(`Could not generate paragraph video prompts. Details: ${errorMessage}`);
    }
};
