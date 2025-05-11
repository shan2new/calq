import React from 'react';
import { useParams } from 'react-router-dom';
import MetadataManager from '../components/SEO/MetadataManager';
import { Breadcrumbs, BreadcrumbsStructuredData, generateConversionBreadcrumbs } from '../components/SEO/Breadcrumbs';
import { 
  ConversionStructuredData, 
  FAQStructuredData,
  ArticleStructuredData,
  CalculatorStructuredData
} from '../components/SEO/StructuredData';
import ConverterWithSpecialized from './ConverterWithSpecialized';

export const ConversionLanding: React.FC = () => {
  const { category, fromUnit, toUnit } = useParams<{
    category: string;
    fromUnit: string;
    toUnit: string;
  }>();
  
  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() : '';
  const fromUnitName = fromUnit ? fromUnit.charAt(0).toUpperCase() + fromUnit.slice(1) : '';
  const toUnitName = toUnit ? toUnit.charAt(0).toUpperCase() + toUnit.slice(1) : '';
  
  const breadcrumbs = generateConversionBreadcrumbs(category, fromUnit, toUnit);
  
  // Mock units data - in a real implementation, this would come from your actual data source
  const mockFromUnit = {
    id: fromUnit || '',
    name: fromUnitName,
    symbol: fromUnitName.substring(0, 3)
  };
  
  const mockToUnit = {
    id: toUnit || '',
    name: toUnitName,
    symbol: toUnitName.substring(0, 3)
  };
  
  const mockCategory = {
    id: category || '',
    name: categoryName
  };
  
  // Get today's date for article schema
  const today = new Date();
  const publishDate = new Date(today.getFullYear(), 0, 1).toISOString(); // Jan 1 of current year
  const modifiedDate = today.toISOString();
  
  // Generate dynamically targeted page title and description
  const pageTitle = `Convert ${fromUnitName} to ${toUnitName} | ${categoryName} Converter`;
  const pageDescription = `Quickly convert ${fromUnitName} to ${toUnitName} with our free ${categoryName.toLowerCase()} converter. Accurate, easy-to-use calculator with step-by-step instructions and formulas.`;
  
  // Generate conversion formula explanation - this would be unit-specific in a real implementation
  const conversionFormula = getConversionFormula(fromUnit || '', toUnit || '');
  
  // Generate FAQ questions specific to this conversion
  const faqQuestions = [
    {
      question: `How do I convert from ${fromUnitName} to ${toUnitName}?`,
      answer: `To convert from ${fromUnitName} to ${toUnitName}, ${conversionFormula.explanation}. Our calculator performs this conversion automatically.`
    },
    {
      question: `What is the formula for converting ${fromUnitName} to ${toUnitName}?`,
      answer: `The formula for converting ${fromUnitName} to ${toUnitName} is: ${conversionFormula.formula}`
    },
    {
      question: `Why would I need to convert ${fromUnitName} to ${toUnitName}?`,
      answer: getConversionUseCase(fromUnit || '', toUnit || '', category || '')
    },
    {
      question: `Is the ${fromUnitName} to ${toUnitName} conversion accurate?`,
      answer: `Yes, our ${fromUnitName} to ${toUnitName} conversion is highly accurate, using the precise conversion factor and up to 15 decimal places when needed.`
    }
  ];
  
  // Example conversions - this would be dynamically generated in a real implementation
  const exampleConversions = [
    { from: 1, to: conversionFormula.factor },
    { from: 5, to: 5 * conversionFormula.factor },
    { from: 10, to: 10 * conversionFormula.factor },
    { from: 100, to: 100 * conversionFormula.factor }
  ];
  
  // Related conversions - this would be dynamically generated based on user interests
  const relatedConversions = getRelatedConversions(category || '');
  
  return (
    <div className="container mx-auto max-w-4xl p-4">
      {/* SEO Metadata */}
      <MetadataManager
        title={pageTitle}
        description={pageDescription}
        fromUnit={fromUnitName}
        toUnit={toUnitName}
        category={categoryName}
        keywords={`${fromUnitName} to ${toUnitName}, convert ${fromUnitName} to ${toUnitName}, ${categoryName.toLowerCase()} converter, ${fromUnitName} ${toUnitName} conversion, ${fromUnitName} in ${toUnitName}`}
        publishedTime={publishDate}
        modifiedTime={modifiedDate}
      />
      
      {/* Structured Data */}
      <BreadcrumbsStructuredData items={breadcrumbs} />
      <ConversionStructuredData
        fromUnit={mockFromUnit}
        toUnit={mockToUnit}
        category={mockCategory}
        fromValue={1}
        toValue={conversionFormula.factor}
      />
      <ArticleStructuredData
        title={`How to Convert ${fromUnitName} to ${toUnitName}`}
        description={pageDescription}
        datePublished={publishDate}
        dateModified={modifiedDate}
        imageUrl={`https://calcq.app/images/conversions/${category?.toLowerCase()}-${fromUnit?.toLowerCase()}-to-${toUnit?.toLowerCase()}.webp`}
        url={`https://calcq.app/convert/${category}/${fromUnit}/${toUnit}`}
        category={categoryName}
      />
      <FAQStructuredData
        category={categoryName}
        fromUnit={fromUnitName}
        toUnit={toUnitName}
        questions={faqQuestions}
      />
      <CalculatorStructuredData
        calculatorType={`${fromUnitName} to ${toUnitName}`}
        description={`Free online calculator to convert ${fromUnitName} to ${toUnitName}. Instant results with step-by-step instructions and formulas.`}
        url={`https://calcq.app/convert/${category}/${fromUnit}/${toUnit}`}
      />
      
      {/* Visual UI */}
      <Breadcrumbs items={breadcrumbs} className="mb-4 py-2" />
      
      <div className="space-y-8">
        {/* Header Section */}
        <header className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            Convert {fromUnitName} to {toUnitName}
          </h1>
          <p className="text-xl text-muted-foreground">
            {categoryName} unit conversion calculator
          </p>
        </header>
        
        {/* Calculator Section */}
        <div className="bg-card border rounded-lg p-5">
          <h2 className="text-2xl font-semibold mb-4">Convert {fromUnitName} to {toUnitName}</h2>
          <ConverterWithSpecialized
            initialCategory={category}
            initialFromUnit={fromUnit}
            initialToUnit={toUnit}
            initialValue={1}
            disableUrlUpdates={true}
          />
        </div>
        
        {/* Formula and Explanation Section */}
        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">How to Convert {fromUnitName} to {toUnitName}</h2>
            <div className="prose prose-slate max-w-none dark:prose-invert">
              <p>{conversionFormula.explanation}</p>
              
              <h3>Formula</h3>
              <div className="p-4 bg-muted rounded-md">
                <p className="font-mono">{fromUnitName} × {conversionFormula.formula} = {toUnitName}</p>
              </div>
              
              <h3>Step-by-Step Conversion Process</h3>
              <ol>
                <li>Start with your {fromUnitName} value.</li>
                <li>{conversionFormula.steps[0]}</li>
                <li>{conversionFormula.steps[1]}</li>
                <li>The result is your answer in {toUnitName}.</li>
              </ol>
            </div>
          </section>
          
          {/* Example Conversions */}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Example {fromUnitName} to {toUnitName} Conversions</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="border px-4 py-2 text-left">{fromUnitName}</th>
                    <th className="border px-4 py-2 text-left">{toUnitName}</th>
                  </tr>
                </thead>
                <tbody>
                  {exampleConversions.map((example, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-card" : "bg-muted/50"}>
                      <td className="border px-4 py-2">{example.from}</td>
                      <td className="border px-4 py-2">{example.to}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          
          {/* Common Use Cases */}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">When to Convert {fromUnitName} to {toUnitName}</h2>
            <div className="prose prose-slate max-w-none dark:prose-invert">
              <p>{getConversionUseCase(fromUnit || '', toUnit || '', category || '')}</p>
              
              <h3>Practical Applications</h3>
              <ul>
                {getUseCaseApplications(fromUnit || '', toUnit || '', category || '').map((application, index) => (
                  <li key={index}>{application}</li>
                ))}
              </ul>
            </div>
          </section>
        </div>
        
        {/* Related Conversions */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Related Conversions</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {relatedConversions.map((conversion, index) => (
              <li key={index} className="hover:bg-muted rounded-md p-2 transition-colors">
                <a 
                  href={`/convert/${conversion.category}/${conversion.from}/${conversion.to}`}
                  className="block text-foreground hover:underline"
                >
                  {conversion.from} to {conversion.to}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

// Helper functions - these would be more sophisticated in a real implementation

interface ConversionFormula {
  factor: number;
  formula: string;
  explanation: string;
  steps: string[];
}

interface RelatedConversion {
  category: string;
  from: string;
  to: string;
}

function getConversionFormula(fromUnit: string, toUnit: string): ConversionFormula {
  // This is a simplified example - in reality, you would have a database or API for accurate formulas
  const commonFormulas: Record<string, ConversionFormula> = {
    'meter-foot': {
      factor: 3.28084,
      formula: '× 3.28084',
      explanation: 'multiply the length value by 3.28084',
      steps: ['Multiply your meter value by the conversion factor 3.28084', 'The result gives you the equivalent in feet']
    },
    'celsius-fahrenheit': {
      factor: 33.8, // This is just for the example conversions, not accurate
      formula: '× 9/5 + 32',
      explanation: 'multiply by 9/5 (or 1.8) and then add 32',
      steps: ['Multiply your Celsius temperature by 9/5 (or 1.8)', 'Add 32 to the result']
    },
    'kilogram-pound': {
      factor: 2.20462,
      formula: '× 2.20462',
      explanation: 'multiply the mass value by 2.20462',
      steps: ['Multiply your kilogram value by the conversion factor 2.20462', 'The result gives you the equivalent in pounds']
    }
  };
  
  const key = `${fromUnit}-${toUnit}`;
  if (commonFormulas[key]) {
    return commonFormulas[key];
  }
  
  // Default fallback
  return {
    factor: 2, // Example factor
    formula: '× conversion factor',
    explanation: 'apply the appropriate conversion factor',
    steps: ['Apply the conversion factor', 'Calculate the final result']
  };
}

function getConversionUseCase(fromUnit: string, toUnit: string, category: string): string {
  const useCases: Record<string, string> = {
    'meter-foot': 'Converting meters to feet is common when working with international measurements, especially between metric and imperial systems. This conversion is useful in construction, interior design, and when traveling between countries that use different measurement systems.',
    'celsius-fahrenheit': 'Converting Celsius to Fahrenheit is essential when traveling between countries that use different temperature scales, interpreting weather forecasts, setting ovens or other appliances, and understanding medical temperature readings.',
    'kilogram-pound': 'Converting kilograms to pounds is necessary when dealing with international shipping, following recipes from different regions, understanding product weights in global commerce, and converting body weight measurements.'
  };
  
  const key = `${fromUnit}-${toUnit}`;
  return useCases[key] || `Converting ${fromUnit} to ${toUnit} is useful in various ${category} applications where different measurement systems are used.`;
}

function getUseCaseApplications(fromUnit: string, toUnit: string, category: string): string[] {
  const applications: Record<string, string[]> = {
    'meter-foot': [
      'International construction projects using materials from different regions',
      'Interior design when using furniture from international suppliers',
      'Reading maps and navigation between countries with different systems',
      'Understanding product dimensions when shopping internationally'
    ],
    'celsius-fahrenheit': [
      'Setting cooking temperatures when using recipes from different regions',
      'Understanding weather forecasts when traveling internationally',
      'Medical applications where different temperature scales might be used',
      'Scientific experiments requiring temperature conversion'
    ],
    'kilogram-pound': [
      'International shipping and freight calculations',
      'Fitness tracking when using equipment calibrated in different units',
      'Cooking and baking with international recipes',
      'Medication dosing based on body weight in different measurement systems'
    ]
  };
  
  const key = `${fromUnit}-${toUnit}`;
  return applications[key] || [
    `${category} measurements in international contexts`,
    `Scientific and technical applications involving ${category}`,
    `Educational settings teaching ${category} conversions`,
    `Everyday situations requiring unit conversion`
  ];
}

function getRelatedConversions(category: string): RelatedConversion[] {
  // This would be replaced with dynamic suggestions based on user behavior, popular conversions, etc.
  const relatedByCategory: Record<string, RelatedConversion[]> = {
    'length': [
      { category: 'length', from: 'meter', to: 'yard' },
      { category: 'length', from: 'centimeter', to: 'inch' },
      { category: 'length', from: 'kilometer', to: 'mile' },
      { category: 'length', from: 'foot', to: 'meter' }
    ],
    'temperature': [
      { category: 'temperature', from: 'fahrenheit', to: 'celsius' },
      { category: 'temperature', from: 'celsius', to: 'kelvin' },
      { category: 'temperature', from: 'kelvin', to: 'fahrenheit' },
      { category: 'temperature', from: 'fahrenheit', to: 'kelvin' }
    ],
    'mass': [
      { category: 'mass', from: 'pound', to: 'kilogram' },
      { category: 'mass', from: 'gram', to: 'ounce' },
      { category: 'mass', from: 'ton', to: 'kilogram' },
      { category: 'mass', from: 'ounce', to: 'gram' }
    ]
  };
  
  return relatedByCategory[category] || [
    { category: 'length', from: 'meter', to: 'foot' },
    { category: 'temperature', from: 'celsius', to: 'fahrenheit' },
    { category: 'mass', from: 'kilogram', to: 'pound' },
    { category: 'volume', from: 'liter', to: 'gallon' }
  ];
}

export default ConversionLanding; 