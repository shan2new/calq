import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ruler, Scale, Beaker, Thermometer, Square, PlaneTakeoff, Clock, HardDrive, Search, ChevronDown, ChevronUp, Info, History, Star, TrendingUp, Zap } from 'lucide-react';
import { ConversionRecord } from '../contexts/HistoryContext';
import { getRecentConversions, getRecommendedConversions, getFrequentCategories, preloadFrequentConversionData } from '../lib/indexedDB';
import { unitCategories } from '../lib/units';

// Skeleton loaders for quick access sections
const QuickAccessSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 bg-muted rounded-lg"></div>
      ))}
    </div>
  </div>
);

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuresExpanded, setFeaturesExpanded] = useState(false);
  const [recentConversions, setRecentConversions] = useState<ConversionRecord[]>([]);
  const [recommendedConversions, setRecommendedConversions] = useState<any[]>([]);
  const [frequentCategories, setFrequentCategories] = useState<{id: string, count: number}[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(true);
  
  // Load quick access data on mount
  useEffect(() => {
    const loadQuickAccessData = async () => {
      try {
        // Fetch recent conversions
        setIsLoadingRecent(true);
        const recent = await getRecentConversions(3);
        setRecentConversions(recent);
        setIsLoadingRecent(false);
        
        // Fetch recommended conversions based on usage patterns
        setIsLoadingRecommended(true);
        const recommendations = await getRecommendedConversions(3);
        setRecommendedConversions(recommendations);
        
        // Fetch frequently used categories
        const categories = await getFrequentCategories(4);
        setFrequentCategories(categories);
        setIsLoadingRecommended(false);
        
        // Preload additional data in the background
        preloadFrequentConversionData();
      } catch (error) {
        console.error('Error loading quick access data:', error);
        setIsLoadingRecent(false);
        setIsLoadingRecommended(false);
      }
    };
    
    loadQuickAccessData();
  }, []);
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/converter?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  // Handle quick conversion selection
  const handleQuickConvert = (record: ConversionRecord) => {
    navigate(`/converter?category=${record.category}&from=${record.fromUnit}&to=${record.toUnit}&value=${record.fromValue}`);
  };
  
  // Handle recommended conversion selection
  const handleRecommendedConvert = (record: any) => {
    navigate(`/converter?category=${record.category}&from=${record.fromUnit}&to=${record.toUnit}`);
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
  
  // Filter categories based on search query
  const filteredCategories = searchQuery.trim()
    ? conversionCategories.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversionCategories;
    
  // Get prioritized categories (frequent if available, otherwise default)
  const prioritizedCategories = frequentCategories.length > 0
    ? frequentCategories.map(freq => {
        const category = conversionCategories.find(cat => cat.id === freq.id);
        return category || conversionCategories[0]; // Fallback to first category if not found
      })
    : conversionCategories.slice(0, 4);
  
  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Hero section */}
      <div className="flex flex-col items-center text-center space-y-4 py-6">
        <h1 className="text-3xl font-bold">Calcq</h1>
        <p className="text-muted-foreground max-w-md">
          Fast, accurate unit conversions across multiple categories
        </p>
        
        {/* Search bar */}
        <form onSubmit={handleSearch} className="w-full max-w-lg relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search units or categories..."
            className="w-full px-3 py-2 pr-10 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            aria-label="Search for units or categories"
          />
          <button 
            type="submit" 
            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Submit search"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>
      
      {/* Quick Access - Recent Conversions */}
      {(isLoadingRecent || recentConversions.length > 0) && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Recent Conversions</h2>
            </div>
            <Link to="/history" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          
          {isLoadingRecent ? (
            <QuickAccessSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {recentConversions.map((record) => {
                const { accentColor, icon } = getCategoryStyle(record.category);
                return (
                  <button
                    key={record.id}
                    onClick={() => handleQuickConvert(record)}
                    className="flex flex-col p-3 bg-card border border-border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 text-left"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className={`p-1.5 rounded-full ${accentColor}`}>
                        {icon}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-1">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{record.fromValue}</span>
                        <span className="text-sm text-muted-foreground">{getUnitName(record.category, record.fromUnit)}</span>
                        <span className="text-muted-foreground mx-1">→</span>
                        <span className="font-medium">{record.toValue}</span>
                        <span className="text-sm text-muted-foreground">{getUnitName(record.category, record.toUnit)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{getCategoryName(record.category)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {/* Smart Recommendations */}
      {(isLoadingRecommended || recommendedConversions.length > 0) && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Recommended For You</h2>
            </div>
            <div className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
              Based on usage
            </div>
          </div>
          
          {isLoadingRecommended ? (
            <QuickAccessSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {recommendedConversions.map((record) => {
                const { accentColor, icon } = getCategoryStyle(record.category);
                return (
                  <button
                    key={record.id}
                    onClick={() => handleRecommendedConvert(record)}
                    className="flex flex-col p-3 bg-card border border-border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 text-left"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className={`p-1.5 rounded-full ${accentColor}`}>
                        {icon}
                      </div>
                      <span className="text-xs flex items-center gap-1 text-amber-500">
                        <Zap className="w-3 h-3" />
                        <span>Used {record.count} times</span>
                      </span>
                    </div>
                    <div className="mt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{getUnitName(record.category, record.fromUnit)}</span>
                        <span className="text-muted-foreground mx-1">→</span>
                        <span className="text-sm">{getUnitName(record.category, record.toUnit)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{getCategoryName(record.category)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {/* Categories section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Popular Categories</h2>
          <Link to="/converter" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredCategories.length > 0 ? (
            (searchQuery ? filteredCategories : prioritizedCategories).map((category) => (
              <Link
                key={category.id}
                to={`/converter?category=${category.id}`}
                className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label={`Convert ${category.name}`}
              >
                <div className={`mb-2 p-1.5 rounded-full ${category.accentColor}`}>{category.icon}</div>
                <span className="text-sm font-medium">{category.name}</span>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-4 text-muted-foreground">
              No matching categories found
            </div>
          )}
        </div>
      </div>
      
      {/* Features section as collapsible accordion */}
      <div className="bg-card border border-border rounded-lg">
        <button 
          onClick={() => setFeaturesExpanded(!featuresExpanded)}
          className="w-full px-5 py-4 flex items-center justify-between text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/50"
          aria-expanded={featuresExpanded}
          aria-controls="features-content"
        >
          <div className="flex items-center">
            <Info className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Why Calcq?</h2>
          </div>
          {featuresExpanded ? 
            <ChevronUp className="w-4 h-4 text-muted-foreground" aria-hidden="true" /> : 
            <ChevronDown className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          }
        </button>
        
        {featuresExpanded && (
          <div 
            id="features-content" 
            className="px-5 pb-5 pt-1 border-t border-border"
          >
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="mr-3 mt-1 text-primary">✓</div>
                <div>
                  <span className="font-medium">Comprehensive Unit Library</span>
                  <p className="text-sm text-muted-foreground">Access a wide range of measurement units for all your conversion needs</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="mr-3 mt-1 text-primary">✓</div>
                <div>
                  <span className="font-medium">Smart Recommendations</span>
                  <p className="text-sm text-muted-foreground">Get personalized suggestions based on your usage patterns</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="mr-3 mt-1 text-primary">✓</div>
                <div>
                  <span className="font-medium">Save Favorites</span>
                  <p className="text-sm text-muted-foreground">Bookmark frequent conversions for faster access</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="mr-3 mt-1 text-primary">✓</div>
                <div>
                  <span className="font-medium">Offline Support</span>
                  <p className="text-sm text-muted-foreground">Convert units anytime, even without an internet connection</p>
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 