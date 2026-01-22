
import React from 'react';
import { StructureItem } from '../../types';
import { STRUCTURE_PRESETS, STRUCTURE_BLOCKS, VOCAL_STYLES } from '../../constants';
import { ImageIcon, TrashIcon, PlusIcon } from '../Icons';

interface StructureSectionProps {
    structure: StructureItem[];
    activeBlockId: string | null;
    draggedIndex: number | null;
    bpm: number;
    durationSeconds: number;
    vocalStyle: string;
    setBpm: (val: number) => void;
    setDurationSeconds: (val: number) => void;
    setVocalStyle: (val: string) => void;
    setActiveBlockId: (id: string | null) => void;

    // Handlers
    onApplyPreset: (structure: string[]) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
    onRemoveBlock: (id: string, e: React.MouseEvent) => void;
    onAddBlock: (label: string) => void;
    formatTime: (seconds: number) => string;
}

const StructureSection: React.FC<StructureSectionProps> = ({
    structure, activeBlockId, draggedIndex,
    bpm, durationSeconds, vocalStyle,
    setBpm, setDurationSeconds, setVocalStyle, setActiveBlockId,
    onApplyPreset, onDragStart, onDragOver, onDrop, onRemoveBlock, onAddBlock,
    formatTime
}) => {
    return (
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
                            onClick={() => onApplyPreset(preset.structure)}
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
                                onDragStart={(e) => onDragStart(e, idx)}
                                onDragOver={(e) => onDragOver(e, idx)}
                                onDrop={(e) => onDrop(e, idx)}
                                onClick={() => setActiveBlockId(item.id)}
                                className={`group relative px-3 py-1.5 rounded shadow-sm text-[11px] font-semibold flex items-center gap-2 cursor-pointer transition-all border cursor-move ${item.image
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
                                    onClick={(e) => onRemoveBlock(item.id, e)}
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
                            onClick={() => onAddBlock(block)}
                            className="px-2.5 py-1.5 bg-white hover:bg-primary/5 hover:text-primary hover:border-primary/30 rounded text-[10px] text-gray-500 border border-gray-200 transition-all flex items-center gap-1 shadow-sm"
                        >
                            <PlusIcon className="w-2.5 h-2.5" /> {block.replace('[', '').replace(']', '')}
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
    );
};

export default StructureSection;
