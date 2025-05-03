# Calcq - Modern Unit Converter

A clean, fast, and user-friendly unit converter built with React, TypeScript, and Tailwind CSS. Designed to handle 4,500+ units across 33 categories while maintaining optimal performance and a clean interface.

## Features

### Core Functionality
- Convert between 4,500+ units across 33 categories
- Hierarchical unit browsing with subcategories
- Efficient search algorithm with typeahead suggestions
- Clean, accessible, and responsive interface
- Dark/light mode support
- PWA support for offline usage

### Smart Features
- **Normalized Data Store**: Optimized data structure for minimal redundancy and fast lookups
- **Lazy Loading**: Dynamic loading of unit data by category for optimal bundle size
- **Intelligent Number Formatting**: Format values differently based on unit type (time, temperature, etc.)
- **Relationship Indicators**: Visual indicators showing related unit types
- **Smart Search**: Fast, efficient unit discovery with typeahead functionality
- **Quick Access**: Recently used and recommended conversions 

### Performance Optimizations
- Initial bundle size kept small despite large dataset
- Sub-100ms response time for common conversions
- Optimized IndexedDB schema for quick lookups
- Background calculation for recommendations using requestIdleCallback
- Category-based code splitting for faster initial load

## Project Structure

The project is organized with a clear separation of concerns:

```
src/
  ├── components/       # UI components
  ├── contexts/         # React context providers
  ├── lib/              # Core business logic
  │   ├── unit-data/    # Unit definitions by category
  │   ├── unit-types.ts # Type definitions
  │   ├── unit-loader.ts # Lazy loading system
  │   ├── unit-search.ts # Search functionality
  │   └── conversion-engine.ts # Conversion logic
  ├── pages/            # Application pages
  └── styles/           # Global styles
```

## Unit System

The unit system is designed for comprehensive coverage while maintaining efficient performance:

- **Hierarchical Organization**: Units are grouped into categories and subcategories
- **Normalized Data**: Each unit contains precise conversion functions
- **Extensible Architecture**: Easy to add new units and categories
- **Optimized Loading**: Units are loaded on-demand to minimize initial load time

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/calcq.git
cd calcq

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
npm run build
```

## Contributing

### Adding Units
See the [Unit Data README](src/lib/unit-data/README.md) for detailed instructions on adding new units or categories.

### Development
1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Unit conversion data validated against authoritative sources (NIST, BIPM)
- Icons from [Lucide](https://lucide.dev/)
- UI components powered by [shadcn/ui](https://ui.shadcn.com/)
