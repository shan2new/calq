/**
 * Digital Units
 * Comprehensive set of digital information measurement units
 */

import { UnitCategory, UnitCategoryId } from '../unit-types';

// Base category definition for digital information units
const digitalCategory: UnitCategory = {
  id: UnitCategoryId.DIGITAL,
  name: 'Digital',
  icon: 'database',
  description: 'Units for measuring digital information',
  baseUnitId: 'byte',
  
  // Commonly used units for quick access
  popularUnits: [
    'byte',
    'kilobyte',
    'megabyte',
    'gigabyte',
    'terabyte',
    'bit'
  ],
  
  // Organized into subcategories for better navigation
  subcategories: [
    {
      id: 'binary',
      name: 'Binary (IEC)',
      description: 'Binary-based units (power of 2) as defined by IEC',
      units: [
        {
          id: 'bit',
          name: 'Bit',
          symbol: 'bit',
          pluralName: 'bits',
          aliases: ['bits', 'b'],
          conversionFactor: 0.125,
          toBase: value => value * 0.125,
          fromBase: value => value / 0.125,
          precision: 0,
        },
        {
          id: 'byte',
          name: 'Byte',
          symbol: 'B',
          pluralName: 'bytes',
          aliases: ['bytes'],
          baseUnit: true,
          toBase: value => value,
          fromBase: value => value,
          precision: 0,
        },
        {
          id: 'kibibyte',
          name: 'Kibibyte',
          symbol: 'KiB',
          pluralName: 'kibibytes',
          aliases: ['kibibytes', 'KiB'],
          conversionFactor: 1024,
          toBase: value => value * 1024,
          fromBase: value => value / 1024,
          precision: 2,
        },
        {
          id: 'mebibyte',
          name: 'Mebibyte',
          symbol: 'MiB',
          pluralName: 'mebibytes',
          aliases: ['mebibytes', 'MiB'],
          conversionFactor: 1048576, // 1024²
          toBase: value => value * 1048576,
          fromBase: value => value / 1048576,
          precision: 2,
        },
        {
          id: 'gibibyte',
          name: 'Gibibyte',
          symbol: 'GiB',
          pluralName: 'gibibytes',
          aliases: ['gibibytes', 'GiB'],
          conversionFactor: 1073741824, // 1024³
          toBase: value => value * 1073741824,
          fromBase: value => value / 1073741824,
          precision: 2,
        },
        {
          id: 'tebibyte',
          name: 'Tebibyte',
          symbol: 'TiB',
          pluralName: 'tebibytes',
          aliases: ['tebibytes', 'TiB'],
          conversionFactor: 1099511627776, // 1024⁴
          toBase: value => value * 1099511627776,
          fromBase: value => value / 1099511627776,
          precision: 2,
        },
        {
          id: 'pebibyte',
          name: 'Pebibyte',
          symbol: 'PiB',
          pluralName: 'pebibytes',
          aliases: ['pebibytes', 'PiB'],
          conversionFactor: 1125899906842624, // 1024⁵
          toBase: value => value * 1125899906842624,
          fromBase: value => value / 1125899906842624,
          precision: 2,
        },
        {
          id: 'exbibyte',
          name: 'Exbibyte',
          symbol: 'EiB',
          pluralName: 'exbibytes',
          aliases: ['exbibytes', 'EiB'],
          conversionFactor: 1152921504606846976, // 1024⁶
          toBase: value => value * 1152921504606846976,
          fromBase: value => value / 1152921504606846976,
          precision: 2,
        }
      ],
      popularUnits: ['kibibyte', 'mebibyte', 'gibibyte'],
    },
    {
      id: 'decimal',
      name: 'Decimal (SI)',
      description: 'Decimal-based units (power of 10) as defined by SI',
      units: [
        {
          id: 'kilobyte',
          name: 'Kilobyte',
          symbol: 'KB',
          pluralName: 'kilobytes',
          aliases: ['kilobytes', 'KB'],
          conversionFactor: 1000,
          toBase: value => value * 1000,
          fromBase: value => value / 1000,
          precision: 2,
        },
        {
          id: 'megabyte',
          name: 'Megabyte',
          symbol: 'MB',
          pluralName: 'megabytes',
          aliases: ['megabytes', 'MB'],
          conversionFactor: 1000000, // 1000²
          toBase: value => value * 1000000,
          fromBase: value => value / 1000000,
          precision: 2,
        },
        {
          id: 'gigabyte',
          name: 'Gigabyte',
          symbol: 'GB',
          pluralName: 'gigabytes',
          aliases: ['gigabytes', 'GB'],
          conversionFactor: 1000000000, // 1000³
          toBase: value => value * 1000000000,
          fromBase: value => value / 1000000000,
          precision: 2,
        },
        {
          id: 'terabyte',
          name: 'Terabyte',
          symbol: 'TB',
          pluralName: 'terabytes',
          aliases: ['terabytes', 'TB'],
          conversionFactor: 1000000000000, // 1000⁴
          toBase: value => value * 1000000000000,
          fromBase: value => value / 1000000000000,
          precision: 2,
        },
        {
          id: 'petabyte',
          name: 'Petabyte',
          symbol: 'PB',
          pluralName: 'petabytes',
          aliases: ['petabytes', 'PB'],
          conversionFactor: 1000000000000000, // 1000⁵
          toBase: value => value * 1000000000000000,
          fromBase: value => value / 1000000000000000,
          precision: 2,
        },
        {
          id: 'exabyte',
          name: 'Exabyte',
          symbol: 'EB',
          pluralName: 'exabytes',
          aliases: ['exabytes', 'EB'],
          conversionFactor: 1000000000000000000, // 1000⁶
          toBase: value => value * 1000000000000000000,
          fromBase: value => value / 1000000000000000000,
          precision: 2,
        }
      ],
      popularUnits: ['kilobyte', 'megabyte', 'gigabyte', 'terabyte'],
    },
    {
      id: 'bits',
      name: 'Bits',
      description: 'Bit-based units of digital information',
      units: [
        {
          id: 'kilobit',
          name: 'Kilobit',
          symbol: 'Kb',
          pluralName: 'kilobits',
          aliases: ['kilobits', 'Kb', 'Kbit'],
          conversionFactor: 125, // 1000/8
          toBase: value => value * 125,
          fromBase: value => value / 125,
          precision: 2,
        },
        {
          id: 'megabit',
          name: 'Megabit',
          symbol: 'Mb',
          pluralName: 'megabits',
          aliases: ['megabits', 'Mb', 'Mbit'],
          conversionFactor: 125000, // 1000²/8
          toBase: value => value * 125000,
          fromBase: value => value / 125000,
          precision: 2,
        },
        {
          id: 'gigabit',
          name: 'Gigabit',
          symbol: 'Gb',
          pluralName: 'gigabits',
          aliases: ['gigabits', 'Gb', 'Gbit'],
          conversionFactor: 125000000, // 1000³/8
          toBase: value => value * 125000000,
          fromBase: value => value / 125000000,
          precision: 2,
        },
        {
          id: 'terabit',
          name: 'Terabit',
          symbol: 'Tb',
          pluralName: 'terabits',
          aliases: ['terabits', 'Tb', 'Tbit'],
          conversionFactor: 125000000000, // 1000⁴/8
          toBase: value => value * 125000000000,
          fromBase: value => value / 125000000000,
          precision: 2,
        },
        {
          id: 'kibibit',
          name: 'Kibibit',
          symbol: 'Kib',
          pluralName: 'kibibits',
          aliases: ['kibibits', 'Kib', 'Kibit'],
          conversionFactor: 128, // 1024/8
          toBase: value => value * 128,
          fromBase: value => value / 128,
          precision: 2,
        },
        {
          id: 'mebibit',
          name: 'Mebibit',
          symbol: 'Mib',
          pluralName: 'mebibits',
          aliases: ['mebibits', 'Mib', 'Mibit'],
          conversionFactor: 131072, // 1024²/8
          toBase: value => value * 131072,
          fromBase: value => value / 131072,
          precision: 2,
        },
        {
          id: 'gibibit',
          name: 'Gibibit',
          symbol: 'Gib',
          pluralName: 'gibibits',
          aliases: ['gibibits', 'Gib', 'Gibit'],
          conversionFactor: 134217728, // 1024³/8
          toBase: value => value * 134217728,
          fromBase: value => value / 134217728,
          precision: 2,
        }
      ],
      popularUnits: ['bit', 'megabit', 'gigabit'],
    },
    {
      id: 'computing',
      name: 'Computing',
      description: 'Units used in computing and networking',
      units: [
        {
          id: 'word',
          name: 'Word',
          symbol: 'word',
          pluralName: 'words',
          aliases: ['words', 'computer word'],
          // A word is typically 4 bytes on 32-bit systems
          conversionFactor: 4,
          toBase: value => value * 4,
          fromBase: value => value / 4,
          precision: 0,
        },
        {
          id: 'nibble',
          name: 'Nibble',
          symbol: 'nibble',
          pluralName: 'nibbles',
          aliases: ['nibbles', 'nybble', 'nyble', 'half-byte'],
          conversionFactor: 0.5,
          toBase: value => value * 0.5,
          fromBase: value => value / 0.5,
          precision: 0,
        },
        {
          id: 'octet',
          name: 'Octet',
          symbol: 'octet',
          pluralName: 'octets',
          aliases: ['octets'],
          // An octet is exactly one byte
          conversionFactor: 1,
          toBase: value => value * 1,
          fromBase: value => value / 1,
          precision: 0,
        },
        {
          id: 'sector',
          name: 'Sector',
          symbol: 'sector',
          pluralName: 'sectors',
          aliases: ['sectors', 'disk sector'],
          // Traditional disk sector is 512 bytes
          conversionFactor: 512,
          toBase: value => value * 512,
          fromBase: value => value / 512,
          precision: 0,
        },
        {
          id: 'cluster',
          name: 'Cluster',
          symbol: 'cluster',
          pluralName: 'clusters',
          aliases: ['clusters', 'disk cluster'],
          // Typical disk cluster (4KB)
          conversionFactor: 4096,
          toBase: value => value * 4096,
          fromBase: value => value / 4096,
          precision: 0,
        }
      ],
      popularUnits: ['word', 'nibble', 'octet'],
    }
  ]
};

export default digitalCategory; 