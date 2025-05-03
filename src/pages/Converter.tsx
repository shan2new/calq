import React, { createRef, useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { unitCategories, convert, formatNumberByCategory } from '../lib/units';
import { useHistory } from '../contexts/HistoryContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { usePresets } from '../contexts/PresetsContext';
import { 
  ArrowUpDown, Star, MoveRight, X, CheckCircle, 
  AlertCircle, Save, Plus, Search, SlidersHorizontal, 
  Settings, ArrowRightLeft, RefreshCw
} from 'lucide-react';
import { debounce } from 'lodash-es';

// Import new unit conversion system
import { UnitCategoryId, unitCategoryInfo, UnitCategory, Unit, ConversionOptions } from '../lib/unit-types';
import { loadUnitCategory, initializeEssentialCategories, preloadCategories, isCategoryLoaded } from '../lib/unit-loader';
import { convert as newConvert, getCompatibleUnits, getPopularUnits } from '../lib/conversion-engine';
import { searchUnits } from '../lib/unit-search';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 py-2 px-4 rounded-md shadow-md flex items-center gap-2 z-50 bg-card border border-border animate-slide-down">
      {type === 'success' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
      <p className="text-sm font-medium">{message}</p>
      <button 
        onClick={onClose} 
        className="ml-2 text-muted-foreground hover:text-foreground ripple"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// SVG Animation for successful conversion
const SuccessfulConversionAnimation = ({ isVisible }: { isVisible: boolean }) => {
  return isVisible ? (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <svg className="w-16 h-16 animate-conversion-success" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle 
          cx="25" 
          cy="25" 
          r="22" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeDasharray="140"
          strokeDashoffset="140"
          className="text-primary animate-conversion-circle"
        />
        <path 
          d="M15 25L22 32L35 19" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          strokeDasharray="30"
          strokeDashoffset="30"
          className="text-primary animate-conversion-check"
        />
      </svg>
    </div>
  ) : null;
};

// Skeleton loader for converter
const ConverterSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-muted rounded w-3/4"></div>
    
    <div className="bg-card border border-border rounded-lg p-5 space-y-4">
      <div className="h-6 bg-muted rounded w-1/4"></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="h-10 bg-muted rounded"></div>
        ))}
      </div>
    </div>
    
    <div className="bg-card border border-border rounded-lg p-5 space-y-6">
      <div className="flex justify-between mb-4">
        <div className="h-6 bg-muted rounded w-1/4"></div>
        <div className="flex gap-2">
          <div className="h-10 w-10 bg-muted rounded"></div>
          <div className="h-10 w-10 bg-muted rounded"></div>
        </div>
      </div>
      
      <div className="space-y-8">
        <div>
          <div className="h-5 bg-muted rounded w-16 mb-2"></div>
          <div className="sm:flex gap-4">
            <div className="flex-1 h-12 bg-muted rounded mb-4 sm:mb-0"></div>
            <div className="w-full sm:w-1/3 h-12 bg-muted rounded"></div>
          </div>
        </div>
        
        <div>
          <div className="h-5 bg-muted rounded w-16 mb-2"></div>
          <div className="sm:flex gap-4">
            <div className="flex-1 h-12 bg-muted rounded mb-4 sm:mb-0"></div>
            <div className="w-full sm:w-1/3 h-12 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Converter: React.FC = () => {
  // Use the navigate hook for deep-linking using history.replaceState
  const navigate = useNavigate();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToHistory } = useHistory();
  const { addToFavorites, isInFavorites, removeFromFavorites } = useFavorites();
  const { presets, addPreset } = usePresets();
  
  // Refs for input focus and conversion tracking
  const fromValueInputRef = useRef<HTMLInputElement>(null);
  const lastConversionRef = useRef<{
    fromValue: number;
    fromUnit: string;
    toUnit: string;
    category: string;
  } | null>(null);
  const validationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const swapButtonRef = useRef<HTMLButtonElement>(null);
  const favoriteButtonRef = useRef<HTMLButtonElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  
  // Get category and search params from URL
  const categoryParam = searchParams.get('category') || UnitCategoryId.LENGTH;
  const searchQuery = searchParams.get('search') || '';
  const valueFromUrl = searchParams.get('value') || '';
  const fromUnitFromUrl = searchParams.get('from') || '';
  const toUnitFromUrl = searchParams.get('to') || '';
  
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [fromValue, setFromValue] = useState<string>('1');
  const [convertedValue, setConvertedValue] = useState<number | null>(null);
  const [formattedConvertedValue, setFormattedConvertedValue] = useState<string>('');
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapColor, setSwapColor] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hasConverted, setHasConverted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [fabVisible, setFabVisible] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [conversionCount, setConversionCount] = useState(0);
  
  // New state variables for the enhanced system
  const [categoryData, setCategoryData] = useState<UnitCategory | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [fromUnitData, setFromUnitData] = useState<Unit | null>(null);
  const [toUnitData, setToUnitData] = useState<Unit | null>(null);
  const [compatibleUnits, setCompatibleUnits] = useState<Unit[]>([]);
  const [popularUnits, setPopularUnits] = useState<Unit[]>([]);
  const [searchResults, setSearchResults] = useState<{ unitId: string; name: string; symbol: string; categoryId: string; }[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [conversionOptions, setConversionOptions] = useState<ConversionOptions>({
    precision: undefined,
    format: true,
  });
  
  // Determine if preset can be saved
  const canSavePreset = hasConverted && convertedValue !== null && fromUnit !== '' && toUnit !== '';
  
  // Show the floating action button
  const showFAB = canSavePreset && fabVisible;
  
  // Initialize essential categories on first load
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        await initializeEssentialCategories();
        // Preload some additional common categories during idle time
        preloadCategories([
          UnitCategoryId.MASS,
          UnitCategoryId.VOLUME,
          UnitCategoryId.TIME,
        ]);
      } catch (error) {
        console.error('Failed to initialize essential categories:', error);
        setToast({
          message: 'Failed to load unit data. Please try again.',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeApp();
  }, []);
  
  // Load selected category data
  useEffect(() => {
    const loadCategory = async () => {
      if (isCategoryLoaded(selectedCategory)) {
        try {
          setCategoryLoading(true);
          const data = await loadUnitCategory(selectedCategory);
          setCategoryData(data);
          
          // Load compatible and popular units
          if (fromUnit) {
            const compatUnits = await getCompatibleUnits(selectedCategory, fromUnit);
            setCompatibleUnits(compatUnits);
          } else {
            // If no fromUnit selected yet, load popular units
            const popular = await getPopularUnits(selectedCategory);
            setPopularUnits(popular);
            
            // Auto-select the first popular unit if we don't have a selection yet
            if (!fromUnit && popular.length > 0) {
              setFromUnit(popular[0].id);
              setFromUnitData(popular[0]);
            }
          }
        } catch (error) {
          console.error(`Failed to load category ${selectedCategory}:`, error);
        } finally {
          setCategoryLoading(false);
        }
      } else {
        // If not yet loaded, initiate loading
        setCategoryLoading(true);
        loadUnitCategory(selectedCategory)
          .then(data => {
            setCategoryData(data);
            return getPopularUnits(selectedCategory);
          })
          .then(popular => {
            setPopularUnits(popular);
            
            // Auto-select the first popular unit if we don't have a selection yet
            if (!fromUnit && popular.length > 0) {
              setFromUnit(popular[0].id);
              setFromUnitData(popular[0]);
            }
          })
          .catch(error => {
            console.error(`Failed to load category ${selectedCategory}:`, error);
          })
          .finally(() => {
            setCategoryLoading(false);
          });
      }
    };
    
    loadCategory();
  }, [selectedCategory]);
  
  // Update from and to unit data when units change
  useEffect(() => {
    const updateUnitData = async () => {
      if (categoryData && fromUnit) {
        // Find the fromUnit in category data
        const fromUnitObj = findUnitInCategory(categoryData, fromUnit);
        setFromUnitData(fromUnitObj || null);
        
        // Load compatible units for this fromUnit
        if (fromUnitObj) {
          try {
            const compatUnits = await getCompatibleUnits(selectedCategory, fromUnit);
            setCompatibleUnits(compatUnits);
            
            // If toUnit not set or not compatible, set to first compatible unit
            if (!toUnit || !compatUnits.some(u => u.id === toUnit)) {
              const firstCompat = compatUnits[0];
              if (firstCompat) {
                setToUnit(firstCompat.id);
                setToUnitData(firstCompat);
              }
            } else {
              // Update toUnitData
              const toUnitObj = compatUnits.find(u => u.id === toUnit);
              setToUnitData(toUnitObj || null);
            }
          } catch (error) {
            console.error('Failed to load compatible units:', error);
          }
        }
      }
    };
    
    updateUnitData();
  }, [categoryData, fromUnit, toUnit]);
  
  // Helper function to find a unit in a category or its subcategories
  const findUnitInCategory = (category: UnitCategory, unitId: string): Unit | undefined => {
    // Check direct units first
    if (category.units) {
      const unit = category.units.find(u => u.id === unitId);
      if (unit) return unit;
    }
    
    // Check in subcategories
    if (category.subcategories) {
      for (const subcategory of category.subcategories) {
        const unit = subcategory.units.find(u => u.id === unitId);
        if (unit) return unit;
      }
    }
    
    return undefined;
  };
  
  // Perform conversion when parameters change
  const performConversion = useCallback(async () => {
    if (!fromUnit || !toUnit || !categoryData) return;
    
    // Validate input value
    const numValue = parseFloat(fromValue);
    if (isNaN(numValue)) {
      setConvertedValue(null);
      setFormattedConvertedValue('');
      return;
    }
    
    try {
      setIsCalculating(true);
      
      // Call the new convert function
      const result = await newConvert(
        numValue,
        selectedCategory,
        fromUnit,
        toUnit,
        conversionOptions
      );
      
      setConvertedValue(result.value);
      setFormattedConvertedValue(result.formattedValue);
      setHasConverted(true);
      
      // Show success animation on significant changes
      if (
        !lastConversionRef.current ||
        lastConversionRef.current.fromValue !== numValue ||
        lastConversionRef.current.fromUnit !== fromUnit ||
        lastConversionRef.current.toUnit !== toUnit
      ) {
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 1000);
      }
      
      // Update last conversion ref
      lastConversionRef.current = {
        fromValue: numValue,
        fromUnit,
        toUnit,
        category: selectedCategory,
      };
      
      // Add to history
      if (numValue !== 0) {
        addToHistory({
          fromValue: numValue,
          fromUnit,
          toUnit,
          toValue: result.value,
          category: selectedCategory,
        });
      }
      
      // Increment conversion count for analytics
      setConversionCount(prev => prev + 1);
      
    } catch (error) {
      console.error('Conversion failed:', error);
      setConvertedValue(null);
      setFormattedConvertedValue('');
      setValidationError('Conversion failed. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  }, [fromValue, fromUnit, toUnit, selectedCategory, categoryData, conversionOptions]);
  
  // Debounced conversion function
  const debouncedConversion = useMemo(
    () => debounce(performConversion, 300),
    [performConversion]
  );
  
  // Run conversion when parameters change
  useEffect(() => {
    if (fromUnit && toUnit) {
      debouncedConversion();
    }
    
    // Update URL with current parameters
    const newParams = new URLSearchParams();
    newParams.set('category', selectedCategory);
    if (fromUnit) newParams.set('from', fromUnit);
    if (toUnit) newParams.set('to', toUnit);
    if (fromValue) newParams.set('value', fromValue);
    
    // Use location state to avoid full page reloads
    navigate(`/converter?${newParams.toString()}`, { replace: true });
    
    return () => {
      debouncedConversion.cancel();
    };
  }, [fromValue, fromUnit, toUnit, selectedCategory, debouncedConversion]);
  
  // Handle search for units
  const handleSearch = useCallback(debounce(async (query: string) => {
    if (query.length >= 2) {
      const results = searchUnits(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, 200), []);
  
  // Update search results when search input changes
  useEffect(() => {
    handleSearch(searchInput);
  }, [searchInput, handleSearch]);
  
  // Handle unit selection
  const handleUnitSelect = (unitId: string, type: 'from' | 'to') => {
    if (type === 'from') {
      setFromUnit(unitId);
    } else {
      setToUnit(unitId);
    }
  };
  
  // Handle swap units
  const handleSwapUnits = () => {
    if (!fromUnit || !toUnit) return;
    
    setIsSwapping(true);
    setSwapColor(prev => !prev);
    
    // Animate swap button
    if (swapButtonRef.current) {
      swapButtonRef.current.classList.add('animate-rotate-swap');
      setTimeout(() => {
        if (swapButtonRef.current) {
          swapButtonRef.current.classList.remove('animate-rotate-swap');
        }
        // Wait for animation
        setFromUnit(toUnit);
        setToUnit(fromUnit);
        setIsSwapping(false);
      }, 300);
    }
  };
  
  // Handle from value change
  const handleFromValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setFromValue(newValue);
    
    // Validate input
    if (newValue.trim() === '') {
      setValidationError(null);
      return;
    }
    
    const numValue = parseFloat(newValue);
    if (isNaN(numValue)) {
      setValidationError('Please enter a valid number');
    } else {
      setValidationError(null);
    }
  };
  
  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Reset unit selections when category changes
    setFromUnit('');
    setToUnit('');
    setFromUnitData(null);
    setToUnitData(null);
    setHasConverted(false);
  };
  
  // Determine if category is loading
  const isCategoryLoadingState = categoryLoading || (!categoryData && selectedCategory !== '');
  
  // Get current category data
  const currentCategory = useMemo(() => 
    unitCategories.find(cat => cat.id === selectedCategory),
    [selectedCategory]
  );
  
  // Get the symbol for a unit - memoized for performance
  const getUnitSymbol = useMemo(() => {
    return (unitId: string): string => {
      const unit = currentCategory?.units.find(u => u.id === unitId);
      return unit?.symbol || '';
    };
  }, [currentCategory]);
  
  // Check if the current conversion is in favorites
  const isFavorite = (): boolean => {
    try {
      const parsedValue = parseFloat(fromValue);
      return isInFavorites(`${selectedCategory}-${fromUnit}-${toUnit}-${parsedValue}`);
    } catch {
      return false;
    }
  };
  
  // Memoized formatted result using the new category-aware formatter
  const formattedResult = useMemo(() => {
    if (convertedValue === null) return '';
    return formatNumberByCategory(convertedValue, selectedCategory);
  }, [convertedValue, selectedCategory]);
  
  // Memoized unit symbols
  const fromUnitSymbol = useMemo(() => getUnitSymbol(fromUnit), [fromUnit, getUnitSymbol]);
  const toUnitSymbol = useMemo(() => getUnitSymbol(toUnit), [toUnit, getUnitSymbol]);
  
  // Check for related units to show relationship indicators
  const unitRelationship = useMemo(() => {
    if (fromUnit === toUnit) return 'equal';
    
    const fromUnitObj = currentCategory?.units.find(u => u.id === fromUnit);
    const toUnitObj = currentCategory?.units.find(u => u.id === toUnit);
    
    if (!fromUnitObj || !toUnitObj) return 'unknown';
    
    // Simple heuristics for relationships
    // In a real app, this would be part of the unit data model
    if (fromUnit === 'meter' && toUnit === 'foot' || fromUnit === 'foot' && toUnit === 'meter') {
      return 'imperial-metric';
    }
    
    if (fromUnitObj.name.includes('square') && toUnitObj.name.includes('square')) {
      return 'similar';
    }
    
    if (['kilometer', 'meter', 'centimeter', 'millimeter'].includes(fromUnit) &&
        ['kilometer', 'meter', 'centimeter', 'millimeter'].includes(toUnit)) {
      return 'decimal';
    }
    
    if (['foot', 'inch', 'yard', 'mile'].includes(fromUnit) &&
        ['foot', 'inch', 'yard', 'mile'].includes(toUnit)) {
      return 'imperial';
    }
    
    return 'standard';
  }, [currentCategory, fromUnit, toUnit]);
  
  // Get relationship label
  const getRelationshipLabel = () => {
    switch (unitRelationship) {
      case 'equal': return 'Same unit';
      case 'decimal': return 'Decimal relationship';
      case 'imperial': return 'Imperial units';
      case 'imperial-metric': return 'Imperial-Metric conversion';
      case 'similar': return 'Similar unit types';
      default: return null;
    }
  };
  
  // Add this function to handle toggling favorites
  const handleToggleFavorite = () => {
    if (!canSavePreset) return;
    
    try {
      const parsedValue = parseFloat(fromValue);
      if (fromUnit && toUnit && !isNaN(parsedValue) && convertedValue !== null) {
        const record = {
          id: `${selectedCategory}-${fromUnit}-${toUnit}-${parsedValue}`,
          fromValue: parsedValue,
          fromUnit,
          toUnit,
          toValue: convertedValue,
          category: selectedCategory,
          timestamp: Date.now(),
        };
        
        if (isInFavorites(record.id)) {
          removeFromFavorites(record.id);
          setToast({
            message: 'Removed from favorites',
            type: 'success'
          });
        } else {
          addToFavorites(record);
          setToast({
            message: 'Added to favorites',
            type: 'success'
          });
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setToast({
        message: 'Failed to update favorites',
        type: 'error'
      });
    }
  };
  
  // Add this function to handle applying presets
  const handleApplyPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setSelectedCategory(preset.category);
      setFromUnit(preset.fromUnit);
      setToUnit(preset.toUnit);
    }
  };
  
  // Add the handleSavePreset function
  const handleSavePreset = () => {
    if (presetName.trim() && fromUnit && toUnit) {
      addPreset({
        name: presetName.trim(),
        category: selectedCategory,
        fromUnit,
        toUnit,
      });
      setIsAddingPreset(false);
      setPresetName('');
      setToast({
        message: 'Preset saved!',
        type: 'success'
      });
      
      // Animate the FAB
      if (fabRef.current) {
        fabRef.current.classList.add('animate-pulse');
        setTimeout(() => {
          if (fabRef.current) {
            fabRef.current.classList.remove('animate-pulse');
          }
        }, 250);
      }
    }
  };
  
  return (
    <div className="pb-20 md:pb-0">
      {isLoading ? (
        <ConverterSkeleton />
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Unit Converter</h1>
            <p className="text-muted-foreground">Convert between different units of measurement</p>
          </div>
          
          {/* Category selector */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-3">Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {unitCategories.map(category => (
                <button
                  key={category.id}
                  className={`p-2 rounded-md ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  } ripple transition-transform active:scale-95 duration-150`} 
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Converter */}
          <div className="bg-card border border-border rounded-lg p-5 relative">
            {/* Success animation overlay */}
            <SuccessfulConversionAnimation isVisible={showSuccessAnimation} />
            
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Converter</h2>
              
              {/* Show relationship indicator when available */}
              {getRelationshipLabel() && (
                <div className="hidden sm:flex items-center px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                  {getRelationshipLabel()}
                </div>
              )}
              
              {/* Toolbar for desktop: side by side */}
              <div className="hidden sm:flex space-x-2">
                <button
                  ref={swapButtonRef}
                  onClick={handleSwapUnits}
                  role="button"
                  aria-pressed={isSwapping}
                  className={`p-2 rounded-md ${
                    swapColor ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                  } hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 ripple transition-all duration-200 active:scale-95`}
                  aria-label="Swap units"
                  disabled={isSwapping}
                >
                  <ArrowUpDown 
                    className={`w-5 h-5 transition-transform duration-200 ease-in-out ${
                      isSwapping ? 'rotate-180' : ''
                    }`} 
                    aria-hidden="true"
                  />
                </button>
                <button
                  ref={favoriteButtonRef}
                  onClick={() => {
                    if (!canSavePreset) return;
                    handleToggleFavorite();
                  }}
                  role="button"
                  aria-pressed={isFavorite()}
                  className={`p-2 rounded-md ${canSavePreset 
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' 
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                  } focus:outline-none focus:ring-2 focus:ring-primary/50 ripple transition-transform active:scale-95 duration-150`}
                  aria-label={isFavorite() ? "Remove from favorites" : "Add to favorites"}
                  disabled={!canSavePreset}
                >
                  <Star 
                    className={`w-5 h-5 ${isFavorite() ? "fill-amber-500 text-amber-500" : ""}`} 
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
            
            {/* Side-by-side on large screens, stacked on small */}
            <div className="space-y-6 sm:space-y-0 sm:flex sm:gap-6 sm:items-start">
              {/* From unit */}
              <div className="w-full sm:w-1/2 relative">
                <label htmlFor="fromValue" className="block text-sm font-medium text-foreground mb-1">
                  From
                </label>
                <div className="space-y-2 sm:space-y-2">
                  <div className="relative">
                    <input
                      id="fromValue"
                      ref={fromValueInputRef}
                      type="text"
                      inputMode="decimal"
                      value={fromValue}
                      onChange={handleFromValueChange}
                      className={`w-full bg-background text-foreground border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                        validationError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-input focus:ring-primary/50 focus:border-primary'
                      } transition-colors duration-200`}
                      placeholder="Enter value"
                      aria-invalid={validationError ? 'true' : 'false'}
                      aria-describedby={validationError ? 'fromValue-error' : undefined}
                      autoComplete="off"
                    />
                    
                    {/* Show inline result for small screens - with smart formatting */}
                    {!validationError && convertedValue !== null && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground transition-opacity duration-200">
                        = {formattedResult} {toUnitSymbol}
                      </div>
                    )}
                    
                    {/* Show calculating indicator */}
                    {isCalculating && !validationError && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    
                    {/* Toolbar for mobile: floating on the card */}
                    <div className="sm:hidden absolute -right-3 top-0 transform -translate-y-full flex flex-col gap-2 p-2">
                      <button
                        ref={swapButtonRef}
                        onClick={handleSwapUnits}
                        role="button"
                        aria-pressed={isSwapping}
                        className={`p-2 rounded-full shadow-sm ${
                          swapColor ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                        } hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 ripple transition-all duration-200 active:scale-95`}
                        aria-label="Swap units"
                        disabled={isSwapping}
                      >
                        <ArrowUpDown 
                          className={`w-4 h-4 transition-transform duration-200 ease-in-out ${
                            isSwapping ? 'rotate-180' : ''
                          }`} 
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        ref={favoriteButtonRef}
                        onClick={() => {
                          if (!canSavePreset) return;
                          handleToggleFavorite();
                        }}
                        role="button"
                        aria-pressed={isFavorite()}
                        className={`p-2 rounded-full shadow-sm ${canSavePreset 
                          ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' 
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                        } focus:outline-none focus:ring-2 focus:ring-primary/50 ripple transition-transform active:scale-95 duration-150`}
                        aria-label={isFavorite() ? "Remove from favorites" : "Add to favorites"}
                        disabled={!canSavePreset}
                      >
                        <Star 
                          className={`w-4 h-4 ${isFavorite() ? "fill-amber-500 text-amber-500" : ""}`} 
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                  
                  {validationError && (
                    <div id="fromValue-error" className="text-xs text-red-500 animate-fadeIn">
                      {validationError}
                    </div>
                  )}
                  
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="w-full bg-background text-foreground border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200"
                    aria-label="From unit"
                  >
                    {currentCategory?.units.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* To unit - only visible on large screens */}
              <div className="hidden sm:block w-full sm:w-1/2">
                <label htmlFor="toUnit" className="block text-sm font-medium text-foreground mb-1">
                  To
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <div className="w-full bg-muted text-foreground border border-input rounded-md px-3 py-2 flex items-center h-[38px] transition-colors duration-200">
                      <span className={convertedValue === null ? 'text-muted-foreground' : 'text-foreground transition-opacity duration-200'}>
                        {convertedValue === null ? 'Result' : formattedResult}
                      </span>
                      {isCalculating && (
                        <div className="ml-2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                  </div>
                  
                  <select
                    id="toUnit"
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="w-full bg-background text-foreground border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200"
                    aria-label="To unit"
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
            
            {/* Show relationship indicator for mobile */}
            {getRelationshipLabel() && (
              <div className="sm:hidden mt-3 flex items-center justify-center">
                <span className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                  {getRelationshipLabel()}
                </span>
              </div>
            )}
            
            {/* To unit selector only (small screens) */}
            <div className="block sm:hidden w-full mt-2">
              <select
                id="toUnitMobile"
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full bg-background text-foreground border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200"
                aria-label="To unit"
              >
                {currentCategory?.units.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Reserve space for errors, FAB and toasts to avoid layout shifts */}
            <div className="h-8"></div>
          </div>
          
          {/* Saved Presets */}
          {presets.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-5">
              <h2 className="text-lg font-semibold mb-3">Saved Presets</h2>
              <div className="space-y-2">
                {presets.map((preset) => {
                  const category = unitCategories.find(cat => cat.id === preset.category);
                  const fromUnitObj = category?.units.find(u => u.id === preset.fromUnit);
                  const toUnitObj = category?.units.find(u => u.id === preset.toUnit);
                  
                  return (
                    <button
                      key={preset.id}
                      className="w-full p-2 flex items-center justify-between bg-muted rounded-md hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ripple transition-transform active:scale-95 duration-150"
                      onClick={() => handleApplyPreset(preset.id)}
                    >
                      <span className="font-medium">{preset.name}</span>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>{fromUnitObj?.symbol || preset.fromUnit}</span>
                        <MoveRight className="mx-1 w-3 h-3" />
                        <span>{toUnitObj?.symbol || preset.toUnit}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Floating Action Button */}
      {showFAB && (
        <button
          ref={fabRef}
          onClick={() => setIsAddingPreset(true)}
          className="fixed bottom-24 md:bottom-6 right-6 bg-primary text-primary-foreground w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 ripple animate-fadeIn duration-150"
          aria-label="Save preset"
          disabled={!canSavePreset || isCalculating}
        >
          {isCalculating ? (
            <div className="w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-6 h-6" />
          )}
        </button>
      )}
      
      {/* Add preset modal */}
      {isAddingPreset && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-card border border-border rounded-lg p-5 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-3">Save Preset</h2>
            <p className="text-sm text-muted-foreground mb-4">Save this conversion for quick access later</p>
            
            <div className="mb-4">
              <label htmlFor="presetName" className="block text-sm font-medium text-foreground mb-1">
                Preset Name
              </label>
              <input
                id="presetName"
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g., Meters to Feet"
                className="w-full bg-background text-foreground border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoComplete="off"
              />
            </div>
            
            <div className="text-sm mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">Category:</span> 
                <span>{currentCategory?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Conversion:</span>
                <span>{fromUnitSymbol} → {toUnitSymbol}</span>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsAddingPreset(false)}
                className="px-3 py-1.5 border border-border rounded-md bg-muted text-foreground hover:bg-muted/80 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 ripple duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className={`px-3 py-1.5 rounded-md ${
                  presetName.trim() 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                } transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 ripple duration-150`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Converter; 