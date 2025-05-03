import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  addHistoryRecord, 
  getHistoryRecords, 
  clearHistoryRecords, 
  removeHistoryRecord 
} from '../lib/indexedDB';

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
  isLoading: boolean;
  addToHistory: (record: Omit<ConversionRecord, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<ConversionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history from IndexedDB on initial render
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        
        // Try to load from IndexedDB first
        const records = await getHistoryRecords(20); // Limit to 20 records as specified
        
        if (records.length > 0) {
          setHistory(records);
        } else {
          // Fallback to localStorage if IndexedDB is empty
          const savedHistory = localStorage.getItem('conversionHistory');
          if (savedHistory) {
            try {
              const parsedHistory = JSON.parse(savedHistory);
              
              // Transfer localStorage history to IndexedDB
              setHistory(parsedHistory);
              
              // Add each record to IndexedDB
              for (const record of parsedHistory) {
                await addHistoryRecord(record);
              }
              
              // Clear localStorage after migration
              localStorage.removeItem('conversionHistory');
            } catch (error) {
              console.error('Failed to parse conversion history from localStorage:', error);
              localStorage.removeItem('conversionHistory');
            }
          }
        }
      } catch (error) {
        console.error('Failed to load history from IndexedDB:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHistory();
  }, []);

  // We don't need to save to localStorage anymore since we're using IndexedDB
  // But we keep the state updated for the UI

  const addToHistory = async (record: Omit<ConversionRecord, 'id' | 'timestamp'>) => {
    const newRecord: ConversionRecord = {
      ...record,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    
    // Update the state first for immediate UI feedback
    setHistory(prev => [newRecord, ...prev.slice(0, 19)]); // Limit to 20 entries (1 new + 19 existing)
    
    // Then add to IndexedDB in the background
    try {
      await addHistoryRecord(newRecord);
    } catch (error) {
      console.error('Failed to add history record to IndexedDB:', error);
    }
  };

  const clearHistory = async () => {
    setHistory([]);
    
    try {
      await clearHistoryRecords();
    } catch (error) {
      console.error('Failed to clear history records from IndexedDB:', error);
    }
  };

  const removeFromHistory = async (id: string) => {
    setHistory(prev => prev.filter(record => record.id !== id));
    
    try {
      await removeHistoryRecord(id);
    } catch (error) {
      console.error('Failed to remove history record from IndexedDB:', error);
    }
  };

  return (
    <HistoryContext.Provider
      value={{ history, isLoading, addToHistory, clearHistory, removeFromHistory }}
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