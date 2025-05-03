/**
 * Unit Search: Efficient search functionality for unit discovery
 * Implements fast prefix matching and relevance ranking
 */

import { Unit, UnitCategory, SubCategory, UnitSearchResult } from './unit-types';

interface UnitIndexEntry {
  unitId: string;
  categoryId: string;
  subcategoryId?: string;
  name: string;
  symbol: string;
  aliases: string[];
}

interface SearchIndex {
  // Normalized term to unitId map for quick lookups
  termMap: Map<string, Set<string>>;
  // Full unit data for results construction
  unitMap: Map<string, UnitIndexEntry>;
}

// Global search index - built incrementally as categories are loaded
const searchIndex: SearchIndex = {
  termMap: new Map(),
  unitMap: new Map(),
};

/**
 * Add a category's units to the search index
 * @param categoryId The category ID
 * @param category The category data
 */
export function addToSearchIndex(categoryId: string, category: UnitCategory): void {
  // Index direct units if present
  if (category.units && category.units.length > 0) {
    category.units.forEach(unit => {
      indexUnit(unit, categoryId);
    });
  }
  
  // Index units in subcategories
  if (category.subcategories && category.subcategories.length > 0) {
    category.subcategories.forEach(subcategory => {
      subcategory.units.forEach(unit => {
        indexUnit(unit, categoryId, subcategory.id);
      });
    });
  }
}

/**
 * Add a unit to the search index
 * @param unit The unit to index
 * @param categoryId The parent category ID
 * @param subcategoryId Optional subcategory ID
 */
function indexUnit(unit: Unit, categoryId: string, subcategoryId?: string): void {
  // Store in unit map for retrieval
  const entry: UnitIndexEntry = {
    unitId: unit.id,
    categoryId,
    subcategoryId,
    name: unit.name,
    symbol: unit.symbol,
    aliases: unit.aliases || [],
  };
  
  // Store full unit data
  searchIndex.unitMap.set(`${categoryId}:${unit.id}`, entry);
  
  // Index searchable terms
  const terms = [
    unit.name.toLowerCase(),
    unit.symbol.toLowerCase(),
    ...(unit.aliases || []).map(a => a.toLowerCase()),
    ...(unit.pluralName ? [unit.pluralName.toLowerCase()] : []),
  ];
  
  // Add each term to the index
  terms.forEach(term => {
    // Index the full term
    addTermToIndex(term, `${categoryId}:${unit.id}`);
    
    // Also index word parts for multi-word terms
    if (term.includes(' ')) {
      term.split(/\s+/).forEach(word => {
        if (word.length > 2) { // Only index words with 3+ chars
          addTermToIndex(word, `${categoryId}:${unit.id}`);
        }
      });
    }
  });
}

/**
 * Add a term to the search index
 * @param term The search term
 * @param unitKey The unit key (category:unitId)
 */
function addTermToIndex(term: string, unitKey: string): void {
  // Skip very short terms
  if (term.length < 2) return;
  
  const normalizedTerm = term.toLowerCase().trim();
  
  // Get or create the set of unit IDs for this term
  if (!searchIndex.termMap.has(normalizedTerm)) {
    searchIndex.termMap.set(normalizedTerm, new Set());
  }
  
  // Add this unit to the set
  searchIndex.termMap.get(normalizedTerm)!.add(unitKey);
}

/**
 * Calculate search relevance score
 * @param entry The unit entry
 * @param query The search query
 * @returns Relevance score (higher is better)
 */
function calculateRelevance(entry: UnitIndexEntry, query: string): number {
  const normalizedQuery = query.toLowerCase().trim();
  const name = entry.name.toLowerCase();
  const symbol = entry.symbol.toLowerCase();
  
  // Exact matches get highest score
  if (name === normalizedQuery) return 100;
  if (symbol === normalizedQuery) return 90;
  
  // Prefix matches get high score
  if (name.startsWith(normalizedQuery)) return 80;
  if (symbol.startsWith(normalizedQuery)) return 75;
  
  // Contains matches get medium score
  if (name.includes(normalizedQuery)) return 60;
  if (symbol.includes(normalizedQuery)) return 55;
  
  // Alias exact matches
  if (entry.aliases.some(a => a.toLowerCase() === normalizedQuery)) return 50;
  
  // Alias contains matches
  if (entry.aliases.some(a => a.toLowerCase().includes(normalizedQuery))) return 40;
  
  // Words in name match query
  if (name.split(/\s+/).some(word => word.startsWith(normalizedQuery))) return 30;
  
  // Default low relevance for other matches
  return 10;
}

/**
 * Search for units matching the query
 * @param query The search query
 * @param limit Maximum number of results
 * @param filter Optional filter for categories
 * @returns Array of search results sorted by relevance
 */
export function searchUnits(
  query: string,
  limit = 10,
  filter?: { categories?: string[] }
): UnitSearchResult[] {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  const results = new Map<string, UnitSearchResult>();
  const matchedUnitKeys = new Set<string>();
  
  // Try exact matches first
  searchIndex.termMap.forEach((unitKeys, term) => {
    // Skip terms that don't match at all
    if (!term.includes(normalizedQuery) && !normalizedQuery.includes(term)) {
      return;
    }
    
    // Get all units associated with this term
    unitKeys.forEach(unitKey => {
      // Skip if we've already matched this unit
      if (matchedUnitKeys.has(unitKey)) return;
      
      const entry = searchIndex.unitMap.get(unitKey);
      if (!entry) return;
      
      // Apply category filter if provided
      if (filter?.categories && 
          !filter.categories.includes(entry.categoryId)) {
        return;
      }
      
      // Calculate relevance
      const relevance = calculateRelevance(entry, normalizedQuery);
      
      // Add to results
      results.set(unitKey, {
        unitId: entry.unitId,
        categoryId: entry.categoryId,
        subcategoryId: entry.subcategoryId,
        name: entry.name,
        symbol: entry.symbol,
        relevance,
      });
      
      // Mark as processed
      matchedUnitKeys.add(unitKey);
    });
  });
  
  // Sort by relevance and limit results
  return Array.from(results.values())
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

/**
 * Get stats about the search index
 * @returns Statistics about the search index
 */
export function getSearchIndexStats(): { terms: number; units: number } {
  return {
    terms: searchIndex.termMap.size,
    units: searchIndex.unitMap.size,
  };
}

/**
 * Clear the search index (useful for testing)
 */
export function clearSearchIndex(): void {
  searchIndex.termMap.clear();
  searchIndex.unitMap.clear();
} 