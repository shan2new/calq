import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeProvider';
import { Sun, Moon, Home, Settings, History, Calculator, Search, Star, Clock, RefreshCw, Compass } from 'lucide-react';
import { unitCategories, formatNumberByCategory } from '../lib/units';
import { useHistory, ConversionRecord } from '../contexts/HistoryContext';
import { getRecentConversions, getRecommendedConversions } from '../lib/indexedDB';

interface LayoutProps {
  children: React.ReactNode;
}

interface SearchResult {
  id: string;
  name: string;
  category: string;
}

interface RecommendedConversion {
  id: string;
  category: string;
  fromUnit: string;
  toUnit: string;
  count: number;
}

// SVG logo component
const LogoIcon = () => (
  <svg
    className="w-7 h-7 mr-1"
    viewBox="0 0 512 512"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <filter id="invertFilter">
        <feComponentTransfer>
          <feFuncR type="table" tableValues="1 0" />
          <feFuncG type="table" tableValues="1 0" />
          <feFuncB type="table" tableValues="1 0" />
        </feComponentTransfer>
      </filter>
    </defs>
    <rect width="512" height="512" rx="100" fill="currentColor" />
    <path
      d="M128 192H384M128 256H384M128 320H384"
      stroke="currentColor"
      strokeWidth="32"
      strokeLinecap="round"
      filter="url(#invertFilter)"
    />
    <path
      d="M192 128L192 384M256 128V384M320 128V384"
      stroke="currentColor"
      strokeWidth="32"
      strokeLinecap="round"
      filter="url(#invertFilter)"
    />
  </svg>
);

