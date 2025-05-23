import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { Unit } from '../lib/unit-types';

interface UnitSelectorProps {
  categoryId: string;
  units: Unit[];
  selectedUnitId: string;
  onChange: (unitId: string) => void;
  recentUnits?: Unit[];
  loading?: boolean;
}

const UnitSelector: React.FC<UnitSelectorProps> = ({
  units,
  selectedUnitId,
  onChange,
  recentUnits = [],
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Get selected unit data with fallback for empty units array
  const selectedUnit = useMemo(() => {
    // First try to find in the provided units array
    const foundUnit = units.find(unit => unit.id === selectedUnitId);
    if (foundUnit) return foundUnit;
    
    // If not found in units array, try in recentUnits
    const recentUnit = recentUnits.find(unit => unit.id === selectedUnitId);
    if (recentUnit) return recentUnit;
    
    // If still not found but we have a selectedUnitId, create a placeholder
    if (selectedUnitId) {
      return {
        id: selectedUnitId,
        name: selectedUnitId.charAt(0).toUpperCase() + selectedUnitId.slice(1).replace(/_/g, ' '),
        symbol: selectedUnitId,
        toBase: (val: number) => val,
        fromBase: (val: number) => val
      };
    }
    
    // Return the first unit or a placeholder if no units
    return units[0] || {
      id: 'select',
      name: 'Select unit',
      symbol: '',
      toBase: (val: number) => val,
      fromBase: (val: number) => val
    };
  }, [units, selectedUnitId, recentUnits]);
  
  // Get filtered units based on search
  const filteredUnits = useMemo(() => {
    if (!searchQuery.trim()) return units;
    
    const query = searchQuery.toLowerCase().trim();
    return units.filter(unit => 
      unit.name.toLowerCase().includes(query) ||
      unit.symbol.toLowerCase().includes(query) ||
      (unit.aliases?.some(alias => alias.toLowerCase().includes(query)) ?? false)
    );
  }, [units, searchQuery]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 10);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);
  
  const handleUnitSelect = (unitId: string) => {
    onChange(unitId);
    setIsOpen(false);
    setSearchQuery('');
  };
  
  // Format the unit name to prevent repetition
  const formatUnitName = (name: string, symbol: string) => {
    // If the name contains the symbol, don't show the symbol separately
    if (name.toLowerCase().includes(symbol.toLowerCase())) {
      return name;
    }
    return name;
  };
  
  return (
    <div className="unit-selector-container">
      {/* {label && <label className="block text-sm text-muted-foreground mb-1">{label}</label>} */}
      
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-[48px] flex items-center justify-between px-3 py-2 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center flex-1">
            <div className="flex flex-row items-center gap-2">
              <span className="font-medium truncate text-base">{selectedUnit.name}</span>
              <span className="text-xs text-muted-foreground truncate">{selectedUnit.symbol}</span>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="dropdown-container absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-10 max-h-[300px] w-[calc(100%+2rem)] -ml-4 overflow-hidden flex flex-col">
            <div className="search-container p-3 border-b border-border sticky top-0 bg-card z-10">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search units..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 bg-muted border-0 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="units-container overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
              {loading ? (
                <div className="p-3 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Recent units section */}
                  {recentUnits.length > 0 && !searchQuery && (
                    <div className="recent-units p-2">
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Recent</div>
                      {recentUnits.map(unit => (
                        <button
                          key={`recent-${unit.id}`}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-muted transition-colors rounded-md ${
                            unit.id === selectedUnitId ? 'bg-primary/10 text-primary' : ''
                          }`}
                          onClick={() => handleUnitSelect(unit.id)}
                          role="option"
                          aria-selected={unit.id === selectedUnitId}
                        >
                          <span className="truncate mr-2">{formatUnitName(unit.name, unit.symbol)}</span>
                          <span className="text-sm text-muted-foreground flex-shrink-0">{unit.symbol}</span>
                        </button>
                      ))}
                      <div className="border-t border-border my-2"></div>
                    </div>
                  )}
                  
                  {/* Main unit list */}
                  <div className="unit-list p-2" role="listbox">
                    {filteredUnits.length === 0 ? (
                      <div className="px-3 py-4 text-center text-muted-foreground">
                        No units found matching "{searchQuery}"
                      </div>
                    ) : (
                      filteredUnits.map(unit => (
                        <button
                          key={unit.id}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-muted transition-colors rounded-md ${
                            unit.id === selectedUnitId ? 'bg-primary/10 text-primary' : ''
                          }`}
                          onClick={() => handleUnitSelect(unit.id)}
                          role="option"
                          aria-selected={unit.id === selectedUnitId}
                        >
                          <span className="truncate mr-2">{formatUnitName(unit.name, unit.symbol)}</span>
                          <span className="text-sm text-muted-foreground flex-shrink-0">{unit.symbol}</span>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitSelector; 