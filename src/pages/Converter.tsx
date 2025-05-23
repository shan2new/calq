import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useHistory } from '../contexts/HistoryContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { usePresets } from '../contexts/PresetsContext';
import { 
  X, 
  Search, 
  ChevronRight
} from 'lucide-react';
import { debounce } from 'lodash-es';
import { 
  trackConversion, 
  trackUnitChanged, 
  trackCategoryChanged, 
  trackFavoriteAdded, 
  trackFavoriteRemoved, 
  trackSwapUnits 
} from '../lib/analytics';

// Import new unit conversion system
import { UnitCategoryId, unitCategoryInfo, UnitCategory, Unit, ConversionOptions } from '../lib/unit-types';
import { loadUnitCategory, initializeEssentialCategories, preloadCategories, isCategoryLoaded } from '../lib/unit-loader';
import { convert as newConvert, getCompatibleUnits, getPopularUnits } from '../lib/conversion-engine';
import { searchUnits } from '../lib/unit-search';


import ExpressionInput from '../components/ExpressionInput';
import ConversionResult from '../components/ConversionResult';
import RelationshipIndicator from '../components/RelationshipIndicator';
import UnitSelector from '../components/UnitSelector';
import ConverterActions from '../components/ConverterActions';
import UnitInformation from '../components/UnitInformation';
import Toast, { ToastType } from '../components/Toast';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import CategorySelector from '../components/CategorySelector';

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

