/**
 * URL utilities for SEO-friendly URLs and canonical paths
 */

/**
 * Convert a unit ID to a URL-friendly slug
 */
export function slugifyUnitId(unitId: string): string {
  // Convert camelCase or snake_case to dash-case
  return unitId
    .replace(/_/g, '-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Convert a URL slug back to a unit ID
 */
export function unslugifyUnitId(slug: string): string {
  // Convert from slug back to valid unit ID format
  return slug.replace(/-/g, '_').toLowerCase();
}

/**
 * Convert a category ID to a URL-friendly slug
 */
export function slugifyCategoryId(categoryId: string): string {
  return categoryId.toLowerCase();
}

/**
 * Convert a category slug back to a category ID
 */
export function unslugifyCategoryId(slug: string): string {
  // This would need to be expanded with mappings for categories with
  // special formatting needs
  return slug.toUpperCase();
}

/**
 * Build a canonical path for a conversion
 */
export function buildCanonicalPath(
  category: string,
  fromUnit: string,
  toUnit: string,
  value?: number | string
): string {
  const categorySlug = slugifyCategoryId(category);
  const fromUnitSlug = slugifyUnitId(fromUnit);
  const toUnitSlug = slugifyUnitId(toUnit);
  
  // Build the base path
  const basePath = `/convert/${categorySlug}/${fromUnitSlug}/${toUnitSlug}`;
  
  // Add value if provided
  const path = value !== undefined ? `${basePath}/${value}` : basePath;
  
  return path;
}

/**
 * Parse a canonical path to extract conversion parameters
 */
export function parseCanonicalPath(path: string): {
  category: string;
  fromUnit: string;
  toUnit: string;
  value?: number;
} | null {
  // Check if this is a SEO path format
  if (!path.startsWith('/convert/')) {
    return null;
  }
  
  // Match the pattern /convert/:category/:fromUnit/:toUnit/:value?
  const match = path.match(/^\/convert\/([^\/]+)\/([^\/]+)\/([^\/]+)(?:\/([^\/]+))?$/);
  
  if (!match) {
    return null;
  }
  
  const [, categorySlug, fromUnitSlug, toUnitSlug, valueStr] = match;
  
  // Skip if any required component is missing
  if (!categorySlug || !fromUnitSlug || !toUnitSlug) {
    return null;
  }
  
  const result = {
    category: unslugifyCategoryId(categorySlug),
    fromUnit: unslugifyUnitId(fromUnitSlug),
    toUnit: unslugifyUnitId(toUnitSlug)
  };
  
  // Add value if present
  if (valueStr !== undefined) {
    const value = Number(valueStr);
    if (!isNaN(value)) {
      return { ...result, value };
    }
  }
  
  return result;
} 