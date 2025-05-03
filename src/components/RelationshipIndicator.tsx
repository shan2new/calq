import React, { useState, useMemo } from 'react';
import { Info, X } from 'lucide-react';
import { Unit } from '../lib/unit-types';

interface RelationshipIndicatorProps {
  fromUnit: Unit;
  toUnit: Unit;
  conversionFactor: number;
}

// Determine relationship type based on conversion factor
const determineRelationshipType = (factor: number): 'multiple' | 'fraction' | 'complex' => {
  if (factor === 1) return 'multiple';
  if (factor > 1 && Number.isInteger(factor)) return 'multiple';
  if (factor < 1 && Number.isInteger(1 / factor)) return 'fraction';
  return 'complex';
};

// Format the factor for display
const formatFactor = (factor: number): string => {
  if (factor === 1) return '1';
  
  if (factor > 1 && factor < 1000) {
    // For larger whole numbers or simple decimals
    return Number.isInteger(factor) ? factor.toString() : factor.toFixed(4).replace(/\.?0+$/, '');
  }
  
  if (factor < 1 && factor > 0.001) {
    // Show as fraction if it's a clean divisor
    const inverse = 1 / factor;
    if (Number.isInteger(inverse)) {
      return `1/${inverse}`;
    }
    return factor.toFixed(4).replace(/\.?0+$/, '');
  }
  
  // For very large numbers, show in a more readable format
  if (factor >= 1000) {
    return `× ${(factor).toLocaleString('en-US', {maximumFractionDigits: 2})}`;
  }
  
  // For very small numbers, use division format
  if (factor <= 0.001) {
    return `÷ ${(1/factor).toLocaleString('en-US', {maximumFractionDigits: 0})}`;
  }
  
  // Fallback to fixed format
  return factor.toFixed(4).replace(/\.?0+$/, '');
};

// Generate a simple conversion formula
const generateConversionFormula = (fromUnit: Unit, toUnit: Unit, factor: number): string => {
  const fromSymbol = fromUnit.symbol;
  const toSymbol = toUnit.symbol;
  
  const relationship = determineRelationshipType(factor);
  
  if (relationship === 'multiple') {
    return `1 ${fromSymbol} × ${formatFactor(factor)} = ${formatFactor(factor)} ${toSymbol}`;
  } else if (relationship === 'fraction') {
    const inverse = 1 / factor;
    return `1 ${fromSymbol} ÷ ${formatFactor(inverse)} = ${formatFactor(factor)} ${toSymbol}`;
  } else {
    return `1 ${fromSymbol} × ${formatFactor(factor)} = ${formatFactor(factor)} ${toSymbol}`;
  }
};

// Generate some real-world examples for the conversion
const generateRealWorldExamples = (fromUnit: Unit, toUnit: Unit, factor: number): string[] => {
  const examples: string[] = [];
  
  // This function would be much more sophisticated in a real implementation
  // with a database of examples for different unit types
  examples.push(`${formatFactor(factor)} ${toUnit.symbol} is equivalent to 1 ${fromUnit.symbol}`);
  
  // Add some contextual examples based on unit types
  if (fromUnit.id === 'meter' && toUnit.id === 'foot') {
    examples.push('A basketball hoop is 10 feet (3.05 meters) high');
  } else if (fromUnit.id === 'kilometer' && toUnit.id === 'mile') {
    examples.push('A marathon is 26.2 miles (42.16 kilometers)');
  } else if (fromUnit.id === 'celsius' && toUnit.id === 'fahrenheit') {
    examples.push('Room temperature is about 20-22°C (68-72°F)');
  }
  
  return examples;
};

const RelationshipIndicator: React.FC<RelationshipIndicatorProps> = ({
  fromUnit,
  toUnit,
  conversionFactor,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Calculate relationship information
  const relationship = useMemo(() => {
    const type = determineRelationshipType(conversionFactor);
    const formula = generateConversionFormula(fromUnit, toUnit, conversionFactor);
    const examples = generateRealWorldExamples(fromUnit, toUnit, conversionFactor);
    
    return { type, formula, examples };
  }, [fromUnit, toUnit, conversionFactor]);
  
  return (
    <>
      <button 
        className="relationship-indicator mt-4 px-3 py-2 rounded-md bg-card border border-border flex items-center justify-between w-full hover:bg-muted/50 transition-colors" 
        onClick={() => setShowDetails(true)}
        aria-label="View conversion details"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {relationship.type === 'multiple' && conversionFactor >= 1 ? 'Multiply by' : 
             relationship.type === 'multiple' && conversionFactor < 1 ? 'Divide by' :
             relationship.type === 'fraction' ? 'Divide by' :
             'Complex conversion'}
          </span>
          <span className="font-medium">
            {relationship.type === 'multiple' && conversionFactor >= 1 && formatFactor(conversionFactor)}
            {relationship.type === 'multiple' && conversionFactor < 1 && formatFactor(1 / conversionFactor)}
            {relationship.type === 'fraction' && formatFactor(1 / conversionFactor)}
            {relationship.type === 'complex' && formatFactor(conversionFactor)}
          </span>
        </div>
        <Info size={16} className="text-muted-foreground" />
      </button>
      
      {showDetails && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relationship-details bg-card border border-border rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Conversion Details</h3>
              <button 
                onClick={() => setShowDetails(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close details"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="formula p-3 bg-muted rounded-md text-center font-medium">
                {relationship.formula}
              </div>
              
              <div className="visualization">
                <div className="relative h-6 bg-muted rounded-full overflow-hidden mb-2">
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-primary"
                    style={{ 
                      width: `${Math.min(100, conversionFactor * 100)}%`,
                      maxWidth: '100%'
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 {fromUnit.symbol}</span>
                  <span>{formatFactor(conversionFactor)} {toUnit.symbol}</span>
                </div>
              </div>
              
              <div className="examples">
                <h4 className="text-sm font-medium mb-2">Examples</h4>
                <ul className="space-y-2">
                  {relationship.examples.map((example, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      • {example}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RelationshipIndicator; 