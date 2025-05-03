import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useHistory } from '../../contexts/HistoryContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import {
  CompoundFormatType,
  CompoundMeasurement,
  CompoundConversionResult,
} from '../../lib/compound-unit-types';
import { UnitCategoryId } from '../../lib/unit-types';
import { convertCompound, parseCompoundInput } from '../../lib/compound-conversion-engine';
import CompoundUnitInput from './CompoundUnitInput';
import { Utensils, Clipboard, BookmarkPlus, BookmarkCheck, ArrowUpDown } from 'lucide-react';
import { ensureValidTargetUnits } from './utils';

const COOKING_REFERENCE_POINTS = [
  { name: 'Cup of flour', value: "1 cup", metric: '240 ml' },
  { name: 'Tablespoon', value: "1 tbsp", metric: '15 ml' },
  { name: 'Teaspoon', value: "1 tsp", metric: '5 ml' },
  { name: 'Stick of butter', value: "1/2 cup", metric: '120 ml' },
];

interface CookingConverterProps {
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const CookingConverter: React.FC<CookingConverterProps> = ({ onShowToast }) => {
  // Get user preferences
  const { userPreferences, getPreferredCompoundFormat } = useUser();
  const { addToHistory } = useHistory();
  const { addToFavorites, isInFavorites, removeFromFavorites } = useFavorites();
  
  // Get format preferences for cooking
  const cookingFormat = getPreferredCompoundFormat(CompoundFormatType.COOKING);
  
  // State for input/output values
  const [fromMeasurement, setFromMeasurement] = useState<CompoundMeasurement | null>(null);
  const [toMeasurement, setToMeasurement] = useState<CompoundMeasurement | null>(null);
  const [conversionResult, setConversionResult] = useState<CompoundConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Keep track of whether a conversion is already in progress
  const [isInitialRender, setIsInitialRender] = useState(true);
  const previousFromMeasurementRef = useRef<string>('');
  
  // Generate a unique ID for this conversion to use with favorites
  const getConversionId = useCallback(() => {
    if (!fromMeasurement || !toMeasurement) return '';
    
    const fromUnits = fromMeasurement.components.map(c => c.unitId).join('-');
    const toUnits = toMeasurement.components.map(c => c.unitId).join('-');
    
    return `cooking-${fromUnits}-${toUnits}`;
  }, [fromMeasurement, toMeasurement]);
  
  // Check if current conversion is in favorites
  const isFavorite = useCallback(() => {
    const id = getConversionId();
    return id ? isInFavorites(id) : false;
  }, [getConversionId, isInFavorites]);
  
  // Convert when input changes
  const performConversion = useCallback(async () => {
    if (!fromMeasurement) {
      setToMeasurement(null);
      setConversionResult(null);
      return;
    }
    
    // Create a serialized version of the measurement to compare with previous
    const measurementKey = JSON.stringify(fromMeasurement.components.map(c => ({
      value: c.value,
      unitId: c.unitId
    })));
    
    // Skip if the measurement hasn't actually changed
    if (measurementKey === previousFromMeasurementRef.current) {
      return;
    }
    
    // Update the reference for next time
    previousFromMeasurementRef.current = measurementKey;
    
    try {
      setIsConverting(true);
      setError(null);
      
      // Get the target unit IDs from preferences
      const targetUnitIds = ensureValidTargetUnits(
        CompoundFormatType.COOKING,
        cookingFormat.toFormat
      );
      
      // Perform the conversion
      const result = await convertCompound(
        fromMeasurement,
        targetUnitIds,
        { 
          precision: 2, 
          format: true 
        }
      );
      
      setToMeasurement(result.converted);
      setConversionResult(result);
      
      // Add to history
      const conversionId = getConversionId();
      if (conversionId) {
        addToHistory({
          fromValue: fromMeasurement.components[0]?.value || 0,
          fromUnit: fromMeasurement.components[0]?.unitId || '',
          toUnit: result.converted.components[0]?.unitId || '',
          toValue: result.converted.components[0]?.value || 0,
          category: fromMeasurement.categoryId
        });
      }
      
    } catch (error) {
      console.error('Conversion error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsConverting(false);
    }
  }, [fromMeasurement, cookingFormat.toFormat, addToHistory, getConversionId]);
  
  // Mark initial render as completed after first mount
  useEffect(() => {
    setIsInitialRender(false);
  }, []);
  
  // Perform conversion when input changes
  useEffect(() => {
    // Skip the conversion on the initial render to avoid double-conversions
    if (isInitialRender) return;
    
    if (fromMeasurement) {
      performConversion();
    }
  }, [fromMeasurement, performConversion, isInitialRender]);
  
  // Handle input change
  const handleInputChange = useCallback((measurement: CompoundMeasurement | null) => {
    // Set a new measurement only if it's different
    if (measurement) {
      const measurementKey = JSON.stringify(measurement.components.map(c => ({
        value: c.value,
        unitId: c.unitId
      })));
      
      if (measurementKey !== previousFromMeasurementRef.current) {
        setFromMeasurement(measurement);
      }
    } else {
      setFromMeasurement(null);
    }
  }, []);
  
  // Handle toggle favorite
  const handleToggleFavorite = useCallback(() => {
    if (!conversionResult || !fromMeasurement) return;
    
    const conversionId = getConversionId();
    if (!conversionId) return;
    
    if (isFavorite()) {
      removeFromFavorites(conversionId);
      onShowToast?.('Removed from favorites', 'success');
    } else {
      addToFavorites({
        id: conversionId,
        fromValue: fromMeasurement.components[0]?.value || 0,
        fromUnit: fromMeasurement.components[0]?.unitId || '',
        toUnit: conversionResult.converted.components[0]?.unitId || '',
        toValue: conversionResult.converted.components[0]?.value || 0,
        category: fromMeasurement.categoryId,
        timestamp: Date.now()
      });
      onShowToast?.('Added to favorites', 'success');
    }
  }, [conversionResult, fromMeasurement, getConversionId, isFavorite, removeFromFavorites, addToFavorites, onShowToast]);
  
  // Handle swap units
  const handleSwapUnits = useCallback(() => {
    if (!toMeasurement) return;
    
    // Set the "to" measurement as the new "from" measurement
    setFromMeasurement(toMeasurement);
    
    onShowToast?.('Swapped units', 'info');
  }, [toMeasurement, onShowToast]);
  
  // Format for display
  const getFormattedMeasurement = useCallback((measurement: CompoundMeasurement | null): string => {
    if (!measurement) return '';
    
    // Format based on unit types
    return measurement.components.map(comp => {
      // Round to 2 decimal places
      const roundedValue = Math.round(comp.value * 100) / 100;
      return `${roundedValue} ${comp.unit?.symbol || comp.unitId}`;
    }).join(' + ');
  }, []);
  
  // Copy result to clipboard
  const handleCopyResult = useCallback(() => {
    if (!toMeasurement) return;
    
    const formattedMeasurement = getFormattedMeasurement(toMeasurement);
    navigator.clipboard.writeText(formattedMeasurement);
    
    onShowToast?.('Copied to clipboard', 'success');
  }, [toMeasurement, getFormattedMeasurement, onShowToast]);
  
  // Apply a reference point
  const handleApplyReference = (reference: { value: string; metric: string }) => {
    // Apply the reference based on current unit preference
    const isMetric = userPreferences.regionalPresets.metric;
    const valueToApply = isMetric ? reference.metric : reference.value;
    
    // Parse the reference value and set it as input
    parseCompoundInput(valueToApply, CompoundFormatType.COOKING)
      .then(measurement => {
        if (measurement) {
          setFromMeasurement(measurement);
        }
      })
      .catch(err => {
        console.error('Error parsing reference value:', err);
        setError('Failed to apply reference measurement');
      });
  };
  
  // Determine if we're using imperial or metric
  const isMetric = cookingFormat.fromFormat[0] === 'milliliter' || cookingFormat.fromFormat[0] === 'liter';
  
  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Utensils className="w-5 h-5 mr-2 text-primary" />
          <h2 className="text-lg font-medium">Cooking Converter</h2>
        </div>
        
        <div className="flex space-x-2">
          {toMeasurement && (
            <>
              <button
                className="p-2 text-muted-foreground rounded-md hover:bg-muted hover:text-foreground transition-colors"
                onClick={handleCopyResult}
                title="Copy result"
              >
                <Clipboard className="w-4 h-4" />
              </button>
              
              <button
                className="p-2 text-muted-foreground rounded-md hover:bg-muted hover:text-foreground transition-colors"
                onClick={handleToggleFavorite}
                title={isFavorite() ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavorite() ? (
                  <BookmarkCheck className="w-4 h-4 text-primary" />
                ) : (
                  <BookmarkPlus className="w-4 h-4" />
                )}
              </button>
              
              <button
                className="p-2 text-muted-foreground rounded-md hover:bg-muted hover:text-foreground transition-colors"
                onClick={handleSwapUnits}
                title="Swap units"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Input section */}
        <div>
          <div className="mb-4">
            <CompoundUnitInput
              formatType={CompoundFormatType.COOKING}
              value={fromMeasurement}
              onChange={handleInputChange}
              unitIds={cookingFormat.fromFormat}
              categoryId={UnitCategoryId.VOLUME}
              placeholder={isMetric ? "Enter volume (e.g. 240 ml)" : "Enter volume (e.g. 1 cup)"}
              label="Ingredient Measurement"
              autoFocus
            />
          </div>
          
          {/* Common reference points */}
          <div className="mb-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Common ingredients:</h3>
            <div className="flex flex-wrap gap-2">
              {COOKING_REFERENCE_POINTS.map((reference, index) => (
                <button
                  key={index}
                  className="px-3 py-1 bg-muted text-xs rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={() => handleApplyReference(reference)}
                >
                  {reference.name}: {isMetric ? reference.metric : reference.value}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Result section */}
        {isConverting ? (
          <div className="animate-pulse flex space-x-4 p-4 bg-muted/50 rounded-md">
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ) : toMeasurement ? (
          <div className="space-y-3">
            <div className="p-4 bg-primary/10 rounded-md">
              <div className="text-sm text-muted-foreground mb-1">Converted measurement:</div>
              <div className="text-2xl font-semibold text-primary">
                {getFormattedMeasurement(toMeasurement)}
              </div>
              
              {/* Equivalents */}
              {conversionResult?.singleUnitEquivalent && (
                <div className="mt-3 text-sm text-muted-foreground">
                  Equivalent to{' '}
                  <span className="font-medium">
                    {conversionResult.singleUnitEquivalent.formattedValue}{' '}
                    {conversionResult.singleUnitEquivalent.toUnit.symbol}
                  </span>
                </div>
              )}
            </div>
            
            {/* Recipe scaling information */}
            <div className="p-4 bg-muted/50 rounded-md">
              <h3 className="text-sm font-medium mb-2">Recipe scaling</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Half recipe:</div>
                  <div className="font-medium">
                    {(toMeasurement.components[0]?.value || 0) / 2} {toMeasurement.components[0]?.unit?.symbol || ''}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Double recipe:</div>
                  <div className="font-medium">
                    {(toMeasurement.components[0]?.value || 0) * 2} {toMeasurement.components[0]?.unit?.symbol || ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CookingConverter; 