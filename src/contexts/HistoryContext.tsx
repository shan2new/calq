import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ConversionRecord {
  id: string;
  fromValue: number;
  fromUnit: string;
  toUnit: string;
  toValue: number;
  category: string;
  timestamp: number;
}

interface HistoryContextType {
  history: ConversionRecord[];
  addToHistory: (record: Omit<ConversionRecord, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<ConversionRecord[]>([]);

  // Load history from localStorage on initial render
  useEffect(() => {
    const savedHistory = localStorage.getItem('conversionHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to parse conversion history:', error);
        localStorage.removeItem('conversionHistory');
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('conversionHistory', JSON.stringify(history));
  }, [history]);

  const addToHistory = (record: Omit<ConversionRecord, 'id' | 'timestamp'>) => {
    const newRecord: ConversionRecord = {
      ...record,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    
    // Add to beginning of array (most recent first)
    setHistory(prev => [newRecord, ...prev.slice(0, 99)]); // Limit to last 100 entries
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(record => record.id !== id));
  };

  return (
    <HistoryContext.Provider
      value={{ history, addToHistory, clearHistory, removeFromHistory }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}; 