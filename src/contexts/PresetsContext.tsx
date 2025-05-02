import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Preset {
  id: string;
  name: string;
  category: string;
  fromUnit: string;
  toUnit: string;
}

interface PresetsContextType {
  presets: Preset[];
  addPreset: (preset: Omit<Preset, 'id'>) => void;
  updatePreset: (id: string, updates: Partial<Omit<Preset, 'id'>>) => void;
  removePreset: (id: string) => void;
}

const PresetsContext = createContext<PresetsContextType | undefined>(undefined);

export const PresetsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [presets, setPresets] = useState<Preset[]>([]);

  // Load presets from localStorage on initial render
  useEffect(() => {
    const savedPresets = localStorage.getItem('conversionPresets');
    if (savedPresets) {
      try {
        setPresets(JSON.parse(savedPresets));
      } catch (error) {
        console.error('Failed to parse conversion presets:', error);
        localStorage.removeItem('conversionPresets');
      }
    }
  }, []);

  // Save presets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('conversionPresets', JSON.stringify(presets));
  }, [presets]);

  const addPreset = (preset: Omit<Preset, 'id'>) => {
    const newPreset: Preset = {
      ...preset,
      id: Date.now().toString(),
    };
    setPresets(prev => [...prev, newPreset]);
  };

  const updatePreset = (id: string, updates: Partial<Omit<Preset, 'id'>>) => {
    setPresets(prev => 
      prev.map(preset => 
        preset.id === id ? { ...preset, ...updates } : preset
      )
    );
  };

  const removePreset = (id: string) => {
    setPresets(prev => prev.filter(preset => preset.id !== id));
  };

  return (
    <PresetsContext.Provider
      value={{ presets, addPreset, updatePreset, removePreset }}
    >
      {children}
    </PresetsContext.Provider>
  );
};

export const usePresets = (): PresetsContextType => {
  const context = useContext(PresetsContext);
  if (context === undefined) {
    throw new Error('usePresets must be used within a PresetsProvider');
  }
  return context;
}; 