/**
 * Compound conversion engine
 * Handles the conversion of compound measurements like height (feet+inches)
 */

import { 
  CompoundMeasurement, 
  MeasurementComponent, 
  CompoundConversionResult,
  CompoundFormatType,
  compoundFormats
} from './compound-unit-types';
import { UnitCategoryId, Unit } from './unit-types';
import { convert } from './conversion-engine';
import { loadUnitCategory } from './unit-loader';

/**
 * Converts a value between compound unit formats
 */
export async function convertCompound(
  originalMeasurement: CompoundMeasurement,
  targetUnitIds: string[],
  options: {
    precision?: number;
    format?: boolean;
  } = {}
): Promise<CompoundConversionResult> {
  // Validate inputs
  if (!originalMeasurement || !originalMeasurement.components || originalMeasurement.components.length === 0) {
    throw new Error('Invalid source measurement: missing components');
  }

  if (!targetUnitIds || targetUnitIds.length === 0) {
    throw new Error('No target units specified for conversion');
  }
  
  // Load the category information
  const categoryData = await loadUnitCategory(originalMeasurement.categoryId);
  
  // First, convert to the base unit of the category
  let totalInBaseUnit = 0;
  
  // For each component, convert to base and add
  for (const component of originalMeasurement.components) {
    // Find the unit definition
    const unitDef = findUnitInCategory(categoryData, component.unitId);
    if (!unitDef) {
      throw new Error(`Unit not found: ${component.unitId}`);
    }
    
    // Convert this component to base unit and add to total
    const valueInBase = unitDef.toBase(component.value);
    totalInBaseUnit += valueInBase;
  }
  
  // Build the result compound measurement
  const convertedComponents: MeasurementComponent[] = [];
  let remainingValue = totalInBaseUnit;
  
  // Process each target unit in sequence
  for (let i = 0; i < targetUnitIds.length; i++) {
    const targetUnitId = targetUnitIds[i];
    const isLastUnit = i === targetUnitIds.length - 1;
    
    // Find the unit definition
    const unitDef = findUnitInCategory(categoryData, targetUnitId);
    if (!unitDef) {
      throw new Error(`Target unit not found: ${targetUnitId}`);
    }
    
    // Convert from base to this unit
    let componentValue: number;
    
    if (isLastUnit) {
      // For the last unit, use all remaining value
      componentValue = unitDef.fromBase(remainingValue);
      // Round to 2 decimal places
      componentValue = Math.round(componentValue * 100) / 100;
    } else {
      // For intermediate units, calculate the whole number only
      componentValue = Math.floor(unitDef.fromBase(remainingValue));
      
      // Subtract what we've used from the remaining base value
      remainingValue -= unitDef.toBase(componentValue);
    }
    
    // Add this component to the result
    convertedComponents.push({
      value: componentValue,
      unitId: targetUnitId,
      unit: unitDef
    });
  }
  
  // Create a single-unit equivalent for comparison
  const primaryTargetUnit = targetUnitIds[0];
  const singleUnitEquivalent = await convert(
    totalInBaseUnit,
    originalMeasurement.categoryId,
    // Use the base unit ID from the category
    categoryData.baseUnitId || 'meter', // Fallback
    primaryTargetUnit,
    {
      precision: options.precision,
      format: options.format
    }
  );
  
  // Construct the final result
  const result: CompoundConversionResult = {
    original: originalMeasurement,
    converted: {
      components: convertedComponents,
      categoryId: originalMeasurement.categoryId
    },
    singleUnitEquivalent,
    timestamp: Date.now()
  };
  
  return result;
}

/**
 * Parse a text string into a compound measurement
 * @param input User input string like "5'10"" or "1 cup 2 tbsp"
 * @param formatType The compound format to use for parsing
 * @returns Parsed compound measurement or null if parsing failed
 */
