
import { useState, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { generateSunoPrompt, generateAlbumArt } from '../services/geminiService';
import { SunoPrompt, GenerationState, PromptOptions, ValidationScore, StructureItem, SavedPreset } from '../types';
import {
    PLACES, STRUCTURE_PRESETS, VOCAL_STYLES, MOODS, INSTRUMENTS, LANGUAGES,
    PRODUCTION_STYLES, DRUM_STYLES, BASS_STYLES, MIXING_STYLES, GENRES
} from '../constants';

interface AIStudioClient {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
}

export const useSonicForge = () => {
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

    // Note: Refs for file inputs should ideally be in the component, but we can manage the logic here if we pass the event.

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

    const handleRemoveStructure = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
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

        // --- NANOBANANA PRO: Advanced Sound Auto-Pilot ---
        setProduction(pickRandom(PRODUCTION_STYLES.filter(s => s !== PRODUCTION_STYLES[0]), 1)[0]);
        setDrumStyle(pickRandom(DRUM_STYLES.filter(s => s !== DRUM_STYLES[0]), 1)[0]);
        setBassStyle(pickRandom(BASS_STYLES.filter(s => s !== BASS_STYLES[0]), 1)[0]);
        setMixing(pickRandom(MIXING_STYLES.filter(s => s !== MIXING_STYLES[0]), 1)[0]);

        // Pick structure mostly from preferred, but sometimes random to keep it fun
        const usePreferredStructure = Math.random() > 0.3;
        const structureIdx = usePreferredStructure ? preferredStructureIndex : Math.floor(Math.random() * STRUCTURE_PRESETS.length);
        handleApplyStructurePreset(STRUCTURE_PRESETS[structureIdx].structure);

        setBpm(Math.floor(Math.random() * (bpmRange[1] - bpmRange[0] + 1)) + bpmRange[0]);
        setVocalStyle(preferredVocalStyle);

        // Randomize duration slightly around 3 mins
        setDurationSeconds(Math.floor(Math.random() * (210 - 150 + 1)) + 150);

        setStatusMsg(`✨ Nanobanana Pro: Optimized for ${randomPlace.label.split(' ')[1]} vibe!`);
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
        } catch (e) { }

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

    return {
        // State
        place, setPlace,
        topic, setTopic,
        structure, setStructure,
        bpm, setBpm,
        durationSeconds, setDurationSeconds,
        vocalStyle, setVocalStyle,
        selectedGenres, setSelectedGenres,
        selectedMoods, setSelectedMoods,
        selectedInstruments, setSelectedInstruments,
        language, setLanguage,
        referenceArtist, setReferenceArtist,
        production, setProduction,
        drumStyle, setDrumStyle,
        bassStyle, setBassStyle,
        mixing, setMixing,
        showAdvanced, setShowAdvanced,
        activeBlockId, setActiveBlockId,
        draggedIndex, setDraggedIndex,
        generationState, setGenerationState,
        currentPromptId, setCurrentPromptId,
        errorMsg, setErrorMsg,
        statusMsg, setStatusMsg,
        prompts, setPrompts,
        showSaveModal, setShowSaveModal,
        showLoadModal, setShowLoadModal,
        saveName, setSaveName,
        savedPresets, setSavedPresets,

        // Helpers & Calculated
        formatTime,
        handleToggle,
        activeBlock,
        validationScore,
        currentPrompt: prompts.find(p => p.id === currentPromptId) || null,
        hasImages: structure.some(s => !!s.image),

        // Handlers
        handleAddStructure,
        handleRemoveStructure,
        handleApplyStructurePreset,
        handleReset,
        handleMagicFill,
        handleDragStart,
        handleDragOver,
        handleDrop,
        updateActiveBlock,
        handleImageUpload,
        handleGenerate,
        handleOpenKeySelection,
        fetchPresets,
        savePreset,
        loadPreset,
        deletePreset,
        handleExportConfig,
        handleImportFile,
    };
};
