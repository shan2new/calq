import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash-es';

// Simple math parser for basic expressions
const evaluateExpression = (expression: string): number | null => {
  try {
    // Remove all whitespace
    const cleanedExpression = expression.replace(/\s/g, '');
    
    // Check if it's just a simple number
    if (/^-?\d+(\.\d+)?$/.test(cleanedExpression)) {
      return parseFloat(cleanedExpression);
    }
    
    // Check if it's a valid math expression
    if (/^[\d\s\+\-\*\/\(\)\.\,]*$/.test(cleanedExpression)) {
      // Replace commas with dots for decimal points (European format)
      const normalizedExpression = cleanedExpression.replace(/,/g, '.');
      
      // Handle percentage calculations
      const percentExpression = normalizedExpression.replace(/(\d+(\.\d+)?)%/g, (_, num) => {
        return `(${num}/100)`;
      });
      
      // Use Function constructor instead of eval for slightly better security
      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${percentExpression})`)();
      
      if (isNaN(result) || !isFinite(result)) {
        return null;
      }
      
      return result;
    }
    
    return null;
  } catch (e) {
    console.error('Expression parsing error:', e);
    return null;
  }
};

interface ExpressionInputProps {
  value: string;
  onChange: (value: string, parsedValue: number | null) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  autoFocus?: boolean;
}

const ExpressionInput: React.FC<ExpressionInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter a value...',
  onKeyDown,
  className = '',
  autoFocus = false,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  // Debounced parsing function
  const parseExpression = useCallback(
    debounce((expression: string) => {
      try {
        if (!expression.trim()) {
          setError(null);
          onChange(expression, null);
          return;
        }
        
        const result = evaluateExpression(expression);
        
        if (result === null) {
          setError('Invalid expression');
          onChange(expression, null);
        } else {
          setError(null);
          onChange(expression, result);
        }
      } catch (e) {
        console.error('Parsing error:', e);
        setError('Invalid expression');
        onChange(expression, null);
      }
    }, 300),
    [onChange]
  );
  
  // Parse the expression when the value changes
  useEffect(() => {
    parseExpression(displayValue);
    
    // Cleanup the debounced function on unmount
    return () => {
      parseExpression.cancel();
    };
  }, [displayValue, parseExpression]);
  
  // Update the display value when the value prop changes
  // This is needed when the parent component changes the value
  useEffect(() => {
    if (!isFocused && value !== displayValue) {
      setDisplayValue(value);
    }
  }, [value, isFocused, displayValue]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
  };
  
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  const handleBlur = () => {
    setIsFocused(false);
  };
  
  // When Enter key is pressed, force immediate evaluation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      parseExpression.flush();
    }
    
    // Call the parent's onKeyDown handler if provided
    if (onKeyDown) {
      onKeyDown(e);
    }
  };
  
  return (
    <div className="expression-input-container relative">
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full p-2 bg-card border border-border rounded-md ${error ? 'border-red-500' : ''} ${className}`}
        aria-invalid={!!error}
        autoFocus={autoFocus}
      />
      {error && (
        <div className="error-message text-red-500 text-sm mt-1 absolute -bottom-6 left-0" aria-live="polite">
          {error}
        </div>
      )}
    </div>
  );
};

export default ExpressionInput; 