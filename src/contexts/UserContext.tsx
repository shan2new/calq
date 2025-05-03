import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserPreferences {
  defaultCategory?: string;
  favoriteUnits: {
    [categoryId: string]: {
      from: string;
      to: string;
    };
  };
  regionalPresets: {
    locale: string;
    metric: boolean;
    currency: string;
    timeFormat: '12h' | '24h';
  };
  themeCustomization: {
    primaryColor: string;
    roundedCorners: boolean;
    fontScale: number;
  };
  featureFlags: {
    premium: boolean;
    multiConversion: boolean;
    formulaConversion: boolean;
    exportData: boolean;
  };
}

interface UserContextType {
  userPreferences: UserPreferences;
  isLoading: boolean;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => Promise<void>;
  detectUserLocation: () => Promise<void>;
  resetPreferences: () => Promise<void>;
  isPremium: () => boolean;
  hasFeature: (featureName: string) => boolean;
}

const defaultPreferences: UserPreferences = {
  favoriteUnits: {},
  regionalPresets: {
    locale: 'en-US',
    metric: true,
    currency: 'USD',
    timeFormat: '24h',
  },
  themeCustomization: {
    primaryColor: '#0284c7',
    roundedCorners: true,
    fontScale: 1,
  },
  featureFlags: {
    premium: false,
    multiConversion: false,
    formulaConversion: false,
    exportData: false,
  },
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user preferences from localStorage on initial render
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        setIsLoading(true);
        const savedPreferences = localStorage.getItem('userPreferences');
        
        if (savedPreferences) {
          setUserPreferences(JSON.parse(savedPreferences));
        } else {
          // First time user - try to detect some defaults automatically
          await detectDefaultSettings();
        }
      } catch (error) {
        console.error('Failed to load user preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserPreferences();
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
      
      // Apply theme customization if provided
      if (userPreferences.themeCustomization) {
        const root = document.documentElement;
        root.style.setProperty('--primary', userPreferences.themeCustomization.primaryColor);
        
        // Apply font scaling if needed
        if (userPreferences.themeCustomization.fontScale !== 1) {
          document.body.style.fontSize = `${userPreferences.themeCustomization.fontScale * 100}%`;
        } else {
          document.body.style.fontSize = '';
        }
        
        // Apply corner rounding preference
        if (!userPreferences.themeCustomization.roundedCorners) {
          root.classList.add('squared-corners');
        } else {
          root.classList.remove('squared-corners');
        }
      }
    }
  }, [userPreferences, isLoading]);

  // Detect default settings based on user's browser and system
  const detectDefaultSettings = async (): Promise<void> => {
    // Detect language/locale
    const browserLocale = navigator.language || 'en-US';
    
    // Detect if user is likely using metric (most of the world) or imperial (US, Liberia, Myanmar)
    const imperialCountries = ['US', 'LR', 'MM'];
    const userCountry = browserLocale.split('-')[1];
    const useMetric = !userCountry || !imperialCountries.includes(userCountry);
    
    // Detect time format preference
    const is24h = new Intl.DateTimeFormat(browserLocale, { hour: 'numeric' })
      .format(new Date(2000, 0, 1, 13))
      .includes('13');
    
    // Update preferences with detected values
    setUserPreferences({
      ...defaultPreferences,
      regionalPresets: {
        ...defaultPreferences.regionalPresets,
        locale: browserLocale,
        metric: useMetric,
        timeFormat: is24h ? '24h' : '12h',
      }
    });
  };

  // Attempt to detect user's location using Geolocation API
  const detectUserLocation = async (): Promise<void> => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Request user location permission
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      // Here you would typically make an API call to a service like
      // Google Maps Geocoding API to get country/locale information
      // from the latitude/longitude coordinates
      
      // For now, we'll use a mock implementation
      console.log('Location detected:', position.coords.latitude, position.coords.longitude);
      
      // Mock update - in a real app you'd derive this from API response
      setUserPreferences({
        ...userPreferences,
        regionalPresets: {
          ...userPreferences.regionalPresets,
          // This would come from the geocoding API response
          locale: navigator.language,
        }
      });
      
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user preferences
  const updatePreferences = async (newPrefs: Partial<UserPreferences>): Promise<void> => {
    setUserPreferences(prev => {
      // Create a new object that properly merges all nested objects
      const updated: UserPreferences = {
        ...prev,
        // These are optional or can be overwritten entirely
        defaultCategory: newPrefs.defaultCategory ?? prev.defaultCategory,
        
        // For the required objects, we need to preserve their structure
        favoriteUnits: {
          ...prev.favoriteUnits,
          ...(newPrefs.favoriteUnits || {})
        },
        regionalPresets: {
          ...prev.regionalPresets,
          ...(newPrefs.regionalPresets || {})
        },
        themeCustomization: {
          ...prev.themeCustomization,
          ...(newPrefs.themeCustomization || {})
        },
        featureFlags: {
          ...prev.featureFlags,
          ...(newPrefs.featureFlags || {})
        }
      };
      
      return updated;
    });
  };

  // Reset preferences to defaults
  const resetPreferences = async (): Promise<void> => {
    setUserPreferences(defaultPreferences);
  };

  // Check if user has premium access
  const isPremium = (): boolean => {
    return !!userPreferences.featureFlags?.premium;
  };

  // Check if a specific feature is available
  const hasFeature = (featureName: string): boolean => {
    if (featureName === 'premium') {
      return isPremium();
    }
    return isPremium() && !!userPreferences.featureFlags?.[featureName as keyof typeof userPreferences.featureFlags];
  };

  return (
    <UserContext.Provider
      value={{
        userPreferences,
        isLoading,
        updatePreferences,
        detectUserLocation,
        resetPreferences,
        isPremium,
        hasFeature,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 