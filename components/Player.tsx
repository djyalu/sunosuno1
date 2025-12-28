import React, { useState, useEffect } from 'react';
import { SunoPrompt, ValidationScore } from '../types';
import { CopyIcon, CheckIcon, SparklesIcon, GlobeIcon, ShieldCheckIcon, RefreshIcon, DownloadIcon } from './Icons';
import { validateLyrics, transcreateLyrics } from '../services/geminiService';
import { LANGUAGES } from '../constants';

interface ResultViewProps {
  promptData: SunoPrompt | null;
  validationScore: ValidationScore;
}

const CopyButton = ({ text, label, fullWidth = false }: { text: string, label: string, fullWidth?: boolean }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      <div className="flex justify-between items-end px-1">
        <span className="text-xs uppercase text-gray-500 font-bold tracking-wider">{label}</span>
        <button 
          onClick={handleCopy} 
          className={`text-xs flex items-center gap-1 transition-colors px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 border border-gray-200 ${copied ? 'text-green-600' : 'text-gray-600'}`}
        >
          {copied ? <><CheckIcon className="w-3 h-3" /> Copied</> : <><CopyIcon className="w-3 h-3" /> Copy</>}
        </button>
      </div>
      <div 
        className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 font-mono hover:border-primary/50 transition-colors cursor-pointer relative group break-words leading-relaxed shadow-sm"
        onClick={handleCopy}
      >
        {text}
      </div>
    </div>
  );
};

