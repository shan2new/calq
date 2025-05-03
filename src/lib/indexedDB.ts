import { ConversionRecord } from "../contexts/HistoryContext";

// Define database name and version
const DB_NAME = 'unitConverterDB';
const DB_VERSION = 2; // Incrementing version for schema upgrade
const HISTORY_STORE = 'conversionHistory';
const USAGE_STORE = 'usageFrequency';  // New store for tracking usage
const FAVORITES_STORE = 'favorites';  // Store for favorite conversions

interface UsageRecord {
  id: string;  // Composite key of category-fromUnit-toUnit
  count: number;
  lastUsed: number;
  timeOfDay: number[]; // Array of hour frequencies (0-23)
  category: string;
  fromUnit: string;
  toUnit: string;
}

// QuickAccess item interface for the UI
export interface QuickAccessItem {
  id: string;
  fromUnit: string;
  fromUnitSymbol: string;
  toUnit: string;
  toUnitSymbol: string;
  category: string;
  isFavorite: boolean;
}

/**
 * Opens the IndexedDB database connection
 * @returns A promise that resolves to the database instance
 */
export const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // Open database connection
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Handle database upgrade (first time or version change)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store for conversion history if it doesn't exist
      if (!db.objectStoreNames.contains(HISTORY_STORE)) {
        const store = db.createObjectStore(HISTORY_STORE, { keyPath: 'id' });
        // Create indexes for efficient querying
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('category', 'category', { unique: false });
      }
      
      // Create object store for usage frequency tracking
      if (!db.objectStoreNames.contains(USAGE_STORE)) {
        const store = db.createObjectStore(USAGE_STORE, { keyPath: 'id' });
        // Create indexes for efficient querying
        store.createIndex('count', 'count', { unique: false });
        store.createIndex('lastUsed', 'lastUsed', { unique: false });
        store.createIndex('category', 'category', { unique: false });
        
        // Composite index for more complex queries
        store.createIndex('category_count', ['category', 'count'], { unique: false });
      }
      
      // Create object store for favorites if it doesn't exist
      if (!db.objectStoreNames.contains(FAVORITES_STORE)) {
        const store = db.createObjectStore(FAVORITES_STORE, { keyPath: 'id' });
        // Create indexes for efficient querying
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('category', 'category', { unique: false });
      }
    };

    // Handle successful connection
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    // Handle connection errors
    request.onerror = (event) => {
      console.error('IndexedDB connection error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

/**
 * Adds a conversion record to the history store
 * @param record The conversion record to add
 * @returns A promise that resolves when the operation completes
 */
export const addHistoryRecord = async (record: ConversionRecord): Promise<void> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([HISTORY_STORE, USAGE_STORE], 'readwrite');
      const store = transaction.objectStore(HISTORY_STORE);
      const request = store.add(record);
      
      // Also update usage frequency
      trackConversionUsage(transaction, record.category, record.fromUnit, record.toUnit);

      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error('Error adding history record:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Failed to add history record:', error);
  }
};

/**
 * Track the usage of a specific conversion for recommendations
 * @param transaction Active IDBTransaction
 * @param category Category of the conversion
 * @param fromUnit Source unit
 * @param toUnit Target unit
 */
const trackConversionUsage = (
  transaction: IDBTransaction,
  category: string,
  fromUnit: string,
  toUnit: string
): void => {
  const usageStore = transaction.objectStore(USAGE_STORE);
  const compositeKey = `${category}-${fromUnit}-${toUnit}`;
  const getCurrentHour = new Date().getHours();
  
  // Try to get existing record
  const getRequest = usageStore.get(compositeKey);
  
  getRequest.onsuccess = (event) => {
    const existingRecord = (event.target as IDBRequest).result as UsageRecord | undefined;
    
    if (existingRecord) {
      // Update existing record
      const timeOfDay = [...existingRecord.timeOfDay];
      timeOfDay[getCurrentHour] = (timeOfDay[getCurrentHour] || 0) + 1;
      
      usageStore.put({
        ...existingRecord,
        count: existingRecord.count + 1,
        lastUsed: Date.now(),
        timeOfDay
      });
    } else {
      // Create new record
      const timeOfDay = new Array(24).fill(0);
      timeOfDay[getCurrentHour] = 1;
      
      usageStore.add({
        id: compositeKey,
        category,
        fromUnit,
        toUnit,
        count: 1,
        lastUsed: Date.now(),
        timeOfDay
      });
    }
  };
  
  getRequest.onerror = (event) => {
    console.error('Error getting usage record:', (event.target as IDBRequest).error);
  };
};

/**
 * Gets the latest conversion history records
 * @param limit Maximum number of records to retrieve (default 20)
 * @returns A promise that resolves to an array of conversion records
 */
export const getHistoryRecords = async (limit = 20): Promise<ConversionRecord[]> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(HISTORY_STORE, 'readonly');
      const store = transaction.objectStore(HISTORY_STORE);
      const index = store.index('timestamp');
      
      // Use a cursor to get the latest records in reverse chronological order
      const request = index.openCursor(null, 'prev');
      const records: ConversionRecord[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && records.length < limit) {
          records.push(cursor.value as ConversionRecord);
          cursor.continue();
        } else {
          resolve(records);
        }
      };

      request.onerror = (event) => {
        console.error('Error getting history records:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Failed to get history records:', error);
    return [];
  }
};

