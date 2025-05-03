/**
 * User preferences and smart defaults management
 */

import { UnitCategoryId } from './unit-types';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultUnits: Record<string, {
    fromUnit: string;
    toUnit: string;
  }>;
  recentCategories: string[];
  showTooltips: boolean;
  useMetricSystem: boolean;
  decimalSeparator: '.' | ',';
}

// Default preferences
const defaultPreferences: UserPreferences = {
  theme: 'system',
  defaultUnits: {
    // Set some sensible defaults for common categories
    [UnitCategoryId.LENGTH]: {
      fromUnit: 'meter',
      toUnit: 'kilometer'
    },
    [UnitCategoryId.MASS]: {
      fromUnit: 'kilogram',
      toUnit: 'gram'
    },
    [UnitCategoryId.TIME]: {
      fromUnit: 'second',
      toUnit: 'minute'
    },
    [UnitCategoryId.TEMPERATURE]: {
      fromUnit: 'celsius',
      toUnit: 'fahrenheit'
    },
    [UnitCategoryId.VOLUME]: {
      fromUnit: 'liter',
      toUnit: 'milliliter'
    }
  },
  recentCategories: [],
  showTooltips: true,
  useMetricSystem: true,
  decimalSeparator: '.'
};

// Get the user's preferences from localStorage
export const getUserPreferences = (): UserPreferences => {
  try {
    const storedPrefs = localStorage.getItem('calcq_preferences');
    if (storedPrefs) {
      return { ...defaultPreferences, ...JSON.parse(storedPrefs) };
    }
  } catch (error) {
    console.error('Error reading preferences:', error);
  }
  
  return { ...defaultPreferences };
};

// Save user preferences to localStorage
export const saveUserPreferences = (preferences: Partial<UserPreferences>) => {
  try {
    const current = getUserPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem('calcq_preferences', JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
};

// Detect regional preferences based on browser locale
export const detectRegionalPreferences = (): Partial<UserPreferences> => {
  const locale = navigator.language || 'en-US';
  const isMetric = !['US', 'LR', 'MM'].includes(locale.split('-')[1] || '');
  
  // Create regional default units
  const defaultUnits: Record<string, { fromUnit: string; toUnit: string }> = {};
  
  if (isMetric) {
    // Metric system defaults
    defaultUnits[UnitCategoryId.LENGTH] = { fromUnit: 'meter', toUnit: 'kilometer' };
    defaultUnits[UnitCategoryId.MASS] = { fromUnit: 'kilogram', toUnit: 'gram' };
    defaultUnits[UnitCategoryId.VOLUME] = { fromUnit: 'liter', toUnit: 'milliliter' };
    defaultUnits[UnitCategoryId.TEMPERATURE] = { fromUnit: 'celsius', toUnit: 'fahrenheit' };
  } else {
    // Imperial system defaults
    defaultUnits[UnitCategoryId.LENGTH] = { fromUnit: 'foot', toUnit: 'inch' };
    defaultUnits[UnitCategoryId.MASS] = { fromUnit: 'pound', toUnit: 'ounce' };
    defaultUnits[UnitCategoryId.VOLUME] = { fromUnit: 'gallon_us', toUnit: 'quart_us' };
    defaultUnits[UnitCategoryId.TEMPERATURE] = { fromUnit: 'fahrenheit', toUnit: 'celsius' };
  }
  
  // Decimal separator preference
  const formatter = new Intl.NumberFormat(locale);
  const formattedNumber = formatter.format(1.1);
  const decimalSeparator = formattedNumber.charAt(1) as '.' | ',';
  
  return {
    useMetricSystem: isMetric,
    defaultUnits,
    decimalSeparator
  };
};

// Initialize user preferences with regional defaults if not yet set
export const initializeUserPreferences = (): UserPreferences => {
  try {
    const existingPrefs = localStorage.getItem('calcq_preferences');
    if (!existingPrefs) {
      const regionalPrefs = detectRegionalPreferences();
      const initialPrefs = { ...defaultPreferences, ...regionalPrefs };
      localStorage.setItem('calcq_preferences', JSON.stringify(initialPrefs));
      return initialPrefs;
    }
    return getUserPreferences();
  } catch (error) {
    console.error('Error initializing preferences:', error);
    return defaultPreferences;
  }
};

// Save last used units for a category
export const saveLastUsedUnits = (
  categoryId: string,
  fromUnit: string,
  toUnit: string
) => {
  try {
    const prefs = getUserPreferences();
    prefs.defaultUnits[categoryId] = { fromUnit, toUnit };
    saveUserPreferences({ defaultUnits: prefs.defaultUnits });
  } catch (error) {
    console.error('Error saving last used units:', error);
  }
};

// Get default units for a category
export const getDefaultUnits = (categoryId: string): { fromUnit: string; toUnit: string } => {
  try {
    const prefs = getUserPreferences();
    return prefs.defaultUnits[categoryId] || { fromUnit: '', toUnit: '' };
  } catch (error) {
    console.error('Error getting default units:', error);
    return { fromUnit: '', toUnit: '' };
  }
};

// Add a category to recent categories
export const addToRecentCategories = (categoryId: string) => {
  try {
    const prefs = getUserPreferences();
    
    // Remove category if it already exists
    const filtered = prefs.recentCategories.filter(id => id !== categoryId);
    
    // Add to beginning and limit to 5 items
    prefs.recentCategories = [categoryId, ...filtered].slice(0, 5);
    
    saveUserPreferences({ recentCategories: prefs.recentCategories });
  } catch (error) {
    console.error('Error updating recent categories:', error);
  }
};

// Get recent categories
export const getRecentCategories = (): string[] => {
  try {
    const prefs = getUserPreferences();
    return prefs.recentCategories;
  } catch (error) {
    console.error('Error getting recent categories:', error);
    return [];
  }
};

// Export the module for use in the application
export default {
  getUserPreferences,
  saveUserPreferences,
  detectRegionalPreferences,
  initializeUserPreferences,
  saveLastUsedUnits,
  getDefaultUnits,
  addToRecentCategories,
  getRecentCategories
}; 