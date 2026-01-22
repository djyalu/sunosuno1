
import React, { useRef } from 'react';
import { StructureItem } from '../../types';
import { XMarkIcon, ImageIcon } from '../Icons';

interface SceneEditorModalProps {
    activeBlock: StructureItem | undefined;
    onClose: () => void;
    onUpdate: (updates: Partial<StructureItem>) => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SceneEditorModal: React.FC<SceneEditorModalProps> = ({
    activeBlock, onClose, onUpdate, onImageUpload
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!activeBlock) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-[2px]">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        Scene Details <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600">{activeBlock.label}</span>
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
                            onChange={(e) => onUpdate({ description: e.target.value })}
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 flex justify-between">
                            Mood Image (Optional)
                            {activeBlock.image && (
                                <button
                                    onClick={() => onUpdate({ image: undefined })}
                                    className="text-red-500 text-[10px] hover:underline"
                                >
                                    Remove Image
                                </button>
                            )}
                        </label>

                        <div
                            className={`relative border-2 border-dashed rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${activeBlock.image ? 'border-primary' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
                                onChange={onImageUpload}
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 text-center">
                            Gemini will use this image to inspire the lyrics AND derive the musical style for the song.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-colors"
                    >
                        Save Scene
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SceneEditorModal;
