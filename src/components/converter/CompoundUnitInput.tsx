import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CompoundFormatType, 
  compoundFormats,
  CompoundMeasurement,
  MeasurementComponent
} from '../../lib/compound-unit-types';
import { UnitCategoryId } from '../../lib/unit-types';
import { createCompoundMeasurement, parseCompoundInput } from '../../lib/compound-conversion-engine';
import { loadUnitCategory } from '../../lib/unit-loader';
import { ensureValidTargetUnits } from './utils';

interface CompoundUnitInputProps {
  formatType: CompoundFormatType;
  value?: CompoundMeasurement | null;
  onChange: (measurement: CompoundMeasurement | null, rawInput?: string) => void;
  unitIds: string[];
  categoryId: UnitCategoryId;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  label?: string;
}

const CompoundUnitInput: React.FC<CompoundUnitInputProps> = ({
  formatType,
  value,
  onChange,
  unitIds: propUnitIds,
  categoryId,
  placeholder = 'Enter value',
  className = '',
  disabled = false,
  autoFocus = false,
  label
}) => {
  // Ensure we have valid unit IDs - if not, use defaults from the format
  const unitIds = propUnitIds && propUnitIds.length > 0 
    ? propUnitIds 
    : compoundFormats[formatType].defaultFromFormat;
  
  // State for the raw text input
  const [rawInput, setRawInput] = useState<string>('');
  
  // State for individual component inputs
  const [componentValues, setComponentValues] = useState<number[]>(
    unitIds.map(() => 0)
  );
  
  // State for input mode (text vs. component inputs)
  const [inputMode, setInputMode] = useState<'text' | 'components'>('components');
  
  // State for unit data (to display symbols)
  const [unitSymbols, setUnitSymbols] = useState<string[]>(unitIds.map(() => ''));
  
  // Previous value reference to prevent infinite loops
  const previousValueRef = useRef<string>('');
  
  // Load unit data for symbols
  useEffect(() => {
    const loadUnitSymbols = async () => {
      try {
        const category = await loadUnitCategory(categoryId);
        
        // Helper function to find a unit in the category
        const findUnit = (id: string) => {
          // Check direct units
          if (category.units) {
            const unit = category.units.find(u => u.id === id);
            if (unit) return unit;
          }
          
          // Check subcategories
          if (category.subcategories) {
            for (const sub of category.subcategories) {
              const unit = sub.units.find(u => u.id === id);
              if (unit) return unit;
            }
          }
          
          return null;
        };
        
        // Get symbols for each unit
        const symbols = unitIds.map(id => {
          const unit = findUnit(id);
          return unit ? unit.symbol : id;
        });
        
        setUnitSymbols(symbols);
      } catch (error) {
        console.error('Failed to load unit symbols:', error);
      }
    };
    
    loadUnitSymbols();
  }, [categoryId, unitIds]);
  
  // Update component values when value prop changes
  useEffect(() => {
    if (value) {
      // Map each value.component to the corresponding index in unitIds
      const newComponentValues = unitIds.map(unitId => {
        const component = value.components.find(c => c.unitId === unitId);
        return component ? component.value : 0;
      });
      
      setComponentValues(newComponentValues);
      
      // Also update text input based on the new value
      setRawInput(formatMeasurementToText(value));
    } else {
      // Reset to defaults if no value provided
      setComponentValues(unitIds.map(() => 0));
      setRawInput('');
    }
  }, [value, unitIds]);
  
  // Helper to format a measurement as text
  const formatMeasurementToText = (measurement: CompoundMeasurement): string => {
    if (!measurement.components.length) return '';
    
    const formatConfig = compoundFormats[formatType];
    let result = '';
    
    // Special handling for height format
    if (formatType === CompoundFormatType.HEIGHT) {
      // Feet and inches
      if (measurement.components[0]?.unitId === 'foot' && measurement.components.length > 1) {
        const feet = Math.floor(measurement.components[0].value);
        const inches = measurement.components[1]?.value || 0;
        return `${feet}'${inches}"`;
      }
      
      // Meters and centimeters
      if (measurement.components[0]?.unitId === 'meter' && measurement.components.length > 1) {
        const meters = measurement.components[0].value;
        const cm = measurement.components[1]?.value || 0;
        return `${meters}m ${cm}cm`;
      }
    }
    
    // Generic format for other types
    return measurement.components.map((comp, i) => {
      return `${comp.value} ${unitSymbols[i] || comp.unitId}`;
    }).join(' ');
  };
  
  // Handle raw text input changes
  const handleRawInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputText = e.target.value;
    
    // Skip if the text hasn't actually changed
    if (inputText === rawInput) {
      return;
    }
    
    setRawInput(inputText);
    
    if (!inputText.trim()) {
      onChange(null, '');
      return;
    }
    
    try {
      // Try to parse the input
      const parsedMeasurement = await parseCompoundInput(inputText, formatType);
      if (parsedMeasurement) {
        // Check if the measurement is different from the previous one
        const measurementKey = JSON.stringify(parsedMeasurement.components.map(c => ({
          value: c.value,
          unitId: c.unitId
        })));
        
        if (measurementKey !== previousValueRef.current) {
          previousValueRef.current = measurementKey;
          onChange(parsedMeasurement, inputText);
          
          // Update component values for consistent UI
          const newValues = unitIds.map(unitId => {
            const component = parsedMeasurement.components.find(c => c.unitId === unitId);
            return component ? component.value : 0;
          });
          setComponentValues(newValues);
        }
      } else {
        onChange(null, inputText);
      }
    } catch (error) {
      console.error('Error parsing compound input:', error);
      onChange(null, inputText);
    }
  }, [formatType, onChange, unitIds, rawInput]);
  
  // Handle individual component input changes
  const handleComponentChange = useCallback(async (index: number, newValue: number) => {
    // Skip if the value didn't change
    if (componentValues[index] === newValue) {
      return;
    }
    
    const newComponentValues = [...componentValues];
    newComponentValues[index] = newValue;
    setComponentValues(newComponentValues);
    
    try {
      // Create a compound measurement from the component values
      const measurement = await createCompoundMeasurement(
        newComponentValues,
        unitIds,
        categoryId
      );
      
      // Check if the measurement is different from the previous one
      const measurementKey = JSON.stringify(measurement.components.map(c => ({
        value: c.value,
        unitId: c.unitId
      })));
      
      if (measurementKey !== previousValueRef.current) {
        previousValueRef.current = measurementKey;
        onChange(measurement);
        
        // Update text representation for consistency
        setRawInput(formatMeasurementToText(measurement));
      }
    } catch (error) {
      console.error('Error creating compound measurement:', error);
      onChange(null);
    }
  }, [componentValues, unitIds, categoryId, onChange]);
  
  // Switch between input modes
  const toggleInputMode = () => {
    setInputMode(prev => prev === 'text' ? 'components' : 'text');
  };
  
  // Render input based on mode
  return (
    <div className={`compound-unit-input ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          {label}
        </label>
      )}
      
      {inputMode === 'text' ? (
        // Text input mode
        <div className="relative">
          <input
            type="text"
            className="w-full p-2 border border-border rounded-md bg-background focus:border-primary focus:ring-1 focus:ring-primary"
            value={rawInput}
            onChange={handleRawInputChange}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground hover:text-primary"
            onClick={toggleInputMode}
          >
            Switch to fields
          </button>
        </div>
      ) : (
        // Component inputs mode
        <div>
          <div className="flex gap-2 mb-2">
            {unitIds.map((unitId, index) => (
              <div key={unitId} className="flex-1">
                <div className="flex flex-col">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      step={index > 0 ? 1 : 'any'} // Allow decimals for the first unit
                      className="w-full p-2 border border-border rounded-md bg-background focus:border-primary focus:ring-1 focus:ring-primary"
                      value={componentValues[index] || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        handleComponentChange(index, isNaN(val) ? 0 : val);
                      }}
                      placeholder="0"
                      disabled={disabled}
                      autoFocus={autoFocus && index === 0}
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      {unitSymbols[index] || unitId}
                    </span>
                  </div>
                  <label className="text-xs text-muted-foreground mt-1 text-center">
                    {unitId.charAt(0).toUpperCase() + unitId.slice(1)}
                  </label>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-primary"
            onClick={toggleInputMode}
          >
            Switch to text input
          </button>
        </div>
      )}
    </div>
  );
};

export default CompoundUnitInput; 