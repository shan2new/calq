/**
 * Utility functions for formatting numbers, units, and scientific notation
 */

/**
 * Format a number based on its magnitude, removing trailing zeros
 * @param value The number to format
 * @param precision Maximum number of decimal places
 */
export const formatNumber = (value: number, precision: number = 6): string => {
  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }
  
  // Handle very small numbers close to zero
  if (Math.abs(value) < 0.000001) {
    return '0';
  }
  
  // Format very large or very small numbers with scientific notation
  if (Math.abs(value) > 1e9 || (Math.abs(value) < 0.0001 && value !== 0)) {
    return value.toExponential(precision);
  }
  
  // For normal numbers, format with commas and remove trailing zeros
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  });
  
  return formatted;
};

/**
 * Format a number according to the category it belongs to
 * @param value The number to format
 * @param categoryId The ID of the unit category
 */
export const formatNumberByCategory = (value: number, categoryId: string): string => {
  if (value === null || isNaN(value)) return '';
  
  // Apply different formatting rules based on category
  switch (categoryId) {
    // Time - use more precise formatting for small time values
    case 'time':
      // For time, we handle the formatting differently depending on magnitude
      if (value < 0.001) {
        // Very small times (microseconds)
        return (value * 1000000).toFixed(2);
      } else if (value < 1) {
        // Milliseconds range (without any decimal places)
        return (value * 1000).toFixed(0);
      } else if (value < 60) {
        // Seconds range (with 2 decimal places)
        return value.toFixed(2);
      } else if (value < 3600) {
        // Minutes range
        const minutes = Math.floor(value / 60);
        const seconds = Math.floor(value % 60);
        return `${minutes}m ${seconds}s`;
      } else if (value < 86400) {
        // Hours range
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value % 3600) / 60);
        return `${hours}h ${minutes}m`;
      } else {
        // Days and above
        const days = Math.floor(value / 86400);
        const hours = Math.floor((value % 86400) / 3600);
        return `${days}d ${hours}h`;
      }
    
    // Currency - always show 2 decimal places
    case 'currency':
      return value.toLocaleString(undefined, { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      });
    
    // Temperature - show 1 decimal place
    case 'temperature':
      return value.toLocaleString(undefined, { 
        minimumFractionDigits: 1,
        maximumFractionDigits: 1 
      });
    
    // Digital storage - no decimals for bytes
    case 'digital':
      if (value % 1 === 0) {
        return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
      }
      return formatNumber(value, 2);
    
    // Default formatting
    default:
      return formatNumber(value);
  }
};

/**
 * Format scientific notation to human-readable format
 * @param value Scientific notation string or number
 */
export const formatScientificNotation = (value: string | number): string => {
  if (typeof value === 'number') {
    value = value.toString();
  }
  
  if (value.includes('e')) {
    // Parse scientific notation
    const [_, exponent] = value.split('e');
    const exp = parseInt(exponent);
    
    if (exp > 0) {
      // For positive exponents (large numbers): 1e3 -> × 1,000
      return `× ${Math.pow(10, exp).toLocaleString()}`;
    } else {
      // For negative exponents (small numbers): 1e-3 -> ÷ 1,000
      return `÷ ${Math.pow(10, Math.abs(exp)).toLocaleString()}`;
    }
  }
  
  return value;
};

/**
 * Format a conversion relationship for display
 * @param fromValue Source value
 * @param toValue Target value
 * @param fromUnit Source unit object
 * @param toUnit Target unit object
 */
export const formatConversionRelationship = (
  fromValue: number,
  toValue: number,
  fromUnitSymbol: string,
  toUnitSymbol: string
): string => {
  if (fromValue === 0 || toValue === 0) return '';
  
  // Calculate the ratio
  const ratio = toValue / fromValue;
  
  if (ratio === 1) {
    return `1 ${fromUnitSymbol} = 1 ${toUnitSymbol}`;
  }
  
  // Format based on magnitude
  if (ratio >= 1000 || ratio < 0.001) {
    // Use scientific notation for extreme values
    return `1 ${fromUnitSymbol} = ${ratio.toExponential(4)} ${toUnitSymbol}`;
  } else if (ratio >= 1) {
    // For values greater than 1
    return `1 ${fromUnitSymbol} = ${formatNumber(ratio, 4)} ${toUnitSymbol}`;
  } else {
    // For fractional values, show as both decimal and fraction if clean
    const inverse = 1 / ratio;
    if (Number.isInteger(inverse)) {
      return `1 ${fromUnitSymbol} = 1/${inverse} ${toUnitSymbol}`;
    }
    return `1 ${fromUnitSymbol} = ${formatNumber(ratio, 4)} ${toUnitSymbol}`;
  }
}; 