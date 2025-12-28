import React, { useState, useEffect, useMemo } from 'react';
import { SearchIcon, StarIcon, XMarkIcon } from './Icons';

interface StyleSelectorProps {
  title: string;
  items: string[];
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  maxSelection: number;
  storageKey: string; // Key for localStorage favorites
}

const StyleSelector: React.FC<StyleSelectorProps> = ({
  title,
  items,
  selectedItems,
  onSelectionChange,
  maxSelection,
  storageKey,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // 1. Lazy Initialization: Load from localStorage immediately on mount
  // This prevents the "flash of empty state" and ensures persistence works robustly.
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
        const stored = localStorage.getItem(`sonicForge_fav_${storageKey}`);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Failed to load favorites", e);
        return [];
    }
  });

  // 2. Sync with localStorage whenever favorites change
  // We use useEffect here strictly for *writing* changes to storage, or use toggle handler.
  // Actually, performing side-effect in handler is often safer for user actions, 
  // but useEffect ensures sync if state changes from other sources. 
  // Here we'll stick to updating storage in the handler to ensure sequential consistency.

  // Handle props change (if the component is reused with different keys)
  useEffect(() => {
    try {
        const stored = localStorage.getItem(`sonicForge_fav_${storageKey}`);
        if (stored) setFavorites(JSON.parse(stored));
        else setFavorites([]);
    } catch (e) {
        setFavorites([]);
    }
  }, [storageKey]);


  // Toggle favorite status with Functional Update
  const toggleFavorite = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setFavorites(prev => {
        const newFavorites = prev.includes(item)
          ? prev.filter((f) => f !== item)
          : [...prev, item];
        
        // Save to storage immediately inside the update to guarantee sync with state
        localStorage.setItem(`sonicForge_fav_${storageKey}`, JSON.stringify(newFavorites));
        return newFavorites;
    });
  };

  // Toggle item selection
  const toggleSelection = (item: string) => {
    if (selectedItems.includes(item)) {
      onSelectionChange(selectedItems.filter((i) => i !== item));
    } else {
      if (selectedItems.length < maxSelection) {
        onSelectionChange([...selectedItems, item]);
      }
    }
  };

  // Filter and Sort Items
  // 1. Filter by search
  // 2. Sort: Selected first, then Favorites, then Alphabetical
  const processedItems = useMemo(() => {
    return items
      .filter((item) => item.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        // 1. Sort by Selection (Selected first)
        const isSelA = selectedItems.includes(a);
        const isSelB = selectedItems.includes(b);
        if (isSelA && !isSelB) return -1;
        if (!isSelA && isSelB) return 1;

        // 2. Sort by Favorites
        const isFavA = favorites.includes(a);
        const isFavB = favorites.includes(b);
        if (isFavA && !isFavB) return -1;
        if (!isFavA && isFavB) return 1;

        // 3. Alphabetical
        return a.localeCompare(b);
      });
  }, [items, searchQuery, favorites, selectedItems]);

  return (
    <div className="space-y-3">
      {/* Header Area */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">{title}</span>
            <span className="text-[10px] text-gray-400">
            {selectedItems.length}/{maxSelection} selected
            </span>
        </div>
        
        <div className="flex items-center">
            {isSearchActive ? (
                <div className="flex items-center bg-gray-100 rounded-lg px-2 py-1 transition-all w-40">
                    <SearchIcon className="w-3 h-3 text-gray-400 mr-1.5" />
                    <input 
                        type="text"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="bg-transparent text-xs outline-none w-full placeholder-gray-400 text-gray-700"
                        onBlur={() => !searchQuery && setIsSearchActive(false)}
                    />
                    <button onClick={() => { setSearchQuery(''); setIsSearchActive(false); }}>
                        <XMarkIcon className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                    </button>
                </div>
            ) : (
                <button 
                    onClick={() => setIsSearchActive(true)}
                    className="p-1 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-md transition-all"
                    title="Search"
                >
                    <SearchIcon className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
      </div>

      {/* Grid */}
      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto custom-scrollbar p-1">
        {processedItems.length > 0 ? (
          processedItems.map((item) => {
            const isSelected = selectedItems.includes(item);
            const isFavorite = favorites.includes(item);

            return (
              <button
                key={item}
                onClick={() => toggleSelection(item)}
                className={`group relative pl-2.5 pr-7 py-1.5 rounded-lg text-[11px] font-medium transition-all border text-left flex items-center ${
                  isSelected
                    ? 'bg-secondary text-white border-secondary shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="truncate max-w-[100px]">{item.split(' (')[0]}</span>
                
                {/* Favorite Star Button */}
                <div 
                    onClick={(e) => toggleFavorite(item, e)}
                    className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition-colors ${
                        isFavorite ? (isSelected ? 'text-yellow-200' : 'text-yellow-400') : 'text-gray-300 opacity-0 group-hover:opacity-100'
                    }`}
                >
                    <StarIcon className="w-3 h-3" filled={isFavorite} />
                </div>
              </button>
            );
          })
        ) : (
          <div className="w-full text-center py-4 text-xs text-gray-400 italic">
            No items match "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};

export default StyleSelector;