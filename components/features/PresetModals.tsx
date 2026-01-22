
import React from 'react';
import { SavedPreset } from '../../types';
import { XMarkIcon, CheckIcon, FloppyDiskIcon, TrashIcon } from '../Icons';

interface SavePresetModalProps {
    isOpen: boolean;
    onClose: () => void;
    saveName: string;
    setSaveName: (val: string) => void;
    onSave: () => void;
    savedPresets: SavedPreset[];
}

export const SavePresetModal: React.FC<SavePresetModalProps> = ({
    isOpen, onClose, saveName, setSaveName, onSave, savedPresets
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Save Preset</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5" /></button>
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
                        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                        <button onClick={onSave} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-colors shadow-md">Save Preset</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface LoadPresetModalProps {
    isOpen: boolean;
    onClose: () => void;
    savedPresets: SavedPreset[];
    onLoad: (preset: SavedPreset) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
}

export const LoadPresetModal: React.FC<LoadPresetModalProps> = ({
    isOpen, onClose, savedPresets, onLoad, onDelete
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
                    <h3 className="font-bold text-gray-800">Load Preset</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5" /></button>
                </div>

                <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
                    {savedPresets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm gap-2">
                            <FloppyDiskIcon className="w-8 h-8 opacity-20" />
                            <p>No saved presets found.</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {savedPresets.sort((a, b) => b.date - a.date).map(preset => (
                                <div key={preset.id} className="group flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all">
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onLoad(preset)}>
                                        <h4 className="font-semibold text-sm text-gray-800 truncate group-hover:text-primary transition-colors">{preset.name}</h4>
                                        <p className="text-[10px] text-gray-400">{new Date(preset.date).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2 pl-2">
                                        <button
                                            onClick={() => onLoad(preset)}
                                            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded hover:bg-primary hover:text-white hover:border-primary transition-colors shadow-sm"
                                        >
                                            Load
                                        </button>
                                        <button
                                            onClick={(e) => onDelete(preset.id, e)}
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
                    <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-800">Close</button>
                </div>
            </div>
        </div>
    );
};
