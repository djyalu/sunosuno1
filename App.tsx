
import React from 'react';
import { useSonicForge } from './hooks/useSonicForge';
import { GenerationState } from './types';
import ResultView from './components/Player';
import PromptCard from './components/SongCard';
import { SparklesIcon } from './components/Icons';

// Components
import Header from './components/layout/Header';
import ContextSection from './components/features/ContextSection';
import StructureSection from './components/features/StructureSection';
import DetailsSection from './components/features/DetailsSection';
import AdvancedSettings from './components/features/AdvancedSettings';
import SceneEditorModal from './components/features/SceneEditorModal';
import { SavePresetModal, LoadPresetModal } from './components/features/PresetModals';

const App: React.FC = () => {
    const {
        // State
        place, setPlace,
        topic, setTopic,
        structure,
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
        draggedIndex,
        generationState,
        currentPromptId, setCurrentPromptId,
        errorMsg,
        statusMsg,
        prompts,
        showSaveModal, setShowSaveModal,
        showLoadModal, setShowLoadModal,
        saveName, setSaveName,
        savedPresets,

        // Helpers & Calculated
        formatTime,
        validationScore,
        currentPrompt,
        hasImages,
        activeBlock,

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
    } = useSonicForge();

    return (
        <div className="h-[100dvh] w-full bg-background text-gray-900 font-sans flex flex-col overflow-hidden">
            <Header
                onLoadClick={() => { fetchPresets(); setShowLoadModal(true); }}
                onSaveClick={() => { fetchPresets(); setShowSaveModal(true); setSaveName(topic || ""); }}
                onExportClick={handleExportConfig}
                onImportFile={handleImportFile}
                onMagicMix={handleMagicFill}
                onReset={handleReset}
            />

            {/* Global Status Message */}
            {statusMsg && (
                <div className="fixed top-20 right-6 z-50 bg-gray-900/90 text-white px-4 py-2 rounded-lg shadow-xl text-xs font-bold animate-in slide-in-from-right-5 fade-in">
                    {statusMsg}
                </div>
            )}

            <main className="flex-1 w-full max-w-[1800px] mx-auto p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 overflow-y-auto xl:overflow-hidden relative">

                {/* LEFT COLUMN: CONTROLS */}
                <div className="xl:col-span-5 space-y-6 xl:h-full xl:overflow-y-auto pr-2 pb-24">

                    <ContextSection
                        place={place} setPlace={setPlace}
                        selectedGenres={selectedGenres} setSelectedGenres={setSelectedGenres}
                        selectedMoods={selectedMoods} setSelectedMoods={setSelectedMoods}
                        selectedInstruments={selectedInstruments} setSelectedInstruments={setSelectedInstruments}
                    />

                    <StructureSection
                        structure={structure}
                        activeBlockId={activeBlockId}
                        draggedIndex={draggedIndex}
                        bpm={bpm}
                        durationSeconds={durationSeconds}
                        vocalStyle={vocalStyle}
                        setBpm={setBpm}
                        setDurationSeconds={setDurationSeconds}
                        setVocalStyle={setVocalStyle}
                        setActiveBlockId={setActiveBlockId}
                        onApplyPreset={handleApplyStructurePreset}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onRemoveBlock={handleRemoveStructure}
                        onAddBlock={handleAddStructure}
                        formatTime={formatTime}
                    />

                    <DetailsSection
                        topic={topic} setTopic={setTopic}
                        language={language} setLanguage={setLanguage}
                        referenceArtist={referenceArtist} setReferenceArtist={setReferenceArtist}
                    />

                    <AdvancedSettings
                        showAdvanced={showAdvanced} setShowAdvanced={setShowAdvanced}
                        production={production} setProduction={setProduction}
                        drumStyle={drumStyle} setDrumStyle={setDrumStyle}
                        bassStyle={bassStyle} setBassStyle={setBassStyle}
                        mixing={mixing} setMixing={setMixing}
                    />

                    {/* Generate Action */}
                    <div className="pt-2 pb-6">
                        <button
                            id="generate-track-btn"
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
                                <br />
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
                            validationScore={currentPrompt ? validationScore : { total: 0, genre: 0, mood: 0, structure: 0, production: 0, hint: "Start by generating a prompt!" }}
                        />
                    </div>
                </div>

                {/* --- MODALS --- */}
                <SceneEditorModal
                    activeBlock={activeBlock}
                    onClose={() => setActiveBlockId(null)}
                    onUpdate={updateActiveBlock}
                    onImageUpload={handleImageUpload}
                />

                <SavePresetModal
                    isOpen={showSaveModal}
                    onClose={() => setShowSaveModal(false)}
                    saveName={saveName}
                    setSaveName={setSaveName}
                    onSave={savePreset}
                    savedPresets={savedPresets}
                />

                <LoadPresetModal
                    isOpen={showLoadModal}
                    onClose={() => setShowLoadModal(false)}
                    savedPresets={savedPresets}
                    onLoad={loadPreset}
                    onDelete={deletePreset}
                />

            </main>
        </div>
    );
};

export default App;
