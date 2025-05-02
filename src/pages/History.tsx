import React, { useState } from 'react';
import { useHistory } from '../contexts/HistoryContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { unitCategories } from '../lib/units';

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
    link.setAttribute('download', `unit-conversions-${new Date().toISOString().slice(0, 10)}.csv`);
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
    return new Date(timestamp).toLocaleString();
  };
  
  // Get unit name and symbol
  const getUnitInfo = (categoryId: string, unitId: string) => {
    const category = unitCategories.find(cat => cat.id === categoryId);
    const unit = category?.units.find(u => u.id === unitId);
    return unit ? `${unit.name} (${unit.symbol})` : unitId;
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Conversion History</h1>
            <p className="text-muted-foreground">Your recent unit conversions</p>
          </div>
          
          <div className="space-x-2">
            <button
              onClick={exportToCSV}
              disabled={history.length === 0}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export CSV
            </button>
            <button
              onClick={clearHistory}
              disabled={history.length === 0}
              className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear History
            </button>
          </div>
        </div>
        
        {history.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-muted-foreground">No conversion history yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Start converting units to build your history.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date & Time</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">From</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">To</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.map((record) => {
                    const category = unitCategories.find(cat => cat.id === record.category);
                    
                    return (
                      <tr key={record.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm">{formatDate(record.timestamp)}</td>
                        <td className="px-4 py-3 text-sm">{category?.name || record.category}</td>
                        <td className="px-4 py-3 text-sm">
                          {record.fromValue} {getUnitInfo(record.category, record.fromUnit)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {record.toValue} {getUnitInfo(record.category, record.toUnit)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleToggleFavorite(record)}
                              className="text-foreground hover:text-primary"
                              aria-label={isInFavorites(record.id) ? "Remove from favorites" : "Add to favorites"}
                            >
                              {isInFavorites(record.id) ? "★" : "☆"}
                            </button>
                            <button
                              onClick={() => removeFromHistory(record.id)}
                              className="text-foreground hover:text-destructive"
                              aria-label="Delete"
                            >
                              🗑️
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