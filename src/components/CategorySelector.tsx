import React, { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { UnitCategoryId } from '../lib/unit-types';
import { unitCategoryInfo } from '../lib/unit-types';
import { CategoryIcon } from './ui/CategoryIcon';

interface CategorySelectorProps {
  selectedCategory: string;
  availableCategories: string[];
  showBackButton?: boolean;
  onBack?: () => void;
  onSelect?: (categoryId: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  availableCategories,
  showBackButton = false,
  onBack,
  onSelect,
}) => {
  // Show only popular categories
  const displayedCategories = useMemo(() => {
    return availableCategories.slice(0, 8);
  }, [availableCategories]);
  
  return (
    <div className="category-selector bg-card border border-border rounded-lg p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        {showBackButton && onBack && (
          <button 
            onClick={onBack}
            className="p-1.5 hover:bg-muted rounded-md transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <h2 className="text-lg font-medium">Categories</h2>
      </div>
      
      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {displayedCategories.map((categoryId) => {
          const info = unitCategoryInfo[categoryId as UnitCategoryId];
          if (!info) return null;
          
          return (
            <button
              key={categoryId}
              onClick={() => onSelect && onSelect(categoryId)}
              className={`
                flex items-center gap-3 p-4 rounded-lg transition-colors
                ${categoryId === selectedCategory
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 hover:bg-muted'
                }
              `}
            >
              {info.icon && (
                <div className={`p-2 rounded-full ${
                  categoryId === selectedCategory 
                    ? 'bg-primary-foreground/20' 
                    : 'bg-primary/10'
                }`}>
                  <CategoryIcon 
                    iconName={info.icon} 
                    className={`${
                      categoryId === selectedCategory 
                        ? 'text-primary-foreground' 
                        : 'text-primary'
                    } w-5 h-5`}
                    size={20}
                  />
                </div>
              )}
              <span className="text-sm font-medium">{info.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;