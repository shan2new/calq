import React, { createContext, useContext, useEffect, useState } from 'react';
import { ConversionRecord } from './HistoryContext';

interface FavoritesContextType {
  favorites: ConversionRecord[];
  addToFavorites: (conversion: ConversionRecord) => void;
  removeFromFavorites: (id: string) => void;
  isInFavorites: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<ConversionRecord[]>([]);

  // Load favorites from localStorage on initial render
  useEffect(() => {
    const savedFavorites = localStorage.getItem('conversionFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to parse conversion favorites:', error);
        localStorage.removeItem('conversionFavorites');
      }
    }
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('conversionFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (conversion: ConversionRecord) => {
    setFavorites(prev => {
      // Check if already in favorites to avoid duplicates
      if (prev.some(fav => fav.id === conversion.id)) {
        return prev;
      }
      return [...prev, conversion];
    });
  };

  const removeFromFavorites = (id: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== id));
  };

  const isInFavorites = (id: string) => {
    return favorites.some(fav => fav.id === id);
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addToFavorites, removeFromFavorites, isInFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}; 