/**
 * Get recent conversions with optimization for quick access
 * @param limit Maximum number of records to retrieve
 * @returns Promise resolving to array of conversion records
 */
export const getRecentConversions = async (limit = 5): Promise<ConversionRecord[]> => {
  try {
    // First try to get records from memory cache if available
    const cachedRecords = sessionStorage.getItem('recentConversions');
    if (cachedRecords) {
      return JSON.parse(cachedRecords);
    }
    
    // If no cache, get from IndexedDB
    const records = await getHistoryRecords(limit);
    
    // Cache the results for future quick access
    sessionStorage.setItem('recentConversions', JSON.stringify(records));
    
    return records;
  } catch (error) {
    console.error('Failed to get recent conversions:', error);
    return [];
  }
};

/**
 * Get recommended conversions based on usage patterns
 * @param limit Maximum number of recommendations
 * @returns Promise resolving to array of usage records
 */
export const getRecommendedConversions = async (limit = 3): Promise<UsageRecord[]> => {
  try {
    const db = await openDatabase();
    
    // Get current hour for time-based recommendations
    const currentHour = new Date().getHours();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(USAGE_STORE, 'readonly');
      const store = transaction.objectStore(USAGE_STORE);
      
      // Get all records to process in memory
      const request = store.getAll();
      
      request.onsuccess = (event) => {
        const records = (event.target as IDBRequest).result as UsageRecord[];
        
        // Calculate a score for each record based on:
        // 1. Overall usage count
        // 2. Recency (more recent = higher score)
        // 3. Time of day relevance
        const now = Date.now();
        const DAY_MS = 24 * 60 * 60 * 1000; // milliseconds in a day
        
        const scoredRecords = records.map(record => {
          // Base score is the usage count
          let score = record.count;
          
          // Recency factor (higher for more recent conversions)
          // Conversions used within the last day get a boost
          const daysSinceLastUse = (now - record.lastUsed) / DAY_MS;
          if (daysSinceLastUse < 1) {
            score += 2; // Bonus for very recent usage
          } else if (daysSinceLastUse < 7) {
            score += 1; // Small bonus for usage within a week
          }
          
          // Time of day factor
          // Check if this conversion is often used at this time of day
          const timeOfDayScore = record.timeOfDay[currentHour] || 0;
          score += timeOfDayScore * 0.5; // Weight for time of day relevance
          
          return { record, score };
        });
        
        // Sort by score (descending) and take top records
        const recommendations = scoredRecords
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(item => item.record);
        
        resolve(recommendations);
      };
      
      request.onerror = (event) => {
        console.error('Error getting recommendations:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Failed to get recommended conversions:', error);
    return [];
  }
};

/**
 * Get frequently used unit categories
 * @param limit Maximum number of categories to retrieve
 * @returns Promise resolving to array of category IDs with usage counts
 */
export const getFrequentCategories = async (limit = 4): Promise<{id: string, count: number}[]> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(USAGE_STORE, 'readonly');
      const store = transaction.objectStore(USAGE_STORE);
      const request = store.getAll();
      
      request.onsuccess = (event) => {
        const records = (event.target as IDBRequest).result as UsageRecord[];
        
        // Count category occurrences
        const categoryCounts: Record<string, number> = {};
        records.forEach(record => {
          categoryCounts[record.category] = (categoryCounts[record.category] || 0) + record.count;
        });
        
        // Convert to array and sort by count
        const categories = Object.entries(categoryCounts)
          .map(([id, count]) => ({ id, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
        
        resolve(categories);
      };
      
      request.onerror = (event) => {
        console.error('Error getting category frequencies:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
      
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Failed to get frequent categories:', error);
    return [];
  }
};

/**
 * Preload frequently used conversion data to improve performance
 * Uses requestIdleCallback for non-blocking background loading
 */
export const preloadFrequentConversionData = (): void => {
  // Use requestIdleCallback if available, or setTimeout as fallback
  const scheduleWork = window.requestIdleCallback || ((cb) => setTimeout(cb, 100));
  
  scheduleWork(async () => {
    try {
      // Get recent conversions and cache them
      await getRecentConversions(10);
      
      // Get recommendations in background
      await getRecommendedConversions(5);
      
      // Get frequent categories
      await getFrequentCategories(5);
      
      console.log('Preloaded conversion data successfully');
    } catch (error) {
      console.error('Error preloading conversion data:', error);
    }
  });
};

/**
 * Clears all conversion history records
 * @returns A promise that resolves when the operation completes
 */
export const clearHistoryRecords = async (): Promise<void> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(HISTORY_STORE, 'readwrite');
      const store = transaction.objectStore(HISTORY_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error('Error clearing history records:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Failed to clear history records:', error);
  }
};

/**
 * Reset all usage data (for testing or user privacy)
 * @returns A promise that resolves when the operation completes
 */
export const resetUsageData = async (): Promise<void> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(USAGE_STORE, 'readwrite');
      const store = transaction.objectStore(USAGE_STORE);
      const request = store.clear();

      request.onsuccess = () => {
        // Also clear session storage cache
        sessionStorage.removeItem('recentConversions');
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('Error clearing usage data:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Failed to reset usage data:', error);
  }
};

/**
 * Removes a specific conversion record by ID
 * @param id The ID of the record to remove
 * @returns A promise that resolves when the operation completes
 */
export const removeHistoryRecord = async (id: string): Promise<void> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(HISTORY_STORE, 'readwrite');
      const store = transaction.objectStore(HISTORY_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error('Error removing history record:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Failed to remove history record:', error);
  }
};

/**
 * Get unique recent conversions for quick access chips
 * Ensures only one conversion per unit pair (from/to) is included
 * @param limit Maximum number of records to retrieve
 * @returns Promise resolving to array of QuickAccessItems
 */
export const getRecentUniqueConversions = async (limit = 5): Promise<QuickAccessItem[]> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([HISTORY_STORE, FAVORITES_STORE], 'readonly');
      const store = transaction.objectStore(HISTORY_STORE);
      const favoritesStore = transaction.objectStore(FAVORITES_STORE);
      const index = store.index('timestamp');
      
      // Use a cursor to get the latest records in reverse chronological order
      const request = index.openCursor(null, 'prev');
      const records: QuickAccessItem[] = [];
      const uniquePairs = new Set<string>(); // Track unique unit pairs
      
      // First, get a list of favorite IDs to check against
      const getAllFavoritesRequest = favoritesStore.getAll();
      let favoriteIds = new Set<string>();
      
      getAllFavoritesRequest.onsuccess = (event) => {
        const favorites = (event.target as IDBRequest).result as ConversionRecord[];
        favoriteIds = new Set(favorites.map(fav => fav.id));
        
        // Now process the history records
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            const record = cursor.value as ConversionRecord;
            const pairKey = `${record.category}-${record.fromUnit}-${record.toUnit}`;
            
            // Only add if we haven't seen this unit pair yet
            if (!uniquePairs.has(pairKey) && records.length < limit) {
              // Get symbols from the record
              const fromSymbol = getUnitSymbol(record.fromUnit);
              const toSymbol = getUnitSymbol(record.toUnit);
              
              records.push({
                id: record.id,
                fromUnit: record.fromUnit,
                fromUnitSymbol: fromSymbol,
                toUnit: record.toUnit,
                toUnitSymbol: toSymbol,
                category: record.category,
                isFavorite: favoriteIds.has(record.id)
              });
              
              uniquePairs.add(pairKey);
            }
            cursor.continue();
          } else {
            resolve(records);
          }
        };
      };
      
      request.onerror = (event) => {
        console.error('Error getting unique conversions:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Failed to get unique conversions:', error);
    return [];
  }
};

