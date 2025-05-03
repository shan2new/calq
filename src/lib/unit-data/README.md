# Unit Data Structure

This directory contains the comprehensive unit data for the Calcq unit converter, organized by category. The data structure is designed to be modular, maintainable, and efficient for supporting 4,500+ units across 33 categories.

## Directory Structure

Each unit category is represented by a single TypeScript file that exports a UnitCategory object. For example:

- `length.ts` - Length/distance measurement units
- `mass.ts` - Mass/weight measurement units
- `temperature.ts` - Temperature scales
- ... (additional categories)

## Unit Data Structure

### Category Structure

Categories follow this basic structure:

```typescript
const categoryName: UnitCategory = {
  id: UnitCategoryId.CATEGORY_ID,
  name: "Display Name",
  icon: "icon-name",
  description: "Description of the category",
  baseUnitId: "base-unit-id",
  
  // Optional: Commonly used units for quick access
  popularUnits: ["unit1", "unit2", "unit3"],
  
  // Either direct units array or subcategories
  units: [...],
  // OR
  subcategories: [...]
};
```

### Subcategory Structure

Subcategories group related units:

```typescript
{
  id: "subcategory-id",
  name: "Subcategory Name",
  description: "Description of the subcategory",
  units: [...],
  popularUnits: ["unit1", "unit2"] // Optional
}
```

### Unit Structure

Each unit is defined with all necessary conversion information:

```typescript
{
  id: "unit-id",
  name: "Unit Name",
  symbol: "unit symbol",
  pluralName: "plural form",
  aliases: ["alternative names", "for search"],
  baseUnit: boolean, // Is this the base unit?
  conversionFactor: number, // Optional, for simple conversions
  
  // Conversion functions
  toBase: (value: number) => number, // Convert to base unit
  fromBase: (value: number) => number, // Convert from base unit
  
  // Optional properties
  precision: number, // Default display precision
  formatter: (value: number) => string, // Custom formatting
  relatedUnits: ["related-unit-ids"], // Semantic relationships
}
```

## Adding New Units

To add a new unit to an existing category:

1. Identify the appropriate category file and subcategory
2. Add the unit definition with required properties
3. Ensure conversion functions are mathematically correct
4. Add aliases to improve searchability
5. Consider adding semantic relationships (relatedUnits)

## Adding a New Category

To add a new category:

1. Create a new file named `category-name.ts`
2. Add the category ID to `UnitCategoryId` enum in `unit-types.ts`
3. Add category info to `unitCategoryInfo` in `unit-types.ts`
4. Add the dynamic import in `unit-loader.ts`
5. Follow the template structure from existing categories

## Validation

All unit data should be validated for:

1. Conversion accuracy against known reference values
2. Proper base unit identification
3. Consistent precision handling
4. Complete required properties
5. Proper hierarchical organization

## Performance Considerations

- Units with simple scalar conversions should use `conversionFactor` for clarity
- For complex conversions, optimize the conversion functions
- Keep aliases concise but comprehensive for good search results
- Organize units into logical subcategories for better navigation
- Identify popular units to improve user experience

## Resources

When adding units, refer to these authoritative sources:

- NIST Special Publication 811
- International Bureau of Weights and Measures (BIPM)
- ISO 80000 series
- CODATA recommended values for physical constants 