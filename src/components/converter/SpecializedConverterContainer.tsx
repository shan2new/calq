import React, { useState, useCallback } from 'react';
import { CompoundFormatType } from '../../lib/compound-unit-types';
import { useUser } from '../../contexts/UserContext';
import FixedHeightConverter from './FixedHeightConverter';
import CookingConverter from './CookingConverter';
import Toast, { ToastType } from '../Toast';
import { Ruler, Utensils, Gauge } from 'lucide-react';

interface SpecializedConverterContainerProps {
  // Any props needed for the container
}

const SpecializedConverterContainer: React.FC<SpecializedConverterContainerProps> = () => {
  // State for active converter and toasts
  const [activeConverter, setActiveConverter] = useState<CompoundFormatType>(CompoundFormatType.HEIGHT);
  const [toastQueue, setToastQueue] = useState<{ message: string; type: ToastType }[]>([]);
  
  // User preferences
  const { userPreferences, getPreferredCompoundFormat } = useUser();
  
  // Function to show a toast notification
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToastQueue(prev => [...prev, { message, type }]);
  }, []);
  
  // Function to dismiss a toast
  const dismissToast = useCallback(() => {
    setToastQueue(prev => prev.slice(1));
  }, []);
  
  // Handle tab change
  const handleTabChange = useCallback((converterType: CompoundFormatType) => {
    setActiveConverter(converterType);
  }, []);
  
  // Get tab button class based on active state
  const getTabClass = (tabType: CompoundFormatType): string => {
    const baseClass = "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors";
    const activeClass = "bg-primary/10 text-primary";
    const inactiveClass = "text-muted-foreground hover:bg-muted hover:text-foreground";
    
    return `${baseClass} ${activeConverter === tabType ? activeClass : inactiveClass}`;
  };
  
  // Render the appropriate converter based on active tab
  const renderActiveConverter = () => {
    switch (activeConverter) {
      case CompoundFormatType.HEIGHT:
        return <FixedHeightConverter onShowToast={showToast} />;
      case CompoundFormatType.COOKING:
        return <CookingConverter onShowToast={showToast} />;
      default:
        return <div className="p-4 text-muted-foreground">Select a converter type</div>;
    }
  };
  
  // Check if each converter type is enabled in preferences
  const heightFormat = getPreferredCompoundFormat(CompoundFormatType.HEIGHT);
  const cookingFormat = getPreferredCompoundFormat(CompoundFormatType.COOKING);
  
  return (
    <div className="space-y-4">
      {/* Toast notifications */}
      {toastQueue.length > 0 && (
        <Toast
          message={toastQueue[0].message}
          type={toastQueue[0].type}
          onClose={dismissToast}
        />
      )}
      
      {/* Converter type tabs */}
      <div className="flex justify-center w-full mb-4">
        <div className="flex space-x-2 bg-card border border-border rounded-lg p-2 w-full max-w-md">
          {heightFormat.enabled && (
            <button 
              className={`${getTabClass(CompoundFormatType.HEIGHT)} flex-1 justify-center`}
              onClick={() => handleTabChange(CompoundFormatType.HEIGHT)}
            >
              <Ruler className="w-4 h-4 mr-2" />
              <span>Height</span>
            </button>
          )}
          
          {cookingFormat.enabled && (
            <button 
              className={`${getTabClass(CompoundFormatType.COOKING)} flex-1 justify-center`}
              onClick={() => handleTabChange(CompoundFormatType.COOKING)}
            >
              <Utensils className="w-4 h-4 mr-2" />
              <span>Cooking</span>
            </button>
          )}
          
          {/* More converter types can be added here */}
        </div>
      </div>
      
      {/* Active converter component */}
      {renderActiveConverter()}
      
      {/* Educational information about specialized converters */}
      <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm">
        <h3 className="font-medium mb-2">About specialized converters</h3>
        <p className="text-muted-foreground">
          Specialized converters provide enhanced features for specific conversion types. 
          They support compound measurements (like feet+inches) and offer contextual
          information relevant to the conversion.
        </p>
      </div>
    </div>
  );
};

export default SpecializedConverterContainer; 