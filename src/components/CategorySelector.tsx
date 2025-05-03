import React, { useState, useEffect, useMemo } from 'react';
import {  ArrowLeft, ChevronRight, Search, FileText } from 'lucide-react';
import { UnitCategoryId } from '../lib/unit-types';
import { unitCategoryInfo } from '../lib/unit-types';
import { searchUnits } from '../lib/unit-search';

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  availableCategories: string[];
  isLoading?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  onSelectUnit?: (unitId: string, categoryId: string) => void;
}

interface UnitSearchResult {
  unitId: string;
  categoryId: string;
  name: string;
  symbol: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  availableCategories,
  isLoading = false,
  showBackButton = false,
  onBack,
  onSelectUnit
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [unitSearchResults, setUnitSearchResults] = useState<UnitSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (searchTerm.trim() === '') {
      return availableCategories;
    }
    
    // If we have unit search results, show only categories with matching units
    if (unitSearchResults.length > 0) {
      const categoriesWithMatchingUnits = new Set(unitSearchResults.map(result => result.categoryId));
      
      // Always include the selected category
      if (selectedCategory) {
        categoriesWithMatchingUnits.add(selectedCategory);
      }
      
      return availableCategories.filter(id => categoriesWithMatchingUnits.has(id));
    }
    
    // Otherwise filter by category name
    const filtered = availableCategories.filter(id => {
      const info = unitCategoryInfo[id as UnitCategoryId] || { name: '', description: '' };
      return info.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    // Always include the selected category if it's not already included
    if (selectedCategory && !filtered.includes(selectedCategory)) {
      filtered.unshift(selectedCategory);
    }
    
    return filtered;
  }, [availableCategories, searchTerm, unitSearchResults, selectedCategory]);
  
  // Default categories to always show when available (common categories)
  const defaultCategories = useMemo(() => {
    const defaults = [
      UnitCategoryId.LENGTH,
      UnitCategoryId.MASS,
      UnitCategoryId.VOLUME,
      UnitCategoryId.TEMPERATURE,
      UnitCategoryId.TIME,
      UnitCategoryId.AREA
    ];
    return defaults.filter(id => availableCategories.includes(id));
  }, [availableCategories]);
  
  // Show only popular categories initially, unless searching
  const displayedCategories = useMemo(() => {
    if (searchTerm.trim() !== '') {
      return filteredCategories.length > 0 ? filteredCategories : defaultCategories;
    }
    return showAllCategories ? filteredCategories : filteredCategories.slice(0, 8);
  }, [filteredCategories, defaultCategories, showAllCategories, searchTerm]);
  
  // Search for units when search term changes
  useEffect(() => {
    const searchForUnits = async () => {
      if (searchTerm.trim().length < 2) {
        setUnitSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        // Use the unit search functionality from lib/unit-search
        const results = searchUnits(searchTerm, 15);
        setUnitSearchResults(results);
      } catch (error) {
        console.error('Error searching units:', error);
        setUnitSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    
    const delayTimer = setTimeout(searchForUnits, 300);
    return () => clearTimeout(delayTimer);
  }, [searchTerm]);
  
  // Reset search when categories change
  useEffect(() => {
    setSearchTerm('');
    setUnitSearchResults([]);
  }, [availableCategories]);
  
  // Handle selecting a unit from search results
  const handleUnitSelect = (unitId: string, categoryId: string) => {
    if (onSelectUnit) {
      onSelectUnit(unitId, categoryId);
    } else {
      // If no unit handler provided, just select the category
      onSelectCategory(categoryId);
    }
    // Clear search after selection
    setSearchTerm('');
    setUnitSearchResults([]);
  };
  
  return (
    <div className="category-selector bg-card border border-border rounded-lg p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {showBackButton && onBack && (
            <button 
              onClick={onBack}
              className="p-1.5 hover:bg-muted rounded-md transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h2 className="text-lg font-medium">Categories</h2>
        </div>
        
        {/* Search input */}
        <div className="relative w-2/5 min-w-[150px]">
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search categories & units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 bg-muted border-0 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary pl-8"
          />
          {searchTerm && (
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearchTerm('');
                setUnitSearchResults([]);
              }}
              aria-label="Clear search"
            >
              <ChevronRight size={14} className="rotate-45" />
            </button>
          )}
        </div>
      </div>
      
      {/* Always show back button with current selection when searching */}
      {searchTerm && (
        <div className="mb-4 p-2 bg-muted/50 rounded-lg flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft size={16} />
            <span>Back to <span className="font-medium">{unitCategoryInfo[selectedCategory as UnitCategoryId]?.name || 'previous'}</span></span>
          </button>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setUnitSearchResults([]);
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Clear search
          </button>
        </div>
      )}
      
      {isLoading || isSearching ? (
        // Loading skeleton
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div 
              key={`skeleton-${index}`}
              className="p-3 rounded-md bg-muted animate-pulse min-h-[80px]"
            />
          ))}
        </div>
      ) : (
        <>
          {/* Show matching units if search results exist */}
          {unitSearchResults.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={14} className="text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Units matching "{searchTerm}"</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {unitSearchResults.map(result => (
                  <button
                    key={`unit-${result.unitId}`}
                    className="p-2 rounded-md bg-muted/50 hover:bg-muted text-left border border-border/50 flex flex-col"
                    onClick={() => handleUnitSelect(result.unitId, result.categoryId)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{result.name}</span>
                      <span className="text-xs text-muted-foreground">{result.symbol}</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {unitCategoryInfo[result.categoryId as UnitCategoryId]?.name || result.categoryId}
                    </span>
                  </button>
                ))}
              </div>
              <div className="border-t border-border/50 my-4"></div>
            </div>
          )}
          
          {/* Categories section */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {displayedCategories.length > 0 ? (
              displayedCategories.map(categoryId => {
                const info = unitCategoryInfo[categoryId as UnitCategoryId] || { name: '', description: '' };
                const isSelected = categoryId === selectedCategory;
                
                return (
                  <button
                    key={categoryId}
                    className={`p-3 rounded-md flex flex-col items-center justify-center text-center min-h-[80px] transition-colors ${
                      isSelected
                        ? 'bg-primary/15 text-primary border-primary font-bold shadow-sm'
                        : 'bg-muted/50 hover:bg-muted/80 border-transparent'
                    } border`}
                    onClick={() => onSelectCategory(categoryId)}
                    aria-pressed={isSelected}
                    aria-label={`Select ${info.name} category`}
                  >
                    <span className="font-medium">{info.name}</span>
                    {info.description && (
                      <span className="text-xs text-muted-foreground mt-1">{info.description}</span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No categories matching "{searchTerm}"
              </div>
            )}
          </div>
          
          {/* Show more/less categories button */}
          {filteredCategories.length > 8 && searchTerm.trim() === '' && (
            <button
              className="mt-4 text-sm text-primary flex items-center justify-center w-full py-2 hover:bg-muted/50 rounded-md transition-colors"
              onClick={() => setShowAllCategories(!showAllCategories)}
            >
              {showAllCategories ? 'Show fewer categories' : 'Show all categories'}
              <ChevronRight size={16} className={`ml-1 transition-transform ${showAllCategories ? 'rotate-90' : ''}`} />
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default CategorySelector;