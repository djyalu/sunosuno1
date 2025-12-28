import React from 'react';
import { SunoPrompt } from '../types';

interface PromptCardProps {
  prompt: SunoPrompt;
  isActive: boolean;
  onSelect: (prompt: SunoPrompt) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, isActive, onSelect }) => {
  return (
    <div 
      className={`group flex items-center gap-3 p-2 pr-4 rounded-xl cursor-pointer transition-all duration-300 border ${
        isActive 
          ? 'bg-primary/10 border-primary/50 shadow-sm' 
          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      }`}
      onClick={() => onSelect(prompt)}
    >
      <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
        <img 
          src={prompt.imageUrl} 
          alt={prompt.title} 
          className="w-full h-full object-cover"
        />
        {isActive && (
            <div className="absolute inset-0 border-2 border-primary rounded-lg"></div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold text-sm truncate ${isActive ? 'text-primary' : 'text-gray-900 group-hover:text-black'}`}>
          {prompt.title}
        </h3>
        <p className="text-xs text-gray-500 truncate">{prompt.stylePrompt}</p>
      </div>
    </div>
  );
};

export default PromptCard;