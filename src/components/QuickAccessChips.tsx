import React, { useState, useEffect, useRef } from 'react';
import { MoveRight, Star } from 'lucide-react';
import { getRecentUniqueConversions, getFavoriteConversions } from '../lib/indexedDB';

interface QuickAccessItem {
  id: string;
  fromUnit: string;
  fromUnitSymbol: string;
  toUnit: string;
  toUnitSymbol: string;
  category: string;
  isFavorite: boolean;
}

// Helper to remove duplicates and merge recents with favorites
const mergeAndDeduplicate = (
  recents: QuickAccessItem[],
  favorites: QuickAccessItem[],
  currentCategory?: string
): QuickAccessItem[] => {
  // First, filter by category if specified
  const filteredFavorites = currentCategory 
    ? favorites.filter(fav => fav.category === currentCategory)
    : favorites;
    
  const filteredRecents = currentCategory 
    ? recents.filter(rec => rec.category === currentCategory)
    : recents;
  
  const merged: QuickAccessItem[] = [...filteredFavorites];
  
  // Track conversion pairs to avoid duplicates like m→km AND km→m
  const conversionPairs = new Set<string>();
  
  // Add favorites first
  filteredFavorites.forEach(fav => {
    const pairKey1 = `${fav.category}:${fav.fromUnit}:${fav.toUnit}`;
    const pairKey2 = `${fav.category}:${fav.toUnit}:${fav.fromUnit}`;
    conversionPairs.add(pairKey1);
    conversionPairs.add(pairKey2);
  });
  
  // Add non-duplicate recents
  filteredRecents.forEach(recent => {
    const pairKey1 = `${recent.category}:${recent.fromUnit}:${recent.toUnit}`;
    const pairKey2 = `${recent.category}:${recent.toUnit}:${recent.fromUnit}`;
    
    // Skip if we already have this conversion pair in either direction
    if (!conversionPairs.has(pairKey1) && !conversionPairs.has(pairKey2)) {
      merged.push(recent);
      conversionPairs.add(pairKey1);
      conversionPairs.add(pairKey2);
    }
  });
  
  return merged.slice(0, 8); // Limit to 8 items total
};

interface QuickAccessChipsProps {
  onApplyConversion: (item: QuickAccessItem) => void;
  currentCategory?: string;
}

const QuickAccessChips: React.FC<QuickAccessChipsProps> = ({ 
  onApplyConversion, 
  currentCategory 
}) => {
  const [items, setItems] = useState<QuickAccessItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevCategoryRef = useRef<string | undefined>(currentCategory);
  
  // Load unique recent conversions and favorites
  useEffect(() => {
    // Force reload when category changes
    if (prevCategoryRef.current !== currentCategory) {
      setItems([]); // Clear current items
      prevCategoryRef.current = currentCategory;
    }
    
    const loadQuickAccessItems = async () => {
      try {
        setIsLoading(true);
        // Get recent unique conversions from IndexedDB
        const recentConversions = await getRecentUniqueConversions(10);
        const favorites = await getFavoriteConversions(10);
        
        // Ensure no duplicates between recents and favorites, and filter by category if needed
        const uniqueItems = mergeAndDeduplicate(recentConversions, favorites, currentCategory);
        setItems(uniqueItems);
      } catch (error) {
        console.error('Failed to load quick access items:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuickAccessItems();
  }, [currentCategory]);
  
  // Add horizontal scroll with arrow navigation
  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };
  
  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -150, behavior: 'smooth' });
    }
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === containerRef.current) {
        if (e.key === 'ArrowRight') {
          scrollRight();
        } else if (e.key === 'ArrowLeft') {
          scrollLeft();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  if (items.length === 0 && !isLoading) {
    return null; // Don't render anything if no items
  }
  
  return (
    <div className="quick-access-section mb-4 mt-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          {currentCategory ? "Category Quick Access" : "Quick Access"}
        </h2>
      </div>
      
      <div 
        className="quick-access-container relative"
        aria-label="Quick access conversions"
      >
        <div 
          ref={containerRef}
          className="scrollable-container flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
          tabIndex={0}
          role="listbox"
        >
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div 
                key={`skeleton-${index}`} 
                className="flex-shrink-0 h-10 bg-muted rounded-full w-32 animate-pulse"
              />
            ))
          ) : (
            items.map(item => (
              <button
                key={item.id}
                className={`flex-shrink-0 h-10 px-3 rounded-full border border-border flex items-center gap-1.5 transition-all hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  item.isFavorite ? 'bg-primary/5 border-primary/30' : 'bg-card'
                }`}
                onClick={() => onApplyConversion(item)}
                aria-label={`Convert from ${item.fromUnitSymbol} to ${item.toUnitSymbol}`}
                role="option"
              >
                {item.isFavorite && (
                  <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                )}
                <span className="font-medium">{item.fromUnitSymbol}</span>
                <MoveRight className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-medium">{item.toUnitSymbol}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickAccessChips; 