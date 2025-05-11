import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Star } from 'lucide-react';
import { ConversionRecord } from '../contexts/HistoryContext';
import { formatNumberByCategory } from '../lib/units';

interface RecentConversionsProps {
  conversions: ConversionRecord[];
  onFavorite?: (conversion: ConversionRecord) => void;
  loading?: boolean;
}

const RecentConversions: React.FC<RecentConversionsProps> = ({
  conversions,
  onFavorite,
  loading = false
}) => {
  const navigate = useNavigate();

  const handleConversionClick = (conversion: ConversionRecord) => {
    const params = new URLSearchParams({
      category: conversion.category,
      from: conversion.fromUnit,
      to: conversion.toUnit,
      value: conversion.fromValue.toString()
    });
    navigate(`/?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="recent-conversions p-4">
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Recent</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-card animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (conversions.length === 0) {
    return null;
  }

  return (
    <div className="recent-conversions p-4">
      <div className="flex items-center gap-2 mb-4 text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Recent</span>
      </div>
      
      <div className="space-y-2">
        {conversions.map((conversion) => (
          <button
            key={conversion.id}
            className="w-full p-3 bg-card hover:bg-muted rounded-lg transition-colors text-left flex items-center justify-between group"
            onClick={() => handleConversionClick(conversion)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-medium truncate">
                  {formatNumberByCategory(conversion.fromValue, conversion.category)}
                </span>
                <span className="text-sm text-muted-foreground truncate">
                  {conversion.fromUnit}
                </span>
              </div>
              
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-sm font-medium text-muted-foreground truncate">
                  {formatNumberByCategory(conversion.toValue, conversion.category)}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {conversion.toUnit}
                </span>
              </div>
            </div>
            
            {onFavorite && (
              <button
                className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite(conversion);
                }}
                aria-label="Add to favorites"
              >
                <Star className="w-4 h-4" />
              </button>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentConversions; 