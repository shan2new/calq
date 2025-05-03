/**
 * Advanced Conversion Engine
 * Provides precise conversion between units with proper rounding and formatting
 */

import { 
  ConversionOptions, 
  ConversionRoundingMode, 
  Unit, 
  UnitCategory,
  UnitCategoryId,
  UnitConversionResult
} from './unit-types';
import { formatNumberByCategory } from './units';
import { loadUnitCategory } from './unit-loader';

// Decimal.js or big.js would be better for precision, but
// for simplicity we'll use native numbers with careful handling

interface ConversionPrecisionDefaults {
  defaultPrecision: number;
  minPrecision: number;
  maxPrecision: number;
}

// Default precision settings by category
const precisionDefaults: Record<string, ConversionPrecisionDefaults> = {
  [UnitCategoryId.LENGTH]: { 
    defaultPrecision: 4, 
    minPrecision: 0, 
    maxPrecision: 10 
  },
  [UnitCategoryId.MASS]: { 
    defaultPrecision: 4, 
    minPrecision: 0, 
    maxPrecision: 10 
  },
  [UnitCategoryId.TEMPERATURE]: { 
    defaultPrecision: 2, 
    minPrecision: 0, 
    maxPrecision: 6 
  },
  [UnitCategoryId.VOLUME]: { 
    defaultPrecision: 4, 
    minPrecision: 0, 
    maxPrecision: 10 
  },
  [UnitCategoryId.AREA]: { 
    defaultPrecision: 4, 
    minPrecision: 0, 
    maxPrecision: 10 
  },
  [UnitCategoryId.TIME]: { 
    defaultPrecision: 3, 
    minPrecision: 0, 
    maxPrecision: 9 
  },
  // Default fallback for all other categories
  default: { 
    defaultPrecision: 4, 
    minPrecision: 0, 
    maxPrecision: 10 
  }
};

/**
 * Find a unit in a category or its subcategories
 * @param category Category data
 * @param unitId Unit ID to find
 * @returns Unit or undefined if not found
 */
function findUnit(category: UnitCategory, unitId: string): Unit | undefined {
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
}

/**
 * Apply rounding according to specified mode
 * @param value Value to round
 * @param precision Decimal precision
 * @param mode Rounding mode
 * @returns Rounded value
 */
function applyRounding(
  value: number,
  precision: number,
  mode: ConversionRoundingMode = 'round'
): number {
  const factor = Math.pow(10, precision);
  
  switch (mode) {
    case 'ceil':
      return Math.ceil(value * factor) / factor;
    case 'floor':
      return Math.floor(value * factor) / factor;
    case 'trunc':
      return Math.trunc(value * factor) / factor;
    case 'round':
    default:
      return Math.round(value * factor) / factor;
  }
}

/**
 * Determine appropriate precision for a conversion result
 * @param value The conversion result
 * @param categoryId Category ID for context
 * @param userPrecision User-specified precision (optional)
 * @returns The precision to use
 */
function determinePrecision(
  value: number, 
  categoryId: string,
  userPrecision?: number
): number {
  // Use user-specified precision if provided
  if (userPrecision !== undefined) {
    return userPrecision;
  }
  
  const defaults = precisionDefaults[categoryId] || precisionDefaults.default;
  
  // For very small or large numbers, adjust precision dynamically
  const absValue = Math.abs(value);
  if (absValue !== 0) {
    if (absValue < 0.001) return defaults.maxPrecision;
    if (absValue < 0.01) return Math.min(defaults.maxPrecision, 6);
    if (absValue < 0.1) return Math.min(defaults.maxPrecision, 5);
    if (absValue < 1) return Math.min(defaults.maxPrecision, 4);
    if (absValue > 1000000) return defaults.minPrecision;
    if (absValue > 10000) return Math.max(defaults.minPrecision, 1);
  }
  
  return defaults.defaultPrecision;
}

/**
 * Convert a value between units
 * @param value Value to convert
 * @param fromCategoryId Category ID
 * @param fromUnitId Source unit ID
 * @param toUnitId Target unit ID
 * @param options Conversion options
 * @returns Promise resolving to conversion result
 */
