import React, { useState, useEffect, useMemo } from 'react';
import { Unit } from '../lib/unit-types';
import { formatNumberByCategory } from '../lib/units';
import { Copy, Share } from 'lucide-react';
import { cn } from '../lib/utils';
import { usePrevious } from '../lib/use-previous';

interface ConversionResultProps {
  fromValue: number;
  fromUnit: Unit;
  toValue: number | null;
  toUnit: Unit;
  categoryId: string;
}

const ConversionResult: React.FC<ConversionResultProps> = ({
  fromValue,
  fromUnit,
  toValue,
  toUnit,
  categoryId,
}) => {
  const [showResultFlash, setShowResultFlash] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const previousToValue = toValue;
  const isCalculating = toValue === null;
  
  const prevValue = usePrevious(toValue);
  const [animateClass, setAnimateClass] = useState('');
  
  // Trigger animation when value changes
  useEffect(() => {
    if (prevValue !== undefined && prevValue !== toValue && toValue !== null) {
      setAnimateClass('result-updated');
      setShowResultFlash(true);
      
      const timer = setTimeout(() => {
        setAnimateClass('');
        setShowResultFlash(false);
      }, 700);
      
      return () => clearTimeout(timer);
    }
  }, [toValue, prevValue]);
  
  const formattedInputValue = useMemo(() => {
    if (categoryId === 'time') {
      if (fromUnit.id === 'millisecond') {
        return Math.round(fromValue).toString();
      } else if (fromUnit.id === 'second') {
        return Number.isInteger(fromValue) ? fromValue.toString() : fromValue.toFixed(2);
      } else if (fromUnit.id === 'minute' || fromUnit.id === 'hour') {
        return Number.isInteger(fromValue) ? fromValue.toString() : fromValue.toFixed(2);
      }
    }
    return formatNumberByCategory(fromValue, categoryId);
  }, [fromValue, categoryId, fromUnit]);
  
  const formattedResultValue = useMemo(() => {
    if (toValue === null) return '';
    
    if (categoryId === 'time') {
      if (toUnit.id === 'day') {
        return Number.isInteger(toValue) ? toValue.toString() : toValue.toFixed(0);
      } else if (toUnit.id === 'millisecond') {
        return Math.round(toValue).toString();
      } else if (toUnit.id === 'second') {
        return Number.isInteger(toValue) ? toValue.toString() : toValue.toFixed(2);
      } else if (toUnit.id === 'minute') {
        return Number.isInteger(toValue) ? toValue.toString() : toValue.toFixed(3);
      } else if (toUnit.id === 'hour') {
        return Number.isInteger(toValue) ? toValue.toString() : toValue.toFixed(4);
      }
    }
    
    const rawFormatted = formatNumberByCategory(toValue, categoryId);
    return rawFormatted.replace(/[a-zA-Z°µ]+$/, '').trim();
  }, [toValue, categoryId, toUnit]);
  
  // Handle copy to clipboard
  const handleCopy = async () => {
    if (toValue === null) return;
    
    try {
      await navigator.clipboard.writeText(`${formattedResultValue} ${toUnit.symbol}`);
      setShowCopyTooltip(true);
      setTimeout(() => setShowCopyTooltip(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (toValue === null) return;
    
    try {
      await navigator.share({
        title: 'Unit Conversion',
        text: `${formattedInputValue} ${fromUnit.symbol} = ${formattedResultValue} ${toUnit.symbol}`,
        url: window.location.href
      });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to share:', error);
      }
    }
  };

  return (
    <div className="conversion-result relative">
      {/* Input Display */}
      <div className="input-display p-3 bg-card/50 rounded-t-lg border border-border">
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-medium">{formattedInputValue}</span>
          <span className="text-sm text-muted-foreground ml-2">{fromUnit.symbol}</span>
        </div>
      </div>
      
      {/* Result Display */}
      <div className="result-display p-4 bg-card rounded-b-lg border border-t-0 border-border relative overflow-hidden">
        {/* Background Flash Animation */}
        {showResultFlash && (
          <div className="absolute inset-0 bg-primary/5 animate-result-flash pointer-events-none" />
        )}
        
        {isCalculating ? (
          <div className="space-y-3">
            <div className="h-8 bg-muted rounded w-2/3 animate-pulse" />
            <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
          </div>
        ) : (
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-semibold">{formattedResultValue}</span>
              <span className="text-lg text-muted-foreground ml-2">{toUnit.symbol}</span>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-muted transition-colors relative"
                aria-label="Copy result"
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
                {showCopyTooltip && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-foreground text-background text-xs rounded">
                    Copied!
                  </span>
                )}
              </button>
              
              {'share' in navigator && (
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                  aria-label="Share result"
                >
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversionResult;