import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { unitCategories, convert } from '../lib/units';
import { useHistory } from '../contexts/HistoryContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { usePresets } from '../contexts/PresetsContext';
import { ArrowUpDown, Star, MoveRight } from 'lucide-react';

const Converter: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToHistory } = useHistory();
  const { addToFavorites, isInFavorites, removeFromFavorites } = useFavorites();
  const { presets, addPreset } = usePresets();
  
  // Get category from URL or use default
  const categoryParam = searchParams.get('category') || 'length';
  
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [fromValue, setFromValue] = useState<number>(1);
  const [toValue, setToValue] = useState<number | null>(null);
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  
  // Update URL when category changes
  useEffect(() => {
    setSearchParams({ category: selectedCategory });
  }, [selectedCategory, setSearchParams]);
  
  // Initialize units when category changes
  useEffect(() => {
    const category = unitCategories.find(cat => cat.id === selectedCategory);
    if (category && category.units.length > 0) {
      setFromUnit(category.units[0].id);
      setToUnit(category.units.length > 1 ? category.units[1].id : category.units[0].id);
    }
  }, [selectedCategory]);
  
  // Perform conversion when inputs change
  useEffect(() => {
    if (fromUnit && toUnit && fromValue !== null) {
      const result = convert(fromValue, selectedCategory, fromUnit, toUnit);
      setToValue(result);
    }
  }, [selectedCategory, fromUnit, toUnit, fromValue]);
  
  const handleConvert = () => {
    if (fromUnit && toUnit && fromValue !== null && toValue !== null) {
      // Add to history
      addToHistory({
        fromValue,
        fromUnit,
        toUnit,
        toValue,
        category: selectedCategory,
      });
    }
  };
  
  const handleSwapUnits = () => {
    // Swap units and values
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    
    if (toValue !== null) {
      setFromValue(toValue);
    }
  };
  
  const handleSavePreset = () => {
    if (presetName && fromUnit && toUnit) {
      addPreset({
        name: presetName,
        category: selectedCategory,
        fromUnit,
        toUnit,
      });
      setIsAddingPreset(false);
      setPresetName('');
    }
  };
  
  const handleApplyPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setSelectedCategory(preset.category);
      setFromUnit(preset.fromUnit);
      setToUnit(preset.toUnit);
    }
  };
  
  const handleToggleFavorite = () => {
    if (fromUnit && toUnit && fromValue !== null && toValue !== null) {
      const record = {
        id: `${selectedCategory}-${fromUnit}-${toUnit}-${fromValue}`,
        fromValue,
        fromUnit,
        toUnit,
        toValue,
        category: selectedCategory,
        timestamp: Date.now(),
      };
      
      if (isInFavorites(record.id)) {
        removeFromFavorites(record.id);
      } else {
        addToFavorites(record);
      }
    }
  };
  
  // Get current category data
  const currentCategory = unitCategories.find(cat => cat.id === selectedCategory);
  
  // Format result with proper precision
  const formatResult = (value: number | null): string => {
    if (value === null) return '';
    
    // Use appropriate precision based on value
    if (Math.abs(value) >= 1000) return value.toFixed(0);
    if (Math.abs(value) >= 10) return value.toFixed(2);
    if (Math.abs(value) >= 0.01) return value.toFixed(4);
    return value.toExponential(6);
  };
  
  // Get the symbol for a unit
  const getUnitSymbol = (unitId: string): string => {
    const unit = currentCategory?.units.find(u => u.id === unitId);
    return unit?.symbol || '';
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Unit Converter</h1>
          <p className="text-muted-foreground">Convert between different units of measurement</p>
        </div>
        
        {/* Category selector */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {unitCategories.map(category => (
              <button
                key={category.id}
                className={`p-2 rounded-md ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Converter */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Converter</h2>
            <div className="space-x-2">
              <button
                onClick={handleSwapUnits}
                className="p-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
                aria-label="Swap units"
              >
                <ArrowUpDown className="w-5 h-5" />
              </button>
              <button
                onClick={handleToggleFavorite}
                className="p-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
                aria-label={isInFavorites(`${selectedCategory}-${fromUnit}-${toUnit}-${fromValue}`) ? "Remove from favorites" : "Add to favorites"}
              >
                <Star className={`w-5 h-5 ${isInFavorites(`${selectedCategory}-${fromUnit}-${toUnit}-${fromValue}`) ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
          
          {/* From unit */}
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="fromValue" className="block text-sm font-medium text-foreground mb-1">
                From
              </label>
              <div className="flex gap-2">
                <input
                  id="fromValue"
                  type="number"
                  value={fromValue}
                  onChange={(e) => setFromValue(parseFloat(e.target.value) || 0)}
                  className="flex-1 bg-background text-foreground border border-input rounded-md px-3 py-2"
                  placeholder="Enter value"
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full md:w-1/3 bg-background text-foreground border border-input rounded-md px-3 py-2"
                >
                  {currentCategory?.units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} ({unit.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* To unit */}
            <div>
              <label htmlFor="toValue" className="block text-sm font-medium text-foreground mb-1">
                To
              </label>
              <div className="flex gap-2">
                <input
                  id="toValue"
                  type="text"
                  value={formatResult(toValue)}
                  readOnly
                  className="flex-1 bg-muted text-foreground border border-input rounded-md px-3 py-2"
                  placeholder="Result"
                />
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full md:w-1/3 bg-background text-foreground border border-input rounded-md px-3 py-2"
                >
                  {currentCategory?.units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} ({unit.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleConvert}
              className="flex-1 bg-primary text-primary-foreground rounded-md px-4 py-2 hover:bg-primary/90 transition-colors"
            >
              Convert
            </button>
            <button
              onClick={() => setIsAddingPreset(true)}
              className="flex-1 bg-secondary text-secondary-foreground rounded-md px-4 py-2 hover:bg-secondary/90 transition-colors"
            >
              Save as Preset
            </button>
          </div>
          
          {/* Conversion formula */}
          {fromValue !== null && toValue !== null && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-sm flex items-center">
                <span>{fromValue} {getUnitSymbol(fromUnit)}</span>
                <MoveRight className="mx-2 w-4 h-4" />
                <span>{formatResult(toValue)} {getUnitSymbol(toUnit)}</span>
              </p>
            </div>
          )}
        </div>
        
        {/* Presets */}
        {presets.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Presets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {presets.map(preset => {
                const category = unitCategories.find(cat => cat.id === preset.category);
                const fromUnitObj = category?.units.find(u => u.id === preset.fromUnit);
                const toUnitObj = category?.units.find(u => u.id === preset.toUnit);
                
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset.id)}
                    className="flex justify-between items-center p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                  >
                    <span className="font-medium">{preset.name}</span>
                    <span className="text-sm text-muted-foreground flex items-center">
                      {fromUnitObj?.symbol} <MoveRight className="mx-1 w-3 h-3" /> {toUnitObj?.symbol}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Modal for adding preset */}
      {isAddingPreset && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Save as Preset</h2>
            
            <div className="mb-4">
              <label htmlFor="presetName" className="block text-sm font-medium text-foreground mb-1">
                Preset Name
              </label>
              <input
                id="presetName"
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="w-full bg-background text-foreground border border-input rounded-md px-3 py-2"
                placeholder="Enter preset name"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAddingPreset(false)}
                className="bg-muted text-foreground rounded-md px-4 py-2 hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                disabled={!presetName}
                className="bg-primary text-primary-foreground rounded-md px-4 py-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Converter; 