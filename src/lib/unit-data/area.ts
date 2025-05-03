/**
 * Area Units
 * Comprehensive set of area measurement units
 */

import { UnitCategory, UnitCategoryId } from '../unit-types';

// Base category definition for area units
const areaCategory: UnitCategory = {
  id: UnitCategoryId.AREA,
  name: 'Area',
  icon: 'square',
  description: 'Units for measuring two-dimensional space',
  baseUnitId: 'square_meter',
  
  // Commonly used units for quick access
  popularUnits: [
    'square_meter',
    'square_kilometer',
    'square_foot',
    'acre',
    'hectare',
  ],
  
  // Organized into subcategories for better navigation
  subcategories: [
    {
      id: 'metric',
      name: 'Metric',
      description: 'International System of Units (SI)',
      units: [
        {
          id: 'square_meter',
          name: 'Square Meter',
          symbol: 'm²',
          pluralName: 'square meters',
          aliases: ['square metres', 'square meters', 'sq m'],
          baseUnit: true,
          toBase: value => value,
          fromBase: value => value,
          precision: 2,
        },
        {
          id: 'square_kilometer',
          name: 'Square Kilometer',
          symbol: 'km²',
          pluralName: 'square kilometers',
          aliases: ['square kilometres', 'square kilometers', 'sq km'],
          conversionFactor: 1000000,
          toBase: value => value * 1000000,
          fromBase: value => value / 1000000,
          precision: 4,
        },
        {
          id: 'square_centimeter',
          name: 'Square Centimeter',
          symbol: 'cm²',
          pluralName: 'square centimeters',
          aliases: ['square centimetres', 'square centimeters', 'sq cm'],
          conversionFactor: 0.0001,
          toBase: value => value * 0.0001,
          fromBase: value => value / 0.0001,
          precision: 2,
        },
        {
          id: 'square_millimeter',
          name: 'Square Millimeter',
          symbol: 'mm²',
          pluralName: 'square millimeters',
          aliases: ['square millimetres', 'square millimeters', 'sq mm'],
          conversionFactor: 0.000001,
          toBase: value => value * 0.000001,
          fromBase: value => value / 0.000001,
          precision: 2,
        },
        {
          id: 'hectare',
          name: 'Hectare',
          symbol: 'ha',
          pluralName: 'hectares',
          aliases: ['hectares'],
          conversionFactor: 10000,
          toBase: value => value * 10000,
          fromBase: value => value / 10000,
          relatedUnits: ['acre'],
          precision: 4,
        },
        {
          id: 'are',
          name: 'Are',
          symbol: 'a',
          pluralName: 'ares',
          aliases: ['ares'],
          conversionFactor: 100,
          toBase: value => value * 100,
          fromBase: value => value / 100,
          precision: 2,
        }
      ],
      popularUnits: ['square_meter', 'square_kilometer', 'hectare'],
    },
    {
      id: 'imperial',
      name: 'Imperial & US',
      description: 'US and UK measurement systems',
      units: [
        {
          id: 'square_inch',
          name: 'Square Inch',
          symbol: 'in²',
          pluralName: 'square inches',
          aliases: ['square inches', 'sq in'],
          conversionFactor: 0.00064516,
          toBase: value => value * 0.00064516,
          fromBase: value => value / 0.00064516,
          precision: 2,
        },
        {
          id: 'square_foot',
          name: 'Square Foot',
          symbol: 'ft²',
          pluralName: 'square feet',
          aliases: ['square feet', 'sq ft'],
          conversionFactor: 0.092903,
          toBase: value => value * 0.092903,
          fromBase: value => value / 0.092903,
          relatedUnits: ['square_meter', 'square_yard'],
          precision: 2,
        },
        {
          id: 'square_yard',
          name: 'Square Yard',
          symbol: 'yd²',
          pluralName: 'square yards',
          aliases: ['square yards', 'sq yd'],
          conversionFactor: 0.836127,
          toBase: value => value * 0.836127,
          fromBase: value => value / 0.836127,
          relatedUnits: ['square_foot', 'square_meter'],
          precision: 2,
        },
        {
          id: 'square_mile',
          name: 'Square Mile',
          symbol: 'mi²',
          pluralName: 'square miles',
          aliases: ['square miles', 'sq mi'],
          conversionFactor: 2589988.11,
          toBase: value => value * 2589988.11,
          fromBase: value => value / 2589988.11,
          relatedUnits: ['square_kilometer', 'acre'],
          precision: 4,
        },
        {
          id: 'acre',
          name: 'Acre',
          symbol: 'ac',
          pluralName: 'acres',
          aliases: ['acres'],
          conversionFactor: 4046.86,
          toBase: value => value * 4046.86,
          fromBase: value => value / 4046.86,
          relatedUnits: ['hectare', 'square_foot'],
          precision: 4,
        },
        {
          id: 'rood',
          name: 'Rood',
          symbol: 'ro',
          pluralName: 'roods',
          aliases: ['roods'],
          conversionFactor: 1011.71,
          toBase: value => value * 1011.71,
          fromBase: value => value / 1011.71,
          precision: 2,
        },
      ],
      popularUnits: ['square_foot', 'acre', 'square_mile'],
    },
    {
      id: 'survey',
      name: 'Land Survey',
      description: 'Units used in property and land surveying',
      units: [
        {
          id: 'township',
          name: 'Township',
          symbol: 'twp',
          pluralName: 'townships',
          aliases: ['townships'],
          conversionFactor: 93239571.972,
          toBase: value => value * 93239571.972,
          fromBase: value => value / 93239571.972,
          precision: 4,
        },
        {
          id: 'section',
          name: 'Section',
          symbol: 'sec',
          pluralName: 'sections',
          aliases: ['sections'],
          conversionFactor: 2589988.11,
          toBase: value => value * 2589988.11,
          fromBase: value => value / 2589988.11,
          precision: 4,
        },
        {
          id: 'homestead',
          name: 'Homestead',
          symbol: 'homestead',
          pluralName: 'homesteads',
          aliases: ['homesteads', 'quarter section'],
          conversionFactor: 647497.028,
          toBase: value => value * 647497.028,
          fromBase: value => value / 647497.028,
          precision: 3,
        }
      ],
      popularUnits: ['section', 'township'],
    },
    {
      id: 'computing',
      name: 'Computing',
      description: 'Units used in display and graphics',
      units: [
        {
          id: 'pixel',
          name: 'Pixel',
          symbol: 'px',
          pluralName: 'pixels',
          aliases: ['pixels', 'px'],
          // Conversion is approximate as pixels are relative
          conversionFactor: 0.0000001,
          toBase: value => value * 0.0000001,
          fromBase: value => value / 0.0000001,
          precision: 0,
        }
      ],
      popularUnits: ['pixel'],
    }
  ]
};

export default areaCategory; 