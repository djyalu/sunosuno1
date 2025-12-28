import React, { useState, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { generateSunoPrompt, generateAlbumArt } from './services/geminiService';
import { SunoPrompt, GenerationState, PromptOptions, ValidationScore, StructureItem } from './types';
import ResultView from './components/Player';
import PromptCard from './components/SongCard';
import StyleSelector from './components/StyleSelector';
import { SparklesIcon, MusicalNoteIcon, PlusIcon, TrashIcon, RefreshIcon, DiceIcon, MagicWandIcon, ImageIcon, XMarkIcon, DownloadIcon, UploadIcon, FloppyDiskIcon, FolderOpenIcon, CheckIcon, SearchIcon } from './components/Icons';
import { 
  PLACES, STRUCTURE_BLOCKS, STRUCTURE_PRESETS, VOCAL_STYLES, MOODS, INSTRUMENTS, LANGUAGES,
  PRODUCTION_STYLES, DRUM_STYLES, BASS_STYLES, MIXING_STYLES, GENRES
} from './constants';

interface AIStudioClient {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

interface SavedPreset {
    id: string;
    name: string;
    date: number;
    config: any;
}

const App: React.FC = () => {
  // --- Form State ---
  const [place, setPlace] = useState(PLACES[0].id);
  const [topic, setTopic] = useState("");
  // Transform initial presets to StructureItem objects
  const [structure, setStructure] = useState<StructureItem[]>(
    STRUCTURE_PRESETS[0].structure.map(label => ({ id: uuidv4(), label }))
  );
  const [bpm, setBpm] = useState(120);
  const [durationSeconds, setDurationSeconds] = useState(180); // Default 3:00 (180s)
  const [vocalStyle, setVocalStyle] = useState(VOCAL_STYLES[1]); 
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [referenceArtist, setReferenceArtist] = useState("");
  
  // Advanced Settings
  const [production, setProduction] = useState(PRODUCTION_STYLES[0]);
  const [drumStyle, setDrumStyle] = useState(DRUM_STYLES[0]);
  const [bassStyle, setBassStyle] = useState(BASS_STYLES[0]);
  const [mixing, setMixing] = useState(MIXING_STYLES[0]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // --- UI State ---
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null); // For Drag and Drop
  const fileInputRef = useRef<HTMLInputElement>(null);
  const configFileRef = useRef<HTMLInputElement>(null);

  // --- App State ---
  const [generationState, setGenerationState] = useState<GenerationState>(GenerationState.IDLE);
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Persistent History
  const [prompts, setPrompts] = useState<SunoPrompt[]>(() => {
    try {
        const stored = localStorage.getItem('sonicForge_history');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
  });

  // Save history whenever it changes
  useEffect(() => {
      localStorage.setItem('sonicForge_history', JSON.stringify(prompts));
  }, [prompts]);

  // --- Save/Load Modal State ---
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>([]);


  // --- Helpers ---
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggle = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, max: number) => {
    if (list.includes(item)) {
        setList(list.filter(i => i !== item));
    } else {
        if (list.length < max) {
            setList([...list, item]);
        }
    }
  };

  const handleAddStructure = (label: string) => {
    setStructure([...structure, { id: uuidv4(), label }]);
  };

  const handleRemoveStructure = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStructure(structure.filter(item => item.id !== id));
    if (activeBlockId === id) setActiveBlockId(null);
  };

  const handleApplyStructurePreset = (presetStructure: string[]) => {
      setStructure(presetStructure.map(label => ({ id: uuidv4(), label })));
  };

  const handleReset = () => {
    handleApplyStructurePreset(STRUCTURE_PRESETS[0].structure);
    setSelectedGenres([]);
    setSelectedMoods([]);
    setSelectedInstruments([]);
    setTopic("");
    setReferenceArtist("");
    setProduction(PRODUCTION_STYLES[0]);
    setDrumStyle(DRUM_STYLES[0]);
    setBassStyle(BASS_STYLES[0]);
    setMixing(MIXING_STYLES[0]);
    setDurationSeconds(180);
    setPlace(PLACES[0].id);
  };

  const handleMagicFill = () => {
    // 1. Pick a random Place first
    const randomPlace = PLACES[Math.floor(Math.random() * PLACES.length)];
    setPlace(randomPlace.id);

    // 2. Define Context-Aware Logic based on Place ID
    let compatibleGenres: string[] = [];
    let compatibleMoods: string[] = [];
    let compatibleInstruments: string[] = [];
    let bpmRange = [80, 130];
    let preferredStructureIndex = 0;
    let preferredVocalStyle = VOCAL_STYLES[0];

    // Helper to pick N random items from an array
    const pickRandom = (arr: string[], n: number) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    };

    // Logic Tree
    switch (randomPlace.id) {
        case 'gym': // Workout
            compatibleGenres = ['Phonk', 'Hardstyle', 'Techno', 'Hip Hop', 'Drill'];
            compatibleMoods = ['Energetic (에너지)', 'Aggressive (공격적)', 'Triumphant (승리감)', 'Epic (웅장한)'];
            compatibleInstruments = ['Synthesizer', 'Drums', '808 Bass', 'Electric Guitar'];
            bpmRange = [125, 160];
            preferredStructureIndex = 1; // EDM Buildup
            preferredVocalStyle = 'Powerful';
            break;
        case 'cafe': // Relax
            compatibleGenres = ['Jazz', 'Bossa Nova', 'Lo-fi', 'Acoustic', 'Piano Ballad'];
            compatibleMoods = ['Peaceful (평화로운)', 'Nostalgic (향수)', 'Playful (경쾌한)', 'Romantic (로맨틱)'];
            compatibleInstruments = ['Piano', 'Acoustic Guitar', 'Saxophone', 'Bass'];
            bpmRange = [70, 100];
            preferredStructureIndex = 4; // Ballad
            preferredVocalStyle = 'Soft';
            break;
        case 'drive': // Night drive
            compatibleGenres = ['Synthwave', 'City Pop', 'Deep House', 'R&B', 'Techno'];
            compatibleMoods = ['Dreamy (몽환적)', 'Nostalgic (향수)', 'Energetic (에너지)', 'Mysterious (신비로운)'];
            compatibleInstruments = ['Synthesizer', 'Bass', 'Drums', 'Electric Guitar'];
            bpmRange = [100, 125];
            preferredStructureIndex = 2; // Standard Pop
            preferredVocalStyle = 'Husky';
            break;
        case 'party': // Club
            compatibleGenres = ['House', 'EDM', 'Tech House', 'K-Pop', 'Dubstep'];
            compatibleMoods = ['Energetic (에너지)', 'Playful (경쾌한)', 'Sexy (섹시한)', 'Groovy (흥겨운)'];
            compatibleInstruments = ['Synthesizer', 'Drums', '808 Bass'];
            bpmRange = [120, 140];
            preferredStructureIndex = 1; // EDM
            preferredVocalStyle = 'Autotune';
            break;
        case 'meditation': // Yoga
            compatibleGenres = ['Ambient', 'Drone', 'New Age', 'Cinematic'];
            compatibleMoods = ['Peaceful (평화로운)', 'Dreamy (몽환적)', 'Mysterious (신비로운)'];
            compatibleInstruments = ['Synthesizer', 'Strings', 'Woodwinds'];
            bpmRange = [50, 80];
            preferredStructureIndex = 4; // Ballad-ish
            preferredVocalStyle = 'Whisper';
            break;
        case 'bedroom': // Lo-fi / Chill
            compatibleGenres = ['Lo-fi', 'Bedroom Pop', 'Indie Folk', 'R&B', 'Chillwave'];
            compatibleMoods = ['Dreamy (몽환적)', 'Melancholic (우울한)', 'Nostalgic (향수)', 'Peaceful (평화로운)'];
            compatibleInstruments = ['Electric Guitar', 'Synthesizer', 'Bass'];
            bpmRange = [70, 95];
            preferredStructureIndex = 2; // Pop
            preferredVocalStyle = 'Whisper';
            break;
        case 'beach': // Tropical
            compatibleGenres = ['Tropical House', 'Reggae', 'Pop', 'Latin'];
            compatibleMoods = ['Playful (경쾌한)', 'Uplifting (희망찬)', 'Groovy (흥겨운)'];
            compatibleInstruments = ['Marimba', 'Steel Drums', 'Synthesizer', 'Guitar'];
            bpmRange = [100, 115];
            preferredStructureIndex = 2;
            preferredVocalStyle = 'Clear';
            break;
        default: // Generic fallback
            compatibleGenres = GENRES.slice(0, 10);
            compatibleMoods = MOODS;
            compatibleInstruments = INSTRUMENTS;
            bpmRange = [90, 130];
            preferredStructureIndex = 2;
            preferredVocalStyle = 'Clear';
    }

    // 3. Apply Logic
    setSelectedGenres(pickRandom(compatibleGenres, 1)); // 1 Primary Genre
    setSelectedMoods(pickRandom(compatibleMoods, Math.floor(Math.random() * 2) + 1)); // 1-2 Moods
    setSelectedInstruments(pickRandom(compatibleInstruments, Math.floor(Math.random() * 2) + 1)); // 1-2 Instruments
    
    // Pick structure mostly from preferred, but sometimes random to keep it fun
    const usePreferredStructure = Math.random() > 0.3;
    const structureIdx = usePreferredStructure ? preferredStructureIndex : Math.floor(Math.random() * STRUCTURE_PRESETS.length);
    handleApplyStructurePreset(STRUCTURE_PRESETS[structureIdx].structure);

    setBpm(Math.floor(Math.random() * (bpmRange[1] - bpmRange[0] + 1)) + bpmRange[0]);
    setVocalStyle(preferredVocalStyle);
    
    // Randomize duration slightly around 3 mins
    setDurationSeconds(Math.floor(Math.random() * (210 - 150 + 1)) + 150);

    setStatusMsg(`✨ Magic Mix: Generated a ${randomPlace.label.split(' ')[1]} vibe!`);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    
    // Check if it's a file drop (Image Upload)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const updatedStructure = [...structure];
                updatedStructure[dropIndex] = {
                    ...updatedStructure[dropIndex],
                    image: reader.result as string
                };
                setStructure(updatedStructure);
                setStatusMsg(`Image added to ${updatedStructure[dropIndex].label}`);
                setTimeout(() => setStatusMsg(null), 2000);
            };
            reader.readAsDataURL(file);
        }
        return;
    }

    // Standard Reorder Drop
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    const updatedStructure = [...structure];
    const [movedItem] = updatedStructure.splice(draggedIndex, 1);
    updatedStructure.splice(dropIndex, 0, movedItem);

    setStructure(updatedStructure);
    setDraggedIndex(null);
  };

  // --- Configuration Management ---
  
  const getConfigObject = () => ({
    place,
    topic,
    structure, // Includes base64 images
    bpm,
    durationSeconds, // Save raw seconds
    vocalStyle,
    genres: selectedGenres,
    moods: selectedMoods,
    instruments: selectedInstruments,
    language,
    referenceArtist,
    production,
    drumStyle,
    bassStyle,
    mixing
  });

  const loadConfigObject = (json: any) => {
    if (json.place) setPlace(json.place);
    if (json.topic !== undefined) setTopic(json.topic);
    
    // Legacy support for structure (string[] vs StructureItem[])
    if (json.structure) {
        if (json.structure.length > 0 && typeof json.structure[0] === 'string') {
             // Convert legacy string array to StructureItem[]
             setStructure(json.structure.map((label: string) => ({ id: uuidv4(), label })));
        } else {
             setStructure(json.structure);
        }
    }

    if (json.bpm) setBpm(json.bpm);
    if (json.durationSeconds) setDurationSeconds(json.durationSeconds);
    if (json.vocalStyle) setVocalStyle(json.vocalStyle);
    if (json.genres) setSelectedGenres(json.genres);
    if (json.moods) setSelectedMoods(json.moods);
    if (json.instruments) setSelectedInstruments(json.instruments);
    if (json.language) setLanguage(json.language);
    if (json.referenceArtist !== undefined) setReferenceArtist(json.referenceArtist);
    if (json.production) setProduction(json.production);
    if (json.drumStyle) setDrumStyle(json.drumStyle);
    if (json.bassStyle) setBassStyle(json.bassStyle);
    if (json.mixing) setMixing(json.mixing);
  };

  // --- Persistence & Autosave ---
  
  // Autosave: Save form state whenever it changes
  useEffect(() => {
      const currentConfig = getConfigObject();
      localStorage.setItem('sonicForge_autosave', JSON.stringify(currentConfig));
  }, [place, topic, structure, bpm, durationSeconds, vocalStyle, selectedGenres, selectedMoods, selectedInstruments, language, referenceArtist, production, drumStyle, bassStyle, mixing]);

  // Load Autosave & Presets on Mount
  useEffect(() => {
    // 1. Fetch Presets List
    fetchPresets();
    
    // 2. Load Autosave
    try {
        const autosave = localStorage.getItem('sonicForge_autosave');
        if (autosave) {
            loadConfigObject(JSON.parse(autosave));
        }
    } catch (e) {
        console.error("Failed to load autosave", e);
    }
  }, []);


  // --- Preset Manager Logic ---
  const fetchPresets = () => {
    try {
        const stored = localStorage.getItem('sonicForge_presets');
        if (stored) {
            setSavedPresets(JSON.parse(stored));
        } else {
            // Check for old single config format and migrate if exists
            const oldConfig = localStorage.getItem('sonicForge_currentConfig');
            if (oldConfig) {
                const legacy = {
                    id: uuidv4(),
                    name: 'Restored Autosave',
                    date: Date.now(),
                    config: JSON.parse(oldConfig)
                };
                setSavedPresets([legacy]);
                localStorage.setItem('sonicForge_presets', JSON.stringify([legacy]));
            }
        }
    } catch (e) {
        console.error("Failed to fetch presets");
    }
  };

  const savePreset = () => {
      if (!saveName.trim()) {
          setErrorMsg("Please enter a name for your preset.");
          return;
      }
      
      const newPreset: SavedPreset = {
          id: uuidv4(),
          name: saveName,
          date: Date.now(),
          config: getConfigObject()
      };

      // Critical Fix: Read directly from localStorage to ensure we have the latest list
      let currentPresets: SavedPreset[] = [];
      try {
          const stored = localStorage.getItem('sonicForge_presets');
          if (stored) currentPresets = JSON.parse(stored);
      } catch (e) {
          console.error("Failed to read presets for saving", e);
      }

      // Check if updating existing by name or create new
      const existingIndex = currentPresets.findIndex(p => p.name.toLowerCase() === saveName.toLowerCase());
      let updatedPresets;
      
      if (existingIndex >= 0) {
          if (!window.confirm(`Overwrite existing preset "${saveName}"?`)) return;
          updatedPresets = [...currentPresets];
          updatedPresets[existingIndex] = { ...newPreset, id: updatedPresets[existingIndex].id }; // Keep old ID, update content
      } else {
          updatedPresets = [newPreset, ...currentPresets];
      }

      setSavedPresets(updatedPresets);
      localStorage.setItem('sonicForge_presets', JSON.stringify(updatedPresets));
      
      setSaveName("");
      setShowSaveModal(false);
      setStatusMsg(`Preset "${saveName}" saved successfully.`);
      setTimeout(() => setStatusMsg(null), 2000);
  };

  const loadPreset = (preset: SavedPreset) => {
      loadConfigObject(preset.config);
      setShowLoadModal(false);
      setStatusMsg(`Loaded preset: ${preset.name}`);
      setTimeout(() => setStatusMsg(null), 2000);
  };

  const deletePreset = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!window.confirm("Are you sure you want to delete this preset?")) return;

      // Robust delete: read from storage first
      let currentPresets: SavedPreset[] = [];
      try {
          const stored = localStorage.getItem('sonicForge_presets');
          if (stored) currentPresets = JSON.parse(stored);
      } catch (e) {}

      const updated = currentPresets.filter(p => p.id !== id);
      setSavedPresets(updated);
      localStorage.setItem('sonicForge_presets', JSON.stringify(updated));
  };


  // 2. File Export/Import (JSON File)
  const handleExportConfig = () => {
    const config = getConfigObject();
    const jsonString = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Create filename based on topic or place
    const fileName = topic ? topic.replace(/[^a-z0-9]/gi, '_').toLowerCase() : place;
    link.href = url;
    link.download = `sonicforge-${fileName}-${Date.now()}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        loadConfigObject(json);
        setErrorMsg(null);
        setStatusMsg("Configuration imported successfully.");
        setTimeout(() => setStatusMsg(null), 2000);
      } catch (err) {
        console.error("Failed to parse config file", err);
        setErrorMsg("Failed to load configuration file. Invalid format.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // --- Scene Editor Handlers ---
  const activeBlock = structure.find(s => s.id === activeBlockId);

  const updateActiveBlock = (updates: Partial<StructureItem>) => {
    if (!activeBlockId) return;
    setStructure(structure.map(s => s.id === activeBlockId ? { ...s, ...updates } : s));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeBlockId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateActiveBlock({ image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Calculation ---
  const validationScore: ValidationScore = useMemo(() => {
    let score = { total: 0, genre: 0, mood: 0, production: 0, structure: 0, hint: "" };
    
    // Structure
    if (structure.length >= 5) score.structure = 100;
    else {
        score.structure = (structure.length / 5) * 100;
        score.hint = "Add more blocks (Intro, Verse...) to complete the structure.";
    }

    // Mood
    if (selectedMoods.length > 0) {
        score.mood = 100;
    } else {
        score.mood = 0;
        if (!score.hint) score.hint = "Select at least one Mood.";
    }

    // Genre
    if (selectedGenres.length > 0) {
        score.genre = 100;
    } else {
        score.genre = (place ? 50 : 0);
        if (!score.hint) score.hint = "Select specific Genres for better accuracy.";
    }

    // Production
    let prodScore = 30;
    const missingProd: string[] = [];
    
    if (selectedInstruments.length > 0) prodScore += 30;
    else missingProd.push("Instruments");

    if (production !== PRODUCTION_STYLES[0]) prodScore += 10;
    else missingProd.push("Production Style");

    if (drumStyle !== DRUM_STYLES[0]) prodScore += 10;
    else missingProd.push("Drum Style");

    if (bassStyle !== BASS_STYLES[0]) prodScore += 10;
    else missingProd.push("Bass Style");

    if (mixing !== MIXING_STYLES[0]) prodScore += 10;
    else missingProd.push("Mixing Style");

    score.production = Math.min(prodScore, 100);

    if (score.production < 100 && !score.hint) {
        if (missingProd.includes("Instruments")) score.hint = "Add Instruments to boost Production score.";
        else score.hint = `Tip: Customize '${missingProd[0]}' in Advanced Settings for 100%.`;
    }

    // Equal weighting
    score.total = Math.round(
      (score.structure * 0.25) + 
      (score.mood * 0.25) + 
      (score.production * 0.25) + 
      (score.genre * 0.25)
    );
    
    if (score.total === 100) score.hint = "🌟 Perfect! Suno will love this.";
    else if (!score.hint) score.hint = "💡 Add more details for better results.";

    return score;
  }, [structure, selectedMoods, selectedInstruments, selectedGenres, place, production, drumStyle, bassStyle, mixing]);

  // --- Generation Handler ---
  const handleGenerate = async () => {
    setGenerationState(GenerationState.GENERATING_METADATA);
    setErrorMsg(null);

    const options: PromptOptions = {
        place,
        topic,
        structure,
        bpm,
        duration: formatTime(durationSeconds),
        vocalStyle,
        genres: selectedGenres,
        moods: selectedMoods,
        instruments: selectedInstruments,
        language,
        referenceArtist,
        production,
        drumStyle,
        bassStyle,
        mixing
    };

    try {
      const metadata = await generateSunoPrompt(options);
      setGenerationState(GenerationState.GENERATING_IMAGE);
      
      // Pass the English title (or fallback to original title) to the image generator
      const coverArtUrl = await generateAlbumArt(metadata.imageDescription, metadata.englishTitle || metadata.title);

      const newPrompt: SunoPrompt = {
        id: uuidv4(),
        title: metadata.title,
        stylePrompt: metadata.stylePrompt,
        lyrics: metadata.lyrics,
        imageUrl: coverArtUrl,
        createdAt: Date.now(),
        options 
      };

      setPrompts(prev => [newPrompt, ...prev]);
      setCurrentPromptId(newPrompt.id);
      setGenerationState(GenerationState.COMPLETED);

    } catch (error: any) {
      console.error(error);
      setGenerationState(GenerationState.ERROR);
      
      const errorMsgStr = error.message || JSON.stringify(error);
      setErrorMsg("Generation failed. " + (error.message || ""));
      
    } finally {
        setTimeout(() => setGenerationState(GenerationState.IDLE), 2000);
    }
  };

  const handleOpenKeySelection = async () => {
      const aiStudio = (window as any).aistudio as AIStudioClient | undefined;
      if (aiStudio) {
          try {
              await aiStudio.openSelectKey();
              setErrorMsg(null); // Clear error on open
          } catch (e) {
              console.error(e);
          }
      }
  };

  const currentPrompt = prompts.find(p => p.id === currentPromptId) || null;
  const hasImages = structure.some(s => !!s.image);

  return (
    <div className="h-[100dvh] w-full bg-background text-gray-900 font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0 bg-background/95 backdrop-blur z-40">
        <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
                <MusicalNoteIcon className="h-5 w-5 text-white" />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">SonicForge</h1>
                <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">AI Music Prompt Generator</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            {/* System Save/Load */}
            <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200 relative">
                <div className="relative group">
                    <button 
                        onClick={() => { fetchPresets(); setShowLoadModal(true); }}
                        className="text-xs font-medium px-2 py-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm transition-all flex items-center gap-1.5"
                    >
                        <FolderOpenIcon className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg font-medium">
                        Load Saved Preset
                    </div>
                </div>
                
                <div className="w-px bg-gray-300 my-1"></div>
                
                <div className="relative group">
                    <button 
                        onClick={() => { fetchPresets(); setShowSaveModal(true); setSaveName(topic || ""); }}
                        className="text-xs font-medium px-2 py-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm transition-all flex items-center gap-1.5"
                    >
                        <FloppyDiskIcon className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg font-medium">
                        Save Preset
                    </div>
                </div>
            </div>

            {/* File Export/Import */}
            <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                <div className="relative group">
                    <button 
                        onClick={() => configFileRef.current?.click()}
                        className="text-xs font-medium px-2 py-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm transition-all flex items-center gap-1.5"
                    >
                        <UploadIcon className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg font-medium">
                        Import JSON File
                    </div>
                </div>

                <div className="w-px bg-gray-300 my-1"></div>
                
                <div className="relative group">
                    <button 
                        onClick={handleExportConfig}
                        className="text-xs font-medium px-2 py-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm transition-all flex items-center gap-1.5"
                    >
                        <DownloadIcon className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg font-medium">
                        Export JSON File
                    </div>
                </div>
                
                <input 
                    type="file" 
                    ref={configFileRef} 
                    className="hidden" 
                    accept=".json" 
                    onChange={handleImportFile} 
                />
            </div>
            
            <button 
                onClick={handleMagicFill}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg transition-all flex items-center gap-1.5 hover:-translate-y-0.5"
            >
                <MagicWandIcon className="w-3.5 h-3.5" /> Magic Mix
            </button>
            <button onClick={handleReset} className="text-xs font-medium px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-1.5 transition-colors">
                <RefreshIcon className="w-3.5 h-3.5" /> Reset
            </button>
        </div>
      </header>

      {/* Global Status Message */}
      {statusMsg && (
          <div className="fixed top-20 right-6 z-50 bg-gray-900/90 text-white px-4 py-2 rounded-lg shadow-xl text-xs font-bold animate-in slide-in-from-right-5 fade-in">
              {statusMsg}
          </div>
      )}

      <main className="flex-1 w-full max-w-[1800px] mx-auto p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 overflow-y-auto xl:overflow-hidden relative">
        
        {/* LEFT COLUMN: CONTROLS */}
        <div className="xl:col-span-5 space-y-6 xl:h-full xl:overflow-y-auto pr-2 pb-24">
            
            {/* Section 1: Context & Vibe */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
                    <h3 className="text-sm font-bold text-gray-800">장소 & 분위기 (Context & Vibe)</h3>
                </div>
                
                {/* Place Grid */}
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {PLACES.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setPlace(p.id)}
                                className={`p-2.5 rounded-xl text-xs font-medium transition-all text-center flex flex-col items-center gap-1.5 border ${
                                    place === p.id 
                                    ? 'bg-primary/5 border-primary text-primary shadow-sm' 
                                    : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                <span className="text-xl">{p.label.split(' ')[0]}</span>
                                <span className="truncate w-full text-[10px]">
                                    {p.label.replace(/^[\S]+\s/, '').split('(')[0].trim()}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Genres, Moods & Instruments */}
                    <div className="space-y-6">
                        <StyleSelector 
                            title="Genres (장르)"
                            items={GENRES}
                            selectedItems={selectedGenres}
                            onSelectionChange={setSelectedGenres}
                            maxSelection={2}
                            storageKey="genres"
                        />
                        
                        <div className="h-px bg-gray-100"></div>

                        <StyleSelector 
                            title="Moods (분위기)"
                            items={MOODS}
                            selectedItems={selectedMoods}
                            onSelectionChange={setSelectedMoods}
                            maxSelection={3}
                            storageKey="moods"
                        />
                        
                        <div className="h-px bg-gray-100"></div>

                        <StyleSelector 
                            title="Instruments (악기)"
                            items={INSTRUMENTS}
                            selectedItems={selectedInstruments}
                            onSelectionChange={setSelectedInstruments}
                            maxSelection={3}
                            storageKey="instruments"
                        />
                    </div>
                </div>
            </div>

            {/* Section 2: Structure & Composition */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">2</span>
                    <h3 className="text-sm font-bold text-gray-800">곡 구성 (Composition)</h3>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-5">
                    {/* Structure Presets */}
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
                        {STRUCTURE_PRESETS.map(preset => (
                            <button 
                            key={preset.label}
                            onClick={() => handleApplyStructurePreset(preset.structure)}
                            className="whitespace-nowrap text-[10px] font-semibold px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 text-gray-600 transition-colors"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {/* Structure Visualizer */}
                    <div className="space-y-2">
                        <div className="text-[10px] text-gray-400 font-medium flex justify-between">
                            <span>Drag blocks to reorder • Drag images to upload • Click to edit</span>
                        </div>
                        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg min-h-[56px] items-center border border-gray-100">
                            {structure.map((item, idx) => (
                                <div 
                                    key={item.id} 
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, idx)}
                                    onDragOver={(e) => handleDragOver(e, idx)}
                                    onDrop={(e) => handleDrop(e, idx)}
                                    onClick={() => setActiveBlockId(item.id)}
                                    className={`group relative px-3 py-1.5 rounded shadow-sm text-[11px] font-semibold flex items-center gap-2 cursor-pointer transition-all border cursor-move ${
                                        item.image 
                                        ? 'bg-gray-800 text-white border-gray-900 overflow-hidden' 
                                        : activeBlockId === item.id 
                                            ? 'bg-primary text-white border-primary ring-2 ring-primary/20' 
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-primary/50'
                                    } ${draggedIndex === idx ? 'opacity-50 border-dashed border-primary bg-primary/5 text-primary' : 'opacity-100'}`}
                                >
                                    {item.image && (
                                        <div className="absolute inset-0 opacity-50">
                                            <img src={item.image} className="w-full h-full object-cover" alt="scene" />
                                        </div>
                                    )}
                                    <span className="relative z-10">{item.label}</span>
                                    {item.description && !item.image && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 relative z-10"></span>}
                                    {item.image && <ImageIcon className="w-3 h-3 text-white relative z-10" />}
                                    
                                    {idx < structure.length - 1 && (
                                         <span className="absolute -right-3 top-1/2 -translate-y-1/2 text-gray-300 text-[8px] pointer-events-none z-0">▶</span>
                                    )}

                                    <button 
                                        onClick={(e) => handleRemoveStructure(item.id, e)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all shadow-sm z-20"
                                    >
                                        <TrashIcon className="w-2.5 h-2.5" />
                                    </button>
                                </div>
                            ))}
                            {structure.length === 0 && <span className="text-xs text-gray-400 italic pl-1">Add blocks to build structure...</span>}
                        </div>
                    </div>
                    
                    {/* Add Buttons */}
                    <div className="flex flex-wrap gap-1.5">
                        {STRUCTURE_BLOCKS.map(block => (
                            <button
                                key={block}
                                onClick={() => handleAddStructure(block)}
                                className="px-2.5 py-1.5 bg-white hover:bg-primary/5 hover:text-primary hover:border-primary/30 rounded text-[10px] text-gray-500 border border-gray-200 transition-all flex items-center gap-1 shadow-sm"
                            >
                                <PlusIcon className="w-2.5 h-2.5" /> {block.replace('[','').replace(']','')}
                            </button>
                        ))}
                    </div>

                    <div className="h-px bg-gray-100"></div>

                    {/* BPM & Vocals & Duration */}
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs font-semibold text-gray-600">BPM</label>
                                    <span className="text-xs font-mono text-primary font-bold bg-primary/10 px-1.5 rounded">{bpm}</span>
                                </div>
                                <input 
                                    type="range" min="60" max="180" value={bpm} 
                                    onChange={(e) => setBpm(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                            
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs font-semibold text-gray-600">Duration</label>
                                    <span className="text-xs font-mono text-primary font-bold bg-primary/10 px-1.5 rounded">{formatTime(durationSeconds)}</span>
                                </div>
                                <input 
                                    type="range" min="30" max="300" step="10" value={durationSeconds} 
                                    onChange={(e) => setDurationSeconds(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                        </div>

                        <div>
                                <label className="text-xs font-semibold text-gray-600 mb-2 block">Vocals</label>
                                <select 
                                value={vocalStyle}
                                onChange={(e) => setVocalStyle(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                                >
                                {VOCAL_STYLES.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3: Details */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">3</span>
                    <h3 className="text-sm font-bold text-gray-800">디테일 (Details)</h3>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Song Topic / Theme</label>
                        <input 
                            type="text"
                            placeholder="e.g. A cyber-noir detective story in the rain"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder-gray-400 transition-all"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Language</label>
                            <select 
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-gray-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                            >
                                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Reference Artist</label>
                            <input 
                                type="text"
                                placeholder="e.g. The Weeknd"
                                value={referenceArtist}
                                onChange={(e) => setReferenceArtist(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder-gray-400"
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Section 4: Advanced */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <button 
                    className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        🎚️ Advanced Sound Design
                    </span>
                    <span className={`text-xs text-gray-400 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
                </button>
                
                {showAdvanced && (
                    <div className="p-4 grid grid-cols-2 gap-4 bg-white border-t border-gray-100 animate-in slide-in-from-top-1 fade-in duration-200">
                        {[{l:'Production',v:production,s:setProduction,o:PRODUCTION_STYLES}, {l:'Drum Style',v:drumStyle,s:setDrumStyle,o:DRUM_STYLES}, {l:'Bass Style',v:bassStyle,s:setBassStyle,o:BASS_STYLES}, {l:'Mixing',v:mixing,s:setMixing,o:MIXING_STYLES}].map((field) => (
                             <div key={field.l}>
                                <label className="text-[10px] text-gray-500 uppercase font-bold mb-1.5 block">{field.l}</label>
                                <select 
                                   value={field.v} onChange={(e) => field.s(e.target.value)}
                                   className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-gray-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                                >
                                   {field.o.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                           </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Generate Action */}
            <div className="pt-2 pb-6">
                <button 
                    onClick={handleGenerate}
                    disabled={generationState !== GenerationState.IDLE && generationState !== GenerationState.ERROR}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-2 transition-all
                        ${generationState === GenerationState.IDLE || generationState === GenerationState.ERROR
                            ? 'bg-gradient-to-r from-primary to-secondary hover:brightness-105 hover:shadow-2xl shadow-purple-200 transform hover:-translate-y-0.5' 
                            : 'bg-gray-200 cursor-not-allowed text-gray-400'}`}
                >
                    {generationState === GenerationState.IDLE || generationState === GenerationState.ERROR ? (
                        <>GENERATE TRACK <span className="text-[10px] opacity-80">(Music & Lyrics)</span> <SparklesIcon className="w-5 h-5" /></>
                    ) : (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            {generationState === GenerationState.GENERATING_METADATA 
                                ? (hasImages ? 'Analyzing Storyboard...' : 'Composing...') 
                                : 'Designing Art...'}
                        </span>
                    )}
                </button>
                {errorMsg && (
                    <div className="text-center mt-2">
                        <p className="text-red-500 text-xs font-medium bg-red-50 py-1 rounded inline-block px-2">{errorMsg}</p>
                        <br/>
                        <button 
                            onClick={handleOpenKeySelection}
                            className="text-[10px] text-gray-500 underline hover:text-primary mt-1"
                        >
                            Change API Key
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT COLUMN: OUTPUT */}
        <div className="xl:col-span-7 flex flex-col gap-6 xl:h-full xl:overflow-hidden min-h-[600px] xl:min-h-0">
            {/* History Ribbon */}
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar min-h-[80px] shrink-0">
                {prompts.map(prompt => (
                     <div key={prompt.id} className="min-w-[220px]">
                        <PromptCard 
                            prompt={prompt} 
                            isActive={currentPromptId === prompt.id}
                            onSelect={(p) => setCurrentPromptId(p.id)}
                        />
                     </div>
                ))}
                {prompts.length === 0 && (
                    <div className="w-full h-[80px] flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400 text-sm gap-1">
                        <SparklesIcon className="w-5 h-5 opacity-50" />
                        <span>History will appear here</span>
                    </div>
                )}
            </div>

            {/* Main Result View */}
            <div className="flex-1 min-h-0">
                <ResultView 
                    promptData={currentPrompt} 
                    validationScore={currentPrompt ? validationScore : { total:0, genre:0, mood:0, structure:0, production:0, hint: "Start by generating a prompt!" }} 
                />
            </div>
        </div>

        {/* --- MODALS --- */}

        {/* SCENE EDITOR MODAL */}
        {activeBlockId && activeBlock && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-[2px]">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            Scene Details <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600">{activeBlock.label}</span>
                        </h3>
                        <button onClick={() => setActiveBlockId(null)} className="text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="p-4 space-y-4">
                        {/* Scene Description */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Scene Description</label>
                            <textarea 
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none h-20"
                                placeholder="Describe what happens in this part of the song (or what the image depicts)..."
                                value={activeBlock.description || ""}
                                onChange={(e) => updateActiveBlock({ description: e.target.value })}
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 flex justify-between">
                                Mood Image (Optional)
                                {activeBlock.image && (
                                    <button 
                                        onClick={() => updateActiveBlock({ image: undefined })}
                                        className="text-red-500 text-[10px] hover:underline"
                                    >
                                        Remove Image
                                    </button>
                                )}
                            </label>
                            
                            <div 
                                className={`relative border-2 border-dashed rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                                    activeBlock.image ? 'border-primary' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {activeBlock.image ? (
                                    <img src={activeBlock.image} alt="Scene" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                                        <span className="text-xs text-gray-400">Click to upload image</span>
                                    </>
                                )}
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 text-center">
                                Gemini will use this image to inspire the lyrics AND derive the musical style for the song.
                            </p>
                        </div>

                        <button 
                            onClick={() => setActiveBlockId(null)}
                            className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-colors"
                        >
                            Save Scene
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* SAVE PRESET MODAL */}
        {showSaveModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">Save Preset</h3>
                        <button onClick={() => setShowSaveModal(false)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5"/></button>
                    </div>
                    <div className="p-4 space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Preset Name</label>
                            <input 
                                type="text"
                                autoFocus
                                value={saveName}
                                onChange={(e) => setSaveName(e.target.value)}
                                placeholder="e.g. My Epic Synthwave"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                            />
                        </div>
                        
                        {/* List of existing to overwrite */}
                        {savedPresets.length > 0 && (
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Or overwrite existing:</label>
                                <div className="max-h-32 overflow-y-auto custom-scrollbar border border-gray-100 rounded-lg">
                                    {savedPresets.map(preset => (
                                        <button 
                                            key={preset.id}
                                            onClick={() => setSaveName(preset.name)}
                                            className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex justify-between items-center text-gray-600 hover:text-primary transition-colors border-b border-gray-50 last:border-0"
                                        >
                                            <span className="truncate">{preset.name}</span>
                                            {saveName === preset.name && <CheckIcon className="w-3 h-3 text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 pt-2">
                             <button onClick={() => setShowSaveModal(false)} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                             <button onClick={savePreset} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-colors shadow-md">Save Preset</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* LOAD PRESET MODAL */}
        {showLoadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                    <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
                        <h3 className="font-bold text-gray-800">Load Preset</h3>
                        <button onClick={() => setShowLoadModal(false)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5"/></button>
                    </div>
                    
                    <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
                        {savedPresets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm gap-2">
                                <FloppyDiskIcon className="w-8 h-8 opacity-20" />
                                <p>No saved presets found.</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {savedPresets.sort((a,b) => b.date - a.date).map(preset => (
                                    <div key={preset.id} className="group flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all">
                                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => loadPreset(preset)}>
                                            <h4 className="font-semibold text-sm text-gray-800 truncate group-hover:text-primary transition-colors">{preset.name}</h4>
                                            <p className="text-[10px] text-gray-400">{new Date(preset.date).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2 pl-2">
                                            <button 
                                                onClick={() => loadPreset(preset)}
                                                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded hover:bg-primary hover:text-white hover:border-primary transition-colors shadow-sm"
                                            >
                                                Load
                                            </button>
                                            <button 
                                                onClick={(e) => deletePreset(preset.id, e)}
                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl shrink-0 text-center">
                        <button onClick={() => setShowLoadModal(false)} className="text-xs text-gray-500 hover:text-gray-800">Close</button>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;
