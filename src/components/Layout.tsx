import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useTheme } from '../contexts/ThemeProvider';
import { Sun, Moon, Home, Settings, History, Calculator, Search, Star, Clock, RefreshCw } from 'lucide-react';
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
  
  // Add nodeRef for transition
  const nodeRef = useRef(null);
  
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
      navigate(`/converter?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
    }
  };

  // Handle selecting a search result
  const handleSelectResult = (categoryId: string, unitId: string) => {
    navigate(`/converter?category=${categoryId}&from=${unitId}`);
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
        onClick={() => navigate(`/converter?category=${item.category}&from=${item.fromUnit}&to=${item.toUnit}`)}
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
          
          {/* Search input for desktop */}
          <div className="mb-4 relative" role="search">
            <form onSubmit={handleSearch} onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search units..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  aria-label="Search for units"
                  aria-expanded={showResults}
                  aria-controls={showResults ? "search-results" : undefined}
                />
                <button 
                  type="submit" 
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-primary ripple"
                  aria-label="Submit search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
              
              {/* Search results dropdown */}
              {showResults && searchResults.length > 0 && (
                <div 
                  id="search-results"
                  className="absolute z-20 w-full mt-1 bg-card border border-border rounded-md shadow-md max-h-60 overflow-auto"
                  role="listbox"
                  aria-label="Search results"
                >
                  <ul>
                    {searchResults.map((result, index) => (
                      <li key={index} role="option">
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-muted text-sm ripple"
                          onClick={() => handleSelectResult(result.category, result.id)}
                          aria-selected="false"
                        >
                          {result.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </form>
          </div>
          
          {/* Quick Access Section */}
          <div className="mb-4">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-1 font-semibold">Quick Access</h2>
            
            {isLoadingQuickAccess ? (
              <div className="flex justify-center p-4">
                <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {/* Recent Conversions */}
                {recentConversions.length > 0 && (
                  <div>
                    <h3 className="text-xs text-muted-foreground flex items-center gap-1 px-1 mb-1">
                      <Clock className="w-3 h-3" /> Recent
                    </h3>
                    <div className="space-y-1">
                      {recentConversions.map(item => renderConversionItem(item, 'recent'))}
                    </div>
                  </div>
                )}
                
                {/* Recommended Conversions */}
                {recommendations.length > 0 && (
                  <div className="mt-3">
                    <h3 className="text-xs text-muted-foreground flex items-center gap-1 px-1 mb-1">
                      <Star className="w-3 h-3" /> Recommended
                    </h3>
                    <div className="space-y-1">
                      {recommendations.map(item => renderConversionItem(item, 'recommended'))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <nav className="space-y-1 flex-1" aria-label="Main navigation">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md flex items-center gap-2 ${isActive('/')
                ? 'bg-primary text-primary-foreground' 
                : 'text-foreground hover:bg-muted transition-colors'
              } ripple`}
              aria-current={isActive('/') ? 'page' : undefined}
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium">Home</span>
            </Link>
            
            <Link 
              to="/converter" 
              className={`px-3 py-2 rounded-md flex items-center gap-2 ${isActive('/converter')
                ? 'bg-primary text-primary-foreground' 
                : 'text-foreground hover:bg-muted transition-colors'
              } ripple`}
              aria-current={isActive('/converter') ? 'page' : undefined}
            >
              <Calculator className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium">Converter</span>
            </Link>
            
            <Link 
              to="/history" 
              className={`px-3 py-2 rounded-md flex items-center gap-2 ${isActive('/history')
                ? 'bg-primary text-primary-foreground' 
                : 'text-foreground hover:bg-muted transition-colors'
              } ripple`}
              aria-current={isActive('/history') ? 'page' : undefined}
            >
              <History className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium">History</span>
            </Link>
            
            <Link 
              to="/settings" 
              className={`px-3 py-2 rounded-md flex items-center gap-2 ${isActive('/settings')
                ? 'bg-primary text-primary-foreground' 
                : 'text-foreground hover:bg-muted transition-colors'
              } ripple`}
              aria-current={isActive('/settings') ? 'page' : undefined}
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium">Settings</span>
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
        
        {/* Search input for mobile */}
        <div className="relative w-full" role="search">
          <form onSubmit={handleSearch} onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <input
                type="search"
                placeholder="Search units..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                aria-label="Search for units"
                aria-expanded={showResults}
                aria-controls={showResults ? "mobile-search-results" : undefined}
              />
              <button 
                type="submit" 
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-primary ripple"
                aria-label="Submit search"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            
            {/* Mobile search results dropdown */}
            {showResults && searchResults.length > 0 && (
              <div 
                id="mobile-search-results"
                className="absolute z-20 w-full mt-1 bg-card border border-border rounded-md shadow-md max-h-60 overflow-auto"
                role="listbox"
                aria-label="Search results"
              >
                <ul>
                  {searchResults.map((result, index) => (
                    <li key={index} role="option">
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-muted text-sm ripple"
                        onClick={() => handleSelectResult(result.category, result.id)}
                        aria-selected="false"
                      >
                        {result.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        </div>
        
        {/* Recent conversions for mobile */}
        {recentConversions.length > 0 && !isLoadingQuickAccess && (
          <div className="flex gap-2 overflow-x-auto pb-1 pt-1 -mx-4 px-4">
            {recentConversions.slice(0, 2).map(item => {
              const category = unitCategories.find(cat => cat.id === item.category);
              const fromUnit = category?.units.find(unit => unit.id === item.fromUnit);
              const toUnit = category?.units.find(unit => unit.id === item.toUnit);
              
              if (!category || !fromUnit || !toUnit) return null;
              
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(`/converter?category=${item.category}&from=${item.fromUnit}&to=${item.toUnit}`)}
                  className="flex-shrink-0 py-1 px-2 border border-border rounded-md text-xs flex items-center gap-1 hover:bg-muted transition-colors"
                  aria-label={`Convert from ${fromUnit.name} to ${toUnit.name}`}
                >
                  <span className="font-medium">{fromUnit.symbol}</span>
                  <span className="mx-1">→</span>
                  <span className="font-medium">{toUnit.symbol}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Main content with page transitions */}
      <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6" id="main-content" role="main">
        <TransitionGroup component={null}>
          <CSSTransition 
            key={location.pathname} 
            classNames="page-transition" 
            timeout={200}
            nodeRef={nodeRef}
          >
            <div ref={nodeRef}>
              {children}
            </div>
          </CSSTransition>
        </TransitionGroup>
      </main>
      
      {/* Mobile navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around p-2 z-10" aria-label="Bottom navigation">
        <Link 
          to="/" 
          className={`p-1.5 flex flex-col items-center relative ${isActive('/') ? 'text-primary' : 'text-muted-foreground'} ripple`}
          aria-current={isActive('/') ? 'page' : undefined}
          aria-label="Home"
        >
          <Home className="w-4 h-4 mb-0.5" aria-hidden="true" />
          <span className="text-xs">Home</span>
          {isActive('/') && <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary rounded-t-full" aria-hidden="true" />}
        </Link>
        <Link 
          to="/converter" 
          className={`p-1.5 flex flex-col items-center relative ${isActive('/converter') ? 'text-primary' : 'text-muted-foreground'} ripple`}
          aria-current={isActive('/converter') ? 'page' : undefined}
          aria-label="Converter"
        >
          <Calculator className="w-4 h-4 mb-0.5" aria-hidden="true" />
          <span className="text-xs">Converter</span>
          {isActive('/converter') && <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary rounded-t-full" aria-hidden="true" />}
        </Link>
        <Link 
          to="/history" 
          className={`p-1.5 flex flex-col items-center relative ${isActive('/history') ? 'text-primary' : 'text-muted-foreground'} ripple`}
          aria-current={isActive('/history') ? 'page' : undefined}
          aria-label="History"
        >
          <History className="w-4 h-4 mb-0.5" aria-hidden="true" />
          <span className="text-xs">History</span>
          {isActive('/history') && <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary rounded-t-full" aria-hidden="true" />}
        </Link>
        <Link 
          to="/settings" 
          className={`p-1.5 flex flex-col items-center relative ${isActive('/settings') ? 'text-primary' : 'text-muted-foreground'} ripple`}
          aria-current={isActive('/settings') ? 'page' : undefined}
          aria-label="Settings"
        >
          <Settings className="w-4 h-4 mb-0.5" aria-hidden="true" />
          <span className="text-xs">Settings</span>
          {isActive('/settings') && <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary rounded-t-full" aria-hidden="true" />}
        </Link>
      </nav>
    </div>
  );
};

export default Layout; 