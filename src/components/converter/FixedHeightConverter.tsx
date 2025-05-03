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
import { Ruler, Clipboard, BookmarkPlus, BookmarkCheck, ArrowUpDown } from 'lucide-react';
import { ensureValidTargetUnits } from './utils';
import { 
  trackConversion, 
  trackFavoriteAdded, 
  trackFavoriteRemoved, 
  trackReferencePointUsed, 
  trackCopyResult, 
  trackSwapUnits 
} from '../../lib/analytics';

const HEIGHT_REFERENCE_POINTS = [
  { name: 'Average adult male (US)', value: "5'9\"", metric: '175 cm' },
  { name: 'Average adult female (US)', value: "5'4\"", metric: '163 cm' },
  { name: 'Basketball hoop', value: "10'0\"", metric: '305 cm' },
  { name: 'Standard door height', value: "6'8\"", metric: '203 cm' },
];

interface HeightConverterProps {
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const FixedHeightConverter: React.FC<HeightConverterProps> = ({ onShowToast }) => {
  // Get user preferences
  const { userPreferences, getPreferredCompoundFormat } = useUser();
  const { addToHistory } = useHistory();
  const { addToFavorites, isInFavorites, removeFromFavorites } = useFavorites();
  
  // Get format preferences for height
  const heightFormat = getPreferredCompoundFormat(CompoundFormatType.HEIGHT);
  
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
    
    return `height-${fromUnits}-${toUnits}`;
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
      
      // Ensure we have valid target units
      const targetUnitIds = ensureValidTargetUnits(
        CompoundFormatType.HEIGHT,
        heightFormat.toFormat
      );
      
      if (!targetUnitIds || targetUnitIds.length === 0) {
        throw new Error('Unable to determine target units for conversion');
      }
      
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
      
      // Add to history - use the primary units for standard history tracking
      if (result.converted.components.length > 0) {
        const fromUnit = fromMeasurement.components[0]?.unitId || '';
        const toUnit = result.converted.components[0]?.unitId || '';
        const fromValue = fromMeasurement.components[0]?.value || 0;
        const toValue = result.converted.components[0]?.value || 0;
        const category = fromMeasurement.categoryId;
        
        addToHistory({
          fromValue,
          fromUnit,
          toUnit,
          toValue,
          category
        });
        
        // Track the conversion in PostHog
        trackConversion(
          category,
          fromUnit,
          toUnit,
          fromValue,
          toValue
        );
      }
      
    } catch (error) {
      console.error('Conversion error:', error);
      setError(error instanceof Error ? error.message : 'Unknown conversion error');
    } finally {
      setIsConverting(false);
    }
  }, [fromMeasurement, heightFormat.toFormat, addToHistory]);
  
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
    
    const fromUnit = fromMeasurement.components[0]?.unitId || '';
    const toUnit = conversionResult.converted.components[0]?.unitId || '';
    const category = fromMeasurement.categoryId;
    
    if (isFavorite()) {
      removeFromFavorites(conversionId);
      onShowToast?.('Removed from favorites', 'success');
      
      // Track the favorite removal in PostHog
      trackFavoriteRemoved(category, fromUnit, toUnit);
    } else {
      // Use standard favorite format with the primary units
      const fromValue = fromMeasurement.components[0]?.value || 0;
      const toValue = conversionResult.converted.components[0]?.value || 0;
      
      addToFavorites({
        id: conversionId,
        fromValue,
        fromUnit,
        toUnit,
        toValue,
        category,
        timestamp: Date.now()
      });
      onShowToast?.('Added to favorites', 'success');
      
      // Track the favorite addition in PostHog
      trackFavoriteAdded(category, fromUnit, toUnit);
    }
  }, [conversionResult, fromMeasurement, getConversionId, isFavorite, removeFromFavorites, addToFavorites, onShowToast]);
  
  // Handle swap units
  const handleSwapUnits = useCallback(() => {
    // Swap from/to formats in the UI
    // Note: This doesn't change user preferences, just this instance
    if (!toMeasurement) return;
    
    // Set the "to" measurement as the new "from" measurement
    setFromMeasurement(toMeasurement);
    
    onShowToast?.('Swapped units', 'info');
    
    // Track the swap units action in PostHog
    if (fromMeasurement && toMeasurement) {
      const fromUnit = fromMeasurement.components[0]?.unitId || '';
      const toUnit = toMeasurement.components[0]?.unitId || '';
      const category = fromMeasurement.categoryId;
      
      trackSwapUnits(category, fromUnit, toUnit);
    }
  }, [toMeasurement, onShowToast, fromMeasurement]);
  
  // Format for display
  const getFormattedHeight = useCallback((measurement: CompoundMeasurement | null): string => {
    if (!measurement) return '';
    
    // Custom formatting for height
    if (measurement.components[0]?.unitId === 'foot' && measurement.components.length > 1) {
      const feet = Math.floor(measurement.components[0].value);
      const inches = measurement.components[1]?.value || 0;
      return `${feet}' ${inches}"`;
    }
    
    if (measurement.components[0]?.unitId === 'meter' && measurement.components.length > 1) {
      const meters = Math.floor(measurement.components[0].value * 100) / 100; // Limit to 2 decimal places
      const cm = Math.round(measurement.components[1]?.value || 0); // Round centimeters
      if (meters < 1) {
        // If less than 1 meter, just show cm
        const totalCm = Math.round(meters * 100 + cm);
        return `${totalCm} cm`;
      }
      return `${meters} m ${cm} cm`;
    }
    
    // Generic formatting with 2 decimal precision
    return measurement.components.map(comp => {
      const roundedValue = Math.round(comp.value * 100) / 100; // Limit to 2 decimal places
      return `${roundedValue} ${comp.unit?.symbol || comp.unitId}`;
    }).join(' ');
  }, []);
  
  // Handle copy to clipboard
  const handleCopyToClipboard = useCallback(() => {
    if (!toMeasurement) return;
    
    // Format the result for the clipboard
    const formattedResult = toMeasurement.components.map(comp => 
      `${comp.value} ${comp.unitId}`
    ).join(' ');
    
    navigator.clipboard.writeText(formattedResult)
      .then(() => {
        onShowToast?.('Copied to clipboard', 'success');
        
        // Track the copy action in PostHog
        if (fromMeasurement) {
          trackCopyResult(fromMeasurement.categoryId);
        }
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        onShowToast?.('Failed to copy to clipboard', 'error');
      });
  }, [toMeasurement, onShowToast, fromMeasurement]);
  
  // Handle applying a reference point
  const handleApplyReference = useCallback(async (reference: { value: string; metric: string; name: string }) => {
    try {
      // Parse the reference value into a measurement
      const parsed = await parseCompoundInput(
        reference.value,
        CompoundFormatType.HEIGHT
      );
      
      if (parsed) {
        setFromMeasurement(parsed);
        
        // Track the reference point usage in PostHog
        trackReferencePointUsed(UnitCategoryId.LENGTH, reference.name);
      }
    } catch (error) {
      console.error('Error applying reference:', error);
      setError(error instanceof Error ? error.message : 'Unknown error applying reference');
    }
  }, []);
  
  // Determine if we're using imperial or metric
  const isMetric = heightFormat.fromFormat && heightFormat.fromFormat[0] === 'meter';
  
  // Get valid unitIds to use for the input
  const inputUnitIds = heightFormat.fromFormat && heightFormat.fromFormat.length > 0
    ? heightFormat.fromFormat
    : ['foot', 'inch'];
  
  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Ruler className="w-5 h-5 mr-2 text-primary" />
          <h2 className="text-lg font-medium">Height Converter</h2>
        </div>
        
        <div className="flex space-x-2">
          {toMeasurement && (
            <>
              <button
                className="p-2 text-muted-foreground rounded-md hover:bg-muted hover:text-foreground transition-colors"
                onClick={handleCopyToClipboard}
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
              formatType={CompoundFormatType.HEIGHT}
              value={fromMeasurement}
              onChange={handleInputChange}
              unitIds={inputUnitIds}
              categoryId={UnitCategoryId.LENGTH}
              placeholder={isMetric ? "Enter height (e.g. 1.75m)" : "Enter height (e.g. 5'10\")"}
              label="Height"
              autoFocus
            />
          </div>
          
          {/* Common reference points */}
          <div className="mb-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Reference points:</h3>
            <div className="flex flex-wrap gap-2">
              {HEIGHT_REFERENCE_POINTS.map((reference, index) => (
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
              <div className="text-sm text-muted-foreground mb-1">Converted height:</div>
              <div className="text-2xl font-semibold text-primary">
                {getFormattedHeight(toMeasurement)}
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

export default FixedHeightConverter;
