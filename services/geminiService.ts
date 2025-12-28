import { GoogleGenAI, Type } from "@google/genai";
import { PromptMetadataResponse, PromptOptions, LyricValidationResponse, LyricTranscreationResponse } from "../types";
import { PLACES as PLACES_DATA } from "../constants";

const modelId = "gemini-3-flash-preview";
const TEST_API_KEY = "***REMOVED***";

export const generateSunoPrompt = async (
  options: PromptOptions
): Promise<PromptMetadataResponse> => {
  const apiKey = process.env.API_KEY || TEST_API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });

  // Find place tags
  const placeTags = PLACES_DATA.find(p => p.id === options.place)?.tags || "";
  const structureLabels = options.structure.map(s => s.label).join(' -> ');
  const hasImages = options.structure.some(s => !!s.image);

  // 1. Prepare parts for Multimodal Request
  const parts: any[] = [];

  // 2. Add Global Context
  const globalContext = `
    Global Context:
    - Place/Vibe: ${placeTags}
    - Primary Genres: ${options.genres.join(', ')} (CRITICAL: These are the ONLY user-selected genres)
    - BPM: ${options.bpm}
    - Target Duration: ${options.duration}
    - Vocal Style: ${options.vocalStyle}
    - Moods: ${options.moods.join(', ')}
    - Instruments: ${options.instruments.join(', ')}
    - Language: ${options.language}
    - Reference Artist: ${options.referenceArtist}
    - Main Topic: ${options.topic || "Create a theme based on the mood"}
    
    Sound Design:
    - Production: ${options.production}
    - Drums: ${options.drumStyle}
    - Bass: ${options.bassStyle}
    - Mixing: ${options.mixing}

    Structure & Scenes (Visual Storyboard):
  `;
  parts.push({ text: globalContext });

  // 3. Add Structure Specifics (Images & Descriptions)
  options.structure.forEach((block, index) => {
    let blockInfo = `\n[Sequence ${index + 1}] Section: ${block.label}`;
    if (block.description) {
      blockInfo += `\nUser Description: ${block.description}`;
    }
    
    parts.push({ text: blockInfo });

    if (block.image) {
      // Remove data:image/png;base64, prefix if present
      const base64Data = block.image.split(',')[1]; 
      if (base64Data) {
        parts.push({
          inlineData: {
            mimeType: "image/png", // Assuming PNG or JPEG, API is flexible usually
            data: base64Data
          }
        });
        parts.push({ text: `(IMAGE PROVIDED: Use this image to define the visual atmosphere and narrative for ${block.label})` });
      }
    }
  });

  // Dynamic instruction based on genre selection
  const genreInstruction = options.genres.length > 0 
    ? `START the Style Prompt strictly with these exact genres: "${options.genres.join(', ')}". Do NOT add other primary genres (like Rock, Pop) unless they are strictly sub-genres of the selected ones.`
    : `Select a primary genre best fitting the Vibe/Place (${placeTags}).`;

  const systemInstruction = `
    You are an expert Songwriter, Music Producer, and Visual Storyteller.
    Your goal is to generate a cohesive Suno AI music prompt package (Title, Style, Lyrics, Art).

    ${hasImages ? `
    *** VISUAL STORYBOARD MODE ACTIVATED ***
    The user has provided a sequence of images. You MUST treat these images as a movie storyboard or timeline.
    
    1. **STYLE & ATMOSPHERE (Crucial)**: 
       - Analyze the *visual aesthetics* of the images (e.g., color palette, lighting, era, setting).
       - Translate these visuals into musical style descriptors.
       - Example: Neon lights/Rain -> Add 'Synthwave, Blade Runner vibes, Cyberpunk'.
       - Example: Sunny beach/Film grain -> Add 'Lo-fi, Vintage, Warm, Analog'.
       - **Combine** these derived styles with the user's selected GENRES, instruments, and moods.
    
    2. **NARRATIVE PROGRESSION**:
       - The lyrics MUST follow the story arc shown in the images from beginning to end.
       - [Sequence 1] lyrics should describe the first image, [Sequence 2] the second, and so on.
    ` : ''}

    **Standard Instructions**:
    1. **Style Prompt** (Max 120 chars): 
       - ${genreInstruction}
       - **CRITICAL**: You MUST include "${options.bpm} bpm" explicitly in the style tags.
       - Then add specific vibe/mood and instruments from the User Context.
       - Include the extracted visual styles if images are present.
       - Format: "Genre, Sub-genre, Vibe, Instruments, Vocal Style, Production Quality, ${options.bpm} bpm".
    
    2. **Lyrics**:
       - Language: ${options.language}.
       - **Duration Control**: The song target duration is **${options.duration}**. Write enough lyrics and structure the song (verse lengths, instrumental breaks) to fill this time at ${options.bpm} BPM.
       - Structure: Follow strictly (${structureLabels}).
       - Rhythm: Ensure lines fit the BPM (${options.bpm}).
       - Content: If an image exists for a section, describe that specific scene. If not, bridge the gap logically.
       - Use appropriate tags like [Verse], [Chorus], [Bridge], [Instrumental].

    3. **Title**: A creative title fitting the visual/thematic narrative.
    
    4. **English Title**: Provide the English translation or transliteration of the title. This is REQUIRED for generating text on the album art.
    
    5. **Image Description**: 
       - If user images exist: Describe a "Key Visual" that synthesizes the vibe of the uploaded storyboard into a single cover art concept.
       - If no images: Create a scene description based on the topic/place.

    Return strictly valid JSON.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: {
      role: 'user',
      parts: parts
    },
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Song title in the target language" },
          englishTitle: { type: Type.STRING, description: "English title for Album Art typography" },
          stylePrompt: { type: Type.STRING, description: "Optimized style string starting with primary genres and ending with BPM" },
          lyrics: { type: Type.STRING, description: "Full lyrics matching the storyboard sequence and target duration" },
          imageDescription: { type: Type.STRING, description: "Prompt for album cover art" }
        },
        required: ["title", "englishTitle", "stylePrompt", "lyrics", "imageDescription"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");

  return JSON.parse(text) as PromptMetadataResponse;
};

export const generateAlbumArt = async (imageDescription: string, title: string): Promise<string> => {
  const apiKey = process.env.API_KEY || TEST_API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });

  // Include the title explicitly in the prompt for text rendering
  const enhancedPrompt = `Album cover art, musical concept, ${imageDescription}, text "${title}" elegantly displayed on cover, high quality, 4k, digital art, trending on artstation`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: enhancedPrompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to generate image");
};

export const validateLyrics = async (lyrics: string, language: string): Promise<LyricValidationResponse> => {
    const apiKey = process.env.API_KEY || TEST_API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
        model: modelId,
        contents: `Analyze and fix the following lyrics in ${language}. 
        Check for natural phrasing, grammar, and rhythm consistency.
        
        Lyrics to check:
        ${lyrics}`,
        config: {
            systemInstruction: `You are a professional lyric editor. 
            1. Fix any grammatical errors or awkward phrasing in the specified language.
            2. Ensure the rhythm/meter flows naturally for a song.
            3. Do NOT change the structure tags (e.g. [Verse], [Chorus]).
            4. Provide a very brief summary of changes.`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    correctedLyrics: { type: Type.STRING, description: "The corrected full lyrics" },
                    changeLog: { type: Type.STRING, description: "Brief explanation of improvements made" }
                },
                required: ["correctedLyrics", "changeLog"]
            }
        }
    });

    const text = response.text;
    if (!text) throw new Error("Validation failed");
    return JSON.parse(text) as LyricValidationResponse;
};

export const transcreateLyrics = async (lyrics: string, targetLanguage: string): Promise<LyricTranscreationResponse> => {
    const apiKey = process.env.API_KEY || TEST_API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
        model: modelId,
        contents: `Transcreate (rewrite) the following lyrics into ${targetLanguage}.
        
        Original Lyrics:
        ${lyrics}`,
        config: {
            systemInstruction: `You are an expert lyricist capable of 'Transcreation'.
            1. Translate the lyrics to ${targetLanguage}.
            2. CRITICAL: Maintain the EXACT rhythm, meter, and syllable count of the original lines so they can be sung to the same melody.
            3. Keep the original meaning and mood.
            4. Keep all structure tags (e.g. [Verse], [Chorus]) in English/Original format.`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    transcreatedLyrics: { type: Type.STRING, description: "The lyrics rewritten in the target language matching the original rhythm" }
                },
                required: ["transcreatedLyrics"]
            }
        }
    });

    const text = response.text;
    if (!text) throw new Error("Transcreation failed");
    return JSON.parse(text) as LyricTranscreationResponse;
};
