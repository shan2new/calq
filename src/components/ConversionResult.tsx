import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Equal } from 'lucide-react';
import { formatNumberByCategory } from '../lib/units';
import { Unit } from '../lib/unit-types';

interface ConversionResultProps {
  fromValue: number;
  fromUnit: Unit;
  toValue: number | null;
  toUnit: Unit;
  categoryId: string;
  isCalculating?: boolean;
}

// Custom hook to store previous value for animation
const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

const ConversionResult: React.FC<ConversionResultProps> = ({
  fromValue,
  fromUnit,
  toValue,
  toUnit,
  categoryId,
  isCalculating = false,
}) => {
  const prevValue = usePrevious(toValue);
  const [animateClass, setAnimateClass] = useState('');
  const [showResultFlash, setShowResultFlash] = useState(false);
  
  // Trigger animation when value changes
  useEffect(() => {
    if (prevValue !== undefined && prevValue !== toValue && toValue !== null) {
      // Start the animation
      setAnimateClass('result-updated');
      setShowResultFlash(true);
      
      // Reset animation classes after animation completes
      const timer = setTimeout(() => {
        setAnimateClass('');
        setShowResultFlash(false);
      }, 700); // Animation duration + buffer
      
      return () => clearTimeout(timer);
    }
  }, [toValue, prevValue]);
  
  // Format input value for display (without unit symbol)
  const formattedInputValue = useMemo(() => {
    // Simple numeric formatting for input value
    if (categoryId === 'time') {
      if (fromUnit.id === 'millisecond') {
        return Math.round(fromValue).toString();
      } else if (fromUnit.id === 'second') {
        return Number.isInteger(fromValue) ? fromValue.toString() : fromValue.toFixed(2);
      } else if (fromUnit.id === 'minute' || fromUnit.id === 'hour') {
        return Number.isInteger(fromValue) ? fromValue.toString() : fromValue.toFixed(2);
      }
    }
    
    // Default formatting for other categories
    return formatNumberByCategory(fromValue, categoryId);
  }, [fromValue, categoryId, fromUnit]);
  
  // Format result for display (without unit symbol)
  const formattedResult = useMemo(() => {
    if (toValue === null) return '';
    
    if (categoryId === 'time') {
      if (toUnit.id === 'day') {
        // Special handling for days (integer value)
        return Number.isInteger(toValue) ? toValue.toString() : toValue.toFixed(0);
      } else if (toUnit.id === 'millisecond') {
        // Special handling for milliseconds
        return Math.round(toValue).toString();
      } else if (toUnit.id === 'second') {
        // Special handling for seconds - don't show decimals if it's a whole number
        return Number.isInteger(toValue) ? toValue.toString() : toValue.toFixed(2);
      } else if (toUnit.id === 'minute') {
        // Special handling for minutes - don't show decimals if it's a whole number
        return Number.isInteger(toValue) ? toValue.toString() : toValue.toFixed(3);
      } else if (toUnit.id === 'hour') {
        // Special handling for hours - don't show decimals if it's a whole number
        return Number.isInteger(toValue) ? toValue.toString() : toValue.toFixed(4);
      }
    }
    
    // Default numeric formatting without any symbols
    const rawFormatted = formatNumberByCategory(toValue, categoryId);
    
    // Strip any unit symbols that might be in the formatted string
    return rawFormatted.replace(/[a-zA-Z°µ]+$/, '').trim();
  }, [toValue, categoryId, toUnit]);
  
  return (
    <div className="conversion-result-container mt-6 relative bg-muted/20 p-3 rounded-lg border border-border/30">
      {/* Result Flash Animation */}
      {showResultFlash && (
        <div className="absolute inset-0 bg-primary/5 rounded-lg animate-result-flash pointer-events-none" />
      )}
      
      <div className="result-equation flex items-center gap-2 text-muted-foreground mb-2">
        <span className="from-value">{formattedInputValue}</span>
        <span className="unit-symbol text-sm">{fromUnit.symbol}</span>
      </div>
      
      <div className="equals-container flex items-center gap-2 mb-3">
        <Equal size={20} className="text-muted-foreground" />
      </div>
      
      <div 
        className={`result-value text-3xl font-semibold flex items-center gap-2 ${animateClass}`} 
        aria-live="polite"
      >
        {isCalculating ? (
          <div className="h-8 bg-muted rounded w-28 animate-pulse"></div>
        ) : (
          <>
            <span className="to-value">{formattedResult}</span>
            <span className="unit-symbol text-lg text-muted-foreground">{toUnit.symbol}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ConversionResult; 