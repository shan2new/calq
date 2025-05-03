import React, { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';

interface UnitFact {
  id: string;
  unitId: string;
  text: string;
  source?: string;
  category: 'history' | 'usage' | 'interesting' | 'equivalent';
}

// Helper function to store recently shown facts in localStorage
const getRecentlyShownFactIds = (): string[] => {
  try {
    const stored = localStorage.getItem('recent_facts');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading recent facts from localStorage:', error);
  }
  return [];
};

const addToRecentFactIds = (factId: string) => {
  try {
    const recent = getRecentlyShownFactIds();
    // Keep last 10 facts to avoid showing duplicates too frequently
    const updated = [factId, ...recent.slice(0, 9)];
    localStorage.setItem('recent_facts', JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recent facts to localStorage:', error);
  }
};

// Example facts for demonstration
// In a real app, these would be loaded from a database or API
const sampleUnitFacts: UnitFact[] = [
  {
    id: 'meter-history-1',
    unitId: 'meter',
    text: 'The meter was originally defined in 1793 as one ten-millionth of the distance from the equator to the North Pole along a meridian through Paris.',
    source: 'International Bureau of Weights and Measures',
    category: 'history',
  },
  {
    id: 'celsius-usage-1',
    unitId: 'celsius',
    text: 'The Celsius scale was previously known as the centigrade scale until 1948, when it was renamed to honor Anders Celsius.',
    source: 'National Institute of Standards and Technology',
    category: 'history',
  },
  {
    id: 'mile-interesting-1',
    unitId: 'mile',
    text: 'The word "mile" comes from the Latin "mille passus" meaning "thousand paces," which was the distance of 1,000 paces (or 2,000 steps) of a Roman legion.',
    category: 'interesting',
  },
  {
    id: 'kilogram-equivalent-1',
    unitId: 'kilogram',
    text: 'One kilogram is approximately equal to the mass of 1 liter of water at 4°C.',
    category: 'equivalent',
  },
  {
    id: 'foot-history-1',
    unitId: 'foot',
    text: 'The foot was originally based on the length of a human foot, but has varied in length throughout history and across different cultures.',
    category: 'history',
  },
];

// Function to get facts for a specific unit
const getUnitFacts = async (unitId: string, categoryId: string): Promise<UnitFact[]> => {
  // In a real app, this would fetch from a database or API
  // For now, we'll just filter our sample facts
  return sampleUnitFacts.filter(fact => fact.unitId === unitId || fact.unitId === categoryId);
};

interface UnitInformationProps {
  unitId: string;
  categoryId: string;
}

const UnitInformation: React.FC<UnitInformationProps> = ({ unitId, categoryId }) => {
  const [fact, setFact] = useState<UnitFact | null>(null);
  const [showFact, setShowFact] = useState(false);
  
  // Load random fact when unit changes
  useEffect(() => {
    const loadRandomFact = async () => {
      try {
        // Get random fact that hasn't been shown recently
        const facts = await getUnitFacts(unitId, categoryId);
        if (facts.length === 0) return;
        
        const recentFactIds = getRecentlyShownFactIds();
        
        const availableFacts = facts.filter(f => !recentFactIds.includes(f.id));
        
        if (availableFacts.length > 0) {
          const randomFact = availableFacts[Math.floor(Math.random() * availableFacts.length)];
          setFact(randomFact);
          addToRecentFactIds(randomFact.id);
        } else if (facts.length > 0) {
          // If all facts have been shown, just pick a random one
          setFact(facts[Math.floor(Math.random() * facts.length)]);
        } else {
          setFact(null);
        }
      } catch (error) {
        console.error('Failed to load unit fact:', error);
        setFact(null);
      }
    };
    
    // Wait a moment before showing the fact to avoid overwhelming the user
    const timer = setTimeout(() => {
      loadRandomFact();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [unitId, categoryId]);
  
  // Auto hide the fact after 8 seconds if shown
  useEffect(() => {
    if (showFact) {
      const timer = setTimeout(() => {
        setShowFact(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showFact]);
  
  if (!fact) return null;
  
  return (
    <div className="unit-info-container mt-4">
      <button
        className="info-button flex items-center text-sm text-muted-foreground hover:text-foreground"
        onClick={() => setShowFact(!showFact)}
        aria-label={showFact ? "Hide unit information" : "Show unit information"}
      >
        <Info size={14} className="mr-1.5" />
        <span>Did you know?</span>
      </button>
      
      {showFact && (
        <div className="fact-content mt-2 p-3 bg-muted/50 border border-border rounded-md relative">
          <button 
            onClick={() => setShowFact(false)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            aria-label="Close fact"
          >
            <X size={14} />
          </button>
          
          <p className="text-sm pr-6">{fact.text}</p>
          
          {fact.source && (
            <div className="fact-source mt-2 text-xs text-muted-foreground">
              Source: {fact.source}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnitInformation; 