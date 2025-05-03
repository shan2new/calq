import React from 'react';

const HistorySkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-muted rounded w-2/3 mb-6"></div>
      
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-card border border-border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="h-5 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-16"></div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 bg-muted rounded w-1/5"></div>
              <div className="h-6 w-6 bg-muted rounded-full"></div>
              <div className="h-6 bg-muted rounded w-1/5"></div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <div className="h-8 w-8 bg-muted rounded"></div>
              <div className="h-8 w-8 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistorySkeleton; 