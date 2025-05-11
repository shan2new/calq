import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { unitCategories } from '../../lib/units';
import { Unit } from '../../lib/unit-types';
import UnitSelector from '../UnitSelector';
import ConversionResult from '../ConversionResult';
import ConverterActions from '../ConverterActions';
import { useHistory, ConversionRecord } from '../../contexts/HistoryContext';
import { ChevronDown, ChevronRight } from 'lucide-react';
import RecentConversions from '../RecentConversions';

interface UnifiedConverterProps {
  onSavePreset: () => void;
}

const UnifiedConverter: React.FC<UnifiedConverterProps> = ({ onSavePreset }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToHistory, history } = useHistory();

  // State
  const [selectedCategory, setSelectedCategory] = useState(unitCategories[0]);
  const [fromValue, setFromValue] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState<Unit>(selectedCategory.units[0]);
  const [toUnit, setToUnit] = useState<Unit>(selectedCategory.units[1]);
  const [result, setResult] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [recentUnits, setRecentUnits] = useState<Unit[]>([]);
  const [favorites, setFavorites] = useState<ConversionRecord[]>([]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('calcq_favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('calcq_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Check if current conversion is a favorite
  useEffect(() => {
    const isFav = favorites.some(fav => 
      fav.category === selectedCategory.id &&
      fav.fromUnit === fromUnit.id &&
      fav.toUnit === toUnit.id
    );
    setIsFavorite(isFav);
  }, [selectedCategory.id, fromUnit.id, toUnit.id, favorites]);

  // Load initial state from URL params
  useEffect(() => {
    const categoryId = searchParams.get('category');
    const fromUnitId = searchParams.get('from');
    const toUnitId = searchParams.get('to');
    const value = searchParams.get('value');

    if (categoryId) {
      const category = unitCategories.find(c => c.id === categoryId);
      if (category) {
        setSelectedCategory(category);
        
        if (fromUnitId) {
          const from = category.units.find(u => u.id === fromUnitId);
          if (from) setFromUnit(from);
        }
        
        if (toUnitId) {
          const to = category.units.find(u => u.id === toUnitId);
          if (to) setToUnit(to);
        }
        
        if (value) {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) setFromValue(numValue);
        }
      }
    }
  }, [searchParams]);

  // Load recent units from history
  useEffect(() => {
    setRecentUnits(history
      .slice(0, 5)
      .map(conv => {
        const category = unitCategories.find(c => c.id === conv.category);
        return category?.units.find(u => u.id === conv.fromUnit) || category?.units.find(u => u.id === conv.toUnit);
      })
      .filter((unit): unit is Unit => unit !== undefined)
    );
  }, [history]);

  // Calculate conversion when inputs change
  useEffect(() => {
    const baseValue = fromUnit.toBase(fromValue);
    const convertedValue = toUnit.fromBase(baseValue);
    setResult(convertedValue);

    // Update URL params
    const newParams = new URLSearchParams({
      category: selectedCategory.id,
      from: fromUnit.id,
      to: toUnit.id,
      value: fromValue.toString()
    });
    navigate(`/?${newParams.toString()}`, { replace: true });

    // Add to history
    const newConversion: Omit<ConversionRecord, 'id'> = {
      category: selectedCategory.id,
      fromUnit: fromUnit.id,
      toUnit: toUnit.id,
      fromValue,
      toValue: convertedValue,
      timestamp: Date.now()
    };
    addToHistory(newConversion);
  }, [fromValue, fromUnit, toUnit, selectedCategory]);

  // Handle unit swapping
  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  // Handle favorite toggle
  const handleFavorite = (conversion?: ConversionRecord) => {
    const targetConversion = conversion || {
      category: selectedCategory.id,
      fromUnit: fromUnit.id,
      toUnit: toUnit.id,
      fromValue,
      toValue: result || 0,
      timestamp: Date.now(),
      id: Date.now().toString()
    };

    const existingIndex = favorites.findIndex(fav => 
      fav.category === targetConversion.category &&
      fav.fromUnit === targetConversion.fromUnit &&
      fav.toUnit === targetConversion.toUnit
    );

    if (existingIndex >= 0) {
      setFavorites(favorites.filter((_, i) => i !== existingIndex));
      setIsFavorite(false);
    } else {
      setFavorites([...favorites, targetConversion]);
      setIsFavorite(true);
    }
  };

  return (
    <div className="unified-converter h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="max-w-xl mx-auto p-2 sm:p-4 space-y-4">
        {/* Category Selector */}
        <div className="category-selector">
          <button
            className="w-full flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <div className="flex items-center">
              <span className="font-medium">{selectedCategory.name}</span>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showCategoryDropdown && (
            <div className="absolute left-4 right-4 mt-2 bg-card border border-border rounded-lg shadow-lg z-20">
              <div className="p-2 grid grid-cols-2 gap-2">
                {unitCategories.map(category => (
                  <button
                    key={category.id}
                    className={`p-3 rounded-md text-left hover:bg-muted transition-colors ${
                      category.id === selectedCategory.id ? 'bg-primary/10 text-primary' : ''
                    }`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setFromUnit(category.units[0]);
                      setToUnit(category.units[1]);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Conversion Section */}
        <div className="conversion-section bg-card/50 rounded-lg border border-border p-3">
          {/* Unit Input */}
          <div className="unit-input mb-4">
            <input
              type="number"
              value={fromValue}
              onChange={(e) => setFromValue(parseFloat(e.target.value) || 0)}
              className="w-full p-3 bg-background border border-border rounded-lg text-2xl font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter value"
            />
          </div>

          {/* Unit Selectors */}
          <div className="unit-selectors grid grid-cols-[1fr,auto,1fr] items-center gap-1">
            <UnitSelector
              categoryId={selectedCategory.id}
              units={selectedCategory.units}
              selectedUnitId={fromUnit.id}
              onChange={(unitId) => {
                const unit = selectedCategory.units.find(u => u.id === unitId);
                if (unit) setFromUnit(unit);
              }}
              recentUnits={recentUnits}
            />
            
            <div className="flex items-center justify-center w-6 h-6">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            
            <UnitSelector
              categoryId={selectedCategory.id}
              units={selectedCategory.units}
              selectedUnitId={toUnit.id}
              onChange={(unitId) => {
                const unit = selectedCategory.units.find(u => u.id === unitId);
                if (unit) setToUnit(unit);
              }}
              recentUnits={recentUnits}
            />
          </div>
        </div>

        {/* Conversion Result */}
        <ConversionResult
          fromValue={fromValue}
          fromUnit={fromUnit}
          toValue={result}
          toUnit={toUnit}
          categoryId={selectedCategory.id}
        />

        {/* Actions */}
        <div className="actions">
          <ConverterActions
            canSave={true}
            isFavorite={isFavorite}
            onSwap={handleSwap}
            onFavorite={() => handleFavorite()}
            onSavePreset={onSavePreset}
            onCopy={() => {
              if (result !== null) {
                navigator.clipboard.writeText(`${result} ${toUnit.symbol}`);
              }
            }}
            onShare={() => {
              const url = new URL(window.location.href);
              navigator.share?.({
                title: 'Unit Conversion',
                text: `${fromValue} ${fromUnit.symbol} = ${result} ${toUnit.symbol}`,
                url: url.toString()
              }).catch(console.error);
            }}
          />
        </div>

        {/* Recent Conversions */}
        <RecentConversions
          conversions={history.slice(0, 5)}
          onFavorite={handleFavorite}
        />
      </div>
    </div>
  );
};

export default UnifiedConverter; 