/**
 * Temperature Units
 * Collection of temperature measurement scales with precise conversion formulas
 */

import { UnitCategory, UnitCategoryId } from '../unit-types';

// Base category definition for temperature units
const temperatureCategory: UnitCategory = {
  id: UnitCategoryId.TEMPERATURE,
  name: 'Temperature',
  icon: 'thermometer',
  description: 'Temperature measurement scales',
  baseUnitId: 'celsius', // Celsius as base unit
  
  // Commonly used units for quick access
  popularUnits: [
    'celsius',
    'fahrenheit',
    'kelvin',
  ],
  
  // Temperature scales with precise conversion formulas
  units: [
    {
      id: 'celsius',
      name: 'Celsius',
      symbol: '°C',
      pluralName: 'degrees Celsius',
      aliases: ['centigrade', 'degrees Celsius', 'C', 'deg C'],
      baseUnit: true,
      // Base unit conversion (identity)
      toBase: value => value,
      fromBase: value => value,
      relatedUnits: ['fahrenheit', 'kelvin'],
      precision: 2,
      formatter: (value) => `${value.toFixed(2)}°C`,
    },
    {
      id: 'fahrenheit',
      name: 'Fahrenheit',
      symbol: '°F',
      pluralName: 'degrees Fahrenheit',
      aliases: ['degrees Fahrenheit', 'F', 'deg F'],
      // Precise formula: F = C × 9/5 + 32
      toBase: value => (value - 32) * (5/9),
      fromBase: value => value * (9/5) + 32,
      relatedUnits: ['celsius', 'rankine'],
      precision: 2,
      formatter: (value) => `${value.toFixed(2)}°F`,
    },
    {
      id: 'kelvin',
      name: 'Kelvin',
      symbol: 'K',
      pluralName: 'kelvins',
      aliases: ['kelvins', 'degrees Kelvin', 'deg K'],
      // K = C + 273.15
      toBase: value => value - 273.15,
      fromBase: value => value + 273.15,
      relatedUnits: ['celsius', 'rankine'],
      precision: 2,
      formatter: (value) => `${value.toFixed(2)} K`,
    },
    {
      id: 'rankine',
      name: 'Rankine',
      symbol: '°R',
      pluralName: 'degrees Rankine',
      aliases: ['degrees Rankine', 'R', 'deg R'],
      // Rankine is Fahrenheit-based absolute scale
      // R = F + 459.67 = C × 9/5 + 491.67
      toBase: value => (value - 491.67) * (5/9),
      fromBase: value => value * (9/5) + 491.67,
      relatedUnits: ['fahrenheit', 'kelvin'],
      precision: 2,
      formatter: (value) => `${value.toFixed(2)}°R`,
    },
    {
      id: 'reaumur',
      name: 'Réaumur',
      symbol: '°Ré',
      pluralName: 'degrees Réaumur',
      aliases: ['degrees Reaumur', 'Reaumur', 'Ré', 'Re'],
      // Ré = C × 4/5
      toBase: value => value * (5/4),
      fromBase: value => value * (4/5),
      precision: 2,
      formatter: (value) => `${value.toFixed(2)}°Ré`,
    },
    {
      id: 'delisle',
      name: 'Delisle',
      symbol: '°De',
      pluralName: 'degrees Delisle',
      aliases: ['degrees Delisle', 'Delisle', 'De'],
      // De = (100 - C) × 3/2
      toBase: value => 100 - value * (2/3),
      fromBase: value => (100 - value) * (3/2),
      precision: 2,
      formatter: (value) => `${value.toFixed(2)}°De`,
    },
    {
      id: 'newton',
      name: 'Newton',
      symbol: '°N',
      pluralName: 'degrees Newton',
      aliases: ['degrees Newton', 'Newton', 'N'],
      // N = C × 33/100
      toBase: value => value * (100/33),
      fromBase: value => value * (33/100),
      precision: 2,
      formatter: (value) => `${value.toFixed(2)}°N`,
    },
    {
      id: 'romer',
      name: 'Rømer',
      symbol: '°Rø',
      pluralName: 'degrees Rømer',
      aliases: ['degrees Romer', 'Romer', 'Rømer', 'Rø', 'Ro'],
      // Rø = C × 21/40 + 7.5
      toBase: value => (value - 7.5) * (40/21),
      fromBase: value => value * (21/40) + 7.5,
      precision: 2,
      formatter: (value) => `${value.toFixed(2)}°Rø`,
    },
    {
      id: 'planck_temperature',
      name: 'Planck Temperature',
      symbol: 'TP',
      pluralName: 'Planck temperatures',
      aliases: ['Planck temperature', 'TP'],
      // TP = C / (1.416784e32)
      toBase: value => value * 1.416784e32,
      fromBase: value => value / 1.416784e32,
      precision: 38, // Extreme precision needed
      formatter: (value) => `${value.toExponential(6)} TP`,
    },
    {
      id: 'gas_mark',
      name: 'Gas Mark',
      symbol: 'G',
      pluralName: 'gas marks',
      aliases: ['gas mark'],
      // Complex formula based on UK oven settings
      // Approximation: Gas Mark 1 = 275°F = 135°C, with 25°F/13.9°C increments
      toBase: value => {
        if (value <= 0) return 135 - 13.9 * Math.abs(value);
        if (value <= 1) return 135;
        return 135 + 13.9 * (value - 1);
      },
      fromBase: value => {
        if (value < 135) return -((135 - value) / 13.9);
        if (value === 135) return 1;
        return ((value - 135) / 13.9) + 1;
      },
      precision: 1,
      formatter: (value) => `Gas Mark ${value.toFixed(1)}`,
    }
  ]
};

export default temperatureCategory; 