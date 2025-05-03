import React from 'react';
import { Helmet } from 'react-helmet-async';

// Interfaces for the component props
interface Unit {
  id: string;
  name: string;
  symbol: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface ConversionStructuredDataProps {
  fromUnit?: Unit;
  toUnit?: Unit;
  fromValue?: number;
  toValue?: number;
  category?: Category;
}

export const ConversionStructuredData: React.FC<ConversionStructuredDataProps> = ({
  fromUnit,
  toUnit,
  fromValue = 1,
  toValue,
  category
}) => {
  if (!fromUnit || !toUnit || !category || toValue === undefined) {
    return null;
  }
  
  // HowTo schema for the conversion
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': `How to Convert ${fromUnit.name} to ${toUnit.name}`,
    'description': `Learn how to convert from ${fromUnit.name} (${fromUnit.symbol}) to ${toUnit.name} (${toUnit.symbol}) using our calculator.`,
    'step': [
      {
        '@type': 'HowToStep',
        'name': 'Enter Value',
        'text': `Enter the ${fromUnit.name} value you want to convert.`
      },
      {
        '@type': 'HowToStep',
        'name': 'Select Units',
        'text': `Select ${fromUnit.name} as the source unit and ${toUnit.name} as the target unit.`
      },
      {
        '@type': 'HowToStep',
        'name': 'View Result',
        'text': `View the converted value in ${toUnit.name}.`
      }
    ],
    'tool': {
      '@type': 'HowToTool',
      'name': 'Calcq Unit Converter'
    }
  };
  
  // Create example conversion for schema
  const conversionExample = {
    '@context': 'https://schema.org',
    '@type': 'Quantity',
    'value': fromValue,
    'unitCode': fromUnit.symbol,
    'unitText': fromUnit.name,
    'equivalentTo': {
      '@type': 'Quantity',
      'value': toValue,
      'unitCode': toUnit.symbol,
      'unitText': toUnit.name
    }
  };
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(howToSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(conversionExample)}
      </script>
    </Helmet>
  );
};

// For category listing pages
interface CategoryListStructuredDataProps {
  categories: Category[];
}

export const CategoryListStructuredData: React.FC<CategoryListStructuredDataProps> = ({ 
  categories 
}) => {
  if (!categories || categories.length === 0) {
    return null;
  }
  
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': categories.map((category, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': category.name,
      'description': category.description || `Convert ${category.name.toLowerCase()} units`,
      'url': `https://calcq.app/convert/${category.id.toLowerCase()}`
    }))
  };
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(itemListSchema)}
      </script>
    </Helmet>
  );
};

export default { ConversionStructuredData, CategoryListStructuredData }; 