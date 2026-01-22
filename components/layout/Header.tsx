
import React, { useRef } from 'react';
import {
    MusicalNoteIcon, FolderOpenIcon, FloppyDiskIcon, UploadIcon, DownloadIcon,
    MagicWandIcon, RefreshIcon
} from '../Icons';

interface HeaderProps {
    onLoadClick: () => void;
    onSaveClick: () => void;
    onExportClick: () => void;
    onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onMagicMix: () => void;
    onReset: () => void;
}

const Header: React.FC<HeaderProps> = ({
    onLoadClick,
    onSaveClick,
    onExportClick,
    onImportFile,
    onMagicMix,
    onReset
}) => {
    const configFileRef = useRef<HTMLInputElement>(null);

    return (
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
                            onClick={onLoadClick}
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
                            onClick={onSaveClick}
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
                            onClick={onExportClick}
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
                        onChange={onImportFile}
                    />
                </div>

                <button
                    onClick={onMagicMix}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg transition-all flex items-center gap-1.5 hover:-translate-y-0.5"
                >
                    <MagicWandIcon className="w-3.5 h-3.5" /> Magic Mix
                </button>
                <button onClick={onReset} className="text-xs font-medium px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-1.5 transition-colors">
                    <RefreshIcon className="w-3.5 h-3.5" /> Reset
                </button>
            </div>
        </header>
    );
};

export default Header;
