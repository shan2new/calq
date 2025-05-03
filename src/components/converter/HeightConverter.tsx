import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useHistory, ConversionRecord } from '../../contexts/HistoryContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import {
  CompoundFormatType,
  CompoundMeasurement,
  CompoundConversionResult,
} from '../../lib/compound-unit-types';
import { UnitCategoryId } from '../../lib/unit-types';
import { convertCompound, formatCompoundMeasurement } from '../../lib/compound-conversion-engine';
import CompoundUnitInput from './CompoundUnitInput';
import { Ruler, Clipboard, BookmarkPlus, BookmarkCheck, ArrowUpDown } from 'lucide-react';

const HEIGHT_REFERENCE_POINTS = [
  { name: 'Average adult male (US)', value: "5'9\"", metric: '175 cm' },
  { name: 'Average adult female (US)', value: "5'4\"", metric: '163 cm' },
  { name: 'Basketball hoop', value: "10'0\"", metric: '305 cm' },
  { name: 'Standard door height', value: "6'8\"", metric: '203 cm' },
];

interface HeightConverterProps {
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const HeightConverter: React.FC<HeightConverterProps> = ({ onShowToast }) => {
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
    
    try {
      setIsConverting(true);
      setError(null);
      
      // Get the target unit IDs from preferences
      let targetUnitIds = heightFormat.toFormat;
      
      // Ensure we have valid target units - if not, use defaults
      if (!targetUnitIds || targetUnitIds.length === 0) {
        // Import directly to avoid circular dependency
        const { compoundFormats } = await import('../../lib/compound-unit-types');
        targetUnitIds = compoundFormats[CompoundFormatType.HEIGHT].defaultToFormat;
      }
      
      // Perform the conversion
      const result = await convertCompound(
        fromMeasurement,
        targetUnitIds,
        { precision: 2, format: true }
      );
      
      setToMeasurement(result.converted);
      setConversionResult(result);
      
      // Add to history - use the primary units for standard history tracking
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
  }, [fromMeasurement, heightFormat.toFormat, addToHistory, getConversionId]);
  
  // Perform conversion when input changes
  useEffect(() => {
    if (fromMeasurement) {
      performConversion();
    }
  }, [fromMeasurement, performConversion]);
  
  // Handle input change
  const handleInputChange = useCallback((measurement: CompoundMeasurement | null) => {
    setFromMeasurement(measurement);
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
      // Use standard favorite format with the primary units
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
    // Swap from/to formats in the UI
    // Note: This doesn't change user preferences, just this instance
    if (!toMeasurement) return;
    
    // Set the "to" measurement as the new "from" measurement
    setFromMeasurement(toMeasurement);
    
    onShowToast?.('Swapped units', 'info');
  }, [toMeasurement, onShowToast]);
  
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
      const meters = measurement.components[0].value;
      const cm = measurement.components[1]?.value || 0;
      if (meters < 1) {
        // If less than 1 meter, just show cm
        const totalCm = Math.round(meters * 100 + cm);
        return `${totalCm} cm`;
      }
      return `${meters} m ${cm} cm`;
    }
    
    // Generic formatting
    return measurement.components.map(comp => 
      `${comp.value} ${comp.unit?.symbol || comp.unitId}`
    ).join(' ');
  }, []);
  
  // Copy result to clipboard
  const handleCopyResult = useCallback(() => {
    if (!toMeasurement) return;
    
    const formattedHeight = getFormattedHeight(toMeasurement);
    navigator.clipboard.writeText(formattedHeight);
    
    onShowToast?.('Copied to clipboard', 'success');
  }, [toMeasurement, getFormattedHeight, onShowToast]);
  
  // Apply a reference point
  const handleApplyReference = (reference: { value: string; metric: string }) => {
    // Apply the reference based on current unit preference
    const isMetric = userPreferences.regionalPresets.metric;
    const valueToApply = isMetric ? reference.metric : reference.value;
    
    // Parse the reference value and set it as input
    import('../../lib/compound-conversion-engine').then(module => {
      module.parseCompoundInput(valueToApply, CompoundFormatType.HEIGHT)
        .then(measurement => {
          if (measurement) {
            setFromMeasurement(measurement);
          }
        });
    });
  };
  
  // Determine if we're using imperial or metric
  const isMetric = heightFormat.fromFormat[0] === 'meter';
  
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
              formatType={CompoundFormatType.HEIGHT}
              value={fromMeasurement}
              onChange={handleInputChange}
              unitIds={heightFormat.fromFormat}
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
            
            {/* Visual comparison (simplified) */}
            <div className="p-4 bg-muted/50 rounded-md">
              <h3 className="text-sm font-medium mb-2">Visual comparison</h3>
              <div className="flex items-end h-40 border-b border-border">
                {fromMeasurement && (
                  <div 
                    className="w-12 bg-primary/70 rounded-t-md mx-2 flex flex-col items-center justify-between"
                    style={{ 
                      height: `${Math.min(100, (conversionResult?.original.components[0]?.value || 0) * 50)}%` 
                    }}
                  >
                    <span className="text-xs bg-primary text-white px-1 rounded-sm rotate-90 whitespace-nowrap origin-bottom-left translate-y-3">
                      {getFormattedHeight(fromMeasurement)}
                    </span>
                  </div>
                )}
                {toMeasurement && (
                  <div 
                    className="w-12 bg-secondary/70 rounded-t-md mx-2 flex flex-col items-center justify-between"
                    style={{ 
                      height: `${Math.min(100, (conversionResult?.converted.components[0]?.value || 0) * 50)}%` 
                    }}
                  >
                    <span className="text-xs bg-secondary text-white px-1 rounded-sm rotate-90 whitespace-nowrap origin-bottom-left translate-y-3">
                      {getFormattedHeight(toMeasurement)}
                    </span>
                  </div>
                )}
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

export default HeightConverter; 