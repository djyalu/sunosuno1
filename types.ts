
export interface StructureItem {
  id: string; // Unique ID for React keys
  label: string; // e.g., [Verse], [Chorus]
  image?: string; // Base64 string
  description?: string; // User input for this specific scene
}

export interface SunoPrompt {
  id: string;
  title: string;
  stylePrompt: string;
  lyrics: string;
  imageUrl: string;
  createdAt: number;
  options: PromptOptions;
}

export interface PromptOptions {
  place: string;
  genres: string[]; // Added: Specific musical genres
  structure: StructureItem[]; // Updated from string[]
  bpm: number;
  duration: string; // New: e.g. "03:30"
  vocalStyle: string;
  moods: string[];
  instruments: string[];
  language: string;
  topic: string;
  referenceArtist: string;
  // Advanced Settings
  production: string;
  drumStyle: string;
  bassStyle: string;
  mixing: string;
}

export interface ValidationScore {
  total: number;
  genre: number;
  mood: number;
  production: number;
  structure: number;
  hint: string; // Specific advice to reach 100
}

export enum GenerationState {
  IDLE,
  GENERATING_METADATA,
  GENERATING_IMAGE,
  COMPLETED,
  ERROR
}

export interface PromptMetadataResponse {
  title: string;
  englishTitle: string; // New field for Album Art text
  stylePrompt: string;
  lyrics: string;
  imageDescription: string;
}

export interface LyricValidationResponse {
  correctedLyrics: string;
  changeLog: string; // Summary of what was fixed
}

export interface LyricTranscreationResponse {
  transcreatedLyrics: string;
}