export async function convert(
  value: number,
  fromCategoryId: string,
  fromUnitId: string,
  toUnitId: string,
  options: ConversionOptions = {}
): Promise<UnitConversionResult> {
  // Skip conversion if units are the same
  if (fromUnitId === toUnitId) {
    // We still need to load the category to get the unit data
    const category = await loadUnitCategory(fromCategoryId);
    const unit = findUnit(category, fromUnitId);
    
    if (!unit) {
      throw new Error(`Unit not found: ${fromUnitId}`);
    }
    
    const precision = determinePrecision(value, fromCategoryId, options.precision);
    const roundedValue = applyRounding(value, precision, options.roundingMode);
    
    return {
      value: roundedValue,
      formattedValue: formatNumberByCategory(roundedValue, fromCategoryId),
      fromUnit: unit,
      toUnit: unit,
      category: fromCategoryId,
      precision,
      timestamp: options.timestamp || Date.now()
    };
  }
  
  // Load category data
  const category = await loadUnitCategory(fromCategoryId);
  
  // Find units
  const fromUnit = findUnit(category, fromUnitId);
  const toUnit = findUnit(category, toUnitId);
  
  if (!fromUnit) {
    throw new Error(`Source unit not found: ${fromUnitId}`);
  }
  
  if (!toUnit) {
    throw new Error(`Target unit not found: ${toUnitId}`);
  }
  
  // Convert to base unit then to target unit
  const baseValue = fromUnit.toBase(value);
  const convertedValue = toUnit.fromBase(baseValue);
  
  // Determine appropriate precision
  const precision = determinePrecision(
    convertedValue, 
    fromCategoryId, 
    options.precision
  );
  
  // Apply rounding according to options
  const roundedValue = applyRounding(
    convertedValue,
    precision,
    options.roundingMode
  );
  
  // Format the value if requested
  const formattedValue = options.format !== false ? 
    formatNumberByCategory(roundedValue, fromCategoryId) : 
    roundedValue.toString();
  
  return {
    value: roundedValue,
    formattedValue,
    fromUnit,
    toUnit,
    category: fromCategoryId,
    precision,
    timestamp: options.timestamp || Date.now()
  };
}

/**
 * Get a list of compatible units for a given unit
 * @param categoryId Category ID
 * @param unitId Unit ID
 * @returns Promise resolving to array of compatible units
 */
export async function getCompatibleUnits(
  categoryId: string,
  unitId: string
): Promise<Unit[]> {
  const category = await loadUnitCategory(categoryId);
  const unit = findUnit(category, unitId);
  
  if (!unit) {
    throw new Error(`Unit not found: ${unitId}`);
  }
  
  // For now, all units in the same category are considered compatible
  const allUnits: Unit[] = [];
  
  // Collect direct units
  if (category.units) {
    allUnits.push(...category.units);
  }
  
  // Collect units from subcategories
  if (category.subcategories) {
    category.subcategories.forEach(subcategory => {
      allUnits.push(...subcategory.units);
    });
  }
  
  // Filter out the original unit
  return allUnits.filter(u => u.id !== unitId);
}

/**
 * Get popular/recommended units for a category
 * @param categoryId Category ID
 * @param limit Maximum number of units to return
 * @returns Promise resolving to array of popular units
 */
export async function getPopularUnits(
  categoryId: string,
  limit = 5
): Promise<Unit[]> {
  const category = await loadUnitCategory(categoryId);
  
  // Use explicit popular units if defined
  if (category.popularUnits && category.popularUnits.length > 0) {
    const popularUnits: Unit[] = [];
    
    for (const unitId of category.popularUnits) {
      const unit = findUnit(category, unitId);
      if (unit) {
        popularUnits.push(unit);
      }
    }
    
    return popularUnits.slice(0, limit);
  }
  
  // Otherwise, collect base units and a sample of others
  const baseUnits: Unit[] = [];
  const otherUnits: Unit[] = [];
  
  // Collect from direct units
  if (category.units) {
    category.units.forEach(unit => {
      if (unit.baseUnit) {
        baseUnits.push(unit);
      } else {
        otherUnits.push(unit);
      }
    });
  }
  
  // Collect from subcategories
  if (category.subcategories) {
    category.subcategories.forEach(subcategory => {
      subcategory.units.forEach(unit => {
        if (unit.baseUnit) {
          baseUnits.push(unit);
        } else {
          otherUnits.push(unit);
        }
      });
    });
  }
  
  // Prioritize base units, then add other units up to the limit
  const result = [...baseUnits];
  
  // Add some common units
  if (result.length < limit && otherUnits.length > 0) {
    // Sort other units by those with conversionFactor for simplicity
    // (these are often the more common units)
    const sortedOtherUnits = otherUnits.sort((a, b) => {
      const aHasFactor = a.conversionFactor !== undefined ? 1 : 0;
      const bHasFactor = b.conversionFactor !== undefined ? 1 : 0;
      return bHasFactor - aHasFactor;
    });
    
    result.push(...sortedOtherUnits.slice(0, limit - result.length));
  }
  
  return result.slice(0, limit);
} 