export async function parseCompoundInput(
  input: string,
  formatType: CompoundFormatType
): Promise<CompoundMeasurement | null> {
  const formatConfig = compoundFormats[formatType];
  if (!formatConfig) {
    throw new Error(`Unknown format type: ${formatType}`);
  }
  
  // Load the unit category for this format
  const categoryData = await loadUnitCategory(formatConfig.categoryId);

  // Helper to map common informal unit names to formal unit IDs
  const mapCommonUnitName = (index: number, format: CompoundFormatType): string => {
    // For cooking format
    if (format === CompoundFormatType.COOKING) {
      if (index === 0) return 'cup_us';      // First unit is cup
      if (index === 1) return 'tablespoon_us'; // Second unit is tablespoon
      if (index === 2) return 'teaspoon_us';  // Third unit is teaspoon
    }
    
    // For other formats or if no mapping needed, use the default format
    return formatConfig.defaultFromFormat[index];
  };

  // Try to parse using the format's parsing patterns
  for (const pattern of formatConfig.parsePatterns) {
    const regex = new RegExp(pattern, 'i');
    const match = input.match(regex);
    
    if (match) {
      // Extract the numeric values from the regex captures
      const components: MeasurementComponent[] = [];
      
      // Skip the first element (the full match)
      for (let i = 1; i < match.length && i - 1 < formatConfig.defaultFromFormat.length; i++) {
        if (match[i]) {
          // For fraction parsing (like 2 1/2 cups)
          if (i + 2 < match.length && match[i+1] && match[i+2] && pattern.includes('/')) {
            // This is a mixed number format (e.g., 2 1/2)
            const whole = parseInt(match[i], 10) || 0;
            const numerator = parseInt(match[i+1], 10) || 0;
            const denominator = parseInt(match[i+2], 10) || 1;
            
            // Map the unit ID correctly
            const unitId = mapCommonUnitName(0, formatType);
            
            components.push({
              value: whole + (numerator / denominator),
              unitId: unitId,
              unit: findUnitInCategory(categoryData, unitId)
            });
            
            // Skip the next two groups since we used them for the fraction
            i += 2;
          } else {
            // Standard integer parsing
            // Map the unit ID correctly
            const unitId = mapCommonUnitName(i - 1, formatType);
            
            components.push({
              value: parseInt(match[i], 10) || 0,
              unitId: unitId,
              unit: findUnitInCategory(categoryData, unitId)
            });
          }
        }
      }
      
      if (components.length > 0) {
        return {
          components,
          categoryId: formatConfig.categoryId
        };
      }
    }
  }
  
  // If no pattern matched, check if it's a single value that we can parse
  const singleValueMatch = input.match(/^([\d.]+)\s*([a-zA-Z'"]+)$/);
  if (singleValueMatch) {
    const value = parseFloat(singleValueMatch[1]);
    const unitText = singleValueMatch[2].toLowerCase();
    
    // Map common unit names to their formal IDs
    const unitMappings: Record<string, string> = {
      'cup': 'cup_us',
      'cups': 'cup_us',
      'tbsp': 'tablespoon_us',
      'tbs': 'tablespoon_us',
      'tablespoon': 'tablespoon_us',
      'tablespoons': 'tablespoon_us',
      'tsp': 'teaspoon_us',
      'teaspoon': 'teaspoon_us',
      'teaspoons': 'teaspoon_us',
      'oz': 'fluid_ounce_us',
      'fl oz': 'fluid_ounce_us',
      'fluid ounce': 'fluid_ounce_us',
      'fluid ounces': 'fluid_ounce_us',
      'pt': 'pint_us',
      'pint': 'pint_us',
      'pints': 'pint_us',
      'qt': 'quart_us',
      'quart': 'quart_us',
      'quarts': 'quart_us',
      'gal': 'gallon_us',
      'gallon': 'gallon_us',
      'gallons': 'gallon_us'
    };
    
    // Try direct mapping first
    if (unitMappings[unitText]) {
      const unitId = unitMappings[unitText];
      return {
        components: [{
          value,
          unitId,
          unit: findUnitInCategory(categoryData, unitId)
        }],
        categoryId: formatConfig.categoryId
      };
    }
    
    // Try to find the unit based on the text
    let matchedUnitId = '';
    for (const unitId of formatConfig.allowedUnitIds) {
      const unit = findUnitInCategory(categoryData, unitId);
      if (unit) {
        // Check against the unit symbol, name, and aliases
        if (
          unit.symbol.toLowerCase() === unitText ||
          unit.name.toLowerCase() === unitText ||
          (unit.aliases && unit.aliases.some(a => a.toLowerCase() === unitText))
        ) {
          matchedUnitId = unitId;
          break;
        }
      }
    }
    
    if (matchedUnitId) {
      return {
        components: [{
          value,
          unitId: matchedUnitId,
          unit: findUnitInCategory(categoryData, matchedUnitId)
        }],
        categoryId: formatConfig.categoryId
      };
    }
  }
  
  // Parsing failed
  return null;
}

/**
 * Format a compound measurement for display
 * @param measurement The compound measurement to format
 * @param formatType The compound format to use for display
 * @returns Formatted string representation
 */
export function formatCompoundMeasurement(
  measurement: CompoundMeasurement,
  formatType: CompoundFormatType
): string {
  const formatConfig = compoundFormats[formatType];
  if (!formatConfig) {
    throw new Error(`Unknown format type: ${formatType}`);
  }
  
  // Use the format's display pattern
  let formattedString = formatConfig.displayPattern;
  
  // Replace each placeholder with its value
  measurement.components.forEach((component, index) => {
    // Round value to 2 decimal places
    const roundedValue = Math.round(component.value * 100) / 100;
    
    // Replace {n} with the component value
    formattedString = formattedString.replace(
      new RegExp(`\\{${index}\\}`, 'g'),
      roundedValue.toString()
    );
    
    // Replace {n:unit} with the unit symbol
    formattedString = formattedString.replace(
      new RegExp(`\\{${index}:unit\\}`, 'g'),
      component.unit?.symbol || component.unitId
    );
  });
  
  // Remove any unused placeholders
  formattedString = formattedString.replace(/\{[0-9]+(?::[^}]+)?\}/g, '');
  
  // Cleanup extra spaces
  return formattedString.replace(/\s+/g, ' ').trim();
}

/**
 * Helper function to find a unit within a category or its subcategories
 */
function findUnitInCategory(category: any, unitId: string): Unit | undefined {
  // Check direct units
  if (category.units) {
    const unitDef = category.units.find((u: Unit) => u.id === unitId);
    if (unitDef) return unitDef;
  }
  
  // Check subcategories if no direct match
  if (category.subcategories) {
    for (const subcategory of category.subcategories) {
      const unitDef = subcategory.units.find((u: Unit) => u.id === unitId);
      if (unitDef) return unitDef;
    }
  }
  
  return undefined;
}

/**
 * Create a compound measurement from component values
 * @param values Array of values for each component
 * @param unitIds Array of unit IDs for each component
 * @param categoryId Category for the measurement
 * @returns Compound measurement object
 */
export async function createCompoundMeasurement(
  values: number[],
  unitIds: string[],
  categoryId: string
): Promise<CompoundMeasurement> {
  if (values.length !== unitIds.length) {
    throw new Error('Values and unitIds arrays must have the same length');
  }
  
  const categoryData = await loadUnitCategory(categoryId);
  
  const components: MeasurementComponent[] = [];
  
  for (let i = 0; i < values.length; i++) {
    const unitDef = findUnitInCategory(categoryData, unitIds[i]);
    if (!unitDef) {
      throw new Error(`Unit not found: ${unitIds[i]}`);
    }
    
    components.push({
      value: values[i],
      unitId: unitIds[i],
      unit: unitDef
    });
  }
  
  return {
    components,
    categoryId
  };
} 