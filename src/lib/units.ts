export interface UnitCategory {
  id: string;
  name: string;
  units: Unit[];
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

// Sample categories and units - in a real app, this would be much more comprehensive
export const unitCategories: UnitCategory[] = [
  {
    id: 'length',
    name: 'Length',
    units: [
      {
        id: 'meter',
        name: 'Meter',
        symbol: 'm',
        toBase: (value) => value,
        fromBase: (value) => value,
      },
      {
        id: 'kilometer',
        name: 'Kilometer',
        symbol: 'km',
        toBase: (value) => value * 1000,
        fromBase: (value) => value / 1000,
      },
      {
        id: 'centimeter',
        name: 'Centimeter',
        symbol: 'cm',
        toBase: (value) => value / 100,
        fromBase: (value) => value * 100,
      },
      {
        id: 'millimeter',
        name: 'Millimeter',
        symbol: 'mm',
        toBase: (value) => value / 1000,
        fromBase: (value) => value * 1000,
      },
      {
        id: 'inch',
        name: 'Inch',
        symbol: 'in',
        toBase: (value) => value * 0.0254,
        fromBase: (value) => value / 0.0254,
      },
      {
        id: 'foot',
        name: 'Foot',
        symbol: 'ft',
        toBase: (value) => value * 0.3048,
        fromBase: (value) => value / 0.3048,
      },
      {
        id: 'yard',
        name: 'Yard',
        symbol: 'yd',
        toBase: (value) => value * 0.9144,
        fromBase: (value) => value / 0.9144,
      },
      {
        id: 'mile',
        name: 'Mile',
        symbol: 'mi',
        toBase: (value) => value * 1609.344,
        fromBase: (value) => value / 1609.344,
      },
    ],
  },
  {
    id: 'mass',
    name: 'Mass',
    units: [
      {
        id: 'kilogram',
        name: 'Kilogram',
        symbol: 'kg',
        toBase: (value) => value,
        fromBase: (value) => value,
      },
      {
        id: 'gram',
        name: 'Gram',
        symbol: 'g',
        toBase: (value) => value / 1000,
        fromBase: (value) => value * 1000,
      },
      {
        id: 'milligram',
        name: 'Milligram',
        symbol: 'mg',
        toBase: (value) => value / 1000000,
        fromBase: (value) => value * 1000000,
      },
      {
        id: 'pound',
        name: 'Pound',
        symbol: 'lb',
        toBase: (value) => value * 0.45359237,
        fromBase: (value) => value / 0.45359237,
      },
      {
        id: 'ounce',
        name: 'Ounce',
        symbol: 'oz',
        toBase: (value) => value * 0.0283495231,
        fromBase: (value) => value / 0.0283495231,
      },
    ],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    units: [
      {
        id: 'celsius',
        name: 'Celsius',
        symbol: '°C',
        toBase: (value) => value,
        fromBase: (value) => value,
      },
      {
        id: 'fahrenheit',
        name: 'Fahrenheit',
        symbol: '°F',
        toBase: (value) => (value - 32) * (5/9),
        fromBase: (value) => value * (9/5) + 32,
      },
      {
        id: 'kelvin',
        name: 'Kelvin',
        symbol: 'K',
        toBase: (value) => value - 273.15,
        fromBase: (value) => value + 273.15,
      },
    ],
  },
  {
    id: 'volume',
    name: 'Volume',
    units: [
      {
        id: 'liter',
        name: 'Liter',
        symbol: 'L',
        toBase: (value) => value,
        fromBase: (value) => value,
      },
      {
        id: 'milliliter',
        name: 'Milliliter',
        symbol: 'mL',
        toBase: (value) => value / 1000,
        fromBase: (value) => value * 1000,
      },
      {
        id: 'cubic_meter',
        name: 'Cubic Meter',
        symbol: 'm³',
        toBase: (value) => value * 1000,
        fromBase: (value) => value / 1000,
      },
      {
        id: 'gallon_us',
        name: 'Gallon (US)',
        symbol: 'gal',
        toBase: (value) => value * 3.78541,
        fromBase: (value) => value / 3.78541,
      },
      {
        id: 'cup_us',
        name: 'Cup (US)',
        symbol: 'cup',
        toBase: (value) => value * 0.2365882365,
        fromBase: (value) => value / 0.2365882365,
      },
    ],
  },
  {
    id: 'area',
    name: 'Area',
    units: [
      {
        id: 'square_meter',
        name: 'Square Meter',
        symbol: 'm²',
        toBase: (value) => value,
        fromBase: (value) => value,
      },
      {
        id: 'square_kilometer',
        name: 'Square Kilometer',
        symbol: 'km²',
        toBase: (value) => value * 1000000,
        fromBase: (value) => value / 1000000,
      },
      {
        id: 'square_foot',
        name: 'Square Foot',
        symbol: 'ft²',
        toBase: (value) => value * 0.09290304,
        fromBase: (value) => value / 0.09290304,
      },
      {
        id: 'acre',
        name: 'Acre',
        symbol: 'ac',
        toBase: (value) => value * 4046.8564224,
        fromBase: (value) => value / 4046.8564224,
      },
      {
        id: 'hectare',
        name: 'Hectare',
        symbol: 'ha',
        toBase: (value) => value * 10000,
        fromBase: (value) => value / 10000,
      },
    ],
  },
  {
    id: 'time',
    name: 'Time',
    units: [
      {
        id: 'second',
        name: 'Second',
        symbol: 's',
        toBase: (value) => value,
        fromBase: (value) => value,
      },
      {
        id: 'minute',
        name: 'Minute',
        symbol: 'min',
        toBase: (value) => value * 60,
        fromBase: (value) => value / 60,
      },
      {
        id: 'hour',
        name: 'Hour',
        symbol: 'h',
        toBase: (value) => value * 3600,
        fromBase: (value) => value / 3600,
      },
      {
        id: 'day',
        name: 'Day',
        symbol: 'd',
        toBase: (value) => value * 86400,
        fromBase: (value) => value / 86400,
      },
      {
        id: 'week',
        name: 'Week',
        symbol: 'wk',
        toBase: (value) => value * 604800,
        fromBase: (value) => value / 604800,
      },
    ],
  },
  {
    id: 'speed',
    name: 'Speed',
    units: [
      {
        id: 'meter_per_second',
        name: 'Meter per Second',
        symbol: 'm/s',
        toBase: (value) => value,
        fromBase: (value) => value,
      },
      {
        id: 'kilometer_per_hour',
        name: 'Kilometer per Hour',
        symbol: 'km/h',
        toBase: (value) => value / 3.6,
        fromBase: (value) => value * 3.6,
      },
      {
        id: 'mile_per_hour',
        name: 'Mile per Hour',
        symbol: 'mph',
        toBase: (value) => value * 0.44704,
        fromBase: (value) => value / 0.44704,
      },
      {
        id: 'knot',
        name: 'Knot',
        symbol: 'kn',
        toBase: (value) => value * 0.514444444,
        fromBase: (value) => value / 0.514444444,
      },
    ],
  },
  {
    id: 'digital',
    name: 'Digital',
    units: [
      {
        id: 'bit',
        name: 'Bit',
        symbol: 'b',
        toBase: (value) => value,
        fromBase: (value) => value,
      },
      {
        id: 'byte',
        name: 'Byte',
        symbol: 'B',
        toBase: (value) => value * 8,
        fromBase: (value) => value / 8,
      },
      {
        id: 'kilobyte',
        name: 'Kilobyte',
        symbol: 'KB',
        toBase: (value) => value * 8 * 1024,
        fromBase: (value) => value / 8 / 1024,
      },
      {
        id: 'megabyte',
        name: 'Megabyte',
        symbol: 'MB',
        toBase: (value) => value * 8 * 1024 * 1024,
        fromBase: (value) => value / 8 / 1024 / 1024,
      },
      {
        id: 'gigabyte',
        name: 'Gigabyte',
        symbol: 'GB',
        toBase: (value) => value * 8 * 1024 * 1024 * 1024,
        fromBase: (value) => value / 8 / 1024 / 1024 / 1024,
      },
    ],
  },
];

export const getUnitById = (categoryId: string, unitId: string): Unit | undefined => {
  const category = unitCategories.find(cat => cat.id === categoryId);
  if (!category) return undefined;
  return category.units.find(unit => unit.id === unitId);
};

export const convert = (
  value: number,
  fromCategoryId: string,
  fromUnitId: string,
  toUnitId: string
): number | null => {
  const fromUnit = getUnitById(fromCategoryId, fromUnitId);
  const toUnit = getUnitById(fromCategoryId, toUnitId);
  
  if (!fromUnit || !toUnit) return null;
  
  // Convert from source unit to base unit, then from base unit to target unit
  const baseValue = fromUnit.toBase(value);
  return toUnit.fromBase(baseValue);
}; 