// Brand logo with styled text
const BrandLogo = () => (
  <div className="flex items-center">
    <LogoIcon />
    <h1 className="logo-text text-primary text-3xl font-extrabold">
      Calc<span className="letter-q">q</span>
    </h1>
  </div>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { history } = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [recentConversions, setRecentConversions] = useState<ConversionRecord[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedConversion[]>([]);
  const [isLoadingQuickAccess, setIsLoadingQuickAccess] = useState(true);
  
  const isActive = (path: string) => location.pathname === path;

  // Load recent conversions and recommendations
  useEffect(() => {
    const loadQuickAccessData = async () => {
      setIsLoadingQuickAccess(true);
      try {
        // Use requestIdleCallback for non-blocking loading when browser is idle
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(async () => {
            const recentData = await getRecentConversions(3);
            const recommendedData = await getRecommendedConversions(3);
            setRecentConversions(recentData);
            setRecommendations(recommendedData);
            setIsLoadingQuickAccess(false);
          });
        } else {
          // Fallback for browsers without requestIdleCallback
          const recentData = await getRecentConversions(3);
          const recommendedData = await getRecommendedConversions(3);
          setRecentConversions(recentData);
          setRecommendations(recommendedData);
          setIsLoadingQuickAccess(false);
        }
      } catch (error) {
        console.error('Failed to load quick access data:', error);
        setIsLoadingQuickAccess(false);
      }
    };
    
    loadQuickAccessData();
    
    // Refresh data when history changes
    if (history.length > 0) {
      loadQuickAccessData();
    }
  }, [history]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Find matching units across all categories
    if (query.trim()) {
      const results: SearchResult[] = [];
      unitCategories.forEach(category => {
        category.units.forEach(unit => {
          if (
            unit.name.toLowerCase().includes(query.toLowerCase()) ||
            unit.symbol.toLowerCase().includes(query.toLowerCase())
          ) {
            results.push({
              id: unit.id,
              name: `${unit.name} (${unit.symbol})`,
              category: category.id
            });
          }
        });
      });
      setSearchResults(results.slice(0, 5)); // Limit to top 5 results
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowResults(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
    }
  };

  // Handle selecting a search result
  const handleSelectResult = (categoryId: string, unitId: string) => {
    navigate(`/?category=${categoryId}&from=${unitId}`);
    setShowResults(false);
    setSearchQuery('');
  };

  // Render a quick access conversion item
  const renderConversionItem = (
    item: ConversionRecord | RecommendedConversion, 
    type: 'recent' | 'recommended'
  ) => {
    // Find category and unit names for display
    const category = unitCategories.find(cat => cat.id === item.category);
    const fromUnit = category?.units.find(unit => unit.id === item.fromUnit);
    const toUnit = category?.units.find(unit => unit.id === item.toUnit);
    
    if (!category || !fromUnit || !toUnit) return null;
    
    // Format values for display based on unit type
    let formattedFromValue = '1';
    let formattedToValue = '';
    
    if (type === 'recent' && 'fromValue' in item && 'toValue' in item) {
      // It's a ConversionRecord
      formattedFromValue = formatNumberByCategory(item.fromValue, item.category);
      formattedToValue = formatNumberByCategory(item.toValue, item.category);
    } else {
      // It's a RecommendedConversion or we're showing a default value
      formattedToValue = formatNumberByCategory(
        fromUnit.toBase(1),
        item.category
      );
    }
    
    return (
      <button
        key={item.id}
        onClick={() => navigate(`/?category=${item.category}&from=${item.fromUnit}&to=${item.toUnit}`)}
        className="w-full p-2 text-left rounded-md hover:bg-muted transition-colors text-sm group flex flex-col"
        aria-label={`Convert from ${fromUnit.name} to ${toUnit.name}`}
      >
        <div className="flex justify-between items-center">
          <span className="font-medium truncate">{category.name}</span>
          {type === 'recommended' && 'count' in item && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500" /> 
              {item.count > 10 ? 'Frequent' : 'Suggested'}
            </span>
          )}
        </div>
        <div className="mt-1 text-xs flex items-center gap-1 text-muted-foreground">
          <span>{formattedFromValue}</span>
          <span className="font-medium">{fromUnit.symbol}</span>
          <span className="mx-1">→</span>
          <span>{formattedToValue}</span>
          <span className="font-medium">{toUnit.symbol}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar for larger screens */}
      <aside className="w-full md:w-64 md:flex-shrink-0 bg-card border-r border-border hidden md:block" aria-label="Main navigation" role="navigation">
        <div className="h-full px-3 py-4 flex flex-col">
          <div className="mb-6">
            <Link to="/" className="block">
              <BrandLogo />
            </Link>
          </div>
          
          
          <nav className="space-y-1 flex-1" aria-label="Main navigation">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md flex items-center gap-2 ${isActive('/')
                ? 'bg-primary text-primary-foreground' 
                : 'text-foreground hover:bg-muted transition-colors'
              } ripple`}
            >
              <Calculator className="w-5 h-5" />
              <span>Converter</span>
            </Link>
            
            <Link 
              to="/explore" 
              className={`px-3 py-2 rounded-md flex items-center gap-2 ${isActive('/explore')
                ? 'bg-primary text-primary-foreground' 
                : 'text-foreground hover:bg-muted transition-colors'
              } ripple`}
            >
              <Compass className="w-5 h-5" />
              <span>Explore</span>
            </Link>
            
            <Link 
              to="/history" 
              className={`px-3 py-2 rounded-md flex items-center gap-2 ${isActive('/history')
                ? 'bg-primary text-primary-foreground' 
                : 'text-foreground hover:bg-muted transition-colors'
              } ripple`}
            >
              <History className="w-5 h-5" />
              <span>History</span>
            </Link>
            
            <Link 
              to="/settings" 
              className={`px-3 py-2 rounded-md flex items-center gap-2 ${isActive('/settings')
                ? 'bg-primary text-primary-foreground' 
                : 'text-foreground hover:bg-muted transition-colors'
              } ripple`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </nav>
          
          <div className="mt-auto pt-4 border-t border-border">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full px-3 py-2 rounded-md flex items-center justify-between text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ripple"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="text-sm font-medium">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
              {theme === 'dark' ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </aside>
      
      {/* Mobile header */}
      <div className="md:hidden bg-card border-b border-border p-4 flex flex-col gap-3" role="banner">
        <div className="flex items-center justify-between">
          <Link to="/" className="block">
            <BrandLogo />
          </Link>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')}
            className="p-1.5 rounded-md text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ripple"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" aria-hidden="true" /> : theme === 'light' ? <Moon className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
      
      {/* Main content - simplified without transitions */}
      <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6" id="main-content" role="main">
        {children}
      </main>
      
      {/* Mobile navigation */}
      <Navigation />
    </div>
  );
};

const Navigation = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 flex items-center justify-around px-4">
      <Link
        to="/"
        className={`flex flex-col items-center min-w-[64px] p-2 rounded-lg transition-colors ${
          isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Calculator className="w-5 h-5" />
        <span className="text-xs mt-1">Converter</span>
      </Link>

      <Link
        to="/history"
        className={`flex flex-col items-center min-w-[64px] p-2 rounded-lg transition-colors ${
          isActive('/history') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <History className="w-5 h-5" />
        <span className="text-xs mt-1">History</span>
      </Link>

      <Link
        to="/settings"
        className={`flex flex-col items-center min-w-[64px] p-2 rounded-lg transition-colors ${
          isActive('/settings') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Settings className="w-5 h-5" />
        <span className="text-xs mt-1">Settings</span>
      </Link>

      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="flex flex-col items-center min-w-[64px] p-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
        <span className="text-xs mt-1">Theme</span>
      </button>
    </nav>
  );
};

export default Layout;