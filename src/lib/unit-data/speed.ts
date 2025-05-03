/**
 * Speed Units
 * Comprehensive set of speed/velocity measurement units
 */

import { UnitCategory, UnitCategoryId } from '../unit-types';

// Base category definition for speed units
const speedCategory: UnitCategory = {
  id: UnitCategoryId.SPEED,
  name: 'Speed',
  icon: 'gauge',
  description: 'Units for measuring velocity or speed',
  baseUnitId: 'meter_per_second',
  
  // Commonly used units for quick access
  popularUnits: [
    'meter_per_second',
    'kilometer_per_hour',
    'mile_per_hour',
    'knot',
    'foot_per_second',
  ],
  
  // Organized into subcategories for better navigation
  subcategories: [
    {
      id: 'metric',
      name: 'Metric',
      description: 'Speed units based on metric distance units',
      units: [
        {
          id: 'meter_per_second',
          name: 'Meter per Second',
          symbol: 'm/s',
          pluralName: 'meters per second',
          aliases: ['metres per second', 'meters per second', 'm/sec'],
          baseUnit: true,
          toBase: value => value,
          fromBase: value => value,
          precision: 2,
        },
        {
          id: 'kilometer_per_second',
          name: 'Kilometer per Second',
          symbol: 'km/s',
          pluralName: 'kilometers per second',
          aliases: ['kilometres per second', 'kilometers per second', 'km/sec'],
          conversionFactor: 1000,
          toBase: value => value * 1000,
          fromBase: value => value / 1000,
          precision: 3,
        },
        {
          id: 'kilometer_per_hour',
          name: 'Kilometer per Hour',
          symbol: 'km/h',
          pluralName: 'kilometers per hour',
          aliases: ['kilometres per hour', 'kilometers per hour', 'kph'],
          conversionFactor: 0.2777777777778,
          toBase: value => value * 0.2777777777778,
          fromBase: value => value / 0.2777777777778,
          relatedUnits: ['mile_per_hour'],
          precision: 1,
        },
        {
          id: 'centimeter_per_second',
          name: 'Centimeter per Second',
          symbol: 'cm/s',
          pluralName: 'centimeters per second',
          aliases: ['centimetres per second', 'centimeters per second', 'cm/sec'],
          conversionFactor: 0.01,
          toBase: value => value * 0.01,
          fromBase: value => value / 0.01,
          precision: 2,
        },
        {
          id: 'millimeter_per_second',
          name: 'Millimeter per Second',
          symbol: 'mm/s',
          pluralName: 'millimeters per second',
          aliases: ['millimetres per second', 'millimeters per second', 'mm/sec'],
          conversionFactor: 0.001,
          toBase: value => value * 0.001,
          fromBase: value => value / 0.001,
          precision: 2,
        }
      ],
      popularUnits: ['meter_per_second', 'kilometer_per_hour'],
    },
    {
      id: 'imperial',
      name: 'Imperial & US',
      description: 'Speed units based on imperial distance units',
      units: [
        {
          id: 'mile_per_hour',
          name: 'Mile per Hour',
          symbol: 'mph',
          pluralName: 'miles per hour',
          aliases: ['miles per hour', 'MPH', 'mi/h'],
          conversionFactor: 0.44704,
          toBase: value => value * 0.44704,
          fromBase: value => value / 0.44704,
          relatedUnits: ['kilometer_per_hour', 'foot_per_second'],
          precision: 1,
        },
        {
          id: 'mile_per_second',
          name: 'Mile per Second',
          symbol: 'mi/s',
          pluralName: 'miles per second',
          aliases: ['miles per second', 'mps', 'mi/sec'],
          conversionFactor: 1609.344,
          toBase: value => value * 1609.344,
          fromBase: value => value / 1609.344,
          precision: 3,
        },
        {
          id: 'foot_per_second',
          name: 'Foot per Second',
          symbol: 'ft/s',
          pluralName: 'feet per second',
          aliases: ['feet per second', 'fps', 'ft/sec'],
          conversionFactor: 0.3048,
          toBase: value => value * 0.3048,
          fromBase: value => value / 0.3048,
          relatedUnits: ['meter_per_second', 'mile_per_hour'],
          precision: 2,
        },
        {
          id: 'foot_per_minute',
          name: 'Foot per Minute',
          symbol: 'ft/min',
          pluralName: 'feet per minute',
          aliases: ['feet per minute', 'fpm'],
          conversionFactor: 0.00508,
          toBase: value => value * 0.00508,
          fromBase: value => value / 0.00508,
          precision: 2,
        },
        {
          id: 'inch_per_second',
          name: 'Inch per Second',
          symbol: 'in/s',
          pluralName: 'inches per second',
          aliases: ['inches per second', 'ips', 'in/sec'],
          conversionFactor: 0.0254,
          toBase: value => value * 0.0254,
          fromBase: value => value / 0.0254,
          precision: 2,
        }
      ],
      popularUnits: ['mile_per_hour', 'foot_per_second'],
    },
    {
      id: 'maritime',
      name: 'Maritime',
      description: 'Speed units used in maritime and aviation contexts',
      units: [
        {
          id: 'knot',
          name: 'Knot',
          symbol: 'kn',
          pluralName: 'knots',
          aliases: ['knots', 'kt', 'kts', 'nautical mile per hour'],
          conversionFactor: 0.5144444444,
          toBase: value => value * 0.5144444444,
          fromBase: value => value / 0.5144444444,
          relatedUnits: ['kilometer_per_hour', 'mile_per_hour'],
          precision: 1,
        },
        {
          id: 'beaufort',
          name: 'Beaufort',
          symbol: 'Bft',
          pluralName: 'beaufort',
          aliases: ['beaufort scale', 'beaufort number'],
          // Beaufort scale is not linear, this is an approximation
          toBase: value => {
            // Simplified formula: v = 0.836 * B^(3/2) m/s
            return 0.836 * Math.pow(value, 1.5);
          },
          fromBase: value => {
            // Simplified inverse: B = (v/0.836)^(2/3)
            return Math.pow(value / 0.836, 2/3);
          },
          precision: 0,
        }
      ],
      popularUnits: ['knot'],
    },
    {
      id: 'physics',
      name: 'Physics',
      description: 'Speed units used in physics and astronomy',
      units: [
        {
          id: 'speed_of_light',
          name: 'Speed of Light',
          symbol: 'c',
          pluralName: 'speed of light',
          aliases: ['lightspeed', 'c', 'speed of light in vacuum'],
          conversionFactor: 299792458,
          toBase: value => value * 299792458,
          fromBase: value => value / 299792458,
          precision: 8,
        },
        {
          id: 'speed_of_sound',
          name: 'Speed of Sound',
          symbol: 'Mach',
          pluralName: 'mach',
          aliases: ['mach', 'mach number', 'speed of sound in air'],
          // Speed of sound at sea level, 20°C
          conversionFactor: 343,
          toBase: value => value * 343,
          fromBase: value => value / 343,
          precision: 3,
        },
        {
          id: 'earth_orbital_velocity',
          name: 'Earth Orbital Velocity',
          symbol: 'EOV',
          pluralName: 'earth orbital velocities',
          aliases: ['earth orbital velocity'],
          conversionFactor: 29780,
          toBase: value => value * 29780,
          fromBase: value => value / 29780,
          precision: 4,
        }
      ],
      popularUnits: ['speed_of_light', 'speed_of_sound'],
    }
  ]
};

export default speedCategory; 