const Converter: React.FC<{
  initialCategory?: string;
  initialFromUnit?: string;
  initialToUnit?: string;
  initialValue?: number;
}> = ({
  initialCategory,
  initialFromUnit,
  initialToUnit,
  initialValue
}) => {
  // Use the navigate hook for deep-linking using history.replaceState
  const navigate = useNavigate();
  
  const [searchParams] = useSearchParams();
  const { addToHistory } = useHistory();
  const { addToFavorites, isInFavorites, removeFromFavorites } = useFavorites();
  const { addPreset } = usePresets();
  
  // Refs for input focus and conversion tracking
  const lastConversionRef = useRef<{
    fromValue: number;
    fromUnit: string;
    toUnit: string;
    category: string;
  } | null>(null);
  const swapButtonRef = useRef<HTMLButtonElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const isInitialLoadRef = useRef(true);
  const latestConversionRef = useRef<{
    fromValue: number;
    fromUnit: string;
    toUnit: string;
    toValue: number;
    category: string;
  } | null>(null);
  
  // Get category from URL or props
  const categoryParam = initialCategory || searchParams.get('category') || UnitCategoryId.LENGTH;
  
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [fromUnit, setFromUnit] = useState(initialFromUnit || '');
  const [toUnit, setToUnit] = useState(initialToUnit || '');
  const [fromValue, setFromValue] = useState<string>(initialValue?.toString() || '1');
  const [convertedValue, setConvertedValue] = useState<number | null>(null);
  const [formattedConvertedValue, setFormattedConvertedValue] = useState<string>('');
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [toastQueue, setToastQueue] = useState<{ message: string; type: ToastType }[]>([]);
  const [hasConverted, setHasConverted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  // New state variables for the enhanced system
  const [categoryData, setCategoryData] = useState<UnitCategory | null>(null);
  const [fromUnitData, setFromUnitData] = useState<Unit | null>(null);
  const [toUnitData, setToUnitData] = useState<Unit | null>(null);
  const [compatibleUnits, setCompatibleUnits] = useState<Unit[]>([]);
  const [popularUnits, setPopularUnits] = useState<Unit[]>([]);
  const [searchResults, setSearchResults] = useState<{ unitId: string; name: string; symbol: string; categoryId: string; }[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [conversionOptions] = useState<ConversionOptions>({
    precision: undefined,
    format: true,
  });
  
  // New state variables for enhanced UX
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [showFirstTimeTooltips, setShowFirstTimeTooltips] = useState(() => {
    const hasSeenTooltips = localStorage.getItem('calcq_seen_tooltips');
    return !hasSeenTooltips;
  });
  
  // Determine if preset can be saved
  const canSavePreset = hasConverted && convertedValue !== null && fromUnit !== '' && toUnit !== '';
  
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
        showToast('Failed to load unit data. Please try again.', 'error');
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
      
      // Check if there's a meaningful change from the last conversion
      const isNewConversion = 
        !lastConversionRef.current ||
        lastConversionRef.current.fromValue !== numValue ||
        lastConversionRef.current.fromUnit !== fromUnit ||
        lastConversionRef.current.toUnit !== toUnit ||
        lastConversionRef.current.category !== selectedCategory;
      
      // Show success animation on significant changes
      if (isNewConversion) {
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 1000);
        
        // Store the latest valid conversion in ref (don't add to history yet)
        if (!isInitialLoadRef.current && numValue !== 0) {
          latestConversionRef.current = {
            fromValue: numValue,
            fromUnit,
            toUnit,
            toValue: result.value,
            category: selectedCategory,
          };
        }
      }
      
      // Update last conversion ref
      lastConversionRef.current = {
        fromValue: numValue,
        fromUnit,
        toUnit,
        category: selectedCategory,
      };
      
    } catch (error) {
      console.error('Conversion failed:', error);
      setConvertedValue(null);
      setFormattedConvertedValue('');
    } finally {
      setIsCalculating(false);
    }
  }, [fromValue, fromUnit, toUnit, selectedCategory, categoryData, conversionOptions, isInitialLoadRef]);
  
  // Add to history when component unmounts if we have a valid conversion
  useEffect(() => {
    return () => {
      // When component unmounts, add the latest conversion to history if it exists
      if (latestConversionRef.current && !isInitialLoadRef.current) {
        addToHistory(latestConversionRef.current);
      }
    };
  }, [addToHistory]);
  
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
    navigate(`/?${newParams.toString()}`, { replace: true });
    
    // Reset initial load flag after first conversion attempt
    if (isInitialLoadRef.current && fromUnit && toUnit) {
      // Use setTimeout to ensure this happens after the initial conversion
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 500);
    }
    
    return () => {
      debouncedConversion.cancel();
    };
  }, [fromValue, fromUnit, toUnit, selectedCategory, debouncedConversion, navigate]);
  
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
      // Track the unit change
      trackUnitChanged(selectedCategory, unitId, toUnit);
    } else {
      setToUnit(unitId);
      // Track the unit change
      trackUnitChanged(selectedCategory, fromUnit, unitId);
    }
  };
  
  // Handle swap units
  const handleSwapUnits = () => {
    // Only swap if both units are set
    if (fromUnit && toUnit) {
      const tempUnit = fromUnit;
      const tempUnitData = fromUnitData;
      
      setFromUnit(toUnit);
      setFromUnitData(toUnitData);
      
      setToUnit(tempUnit);
      setToUnitData(tempUnitData);
      
      // Trigger conversion with the swapped units
      convertValues(fromValue, toUnit, tempUnit);
      
      // Show success animation
      if (swapButtonRef.current) {
        swapButtonRef.current.classList.add('animate-button-pulse');
        setTimeout(() => {
          if (swapButtonRef.current) {
            swapButtonRef.current.classList.remove('animate-button-pulse');
          }
        }, 500);
      }
      
      // Track swap units action
      trackSwapUnits(selectedCategory, fromUnit, toUnit);
    }
  };
  
  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    if (categoryId !== selectedCategory) {
      setSelectedCategory(categoryId);
      setShowCategorySelection(false);
      
      // Clear units when changing category
      setFromUnit('');
      setToUnit('');
      setFromUnitData(null);
      setToUnitData(null);
      setConvertedValue(null);
      setFormattedConvertedValue('');
      
      // Track category change
      trackCategoryChanged(categoryId);
    }
  };
  
  // Check if the current conversion is in favorites
  const isFavorite = (): boolean => {
    try {
      const parsedValue = parseFloat(fromValue);
      return isInFavorites(`${selectedCategory}-${fromUnit}-${toUnit}-${parsedValue}`);
    } catch {
      return false;
    }
  };
  
  // Handle toggle favorite
  const handleToggleFavorite = () => {
    if (!hasConverted || convertedValue === null || !fromUnit || !toUnit) {
      return;
    }
    
    // Create a unique ID for this conversion
    const conversionId = `${selectedCategory}-${fromUnit}-${toUnit}-${fromValue}`;
    
    if (isFavorite()) {
      // Remove from favorites
      removeFromFavorites(conversionId);
      showToast('Removed from favorites', 'success');
      
      // Track favorite removal
      trackFavoriteRemoved(selectedCategory, fromUnit, toUnit);
    } else {
      // Add to favorites
      const numericValue = parseFloat(fromValue);
      
      if (!isNaN(numericValue)) {
        addToFavorites({
          id: conversionId,
          fromUnit,
          fromValue: numericValue,
          toUnit,
          toValue: convertedValue,
          category: selectedCategory,
          timestamp: Date.now()
        });
        
        showToast('Added to favorites', 'success');
        
        // Track favorite addition
        trackFavoriteAdded(selectedCategory, fromUnit, toUnit);
      }
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
      showToast('Preset saved!', 'success');
      
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
  // Handler for input changes with the new expression input
  const handleInputChange = (value: string, parsedValue: number | null) => {
    setFromValue(value);
    
    if (parsedValue === null) {
      setConvertedValue(null);
    } else {
      // Conversion logic happens in the useEffect
    }
  };
  
  // Update the way toasts are handled
  const showToast = (message: string, type: ToastType = 'info') => {
    setToastQueue(prev => [...prev, { message, type }]);
  };
  
  const dismissToast = () => {
    setToastQueue(prev => prev.slice(1));
  };
  
  // Mark tooltips as seen
  useEffect(() => {
    if (showFirstTimeTooltips) {
      const timer = setTimeout(() => {
        setShowFirstTimeTooltips(false);
        localStorage.setItem('calcq_seen_tooltips', 'true');
      }, 10000); // Show tooltips for 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [showFirstTimeTooltips]);
  
  // Handle unit selection from search
  const handleUnitSearch = (unitId: string, categoryId: string) => {
    // First change the category if needed
    if (categoryId !== selectedCategory) {
      setSelectedCategory(categoryId);
      
      // Use loadUnitCategory to ensure the category data is loaded
      loadUnitCategory(categoryId)
        .then(data => {
          setCategoryData(data);
          
          // Then set the from unit
          setFromUnit(unitId);
          
          // Find the unit in the category data
          const fromUnitObj = findUnitInCategoryData(data, unitId);
          if (fromUnitObj) {
            setFromUnitData(fromUnitObj);
            
            // Get compatible units for this unit
            getCompatibleUnits(categoryId, unitId)
              .then(compatUnits => {
                setCompatibleUnits(compatUnits);
                
                // Set first compatible unit as the destination unit
                if (compatUnits.length > 0) {
                  setToUnit(compatUnits[0].id);
                  setToUnitData(compatUnits[0]);
                }
              });
          }
        })
        .catch(error => {
          console.error('Failed to load category data:', error);
          showToast('Failed to load category data', 'error');
        });
    } else {
      // If we're already in the correct category, just set the from unit
      setFromUnit(unitId);
      
      // Find the unit in the existing category data
      if (categoryData) {
        const fromUnitObj = findUnitInCategory(categoryData, unitId);
        if (fromUnitObj) {
          setFromUnitData(fromUnitObj);
          
          // Get compatible units
          getCompatibleUnits(categoryId, unitId)
            .then(compatUnits => {
              setCompatibleUnits(compatUnits);
              
              // Set first compatible unit as the destination unit
              if (compatUnits.length > 0) {
                setToUnit(compatUnits[0].id);
                setToUnitData(compatUnits[0]);
              }
            });
        }
      }
    }
    
    // Hide the category selection view
    setShowCategorySelection(false);
    
    // Show a toast notification
    showToast(`Selected ${unitId}`, 'success');
  };
  
  // Search for units when search input changes
  useEffect(() => {
    const performSearch = async () => {
      if (searchInput.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      
      try {
        // Use the unit search functionality
        const results = searchUnits(searchInput, 15);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching units:', error);
        setSearchResults([]);
      }
    };
    
    const delayTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(delayTimer);
  }, [searchInput]);
  
  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.global-search-container')) {
        setShowSearch(false);
      }
    };
    
    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearch]);
  
  // Helper function to find a unit in loaded category data (similar to findUnitInCategory)
  const findUnitInCategoryData = (category: UnitCategory, unitId: string): Unit | undefined => {
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
  
  // Function to perform the conversion
  const convertValues = async (
    value: string, 
    source: string, 
    target: string
  ) => {
    // Validate the value
    const numericValue = parseFloat(value);
    
    if (isNaN(numericValue)) {
      setConvertedValue(null);
      setFormattedConvertedValue('');
      return;
    }
    
    // Skip if no units are selected
    if (!source || !target) {
      return;
    }
    
    // Skip if nothing has changed from the last conversion
    if (
      lastConversionRef.current &&
      lastConversionRef.current.fromValue === numericValue &&
      lastConversionRef.current.fromUnit === source &&
      lastConversionRef.current.toUnit === target &&
      lastConversionRef.current.category === selectedCategory
    ) {
      return;
    }
    
    try {
      // Show calculating state
      setIsCalculating(true);
      
      // Perform the conversion
      const result = await newConvert(
        numericValue,
        selectedCategory,
        source,
        target,
        { format: true }
      );
      
      // Set result in state
      setConvertedValue(result.value);
      setFormattedConvertedValue(result.formattedValue);
      
      // Update last conversion ref
      lastConversionRef.current = {
        fromValue: numericValue,
        fromUnit: source,
        toUnit: target,
        category: selectedCategory
      };
      
      // Add to history
      addToHistory({
        fromValue: numericValue,
        fromUnit: source,
        toUnit: target,
        toValue: result.value,
        category: selectedCategory
      });
      
      // Update latest conversion ref
      latestConversionRef.current = {
        fromValue: numericValue,
        fromUnit: source,
        toUnit: target,
        toValue: result.value,
        category: selectedCategory
      };
      
      // Show success animation briefly
      setShowSuccessAnimation(true);
      setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 800);
      
      // Show that a conversion has been performed
      setHasConverted(true);
      
      // Track conversion in PostHog
      trackConversion(
        selectedCategory,
        source,
        target,
        numericValue,
        result.value
      );
      
    } catch (error) {
      console.error('Conversion error:', error);
      setConvertedValue(null);
      setFormattedConvertedValue('');
    } finally {
      setIsCalculating(false);
    }
  };
  
  return (
    <>
      {toastQueue.length > 0 && (
        <Toast
          message={toastQueue[0].message}
          type={toastQueue[0].type}
          onClose={dismissToast}
        />
      )}
      
      <div className="container mx-auto max-w-3xl">
        
        {isLoading ? (
          <ConverterSkeleton />
        ) : (
          <>
            {/* Global search box */}
            <div className="mb-4 relative global-search-container">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search all units (e.g., meters, pounds, celsius)..."
                className="w-full py-2 px-10 rounded-lg border border-border bg-card focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setShowSearch(true)}
              />
              {searchInput && (
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSearchInput('');
                    setSearchResults([]);
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              {/* Search results dropdown */}
              {showSearch && (
                <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-64 overflow-auto">
                  {searchInput.length > 0 ? (
                    searchResults.length > 0 ? (
                      <div className="p-2">
                        {searchResults.map((result) => (
                          <button
                            key={`${result.categoryId}-${result.unitId}`}
                            className="w-full text-left px-3 py-2 hover:bg-muted text-sm rounded-md flex justify-between items-center"
                            onClick={() => {
                              handleUnitSearch(result.unitId, result.categoryId);
                              setSearchInput('');
                              setSearchResults([]);
                              setShowSearch(false);
                            }}
                          >
                            <div>
                              <div className="font-medium">{result.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {unitCategoryInfo[result.categoryId as UnitCategoryId]?.name || result.categoryId}
                              </div>
                            </div>
                            <span className="text-muted-foreground">{result.symbol}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No units found matching "{searchInput}"
                      </div>
                    )
                  ) : (
                    <div className="p-2">
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-muted text-sm rounded-md"
                        onClick={() => {
                          setShowCategorySelection(true);
                          setShowSearch(false);
                        }}
                      >
                        Browse all categories
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Category selection */}
            <button
                className="w-full py-3 px-4 mb-4 bg-card border border-border rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors"
                aria-label="Select category"
                onClick={() => setShowCategorySelection(true)}
              >
                <div className="flex items-center gap-2">
                  {unitCategoryInfo[selectedCategory as UnitCategoryId]?.icon && (
                    <div className="p-2 rounded-full bg-primary/10">
                      <CategoryIcon 
                        iconName={unitCategoryInfo[selectedCategory as UnitCategoryId].icon} 
                        className="text-primary w-5 h-5"
                        size={20}
                      />
                    </div>
                  )}
                  <span className="text-lg font-medium">
                    {unitCategoryInfo[selectedCategory as UnitCategoryId]?.name || 'Select Category'}
                  </span>
                </div>
                <ChevronRight className="text-muted-foreground w-5 h-5" />
              </button>
            
            {/* Main conversion card */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex justify-between mb-6">
                <h2 className="text-lg font-medium">Convert</h2>
                
                {/* Conversion actions */}
                <ConverterActions
                  canSave={canSavePreset}
                  isFavorite={isFavorite()}
                  onSwap={handleSwapUnits}
                  onFavorite={handleToggleFavorite}
                  onSavePreset={() => setIsAddingPreset(true)}
                  swapButtonRef={swapButtonRef}
                  onCopy={() => {
                    if (convertedValue !== null && toUnitData) {
                      navigator.clipboard.writeText(
                        `${formattedConvertedValue} ${toUnitData.symbol}`
                      );
                      showToast('Copied to clipboard', 'success');
                    }
                  }}
                  onShare={() => {
                    // Implementation for share functionality
                    const url = window.location.href;
                    if (navigator.share) {
                      navigator.share({
                        title: 'Unit Conversion',
                        text: `${fromValue} ${fromUnitData?.symbol} = ${formattedConvertedValue} ${toUnitData?.symbol}`,
                        url
                      }).catch(err => console.error('Share failed:', err));
                    } else {
                      navigator.clipboard.writeText(url);
                      showToast('Link copied to clipboard', 'success');
                    }
                  }}
                />
              </div>
              
              <div className="space-y-4">
                {/* Main conversion section - reorganized layout */}
                <div>
                  {/* Value input */}
                  <div className="mb-4">
                    <ExpressionInput 
                      value={fromValue}
                      onChange={handleInputChange}
                      placeholder="Enter a value..."
                    />
                  </div>
                  
                  {/* Units row with arrow between */}
                  <div className="flex items-center gap-2">
                    {/* From unit */}
                    <div className="flex-1">
                      <UnitSelector
                        categoryId={selectedCategory}
                        units={categoryData?.units || []}
                        selectedUnitId={fromUnit}
                        onChange={(unitId) => handleUnitSelect(unitId, 'from')}
                        recentUnits={popularUnits}
                        loading={categoryLoading}
                      />
                    </div>
                    
                    {/* Arrow icon */}
                    <div className="flex-shrink-0 flex items-center justify-center text-muted-foreground">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                    
                    {/* To unit */}
                    <div className="flex-1">
                      <UnitSelector
                        categoryId={selectedCategory}
                        units={compatibleUnits}
                        selectedUnitId={toUnit}
                        onChange={(unitId) => handleUnitSelect(unitId, 'to')}
                        recentUnits={popularUnits}
                        loading={categoryLoading}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Conversion result */}
                <div className="py-2">
                  {fromUnitData && toUnitData && (
                    <ConversionResult
                      fromValue={parseFloat(fromValue) || 0}
                      fromUnit={fromUnitData}
                      toValue={convertedValue}
                      toUnit={toUnitData}
                      categoryId={selectedCategory}
                    />
                  )}
                </div>
                
                {/* Relationship indicator */}
                {fromUnitData && toUnitData && convertedValue !== null && (
                  <div className="mt-6">
                    <RelationshipIndicator
                      fromUnit={fromUnitData}
                      toUnit={toUnitData}
                      conversionFactor={convertedValue / (parseFloat(fromValue) || 1)}
                    />
                  </div>
                )}
                
              </div>
            </div>
            
            {/* Success animation */}
            <SuccessfulConversionAnimation isVisible={showSuccessAnimation} />
            
            {/* Add preset modal */}
            {isAddingPreset && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-overlay">
                <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md modal-content">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold">Save Preset</h3>
                    <button
                      onClick={() => setIsAddingPreset(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-4">
                      <label className="block text-sm text-muted-foreground mb-1">
                        Preset Name
                      </label>
                      <input
                        type="text"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        placeholder="Enter a name for this preset"
                        className="w-full p-2 bg-muted border-0 rounded-md"
                      />
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-4">
                      This will save the current conversion for quick access.
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <button
                        className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                        onClick={() => setIsAddingPreset(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
                        onClick={handleSavePreset}
                        disabled={!presetName.trim()}
                      >
                        Save Preset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Category selection modal */}
            {showCategorySelection && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-overlay">
                <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-3xl modal-content">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold">Select Category</h3>
                    <button
                      onClick={() => setShowCategorySelection(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <CategorySelector
                      selectedCategory={selectedCategory}
                      availableCategories={Object.values(UnitCategoryId)}
                      onSelect={(categoryId) => {
                        handleCategoryChange(categoryId);
                        setShowCategorySelection(false);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Converter; 