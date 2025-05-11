import React from 'react';
import { Helmet } from 'react-helmet-async';

interface ComparisonSchemaProps {
  baseItem: string;
  comparisonItems: string[];
  itemType: string;
  url: string;
  description: string;
}

/**
 * ComparisonSchema - For conversion comparison pages to appear in "vs" searches
 * Helps with ranking for queries like "meters vs feet" or "celsius vs fahrenheit"
 */
export const ComparisonSchema: React.FC<ComparisonSchemaProps> = ({
  baseItem,
  comparisonItems,
  itemType,
  url,
  description
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': `${baseItem} compared to ${comparisonItems.join(', ')}`,
    'description': description,
    'url': url,
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'item': {
          '@type': itemType,
          'name': baseItem
        }
      },
      ...comparisonItems.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 2,
        'item': {
          '@type': itemType,
          'name': item
        }
      }))
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface FormulaSchemaProps {
  name: string;
  description: string;
  formula: string;
  url: string;
  variables: Array<{
    name: string;
    description: string;
  }>;
}

/**
 * FormulaSchema - For ranking formula-related searches
 * Helps with ranking for queries like "meters to feet formula"
 */
export const FormulaSchema: React.FC<FormulaSchemaProps> = ({
  name,
  description,
  formula,
  url,
  variables
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MathSolver',
    'name': name,
    'text': description,
    'abstract': formula,
    'url': url,
    'eduQuestionType': 'Formula',
    'knowsAbout': variables.map(v => ({
      '@type': 'Specialty',
      'name': v.name,
      'description': v.description
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface ToolSchemaProps {
  name: string;
  description: string;
  url: string;
  image: string;
  creator: string;
  dateCreated: string;
  license: string;
  features: string[];
}

/**
 * ToolSchema - For ranking the calculator as a tool
 * Helps appear in searches like "online conversion tool"
 */
export const ToolSchema: React.FC<ToolSchemaProps> = ({
  name,
  description,
  url,
  image,
  creator,
  dateCreated,
  license,
  features
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': name,
    'description': description,
    'operatingSystem': 'Web',
    'applicationCategory': 'UtilityApplication',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'screenshot': image,
    'featureList': features.join(', '),
    'dateCreated': dateCreated,
    'license': license,
    'creator': {
      '@type': 'Organization',
      'name': creator
    },
    'url': url
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface TableSchemaProps {
  name: string;
  description: string;
  url: string;
  columns: string[];
  rows: Array<Array<string | number>>;
}

/**
 * TableSchema - For conversion tables to appear in search results
 * Helps with ranking for queries like "meters to feet conversion table"
 */
export const TableSchema: React.FC<TableSchemaProps> = ({
  name,
  description,
  url,
  columns,
  rows
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Table',
    'about': name,
    'description': description,
    'url': url,
    'mainContentOfPage': {
      '@type': 'WebPageElement',
      'isPartOf': {
        '@type': 'WebPage',
        '@id': url
      }
    },
    'cssSelector': '.conversion-table',
    'tableColumns': columns.map(name => ({
      '@type': 'PropertyValue',
      'name': name
    })),
    'tableRows': rows.map(row => ({
      '@type': 'ItemList',
      'itemListElement': row.map((cell, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'PropertyValue',
          'name': columns[index],
          'value': cell
        }
      }))
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface SearchActionSchemaProps {
  target: string;
  queryInput: string;
  name: string;
}

/**
 * SearchActionSchema - To appear in search boxes in Google results
 * Helps with direct navigation via search boxes
 */
export const SearchActionSchema: React.FC<SearchActionSchemaProps> = ({
  target,
  queryInput,
  name
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'url': 'https://calcq.app/',
    'name': name,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': target
      },
      'query-input': queryInput
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface QuestionAnswerSchemaProps {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

/**
 * QuestionAnswerSchema - For FAQ sections to appear in search results
 * Helps with ranking for how-to and question searches
 */
export const QuestionAnswerSchema: React.FC<QuestionAnswerSchemaProps> = ({ questions }) => {
  const schema = {
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

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface WorkflowSchemaProps {
  name: string;
  description: string;
  steps: Array<{
    name: string;
    text: string;
    image?: string;
  }>;
}

/**
 * WorkflowSchema - For step-by-step processes to appear in search results
 * Helps with ranking for how-to searches
 */
export const WorkflowSchema: React.FC<WorkflowSchemaProps> = ({
  name,
  description,
  steps
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': name,
    'description': description,
    'step': steps.map((step, index) => ({
      '@type': 'HowToStep',
      'position': index + 1,
      'name': step.name,
      'text': step.text,
      ...(step.image ? {
        'image': {
          '@type': 'ImageObject',
          'url': step.image
        }
      } : {})
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface ReviewSchemaProps {
  itemName: string;
  itemType: string;
  reviewCount: number;
  ratingValue: number;
  url: string;
  bestRating?: number;
  worstRating?: number;
}

/**
 * ReviewSchema - To display ratings in search results
 * Helps with establishing credibility and click-through rates
 */
export const ReviewSchema: React.FC<ReviewSchemaProps> = ({
  itemName,
  itemType,
  reviewCount,
  ratingValue,
  url,
  bestRating = 5,
  worstRating = 1
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': itemType,
    'name': itemName,
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': ratingValue,
      'reviewCount': reviewCount,
      'bestRating': bestRating,
      'worstRating': worstRating
    },
    'url': url
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default {
  ComparisonSchema,
  FormulaSchema,
  ToolSchema,
  TableSchema,
  SearchActionSchema,
  QuestionAnswerSchema,
  WorkflowSchema,
  ReviewSchema
}; 