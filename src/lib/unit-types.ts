/**
 * Core type definitions for the enhanced unit conversion system
 * Designed to handle 4,500+ units across 33 categories efficiently
 */

export interface UnitCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  baseUnitId?: string;
  subcategories?: SubCategory[];
  units?: Unit[]; // Direct units if no subcategories
  popularUnits?: string[]; // IDs of commonly used units
}

export interface SubCategory {
  id: string;
  name: string;
  description?: string;
  units: Unit[];
  popularUnits?: string[]; // IDs of commonly used units
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  aliases?: string[];        // Alternative names for search
  pluralName?: string;       // For proper display
  baseUnit?: boolean;        // Is this the base unit for the category?
  conversionFactor?: number; // For simple conversions
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
  relatedUnits?: string[];   // IDs of related units (for suggestions)
  precision?: number;        // Default precision for this unit type
  formatter?: (value: number) => string; // Custom formatter if needed
}

export interface UnitConversionResult {
  value: number;
  formattedValue: string;
  fromUnit: Unit;
  toUnit: Unit;
  category: string;
  precision: number;
  timestamp: number;
}

export interface UnitSearchResult {
  unitId: string;
  categoryId: string;
  subcategoryId?: string;
  name: string;
  symbol: string;
  relevance: number;
}

export type ConversionRoundingMode = 'ceil' | 'floor' | 'round' | 'trunc';

export interface ConversionOptions {
  precision?: number;
  roundingMode?: ConversionRoundingMode;
  format?: boolean;
  timestamp?: number;
}

// Enum for unit categories to ensure consistent use of category IDs
export enum UnitCategoryId {
  LENGTH = 'length',
  MASS = 'mass',
  TEMPERATURE = 'temperature',
  VOLUME = 'volume',
  AREA = 'area',
  TIME = 'time',
  SPEED = 'speed',
  DIGITAL = 'digital',
  ENERGY = 'energy',
  POWER = 'power',
  PRESSURE = 'pressure',
  ANGLE = 'angle',
  FREQUENCY = 'frequency',
  FORCE = 'force',
  CURRENCY = 'currency',
  FUEL_ECONOMY = 'fuel-economy',
  DATA_TRANSFER = 'data-transfer',
  ACCELERATION = 'acceleration',
  TORQUE = 'torque',
  DENSITY = 'density',
  ELECTRIC_CURRENT = 'electric-current',
  ELECTRIC_CHARGE = 'electric-charge',
  ELECTRIC_CAPACITANCE = 'electric-capacitance',
  ELECTRIC_CONDUCTANCE = 'electric-conductance',
  ELECTRIC_INDUCTANCE = 'electric-inductance',
  ELECTRIC_RESISTANCE = 'electric-resistance',
  ELECTRIC_VOLTAGE = 'electric-voltage',
  ILLUMINANCE = 'illuminance',
  RADIATION = 'radiation',
  RADIOACTIVITY = 'radioactivity',
  VISCOSITY = 'viscosity',
  SOUND = 'sound',
  TYPOGRAPHY = 'typography',
}

// Base category structure to be used for navigation and UI before full data is loaded
export const unitCategoryInfo: Record<string, { name: string; icon: string; description: string }> = {
  [UnitCategoryId.LENGTH]: {
    name: 'Length',
    icon: 'ruler',
    description: 'Units for measuring distance or length'
  },
  [UnitCategoryId.MASS]: {
    name: 'Mass',
    icon: 'weight',
    description: 'Units for measuring mass or weight'
  },
  [UnitCategoryId.TEMPERATURE]: {
    name: 'Temperature',
    icon: 'thermometer',
    description: 'Units for measuring temperature'
  },
  [UnitCategoryId.VOLUME]: {
    name: 'Volume',
    icon: 'beaker',
    description: 'Units for measuring three-dimensional space'
  },
  [UnitCategoryId.AREA]: {
    name: 'Area',
    icon: 'square',
    description: 'Units for measuring two-dimensional space'
  },
  [UnitCategoryId.TIME]: {
    name: 'Time',
    icon: 'clock',
    description: 'Units for measuring time intervals'
  },
  [UnitCategoryId.SPEED]: {
    name: 'Speed',
    icon: 'gauge',
    description: 'Units for measuring velocity'
  },
  [UnitCategoryId.DIGITAL]: {
    name: 'Digital',
    icon: 'database',
    description: 'Units for measuring digital information'
  },
  [UnitCategoryId.ENERGY]: {
    name: 'Energy',
    icon: 'zap',
    description: 'Units for measuring energy'
  },
  [UnitCategoryId.POWER]: {
    name: 'Power',
    icon: 'battery',
    description: 'Units for measuring power or rate of energy'
  },
  // Additional categories omitted for brevity - would include all 33 categories
}; 