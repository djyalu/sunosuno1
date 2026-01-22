
import React from 'react';
import { PRODUCTION_STYLES, DRUM_STYLES, BASS_STYLES, MIXING_STYLES } from '../../constants';

interface AdvancedSettingsProps {
    showAdvanced: boolean;
    setShowAdvanced: (val: boolean) => void;
    production: string;
    setProduction: (val: string) => void;
    drumStyle: string;
    setDrumStyle: (val: string) => void;
    bassStyle: string;
    setBassStyle: (val: string) => void;
    mixing: string;
    setMixing: (val: string) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
    showAdvanced, setShowAdvanced,
    production, setProduction,
    drumStyle, setDrumStyle,
    bassStyle, setBassStyle,
    mixing, setMixing
}) => {
    return (
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
                    {[{ l: 'Production', v: production, s: setProduction, o: PRODUCTION_STYLES }, { l: 'Drum Style', v: drumStyle, s: setDrumStyle, o: DRUM_STYLES }, { l: 'Bass Style', v: bassStyle, s: setBassStyle, o: BASS_STYLES }, { l: 'Mixing', v: mixing, s: setMixing, o: MIXING_STYLES }].map((field) => (
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
    );
};

export default AdvancedSettings;
