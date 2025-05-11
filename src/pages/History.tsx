import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useHistory } from '../contexts/HistoryContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { unitCategories } from '../lib/units';
import { Star, Trash, Download, Calculator, ChevronUp } from 'lucide-react';
import HistorySkeleton from '../components/HistorySkeleton';

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete: () => void;
}

const SwipeableItem: React.FC<SwipeableItemProps> = ({ children, onDelete }) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const [swiping, setSwiping] = useState(false);
  const threshold = 100; // Minimum distance to trigger delete
  
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setSwiping(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    currentXRef.current = diff;
    
    // Only allow swiping left (negative diff)
    if (diff < 0) {
      if (itemRef.current) {
        itemRef.current.style.transform = `translateX(${diff}px)`;
      }
    }
  };
  
  const handleTouchEnd = () => {
    setSwiping(false);
    
    if (currentXRef.current < -threshold) {
      // Animate deletion
      if (itemRef.current) {
        itemRef.current.style.transform = 'translateX(-100%)';
        itemRef.current.style.opacity = '0';
        
        setTimeout(() => {
          onDelete();
        }, 200);
      }
    } else {
      // Reset position
      if (itemRef.current) {
        itemRef.current.style.transform = 'translateX(0)';
      }
    }
  };
  
  return (
    <div 
      ref={itemRef}
      className="relative touch-manipulation bg-card rounded-md mb-2 transition-transform duration-200 ease-out"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
      <div className="absolute inset-y-0 right-0 bg-red-500 flex items-center justify-center px-4 rounded-r-md opacity-0 pointer-events-none">
        <Trash className="w-4 h-4 text-white" />
      </div>
    </div>
  );
};

// First-time tooltip
const FirstVisitTip: React.FC<{onDismiss: () => void}> = ({ onDismiss }) => {
  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground p-3 rounded-lg shadow-lg z-50 w-11/12 max-w-xs animate-fadeIn">
      <div className="flex justify-between items-start mb-2">
        <p className="font-medium">Your conversions will appear here</p>
        <button 
          onClick={onDismiss}
          className="text-primary-foreground/80 hover:text-primary-foreground"
          aria-label="Dismiss tip"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
      <p className="text-sm opacity-90">Conversions are automatically saved as you use the app</p>
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
        <div className="w-4 h-4 bg-primary rotate-45 transform origin-bottom-left"></div>
      </div>
    </div>
  );
};

