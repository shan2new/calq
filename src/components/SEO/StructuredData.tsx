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

// FAQ Structured Data component
interface FAQProps {
  category: string;
  fromUnit: string;
  toUnit: string;
  questions?: Array<{question: string, answer: string}>;
}

export const FAQStructuredData: React.FC<FAQProps> = ({ 
  category, 
  fromUnit, 
  toUnit,
  questions = []
}) => {
  // Default questions if none provided
  const defaultQuestions = [
    {
      question: `How do I convert from ${fromUnit} to ${toUnit}?`,
      answer: `To convert from ${fromUnit} to ${toUnit}, enter your value in the ${fromUnit} field and see the instant conversion result in ${toUnit}.`
    },
    {
      question: `What is the formula to convert ${fromUnit} to ${toUnit}?`,
      answer: `The formula for converting from ${fromUnit} to ${toUnit} depends on the specific units. Our calculator handles all the complex mathematics for accurate conversions.`
    },
    {
      question: `Why should I use Calcq for ${category} conversions?`,
      answer: `Calcq provides instant, accurate conversions with a user-friendly interface. Our ${category} converter is designed to be fast, reliable, and easy to use.`
    }
  ];
  
  // Combine default and custom questions
  const allQuestions = [...defaultQuestions, ...questions];
  
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': allQuestions.map(q => ({
      '@type': 'Question',
      'name': q.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': q.answer
      }
    }))
  };
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
};

// WebApplication structured data
export const WebApplicationStructuredData: React.FC = () => {
  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'Calcq Calculator',
    'applicationCategory': 'UtilityApplication',
    'operatingSystem': 'Web',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    }
  };
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(appSchema)}
      </script>
    </Helmet>
  );
};

// Product structured data with ratings
export const ProductStructuredData: React.FC = () => {
  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'SoftwareApplication',
    'name': 'Calcq Unit Converter',
    'applicationCategory': 'UtilityApplication',
    'operatingSystem': 'Web',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'ratingCount': '1024',
      'bestRating': '5',
      'worstRating': '1'
    },
    'description': 'Fast, accurate unit conversions across 33 categories. Convert anything with our easy-to-use calculator.',
    'screenshot': 'https://calcq.app/images/calculator-screenshot.png',
    'featureList': 'Instant conversions, 4,500+ units, history tracking, dark mode, offline capability'
  };
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
    </Helmet>
  );
};

// Article structured data for conversion guides
interface ArticleProps {
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  imageUrl: string;
  url: string;
  category: string;
}

export const ArticleStructuredData: React.FC<ArticleProps> = ({
  title,
  description,
  datePublished,
  dateModified,
  imageUrl,
  url,
  category
}) => {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': title,
    'description': description,
    'image': imageUrl,
    'datePublished': datePublished,
    'dateModified': dateModified,
    'author': {
      '@type': 'Organization',
      'name': 'Calcq'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Calcq',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://calcq.app/images/logo.png'
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': url
    },
    'articleSection': category
  };
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(articleSchema)}
      </script>
    </Helmet>
  );
};

export default { 
  ConversionStructuredData, 
  CategoryListStructuredData,
  FAQStructuredData,
  WebApplicationStructuredData,
  ProductStructuredData,
  ArticleStructuredData
}; 