import React, { useState } from 'react';
import { useHistory } from '../contexts/HistoryContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { unitCategories } from '../lib/units';
import { Star, Trash, Download } from 'lucide-react';

const History: React.FC = () => {
  const { history, clearHistory, removeFromHistory } = useHistory();
  const { addToFavorites, isInFavorites, removeFromFavorites } = useFavorites();
  const [csvData, setCsvData] = useState<string | null>(null);
  
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
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) + 
        ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };
  
  // Get unit name and symbol
  const getUnitInfo = (categoryId: string, unitId: string) => {
    const category = unitCategories.find(cat => cat.id === categoryId);
    const unit = category?.units.find(u => u.id === unitId);
    return unit ? `${unit.name} (${unit.symbol})` : unitId;
  };
  
  return (
    <div className="pb-20 md:pb-0">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">History</h1>
            <p className="text-muted-foreground">Your recent unit conversions</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportToCSV}
              disabled={history.length === 0}
              className="bg-primary text-primary-foreground px-3 py-1.5 text-sm rounded-md flex items-center gap-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button
              onClick={clearHistory}
              disabled={history.length === 0}
              className="bg-muted text-foreground px-3 py-1.5 text-sm rounded-md flex items-center gap-1.5 hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
        
        {history.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-5 text-center">
            <p className="text-muted-foreground">No conversion history yet</p>
            <p className="text-sm text-muted-foreground mt-2">Your conversions will appear here</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Date</th>
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">From</th>
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">To</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground w-16">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.map((record) => {
                    const category = unitCategories.find(cat => cat.id === record.category);
                    
                    return (
                      <tr key={record.id} className="hover:bg-muted/50">
                        <td className="px-3 py-2.5 text-xs">
                          <div>{formatDate(record.timestamp)}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{category?.name || record.category}</div>
                        </td>
                        <td className="px-3 py-2.5 text-sm">
                          <div className="font-medium">{record.fromValue}</div>
                          <div className="text-xs text-muted-foreground">{getUnitInfo(record.category, record.fromUnit)}</div>
                        </td>
                        <td className="px-3 py-2.5 text-sm">
                          <div className="font-medium">{record.toValue}</div>
                          <div className="text-xs text-muted-foreground">{getUnitInfo(record.category, record.toUnit)}</div>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex justify-end gap-2 items-center">
                            <button
                              onClick={() => handleToggleFavorite(record)}
                              className={`p-1 rounded-sm ${isInFavorites(record.id) ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500'}`}
                              aria-label={isInFavorites(record.id) ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Star className="w-3.5 h-3.5" fill={isInFavorites(record.id) ? "currentColor" : "none"} />
                            </button>
                            <button
                              onClick={() => removeFromHistory(record.id)}
                              className="p-1 rounded-sm text-muted-foreground hover:text-destructive"
                              aria-label="Delete"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden area for CSV data */}
      {csvData && (
        <div className="hidden">
          <textarea readOnly value={csvData} />
        </div>
      )}
    </div>
  );
};

export default History; 