const ScoreBar = ({ label, score }: { label: string, score: number }) => (
    <div className="flex items-center gap-3 text-xs">
        <span className="w-16 text-gray-500">{label}</span>
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-1000 ${score > 80 ? 'bg-green-500' : score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                style={{ width: `${score}%` }}
            ></div>
        </div>
        <span className="w-8 text-right font-mono text-gray-600">{score}</span>
    </div>
);

const ResultView: React.FC<ResultViewProps> = ({ promptData, validationScore }) => {
  // State for lyrics manipulation
  const [currentLyrics, setCurrentLyrics] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState(LANGUAGES[1]); // Default to second lang (English usually)

  // Sync lyrics when prompt changes
  useEffect(() => {
    if (promptData) {
        setCurrentLyrics(promptData.lyrics);
        setStatusMessage(null);
    }
  }, [promptData]);

  const handleValidate = async () => {
    if (!promptData || !currentLyrics) return;
    setIsProcessing(true);
    setStatusMessage("AI is analyzing and polishing your lyrics...");
    try {
        const result = await validateLyrics(currentLyrics, promptData.options.language);
        setCurrentLyrics(result.correctedLyrics);
        setStatusMessage(`Fixed: ${result.changeLog}`);
    } catch (e) {
        setStatusMessage("Validation failed. Please check API key.");
    } finally {
        setIsProcessing(false);
        setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleTranscreate = async () => {
    if (!promptData || !currentLyrics) return;
    setIsProcessing(true);
    setStatusMessage(`Transcreating lyrics to ${targetLang} (matching rhythm)...`);
    try {
        const result = await transcreateLyrics(currentLyrics, targetLang);
        setCurrentLyrics(result.transcreatedLyrics);
        setStatusMessage(`Transcreated to ${targetLang} successfully!`);
    } catch (e) {
        setStatusMessage("Transcreation failed. Please check API key.");
    } finally {
        setIsProcessing(false);
        setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleRestore = () => {
      if (promptData) {
          setCurrentLyrics(promptData.lyrics);
          setStatusMessage("Restored original lyrics.");
          setTimeout(() => setStatusMessage(null), 2000);
      }
  };

  const handleDownloadImage = () => {
    if (!promptData?.imageUrl) return;
    const link = document.createElement('a');
    link.href = promptData.imageUrl;
    link.download = `${promptData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_cover.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!promptData) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-300 min-h-[500px] p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-50/50 to-transparent pointer-events-none"></div>
        <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Ready to Create</h2>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Configure your settings on the left and click Generate to create your prompt and album art.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-gray-200 overflow-hidden shadow-xl flex flex-col lg:flex-row h-full">
      {/* Left: Visuals & Validation */}
      <div className="lg:w-1/3 bg-gray-50 p-6 flex flex-col gap-6 border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto">
        
        {/* Album Art */}
        <div className="w-full aspect-square rounded-xl overflow-hidden shadow-lg border border-gray-200 relative group bg-gray-100 shrink-0">
          <img 
            src={promptData.imageUrl} 
            alt={promptData.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none"></div>
          
          {/* Download Button */}
          <button 
            onClick={handleDownloadImage}
            className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all shadow-md z-10 hover:scale-105"
            title="Download Cover Art"
          >
            <DownloadIcon className="w-4 h-4" />
          </button>

          <div className="absolute bottom-5 left-5 right-5 pointer-events-none">
             <h2 className="text-2xl font-bold text-white leading-tight drop-shadow-md">{promptData.title}</h2>
             <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-primary text-white shadow-md">
                    {promptData.options.language}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-white/30 text-white backdrop-blur-md border border-white/20">
                    {promptData.options.bpm} BPM
                </span>
             </div>
          </div>
        </div>
        
        {/* Validation Score */}
        <div className="bg-white rounded-xl p-4 space-y-3 border border-gray-200 shadow-sm shrink-0">
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm text-gray-700">Prompt Score</span>
                <span className={`text-lg font-bold ${validationScore.total > 80 ? 'text-green-500' : 'text-yellow-500'}`}>
                    {validationScore.total}
                </span>
            </div>
            <ScoreBar label="Genre" score={validationScore.genre} />
            <ScoreBar label="Mood" score={validationScore.mood} />
            <ScoreBar label="Struct" score={validationScore.structure} />
            <ScoreBar label="Sound" score={validationScore.production} />
            <div className="pt-2 text-[10px] text-center text-gray-500 font-medium bg-gray-50 rounded py-1 px-2 border border-gray-100">
                {validationScore.hint}
            </div>
        </div>

        {/* Style Prompt */}
        <div className="flex-1">
           <CopyButton text={promptData.stylePrompt} label="🎵 Style Prompt" fullWidth />
        </div>
      </div>

      {/* Right: Lyrics / Details */}
      <div className="lg:w-2/3 flex flex-col h-[600px] lg:h-full bg-white">
         {/* Toolbar */}
         <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50 shrink-0">
            <div className="flex items-center gap-2">
                <span className="text-xs uppercase text-gray-500 font-bold tracking-wider">📝 Lyrics Editor</span>
            </div>
            
            <div className="flex items-center gap-2">
                {/* Restore */}
                {currentLyrics !== promptData.lyrics && (
                    <button 
                        onClick={handleRestore}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-200 transition-colors"
                        title="Restore Original"
                    >
                        <RefreshIcon className="w-4 h-4" />
                    </button>
                )}

                {/* Validate */}
                <button
                    onClick={handleValidate}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg transition-all shadow-sm"
                >
                    <ShieldCheckIcon className="w-3.5 h-3.5 text-green-500" />
                    {isProcessing ? "Analyzing..." : "AI Validate"}
                </button>

                {/* Transcreate */}
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
                    <select 
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="text-xs bg-transparent border-none focus:ring-0 text-gray-700 py-1 pl-2 pr-6 cursor-pointer"
                    >
                        {LANGUAGES.filter(l => l !== promptData.options.language).map(l => (
                            <option key={l} value={l}>{l}</option>
                        ))}
                        {/* Fallback if current lang is not in list or to allow re-selection */}
                        {!LANGUAGES.filter(l => l !== promptData.options.language).includes(targetLang) && <option value={targetLang}>{targetLang}</option>}
                    </select>
                    <button 
                         onClick={handleTranscreate}
                         disabled={isProcessing}
                         className="px-2 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded text-xs font-bold transition-colors flex items-center gap-1"
                    >
                        <GlobeIcon className="w-3 h-3" />
                        Transcreate
                    </button>
                </div>

                {/* Copy */}
                <button 
                    onClick={() => navigator.clipboard.writeText(currentLyrics)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-lg shadow-primary/20 ml-2"
                >
                    <CopyIcon className="w-3.5 h-3.5" /> Copy
                </button>
            </div>
         </div>
         
         {/* Lyrics Area */}
         <div className="flex-1 p-6 overflow-hidden relative">
            {isProcessing && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                         <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                         <p className="text-xs font-bold text-primary animate-pulse">Consulting AI Muse...</p>
                    </div>
                </div>
            )}
            
            <textarea
                value={currentLyrics}
                onChange={(e) => setCurrentLyrics(e.target.value)}
                className="w-full h-full resize-none focus:outline-none font-sans text-gray-700 leading-8 text-[15px] bg-transparent custom-scrollbar overflow-y-auto"
                spellCheck={false}
            />

            {statusMessage && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white px-4 py-2 rounded-full text-xs font-medium shadow-xl animate-in slide-in-from-bottom-2 fade-in">
                    {statusMessage}
                </div>
            )}
         </div>

         <div className="p-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 bg-gray-50/50 shrink-0">
            <span>Structure: {promptData.options.structure.length} blocks</span>
            <span>Editable • Gemini 3.0 Pro</span>
         </div>
      </div>
    </div>
  );
};

export default ResultView;