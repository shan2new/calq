import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { UnitCategoryId } from '../lib/unit-types';
import { CompoundFormatType, defaultCompoundPreferences } from '../lib/compound-unit-types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import SpecializedConverterContainer from '../components/converter/SpecializedConverterContainer';

// Import the original Converter for backward compatibility
import OriginalConverter from './Converter';

const ConverterWithSpecialized: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { userPreferences, updatePreferences } = useUser();
  
  // Determine active tab from URL or defaults
  const [activeTab, setActiveTab] = useState<'standard' | 'specialized'>(
    searchParams.get('mode') === 'specialized' ? 'specialized' : 'standard'
  );
  
  // Update URL when tab changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('mode', activeTab);
    setSearchParams(newParams, { replace: true });
  }, [activeTab, searchParams, setSearchParams]);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'standard' | 'specialized');
  };
  
  // Toggle specialized converter visibility
  const toggleSpecializedFormat = (formatType: CompoundFormatType, enabled: boolean) => {
    updatePreferences({
      compoundPreferences: {
        preferredFormats: {
          [formatType]: {
            enabled
          }
        },
        // Keep the existing recent conversions or use defaults
        recentCompoundConversions: 
          userPreferences.compoundPreferences.recentCompoundConversions || 
          defaultCompoundPreferences.recentCompoundConversions
      }
    });
  };
  
  // Determine if each format is enabled
  const isHeightEnabled = userPreferences.compoundPreferences.preferredFormats[CompoundFormatType.HEIGHT]?.enabled ?? true;
  const isCookingEnabled = userPreferences.compoundPreferences.preferredFormats[CompoundFormatType.COOKING]?.enabled ?? true;
  
  return (
    <div className="container mx-auto max-w-3xl">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex justify-center w-full">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="standard">Standard</TabsTrigger>
            <TabsTrigger value="specialized">Specialized</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="standard" className="mt-2">
          <OriginalConverter />
        </TabsContent>
        
        <TabsContent value="specialized" className="mt-2">
          {/* Settings for specialized converters */}
          <div className="bg-card border border-border rounded-lg p-4 mb-4">
            <h2 className="text-lg font-medium mb-3">Specialized Converters</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="height-converter">Height Converter</Label>
                  <p className="text-sm text-muted-foreground">
                    Convert between feet/inches and metric height measurements
                  </p>
                </div>
                <Switch
                  id="height-converter"
                  checked={isHeightEnabled}
                  onCheckedChange={(checked: boolean) => toggleSpecializedFormat(CompoundFormatType.HEIGHT, checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cooking-converter">Cooking Converter</Label>
                  <p className="text-sm text-muted-foreground">
                    Convert between cups, tablespoons and metric volumes
                  </p>
                </div>
                <Switch
                  id="cooking-converter"
                  checked={isCookingEnabled}
                  onCheckedChange={(checked: boolean) => toggleSpecializedFormat(CompoundFormatType.COOKING, checked)}
                />
              </div>
            </div>
          </div>
          
          {/* Specialized converter container */}
          <SpecializedConverterContainer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConverterWithSpecialized; 