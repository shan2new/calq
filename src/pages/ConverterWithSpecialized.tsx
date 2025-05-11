import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { UnitCategoryId } from '../lib/unit-types';
import { CompoundFormatType, defaultCompoundPreferences } from '../lib/compound-unit-types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import SpecializedConverterContainer from '../components/converter/SpecializedConverterContainer';
import { trackCategoryChanged } from '../lib/analytics';
import { Calculator, Settings } from 'lucide-react';

// Import the original Converter for backward compatibility
import OriginalConverter from './Converter';

// Import SEO components
import MetadataManager from '../components/SEO/MetadataManager';
import { parseCanonicalPath, buildCanonicalPath } from '../lib/url-utils';

interface ConverterProps {
  initialCategory?: string;
  initialFromUnit?: string;
  initialToUnit?: string;
  initialValue?: number;
  disableUrlUpdates?: boolean;
  useLegacyUrlFormat?: boolean;
}

const ConverterWithSpecialized: React.FC<ConverterProps> = ({
  initialCategory,
  initialFromUnit,
  initialToUnit,
  initialValue,
  disableUrlUpdates = false,
  useLegacyUrlFormat = false
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { userPreferences, updatePreferences } = useUser();
  const location = useLocation();
  
  // Extract parameters for SEO metadata from the URL
  const seoParams = React.useMemo(() => {
    // Use different parameter extraction based on URL format
    if (location.pathname.startsWith('/convert/')) {
      return parseCanonicalPath(location.pathname);
    } else {
      // For legacy URL format, use query parameters
      return {
        category: searchParams.get('category') || initialCategory || undefined,
        fromUnit: searchParams.get('from') || initialFromUnit || undefined,
        toUnit: searchParams.get('to') || initialToUnit || undefined,
        value: searchParams.get('value') ? Number(searchParams.get('value')) : initialValue
      };
    }
  }, [location.pathname, searchParams, initialCategory, initialFromUnit, initialToUnit, initialValue]);
  
  // Determine active tab from URL or defaults
  const [activeTab, setActiveTab] = useState<'standard' | 'specialized'>(
    searchParams.get('mode') === 'specialized' ? 'specialized' : 'standard'
  );
  
  // Update URL when tab changes - only if not disabled
  useEffect(() => {
    // Skip URL updates if disabled or using SEO format
    if (disableUrlUpdates || location.pathname.startsWith('/convert/')) {
      return;
    }
    
    // Otherwise update the search params
    const newParams = new URLSearchParams(searchParams);
    newParams.set('mode', activeTab);
    setSearchParams(newParams, { replace: true });
  }, [activeTab, searchParams, setSearchParams, location.pathname, disableUrlUpdates]);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'standard' | 'specialized');
    
    // Track tab change as category change
    trackCategoryChanged(`converter_mode_${value}`);
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
    
    // Track specialized format change
    trackCategoryChanged(`${formatType}_${enabled ? 'enabled' : 'disabled'}`);
  };
  
  // Determine if each format is enabled
  const isHeightEnabled = userPreferences.compoundPreferences.preferredFormats[CompoundFormatType.HEIGHT]?.enabled ?? true;
  const isCookingEnabled = userPreferences.compoundPreferences.preferredFormats[CompoundFormatType.COOKING]?.enabled ?? true;
  
  // Create SEO metadata based on URL parameters and format
  const seoTitle = seoParams?.fromUnit && seoParams?.toUnit && seoParams?.category
    ? `Convert ${seoParams.fromUnit} to ${seoParams.toUnit} | ${seoParams.category} Converter | Calcq`
    : 'Unit Converter | Calcq';
  
  const seoDescription = seoParams?.fromUnit && seoParams?.toUnit && seoParams?.category
    ? `Convert ${seoParams?.value || ''} ${seoParams.fromUnit} to ${seoParams.toUnit} with Calcq's ${seoParams.category} converter. Instant, accurate calculations.`
    : 'Convert between 4,500+ units across 33 categories with Calcq. Fast, accurate, and user-friendly.';
  
  // Build canonical path differently based on URL format
  const canonicalPath = useLegacyUrlFormat
    ? null // Don't provide canonical path for legacy format
    : (seoParams?.fromUnit && seoParams?.toUnit && seoParams?.category
      ? buildCanonicalPath(seoParams.category, seoParams.fromUnit, seoParams.toUnit, seoParams.value)
      : null);
  
  return (
    <div className="container mx-auto max-w-3xl">
      {/* SEO Metadata */}
      <MetadataManager 
        title={seoTitle}
        description={seoDescription}
        canonicalPath={canonicalPath || undefined}
        fromUnit={seoParams?.fromUnit}
        toUnit={seoParams?.toUnit}
        category={seoParams?.category}
        value={seoParams?.value}
      />
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex justify-center w-full">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="standard">
              <Calculator className="mr-2 h-4 w-4" />
              Standard
            </TabsTrigger>
            <TabsTrigger value="specialized">
              <Settings className="mr-2 h-4 w-4" />
              Specialized
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="standard" className="mt-2">
          <OriginalConverter 
            initialCategory={initialCategory}
            initialFromUnit={initialFromUnit}
            initialToUnit={initialToUnit}
            initialValue={initialValue}
          />
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
          <SpecializedConverterContainer 
            initialCategory={initialCategory as UnitCategoryId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConverterWithSpecialized; 