import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Generates dynamic schema markup for unit conversions
 */
export function generateConversionSchema(params: {
  fromUnit: string;
  toUnit: string;
  category: string;
  conversionFactor?: number;
  url: string;
  baseUrl?: string;
}) {
  const { fromUnit, toUnit, category, conversionFactor = 1, url, baseUrl = 'https://calcq.app' } = params;
  
  // Generate HowTo schema for the conversion process
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': `How to Convert ${fromUnit} to ${toUnit}`,
    'description': `Step-by-step guide for converting ${fromUnit} to ${toUnit} with formulas, examples, and a free calculator.`,
    'totalTime': 'PT1M',
    'tool': {
      '@type': 'HowToTool',
      'name': 'Calcq Unit Converter'
    },
    'step': [
      {
        '@type': 'HowToStep',
        'name': 'Enter Value',
        'text': `Enter the ${fromUnit} value you want to convert.`,
        'url': `${url}#step1`,
        'image': `${baseUrl}/images/conversions/${category.toLowerCase()}-${fromUnit.toLowerCase()}-step1.webp`
      },
      {
        '@type': 'HowToStep',
        'name': 'View Result',
        'text': `Get your ${toUnit} result instantly.`,
        'url': `${url}#step2`,
        'image': `${baseUrl}/images/conversions/${category.toLowerCase()}-${fromUnit.toLowerCase()}-step2.webp`
      }
    ]
  };
  
  // Generate Calculator schema for the conversion tool
  const calculatorSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'applicationCategory': 'CalculatorApplication',
    'name': `${fromUnit} to ${toUnit} Calculator`,
    'operatingSystem': 'Web',
    'description': `Free online calculator to convert ${fromUnit} to ${toUnit}. Instant results with step-by-step instructions and formulas.`,
    'url': url,
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'featureList': 'Instant calculations, formula display, step-by-step process, mobile-friendly, offline capability'
  };

  // Generate example conversion data
  const conversionExample = {
    '@context': 'https://schema.org',
    '@type': 'Quantity',
    'value': 1,
    'unitText': fromUnit,
    'equivalentTo': {
      '@type': 'Quantity',
      'value': conversionFactor,
      'unitText': toUnit
    }
  };
  
  return {
    howToSchema,
    calculatorSchema,
    conversionExample
  };
}

/**
 * Component to render all schema markup for a conversion page
 */
export const ConversionSchemaMarkup: React.FC<{
  fromUnit: string;
  toUnit: string;
  category: string;
  conversionFactor?: number;
  url: string;
  baseUrl?: string;
}> = (props) => {
  const schemas = generateConversionSchema(props);
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemas.howToSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(schemas.calculatorSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(schemas.conversionExample)}
      </script>
    </Helmet>
  );
};

/**
 * Generates schema markup for blog articles
 */
export function generateArticleSchema(params: {
  title: string;
  description: string;
  publishDate: string;
  modifyDate: string;
  author: string;
  url: string;
  imageUrl: string;
  category: string;
}) {
  const { title, description, publishDate, modifyDate, author, url, imageUrl, category } = params;
  
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': url
    },
    'headline': title,
    'description': description,
    'image': imageUrl,
    'author': {
      '@type': 'Person',
      'name': author
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Calcq',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://calcq.app/images/logo.png',
        'width': 600,
        'height': 60
      }
    },
    'datePublished': publishDate,
    'dateModified': modifyDate,
    'articleSection': category
  };
  
  return articleSchema;
}

/**
 * Component to render blog article schema
 */
export const BlogArticleSchema: React.FC<{
  title: string;
  description: string;
  publishDate: string;
  modifyDate: string;
  author: string;
  url: string;
  imageUrl: string;
  category: string;
}> = (props) => {
  const schema = generateArticleSchema(props);
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

/**
 * Generates structured data for a list of FAQs
 */
export function generateFAQSchema(questions: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': questions.map(q => ({
      '@type': 'Question',
      'name': q.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': q.answer
      }
    }))
  };
}

/**
 * Component to render FAQ schema
 */
export const FAQSchema: React.FC<{
  questions: Array<{ question: string; answer: string }>
}> = ({ questions }) => {
  const schema = generateFAQSchema(questions);
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

/**
 * Generates breadcrumb structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>, baseUrl = 'https://calcq.app') {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };
}

/**
 * Component to render breadcrumb schema
 */
export const BreadcrumbSchema: React.FC<{
  items: Array<{ name: string; url: string }>;
  baseUrl?: string;
}> = ({ items, baseUrl = 'https://calcq.app' }) => {
  const schema = generateBreadcrumbSchema(items, baseUrl);
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}; 