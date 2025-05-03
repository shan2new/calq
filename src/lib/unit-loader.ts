/**
 * Unit Loader: Manages lazy loading of unit data by category
 * Provides caching and preloading functionality to optimize performance
 */

import { UnitCategory, UnitCategoryId } from './unit-types';
import { addToSearchIndex } from './unit-search';

// Map of dynamic imports for each category
// This enables code splitting and lazy loading of unit data
const unitModules: Record<string, () => Promise<{ default: UnitCategory }>> = {
  [UnitCategoryId.LENGTH]: () => import('./unit-data/length'),
  [UnitCategoryId.MASS]: () => import('./unit-data/mass'),
  [UnitCategoryId.TEMPERATURE]: () => import('./unit-data/temperature'),
  [UnitCategoryId.VOLUME]: () => import('./unit-data/volume'),
  [UnitCategoryId.AREA]: () => import('./unit-data/area'),
  [UnitCategoryId.TIME]: () => import('./unit-data/time'),
  [UnitCategoryId.SPEED]: () => import('./unit-data/speed'),
  [UnitCategoryId.DIGITAL]: () => import('./unit-data/digital'),
  // Additional categories would be added here
};

// Cache loaded modules to prevent redundant imports
const loadedCategories = new Map<string, UnitCategory>();

// Loading status to prevent duplicate loading requests
const loadingPromises = new Map<string, Promise<UnitCategory>>();

/**
 * Load a unit category with caching
 * @param categoryId - The category to load
 * @returns Promise resolving to the unit category data
 */
export async function loadUnitCategory(categoryId: string): Promise<UnitCategory> {
  // Return from cache if available
  if (loadedCategories.has(categoryId)) {
    return loadedCategories.get(categoryId)!;
  }
  
  // Return existing promise if category is already loading
  if (loadingPromises.has(categoryId)) {
    return loadingPromises.get(categoryId)!;
  }
  
  // Start loading if module exists
  if (unitModules[categoryId]) {
    const loadPromise = unitModules[categoryId]()
      .then(module => {
        // Store in cache
        loadedCategories.set(categoryId, module.default);
        // Add to search index
        addToSearchIndex(categoryId, module.default);
        // Clear from loading promises
        loadingPromises.delete(categoryId);
        // Return the data
        return module.default;
      })
      .catch(error => {
        console.error(`Failed to load unit category: ${categoryId}`, error);
        loadingPromises.delete(categoryId);
        throw error;
      });
    
    // Store the promise to prevent duplicate loading
    loadingPromises.set(categoryId, loadPromise);
    return loadPromise;
  }
  
  throw new Error(`Unknown unit category: ${categoryId}`);
}

/**
 * Check if a category is loaded
 * @param categoryId - The category to check
 * @returns Whether the category is loaded
 */
export function isCategoryLoaded(categoryId: string): boolean {
  return loadedCategories.has(categoryId);
}

/**
 * Get list of all loaded categories
 * @returns Array of loaded category IDs
 */
export function getLoadedCategories(): string[] {
  return Array.from(loadedCategories.keys());
}

/**
 * Preload frequently used categories
 * @param categories - Array of category IDs to preload
 */
export function preloadCategories(categories: string[]): void {
  if ('requestIdleCallback' in window) {
    // Use idle time to load categories without impacting performance
    window.requestIdleCallback(() => {
      categories.forEach(categoryId => {
        if (!loadedCategories.has(categoryId) && !loadingPromises.has(categoryId)) {
          loadUnitCategory(categoryId).catch(err => {
            console.warn(`Preloading category ${categoryId} failed:`, err);
          });
        }
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      categories.forEach(categoryId => {
        if (!loadedCategories.has(categoryId) && !loadingPromises.has(categoryId)) {
          loadUnitCategory(categoryId).catch(err => {
            console.warn(`Preloading category ${categoryId} failed:`, err);
          });
        }
      });
    }, 1000);
  }
}

/**
 * Preload common categories based on user history
 * @param historyData - Array of recent conversions
 * @param limit - Maximum number of categories to preload
 */
export function preloadCommonCategories(
  historyData: Array<{ category: string }>,
  limit = 3
): void {
  // Count category occurrences
  const categoryCounts: Record<string, number> = {};
  
  historyData.forEach(item => {
    const { category } = item;
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });
  
  // Sort by occurrence count and take top N
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([categoryId]) => categoryId);
  
  // Preload the top categories
  preloadCategories(topCategories);
}

/**
 * Initialize essential categories for immediate use
 * @returns Promise that resolves when essential categories are loaded
 */
export async function initializeEssentialCategories(): Promise<void> {
  // Define essential categories that should be available immediately
  const essentialCategories = [
    UnitCategoryId.LENGTH,
    UnitCategoryId.MASS,
    UnitCategoryId.TEMPERATURE
  ];
  
  // Load all essential categories in parallel
  await Promise.all(
    essentialCategories.map(categoryId => 
      loadUnitCategory(categoryId).catch(err => {
        console.error(`Failed to load essential category ${categoryId}:`, err);
      })
    )
  );
} 