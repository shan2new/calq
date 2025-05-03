/**
 * Utility functions for compound unit converters
 */

import { 
  CompoundFormatType, 
  compoundFormats,
  CompoundMeasurement,
  MeasurementComponent
} from '../../lib/compound-unit-types';
import { UnitCategoryId } from '../../lib/unit-types';

/**
 * Ensures that we have valid target unit IDs for compound conversions
 * @param formatType The type of compound format
 * @param targetUnitIds The target unit IDs to validate
 * @returns Valid target unit IDs
 */
export function ensureValidTargetUnits(
  formatType: CompoundFormatType,
  targetUnitIds: string[] | undefined
): string[] {
  // If unit IDs are provided and valid, use them
  if (targetUnitIds && targetUnitIds.length > 0) {
    return targetUnitIds;
  }
  
  // Otherwise, fall back to defaults from the compound format configuration
  if (compoundFormats[formatType]) {
    return compoundFormats[formatType].defaultToFormat;
  }
  
  // Last resort fallbacks based on format type
  switch (formatType) {
    case CompoundFormatType.HEIGHT:
      return ['meter', 'centimeter'];
    case CompoundFormatType.COOKING:
      return ['milliliter'];
    case CompoundFormatType.DISTANCE:
      return ['kilometer', 'meter'];
    default:
      return ['meter']; // Generic fallback
  }
}

/**
 * Creates a default compound measurement with zero values
 * @param formatType The type of compound format
 * @param categoryId The unit category ID
 * @returns A default compound measurement
 */
export function createDefaultMeasurement(
  formatType: CompoundFormatType,
  categoryId: UnitCategoryId
): CompoundMeasurement {
  let unitIds: string[] = [];
  
  // Get unit IDs from the format configuration
  if (compoundFormats[formatType]) {
    unitIds = compoundFormats[formatType].defaultFromFormat;
  } else {
    // Fallbacks based on format type
    switch (formatType) {
      case CompoundFormatType.HEIGHT:
        unitIds = ['foot', 'inch'];
        break;
      case CompoundFormatType.COOKING:
        unitIds = ['cup', 'tablespoon'];
        break;
      case CompoundFormatType.DISTANCE:
        unitIds = ['mile', 'yard'];
        break;
      default:
        unitIds = ['meter'];
    }
  }
  
  // Create components with zero values
  const components: MeasurementComponent[] = unitIds.map(unitId => ({
    value: 0,
    unitId
  }));
  
  return {
    components,
    categoryId
  };
}

/**
 * Makes a deep copy of a compound measurement
 * @param measurement The measurement to copy
 * @returns A deep copy of the measurement
 */
export function cloneCompoundMeasurement(
  measurement: CompoundMeasurement
): CompoundMeasurement {
  return {
    components: measurement.components.map(comp => ({
      value: comp.value,
      unitId: comp.unitId,
      unit: comp.unit
    })),
    categoryId: measurement.categoryId,
    displayFormat: measurement.displayFormat
  };
}
