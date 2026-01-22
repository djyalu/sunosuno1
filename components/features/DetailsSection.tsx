
import React from 'react';
import { LANGUAGES } from '../../constants';

interface DetailsSectionProps {
    topic: string;
    setTopic: (val: string) => void;
    language: string;
    setLanguage: (val: string) => void;
    referenceArtist: string;
    setReferenceArtist: (val: string) => void;
}

const DetailsSection: React.FC<DetailsSectionProps> = ({
    topic, setTopic,
    language, setLanguage,
    referenceArtist, setReferenceArtist
}) => {
    return (
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
    );
};

export default DetailsSection;
