/**
 * Types for compound unit measurements such as height (feet+inches) and cooking measurements
 * Extends the core unit-types.ts system to support multi-unit conversions
 */

import { Unit, UnitCategory, UnitCategoryId, UnitConversionResult } from './unit-types';

/**
 * Represents a measurement consisting of multiple components (e.g., feet + inches)
 */
export interface CompoundMeasurement {
  components: MeasurementComponent[];
  categoryId: string;
  displayFormat?: string; // Format string for display (e.g., "{0}' {1}")
}

/**
 * A single component of a compound measurement
 */
export interface MeasurementComponent {
  value: number;
  unitId: string;
  unit?: Unit; // Unit reference, may be loaded lazily
}

/**
 * Results of converting a compound measurement
 */
export interface CompoundConversionResult {
  original: CompoundMeasurement;
  converted: CompoundMeasurement;
  singleUnitEquivalent?: UnitConversionResult; // Equivalent in a single unit for comparison
  timestamp: number;
}

/**
 * Specialized compound formats supported by the system
 */
export enum CompoundFormatType {
  HEIGHT = 'height',
  COOKING = 'cooking',
  DISTANCE = 'distance',
  CUSTOM = 'custom'
}

/**
 * Configuration for a compound format
 */
export interface CompoundFormatConfig {
  id: CompoundFormatType;
  name: string;
  description: string;
  categoryId: UnitCategoryId;
  defaultFromFormat: string[];  // Array of unit IDs in display order
  defaultToFormat: string[];    // Array of unit IDs in display order
  allowedUnitIds: string[];     // All unit IDs that can be used in this format
  displayPattern: string;       // How to format for display
  parsePatterns: string[];      // Regex patterns to parse text input
}

// Predefined compound formats
export const compoundFormats: Record<CompoundFormatType, CompoundFormatConfig> = {
  [CompoundFormatType.HEIGHT]: {
    id: CompoundFormatType.HEIGHT,
    name: 'Height',
    description: 'Human height in feet/inches or meters/centimeters',
    categoryId: UnitCategoryId.LENGTH,
    defaultFromFormat: ['foot', 'inch'],
    defaultToFormat: ['meter', 'centimeter'],
    allowedUnitIds: ['foot', 'inch', 'meter', 'centimeter', 'millimeter'],
    displayPattern: '{0} {0:unit} {1} {1:unit}',
    parsePatterns: [
      // 5'10"
      '(\\d+)[\'′]\\s*(\\d+)[\"″]',
      // 5ft 10in
      '(\\d+)\\s*(?:ft|feet)\\s*(\\d+)\\s*(?:in|inch|inches)?',
      // 5' 10
      '(\\d+)[\'′]\\s*(\\d+)'
    ]
  },
  [CompoundFormatType.COOKING]: {
    id: CompoundFormatType.COOKING,
    name: 'Cooking',
    description: 'Cooking measurements with mixed units',
    categoryId: UnitCategoryId.VOLUME,
    defaultFromFormat: ['cup', 'tablespoon', 'teaspoon'],
    defaultToFormat: ['milliliter'],
    allowedUnitIds: [
      'cup', 'tablespoon', 'teaspoon', 'fluid_ounce', 'pint', 'quart', 'gallon',
      'milliliter', 'liter', 'deciliter'
    ],
    displayPattern: '{0} {0:unit} {1} {1:unit} {2} {2:unit}',
    parsePatterns: [
      // 1 cup 2 tbsp
      '(\\d+)\\s*(?:cup|cups)\\s*(\\d+)\\s*(?:tbsp|tbs|tablespoon|tablespoons)',
      // 2 1/2 cups
      '(\\d+)\\s*(\\d+)\\/(\\d+)\\s*(?:cup|cups)'
    ]
  },
  [CompoundFormatType.DISTANCE]: {
    id: CompoundFormatType.DISTANCE,
    name: 'Distance',
    description: 'Distance with mixed units like miles/yards/feet',
    categoryId: UnitCategoryId.LENGTH,
    defaultFromFormat: ['mile', 'yard', 'foot'],
    defaultToFormat: ['kilometer', 'meter'],
    allowedUnitIds: [
      'mile', 'yard', 'foot', 'inch', 
      'kilometer', 'meter', 'centimeter'
    ],
    displayPattern: '{0} {0:unit} {1} {1:unit} {2} {2:unit}',
    parsePatterns: [
      // 2 mi 300 yd
      '(\\d+)\\s*(?:mi|mile|miles)\\s*(\\d+)\\s*(?:yd|yard|yards)',
      // 2 km 350 m
      '(\\d+)\\s*(?:km|kilometer|kilometers)\\s*(\\d+)\\s*(?:m|meter|meters)'
    ]
  },
  [CompoundFormatType.CUSTOM]: {
    id: CompoundFormatType.CUSTOM,
    name: 'Custom',
    description: 'User-defined compound format',
    categoryId: UnitCategoryId.LENGTH, // Default, but can be changed
    defaultFromFormat: ['foot', 'inch'],
    defaultToFormat: ['meter', 'centimeter'],
    allowedUnitIds: [], // To be populated based on category
    displayPattern: '{0} {0:unit} {1} {1:unit}',
    parsePatterns: []
  }
};

// Model for compound user preferences
export interface CompoundUnitPreferences {
  preferredFormats: {
    [key in CompoundFormatType]?: {
      enabled: boolean;
      customFromFormat?: string[];
      customToFormat?: string[];
    };
  };
  recentCompoundConversions: CompoundConversionResult[];
}

// Default compound preferences
export const defaultCompoundPreferences: CompoundUnitPreferences = {
  preferredFormats: {
    [CompoundFormatType.HEIGHT]: {
      enabled: true
    },
    [CompoundFormatType.COOKING]: {
      enabled: true
    },
    [CompoundFormatType.DISTANCE]: {
      enabled: true
    }
  },
  recentCompoundConversions: []
}; 