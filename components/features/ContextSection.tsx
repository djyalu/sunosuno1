
import React from 'react';
import StyleSelector from '../StyleSelector';
import { PLACES, GENRES, MOODS, INSTRUMENTS } from '../../constants';

interface ContextSectionProps {
    place: string;
    setPlace: (id: string) => void;
    selectedGenres: string[];
    setSelectedGenres: React.Dispatch<React.SetStateAction<string[]>>;
    selectedMoods: string[];
    setSelectedMoods: React.Dispatch<React.SetStateAction<string[]>>;
    selectedInstruments: string[];
    setSelectedInstruments: React.Dispatch<React.SetStateAction<string[]>>;
}

const ContextSection: React.FC<ContextSectionProps> = ({
    place,
    setPlace,
    selectedGenres,
    setSelectedGenres,
    selectedMoods,
    setSelectedMoods,
    selectedInstruments,
    setSelectedInstruments,
}) => {
    return (
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
                            className={`p-2.5 rounded-xl text-xs font-medium transition-all text-center flex flex-col items-center gap-1.5 border ${place === p.id
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
    );
};

export default ContextSection;
