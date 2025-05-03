import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ruler, Scale, Beaker, Thermometer, Square, PlaneTakeoff, Clock, HardDrive, ChevronRight, Star, History } from 'lucide-react';
import { ConversionRecord } from '../contexts/HistoryContext';
import { getRecentConversions, getRecommendedConversions, getFrequentCategories, preloadFrequentConversionData } from '../lib/indexedDB';
import { unitCategories } from '../lib/units';

// Skeleton loaders for quick access sections
const QuickAccessSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-5 bg-muted rounded w-1/4 mb-2"></div>
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-16 bg-muted rounded-lg min-w-[160px] flex-shrink-0"></div>
      ))}
    </div>
  </div>
);

// Category card skeleton
const CategorySkeleton = () => (
  <div className="grid grid-cols-2 gap-3">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="h-24 bg-muted rounded-lg animate-pulse"></div>
    ))}
  </div>
);

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [recentConversions, setRecentConversions] = useState<ConversionRecord[]>([]);
  const [recommendedConversions, setRecommendedConversions] = useState<any[]>([]);
  const [frequentCategories, setFrequentCategories] = useState<{id: string, count: number}[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  // Load quick access data on mount
  useEffect(() => {
    const loadQuickAccessData = async () => {
      try {
        // Fetch recent conversions
        setIsLoadingRecent(true);
        const recent = await getRecentConversions(6); // Increased limit to 6
        setRecentConversions(recent);
        setIsLoadingRecent(false);
        
        // Fetch frequently used categories
        setIsLoadingCategories(true);
        const categories = await getFrequentCategories(8);
        setFrequentCategories(categories);
        
        // Fetch recommended conversions in background
        const recommendations = await getRecommendedConversions(4);
        setRecommendedConversions(recommendations);
        setIsLoadingCategories(false);
        
        // Preload additional data in the background
        preloadFrequentConversionData();
      } catch (error) {
        console.error('Error loading quick access data:', error);
        setIsLoadingRecent(false);
        setIsLoadingCategories(false);
      }
    };
    
    loadQuickAccessData();
  }, []);
  
  // Handle quick conversion selection
  const handleQuickConvert = (record: ConversionRecord) => {
    navigate(`/converter?category=${record.category}&from=${record.fromUnit}&to=${record.toUnit}&value=${record.fromValue}`);
  };
  
  // Get unit name from ID
  const getUnitName = (categoryId: string, unitId: string): string => {
    const category = unitCategories.find(cat => cat.id === categoryId);
    if (!category) return unitId;
    
    const unit = category.units.find(u => u.id === unitId);
    return unit ? unit.name : unitId;
  };
  
  // Get category name from ID
  const getCategoryName = (categoryId: string): string => {
    const category = unitCategories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };
  
  // Get category accent color and icon
  const getCategoryStyle = (categoryId: string) => {
    const category = conversionCategories.find(cat => cat.id === categoryId);
    return category ? {
      accentColor: category.accentColor,
      icon: category.icon
    } : {
      accentColor: 'bg-primary/10 text-primary',
      icon: <Square className="w-5 h-5" />
    };
  };
  
  // Categories with unique accent colors
  const conversionCategories = [
    { id: 'length', name: 'Length', icon: <Ruler className="w-5 h-5" />, accentColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    { id: 'mass', name: 'Mass', icon: <Scale className="w-5 h-5" />, accentColor: 'bg-green-500/10 text-green-600 dark:text-green-400' },
    { id: 'volume', name: 'Volume', icon: <Beaker className="w-5 h-5" />, accentColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
    { id: 'temperature', name: 'Temperature', icon: <Thermometer className="w-5 h-5" />, accentColor: 'bg-red-500/10 text-red-600 dark:text-red-400' },
    { id: 'area', name: 'Area', icon: <Square className="w-5 h-5" />, accentColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    { id: 'speed', name: 'Speed', icon: <PlaneTakeoff className="w-5 h-5" />, accentColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' },
    { id: 'time', name: 'Time', icon: <Clock className="w-5 h-5" />, accentColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
    { id: 'digital', name: 'Digital', icon: <HardDrive className="w-5 h-5" />, accentColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  ];
  
  // Get prioritized categories (frequent if available, otherwise default)
  const prioritizedCategories = frequentCategories.length > 0
    ? frequentCategories.map(freq => {
        const category = conversionCategories.find(cat => cat.id === freq.id);
        return category || conversionCategories[0]; // Fallback to first category if not found
      })
    : conversionCategories.slice(0, 8);
    
  // Get most commonly used unit conversion for a category
  const getMostCommonConversion = (categoryId: string) => {
    const categoryRecommendations = recommendedConversions.filter(r => r.category === categoryId);
    if (categoryRecommendations.length > 0) {
      const topRecommendation = categoryRecommendations[0];
      return `${getUnitName(categoryId, topRecommendation.fromUnit)} → ${getUnitName(categoryId, topRecommendation.toUnit)}`;
    }
    return null;
  };
  
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Quick Access - Recent & Favorite Conversions */}
      <div className="space-y-4 mt-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-medium">Quick Conversions</h2>
          </div>
          <Link to="/history" className="text-sm text-primary hover:underline flex items-center">
            View all
            <ChevronRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
        
        {isLoadingRecent ? (
          <QuickAccessSkeleton />
        ) : recentConversions.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
            {recentConversions.map((record) => {
              const { accentColor, icon } = getCategoryStyle(record.category);
              return (
                <button
                  key={record.id}
                  onClick={() => handleQuickConvert(record)}
                  className="flex-shrink-0 snap-start min-w-[180px] p-3 bg-card border border-border rounded-lg hover:bg-muted/50 hover:border-primary/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 text-left"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div className={`p-1.5 rounded-full ${accentColor}`}>
                      {icon}
                    </div>
                    {record.isFavorite && (
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-col">
                      <div className="flex items-center text-sm">
                        <span className="font-medium truncate">{record.fromValue}</span>
                        <span className="text-xs text-muted-foreground ml-1 truncate">{getUnitName(record.category, record.fromUnit)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="font-medium truncate">{record.toValue}</span>
                        <span className="text-xs text-muted-foreground ml-1 truncate">{getUnitName(record.category, record.toUnit)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{getCategoryName(record.category)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-muted/30 rounded-lg p-4 text-center text-sm text-muted-foreground">
            Your recent conversions will appear here
          </div>
        )}
      </div>
      
      {/* Categories Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Categories</h2>
        </div>
        
        {isLoadingCategories ? (
          <CategorySkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {prioritizedCategories.map((category) => {
              const commonConversion = getMostCommonConversion(category.id);
              const categoryCount = frequentCategories.find(c => c.id === category.id)?.count || 0;
              const showCategoryCount = categoryCount > 0;
              
              return (
                <Link
                  key={category.id}
                  to={`/converter?category=${category.id}`}
                  className="flex flex-col p-3 bg-card border border-border rounded-lg hover:bg-muted/50 hover:border-primary/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-full ${category.accentColor}`}>
                      {category.icon}
                    </div>
                    {showCategoryCount && (
                      <span className="text-xs px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground">
                        {categoryCount}×
                      </span>
                    )}
                  </div>
                  <span className="font-medium">{category.name}</span>
                  {commonConversion && (
                    <span className="text-xs text-muted-foreground mt-1 truncate">{commonConversion}</span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Contextual Widget */}
      {recommendedConversions.length > 0 && (
        <div className="bg-muted/20 border border-border rounded-lg p-4 space-y-2">
          <h3 className="font-medium">Did you know?</h3>
          <p className="text-sm text-muted-foreground">
            Your most used conversion is {' '}
            <span className="font-medium text-foreground">
              {getUnitName(recommendedConversions[0].category, recommendedConversions[0].fromUnit)} → {getUnitName(recommendedConversions[0].category, recommendedConversions[0].toUnit)}
            </span>{' '}
            ({getCategoryName(recommendedConversions[0].category)})
          </p>
          <Link 
            to={`/converter?category=${recommendedConversions[0].category}&from=${recommendedConversions[0].fromUnit}&to=${recommendedConversions[0].toUnit}`}
            className="text-sm text-primary hover:underline flex items-center mt-1"
          >
            Use this conversion
            <ChevronRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home; 