import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

// Visual breadcrumbs component
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  if (!items || items.length === 0) {
    return null;
  }
  
  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
      <ol className="flex items-center flex-wrap gap-1">
        {items.map((item, index) => (
          <li key={item.url} className="flex items-center">
            {index > 0 && <span className="mx-1 text-muted-foreground">/</span>}
            {index === items.length - 1 ? (
              <span aria-current="page" className="font-medium text-foreground">
                {item.name}
              </span>
            ) : (
              <Link 
                to={item.url} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Structured data component for breadcrumbs
export const BreadcrumbsStructuredData: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }
  
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url.startsWith('http') ? item.url : `https://calcq.app${item.url}`
    }))
  };
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
};

// Helper function to generate breadcrumbs for conversion pages
export const generateConversionBreadcrumbs = (
  category?: string,
  fromUnit?: string,
  toUnit?: string
): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: '/' }
  ];
  
  if (category) {
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    breadcrumbs.push({ 
      name: `${categoryName} Converter`, 
      url: `/convert/${category.toLowerCase()}` 
    });
    
    if (fromUnit && toUnit) {
      breadcrumbs.push({
        name: `${fromUnit} to ${toUnit}`,
        url: `/convert/${category.toLowerCase()}/${fromUnit.toLowerCase()}/${toUnit.toLowerCase()}`
      });
    }
  }
  
  return breadcrumbs;
};

export default { 
  Breadcrumbs, 
  BreadcrumbsStructuredData,
  generateConversionBreadcrumbs
}; 