/**
 * Get favorite conversions for quick access
 * @param limit Maximum number of records to retrieve 
 * @returns Promise resolving to array of QuickAccessItems
 */
export const getFavoriteConversions = async (limit = 5): Promise<QuickAccessItem[]> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(FAVORITES_STORE, 'readonly');
      const store = transaction.objectStore(FAVORITES_STORE);
      const index = store.index('timestamp');
      
      // Use a cursor to get the most recent favorites
      const request = index.openCursor(null, 'prev');
      const records: QuickAccessItem[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && records.length < limit) {
          const record = cursor.value as ConversionRecord;
          
          // Get symbols from the record
          const fromSymbol = getUnitSymbol(record.fromUnit);
          const toSymbol = getUnitSymbol(record.toUnit);
          
          records.push({
            id: record.id,
            fromUnit: record.fromUnit,
            fromUnitSymbol: fromSymbol,
            toUnit: record.toUnit,
            toUnitSymbol: toSymbol,
            category: record.category,
            isFavorite: true
          });
          
          cursor.continue();
        } else {
          resolve(records);
        }
      };

      request.onerror = (event) => {
        console.error('Error getting favorite conversions:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Failed to get favorite conversions:', error);
    return [];
  }
};

/**
 * Helper function to get unit symbol from unit ID
 * Simplified version for quick access - in real implementation
 * this would use the unit registry or lookup service
 */
const getUnitSymbol = (unitId: string): string => {
  // This is a simplified lookup - in real implementation
  // this would query the unit registry
  const commonSymbols: Record<string, string> = {
    'meter': 'm',
    'kilometer': 'km',
    'centimeter': 'cm',
    'millimeter': 'mm',
    'inch': 'in',
    'foot': 'ft',
    'yard': 'yd',
    'mile': 'mi',
    'kilogram': 'kg',
    'gram': 'g',
    'pound': 'lb',
    'ounce': 'oz',
    'celsius': '°C',
    'fahrenheit': '°F',
    'kelvin': 'K',
    'liter': 'L',
    'gallon_us': 'gal',
    'cup_us': 'cup',
  };
  
  return commonSymbols[unitId] || unitId;
}; 