const History: React.FC = () => {
  const location = useLocation();
  const { history, isLoading, clearHistory, removeFromHistory } = useHistory();
  const { addToFavorites, isInFavorites, removeFromFavorites } = useFavorites();
  const [csvData, setCsvData] = useState<string | null>(null);
  const [showFirstVisitTip, setShowFirstVisitTip] = useState(false);
  const [uiReady, setUiReady] = useState(false);
  
  // Show first visit tooltip if this is the first visit to the history tab
  useEffect(() => {
    const hasVisitedHistory = localStorage.getItem('hasVisitedHistory');
    
    // Set a small delay to ensure UI transitions are smooth
    const readyTimer = setTimeout(() => {
      setUiReady(true);
      
      if (!hasVisitedHistory && location.pathname === '/history') {
        setShowFirstVisitTip(true);
        localStorage.setItem('hasVisitedHistory', 'true');
        
        // Auto-dismiss after 5 seconds
        const dismissTimer = setTimeout(() => {
          setShowFirstVisitTip(false);
        }, 5000);
        
        return () => clearTimeout(dismissTimer);
      }
    }, 300);
    
    return () => clearTimeout(readyTimer);
  }, [location.pathname]);
  
  // Function to export history to CSV
  const exportToCSV = () => {
    if (history.length === 0) return;
    
    // Create CSV header
    const headers = ['Date', 'Category', 'From Value', 'From Unit', 'To Value', 'To Unit'];
    
    // Create CSV rows
    const rows = history.map(record => {
      const category = unitCategories.find(cat => cat.id === record.category);
      const fromUnit = category?.units.find(unit => unit.id === record.fromUnit);
      const toUnit = category?.units.find(unit => unit.id === record.toUnit);
      
      return [
        new Date(record.timestamp).toLocaleString(),
        category?.name || record.category,
        record.fromValue.toString(),
        fromUnit?.name || record.fromUnit,
        record.toValue.toString(),
        toUnit?.name || record.toUnit,
      ];
    });
    
    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    setCsvData(csvContent);
    
    // Create a blob and create a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `calcq-conversions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleToggleFavorite = (record: any) => {
    if (isInFavorites(record.id)) {
      removeFromFavorites(record.id);
    } else {
      addToFavorites(record);
    }
  };
  
  // Group history by date
  const groupedHistory = history.reduce<Record<string, typeof history>>((groups, record) => {
    const date = new Date(record.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let groupKey: string;
    
    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else {
      // Format as "Month Day, Year"
      groupKey = date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    groups[groupKey].push(record);
    return groups;
  }, {});
  
  // Format time for display
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get unit name and symbol
  const getUnitInfo = (categoryId: string, unitId: string) => {
    const category = unitCategories.find(cat => cat.id === categoryId);
    const unit = category?.units.find(u => u.id === unitId);
    return unit ? `${unit.symbol}` : unitId;
  };
  
  // Show skeleton when loading from IndexedDB
  if (isLoading || !uiReady) {
    return (
      <div className="pb-20 md:pb-0">
        <HistorySkeleton />
      </div>
    );
  }
  
  return (
    <div className="pb-20 md:pb-0">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportToCSV}
              disabled={history.length === 0}
              className="bg-primary text-primary-foreground px-3 py-1.5 text-sm rounded-md flex items-center gap-1.5 hover:bg-primary/90 transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Export history as CSV"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Export</span>
            </button>
            <button
              onClick={clearHistory}
              disabled={history.length === 0}
              className="bg-muted text-foreground px-3 py-1.5 text-sm rounded-md flex items-center gap-1.5 hover:bg-muted/80 transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Clear all history"
            >
              <Trash className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
        
        {history.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-5 text-center">
            <p className="text-muted-foreground mb-3">No history yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Tap <Link to="/" className="text-primary hover:underline">Converter</Link> to convert units
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-all duration-150 active:scale-95"
            >
              <Calculator className="w-4 h-4" aria-hidden="true" />
              <span>Go to Converter</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(groupedHistory).map(([dateGroup, records]) => (
              <div key={dateGroup} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-muted border-b border-border">
                  <h2 className="text-md font-medium">{dateGroup}</h2>
                </div>
                <div className="p-2">
                  {records.map((record) => {
                    const category = unitCategories.find(cat => cat.id === record.category);
                    
                    return (
                      <SwipeableItem
                        key={record.id}
                        onDelete={() => removeFromHistory(record.id)}
                      >
                        <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-xs text-muted-foreground">{formatTime(record.timestamp)}</span>
                              <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{category?.name || record.category}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm">
                              <span className="font-medium">{record.fromValue}</span>
                              <span className="text-muted-foreground">{getUnitInfo(record.category, record.fromUnit)}</span>
                              <span className="text-muted-foreground mx-1">→</span>
                              <span className="font-medium">{record.toValue}</span>
                              <span className="text-muted-foreground">{getUnitInfo(record.category, record.toUnit)}</span>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 items-center">
                            <button
                              onClick={() => handleToggleFavorite(record)}
                              className={`p-1 rounded-sm ${isInFavorites(record.id) ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500'} transition-transform active:scale-95 duration-150`}
                              aria-label={isInFavorites(record.id) ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Star className="w-3.5 h-3.5" fill={isInFavorites(record.id) ? "currentColor" : "none"} />
                            </button>
                            <button
                              onClick={() => removeFromHistory(record.id)}
                              className="p-1 rounded-sm text-muted-foreground hover:text-destructive sm:hidden transition-transform active:scale-95 duration-150"
                              aria-label="Delete"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </SwipeableItem>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Hidden area for CSV data */}
      {csvData && (
        <div className="hidden">
          <textarea readOnly value={csvData} />
        </div>
      )}
      
      {/* Add swipe hint for mobile users */}
      {history.length > 0 && (
        <div className="text-center text-xs text-muted-foreground mt-2 md:hidden">
          Swipe left to delete items
        </div>
      )}
      
      {/* First visit tip */}
      {showFirstVisitTip && (
        <FirstVisitTip onDismiss={() => setShowFirstVisitTip(false)} />
      )}
    </div>
  );
};

export default History; 