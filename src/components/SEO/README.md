# Calcq SEO Implementation

This directory contains the SEO components and utilities for the Calcq calculator application. These components provide server-side rendering (SSR) capabilities, dynamic metadata generation, and structured data for enhanced search engine visibility.

## Components

### MetadataManager

`MetadataManager.tsx` is a reusable component that generates dynamic metadata for pages, including:

- Page titles following the pattern: "Convert [fromUnit] to [toUnit] | [category] Converter | Calcq"
- Descriptive meta descriptions based on conversion context
- Open Graph and Twitter card metadata with proper conversion previews
- Canonical URL management

Usage:

```tsx
<MetadataManager 
  title="Convert Meters to Feet | Length Converter | Calcq"
  description="Convert 10 meters to feet with Calcq's length converter. Instant, accurate calculations."
  fromUnit="meters"
  toUnit="feet"
  category="Length"
  value={10}
  canonicalPath="/convert/length/meter/foot/10"
/>
```

### StructuredData

`StructuredData.tsx` provides JSON-LD structured data for various page types:

- `ConversionStructuredData`: Implements HowTo schema for conversion processes
- `CategoryListStructuredData`: Implements ItemList schema for unit categories

Usage:

```tsx
<ConversionStructuredData
  fromUnit={fromUnitData}
  toUnit={toUnitData}
  fromValue={fromValue}
  toValue={convertedValue}
  category={categoryData}
/>
```

## URL Utilities

The `url-utils.ts` module provides utilities for SEO-friendly URLs:

- `slugifyUnitId`: Converts unit IDs to URL-friendly slugs
- `unslugifyUnitId`: Converts slugs back to unit IDs
- `buildCanonicalPath`: Builds canonical paths for conversions
- `parseCanonicalPath`: Parses conversion parameters from paths

## Server-Side Rendering

The SSR implementation uses Vite and Express to provide server-rendered content:

- `server/index.js`: Express server with compression and SSR capabilities
- `src/entry-server.tsx`: Server entry point for rendering React components to HTML
- `src/entry-client.tsx`: Client entry point for hydrating server-rendered HTML

## Getting Started

To run the SSR version:

```
# Development
npm run dev:ssr

# Production build
npm run build:ssr
npm run serve
```

## SEO-Friendly URL Structure

The application supports the following URL pattern:

```
/convert/[category]/[from-unit]/[to-unit]/[value]?
```

For example:
```
/convert/length/meter/foot/10
```

The application also provides backward compatibility with the old URL pattern:

```
/converter?category=LENGTH&from=meter&to=foot&value=10
```

Requests using the old pattern are automatically redirected to the SEO-friendly URLs. 