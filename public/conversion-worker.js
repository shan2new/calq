/**
 * Calcq Conversion Web Worker
 * This worker handles unit conversion calculations in a separate thread
 * to keep the main UI thread responsive for better Core Web Vitals.
 */

// Cache for conversion factors to avoid recalculating
const conversionCache = new Map();

// Handle messages from main thread
self.addEventListener('message', function(e) {
  const { 
    fromUnit, 
    toUnit, 
    value, 
    conversionFactor, 
    conversionOffset,
    precision,
    operation = 'convert',
    requestId 
  } = e.data;
  
  try {
    switch (operation) {
      case 'convert':
        // Perform basic conversion with factor and optional offset
        const result = performConversion(value, conversionFactor, conversionOffset);
        sendResult(requestId, result, fromUnit, toUnit);
        break;
        
      case 'batch_convert':
        // Convert multiple values at once
        const values = e.data.values || [];
        const results = values.map(val => performConversion(val, conversionFactor, conversionOffset));
        sendBatchResult(requestId, results, fromUnit, toUnit);
        break;
        
      case 'format_result':
        // Format a result with proper precision
        const formattedValue = formatNumber(value, precision || 10);
        self.postMessage({
          requestId,
          formattedValue,
          fromUnit,
          toUnit
        });
        break;
        
      case 'clear_cache':
        // Clear the conversion cache
        conversionCache.clear();
        self.postMessage({ requestId, operation: 'cache_cleared' });
        break;
        
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } catch (error) {
    self.postMessage({ 
      requestId, 
      error: error.message,
      fromUnit,
      toUnit
    });
  }
}, false);

/**
 * Perform a numeric conversion
 */
function performConversion(value, factor, offset = 0) {
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) {
    throw new Error('Invalid input value');
  }
  
  const cacheKey = `${value}-${factor}-${offset}`;
  
  // Check cache first
  if (conversionCache.has(cacheKey)) {
    return conversionCache.get(cacheKey);
  }
  
  // For temperature conversions that use offset (like C to F)
  const result = numValue * factor + offset;
  
  // Cache the result
  conversionCache.set(cacheKey, result);
  
  return result;
}

/**
 * Format a number to the specified decimal places
 */
function formatNumber(value, decimalPlaces = 10) {
  const num = parseFloat(value);
  if (isNaN(num)) return '';
  
  // Handle large and small numbers appropriately
  if (Math.abs(num) >= 1e10 || (Math.abs(num) < 1e-7 && num !== 0)) {
    return num.toExponential(decimalPlaces);
  }
  
  // Regular formatting
  return num.toFixed(decimalPlaces).replace(/\.?0+$/, '');
}

/**
 * Send the conversion result back to the main thread
 */
function sendResult(requestId, result, fromUnit, toUnit) {
  self.postMessage({
    requestId,
    result: result,
    fromUnit: fromUnit,
    toUnit: toUnit
  });
}

/**
 * Send batch results back to the main thread
 */
function sendBatchResult(requestId, results, fromUnit, toUnit) {
  self.postMessage({
    requestId,
    results: results,
    fromUnit: fromUnit,
    toUnit: toUnit
  });
} 