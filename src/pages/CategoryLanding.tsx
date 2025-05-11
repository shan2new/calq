import React from 'react';
import { useParams } from 'react-router-dom';
import MetadataManager from '../components/SEO/MetadataManager';
import { Breadcrumbs, BreadcrumbsStructuredData, generateConversionBreadcrumbs } from '../components/SEO/Breadcrumbs';
import { CategoryListStructuredData, ArticleStructuredData, FAQStructuredData } from '../components/SEO/StructuredData';
import { ResponsiveImage } from '../components/ui/ResponsiveImage';

export const CategoryLanding: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() : '';
  const breadcrumbs = generateConversionBreadcrumbs(category);
  
  // Mock category data - would come from your data store
  const mockCategory = { 
    id: category || '', 
    name: categoryName,
    description: `Convert between ${categoryName.toLowerCase()} units with Calcq's fast and accurate ${categoryName.toLowerCase()} converter.`
  };
  
  // Get today's date for article schema
  const today = new Date();
  const publishDate = new Date(today.getFullYear(), 0, 1).toISOString(); // Jan 1 of current year
  const modifiedDate = today.toISOString();
  
  // Common conversions for this category - would come from your data
  const commonConversions = getCommonConversionsForCategory(category || '');
  
  // FAQ questions for this category
  const faqQuestions = [
    {
      question: `What ${categoryName.toLowerCase()} units can I convert with Calcq?`,
      answer: `Calcq's ${categoryName.toLowerCase()} converter supports all standard ${categoryName.toLowerCase()} units, including ${commonConversions.map(c => c.from + ', ' + c.to).join(', ')} and many more.`
    },
    {
      question: `How accurate is Calcq's ${categoryName.toLowerCase()} converter?`,
      answer: `Calcq provides highly accurate ${categoryName.toLowerCase()} conversions, using precise conversion formulas and up to 15 decimal places of precision.`
    },
    {
      question: `Can I convert between ${categoryName.toLowerCase()} units offline?`,
      answer: `Yes, Calcq works offline once loaded. You can perform ${categoryName.toLowerCase()} conversions without an internet connection.`
    }
  ];
  
  return (
    <div className="container mx-auto max-w-3xl p-4">
      <MetadataManager
        title={`${categoryName} Converter | Convert ${categoryName} Units | Calcq`}
        description={`Convert between all ${categoryName.toLowerCase()} units with Calcq's fast, accurate ${categoryName.toLowerCase()} converter. Simple, free, and no ads.`}
        category={categoryName}
        keywords={`${categoryName} converter, ${categoryName} units, convert ${categoryName}, ${categoryName} calculation, ${commonConversions.map(c => c.from + ' to ' + c.to).join(', ')}`}
      />
      
      {/* Structured data */}
      <BreadcrumbsStructuredData items={breadcrumbs} />
      <CategoryListStructuredData categories={[mockCategory]} />
      <ArticleStructuredData
        title={`${categoryName} Converter - Convert All ${categoryName} Units Quickly & Easily`}
        description={mockCategory.description}
        datePublished={publishDate}
        dateModified={modifiedDate}
        imageUrl={`https://calcq.app/images/categories/${category?.toLowerCase()}.webp`}
        url={`https://calcq.app/convert/${category?.toLowerCase()}`}
        category={categoryName}
      />
      <FAQStructuredData
        category={categoryName}
        fromUnit=""
        toUnit=""
        questions={faqQuestions}
      />
      
      {/* UI elements */}
      <Breadcrumbs items={breadcrumbs} className="mb-4 py-2" />
      
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{categoryName} Converter</h1>
          <p className="text-lg text-muted-foreground">
            Convert between all {categoryName.toLowerCase()} units instantly
          </p>
        </header>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-2/3">
            <div className="rounded-lg overflow-hidden bg-card border">
              <div className="px-6 py-4">
                <h2 className="text-2xl font-semibold mb-4">Popular {categoryName} Conversions</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {commonConversions.map((conversion, index) => (
                    <li key={index} className="hover:bg-muted rounded-md p-2 transition-colors">
                      <a 
                        href={`/convert/${category}/${conversion.from}/${conversion.to}`}
                        className="block text-foreground hover:underline"
                      >
                        {conversion.from} to {conversion.to}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">About {categoryName} Conversion</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  {categoryName} conversion is essential for various applications, from everyday tasks to specialized fields.
                  Calcq provides an intuitive and accurate way to convert between different {categoryName.toLowerCase()} units.
                </p>
                <p>
                  Our {categoryName.toLowerCase()} converter supports all standard and specialized {categoryName.toLowerCase()} units,
                  ensuring you can easily convert between any {categoryName.toLowerCase()} measurements you need.
                </p>
              </div>
            </section>
            
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Common {categoryName} Units</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  Common {categoryName.toLowerCase()} units include {commonConversions.map(c => c.from).join(', ')} and {commonConversions.map(c => c.to).join(', ')}.
                  These units are used in various contexts and applications around the world.
                </p>
              </div>
            </section>
          </div>
          
          <div className="w-full md:w-1/3 space-y-4">
            <div className="rounded-lg overflow-hidden border bg-card">
              <h3 className="px-4 py-3 border-b font-medium">Use Our Converter</h3>
              <div className="p-4">
                <p className="mb-4 text-sm">
                  Try Calcq's advanced {categoryName.toLowerCase()} converter for instant, accurate conversions.
                </p>
                <a 
                  href="/converter" 
                  className="block w-full py-2 text-center bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Go to Converter
                </a>
              </div>
            </div>
            
            {category && (
              <div className="aspect-video relative overflow-hidden rounded-lg border">
                <ResponsiveImage 
                  src={`/images/categories/${category.toLowerCase()}.jpg`}
                  alt={`${categoryName} conversion illustration`}
                  width={400}
                  height={300}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get common conversions for a category
function getCommonConversionsForCategory(category: string) {
  const commonConversions: Record<string, Array<{from: string, to: string}>> = {
    'length': [
      { from: 'meter', to: 'foot' },
      { from: 'kilometer', to: 'mile' },
      { from: 'centimeter', to: 'inch' },
      { from: 'millimeter', to: 'inch' }
    ],
    'mass': [
      { from: 'kilogram', to: 'pound' },
      { from: 'gram', to: 'ounce' },
      { from: 'ton', to: 'pound' },
      { from: 'milligram', to: 'grain' }
    ],
    'temperature': [
      { from: 'celsius', to: 'fahrenheit' },
      { from: 'kelvin', to: 'celsius' },
      { from: 'fahrenheit', to: 'celsius' },
      { from: 'kelvin', to: 'fahrenheit' }
    ],
    'volume': [
      { from: 'liter', to: 'gallon' },
      { from: 'milliliter', to: 'fluid ounce' },
      { from: 'cubic meter', to: 'cubic foot' },
      { from: 'cup', to: 'milliliter' }
    ],
    // Add more category conversions as needed
  };
  
  return commonConversions[category.toLowerCase()] || [
    { from: 'unit1', to: 'unit2' },
    { from: 'unit3', to: 'unit4' }
  ];
}

export default CategoryLanding; 