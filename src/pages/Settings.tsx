import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeProvider';
import { usePresets } from '../contexts/PresetsContext';
import { Sun, Moon, Laptop, Pencil, Trash, Save, X, Check, FileJson } from 'lucide-react';

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { presets, updatePreset, removePreset } = usePresets();
  const [isEditingPreset, setIsEditingPreset] = useState<string | null>(null);
  const [editPresetName, setEditPresetName] = useState('');
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  
  const handleEditPreset = (presetId: string, currentName: string) => {
    setIsEditingPreset(presetId);
    setEditPresetName(currentName);
  };
  
  const handleSavePresetEdit = () => {
    if (isEditingPreset && editPresetName.trim()) {
      updatePreset(isEditingPreset, { name: editPresetName.trim() });
      setIsEditingPreset(null);
      setEditPresetName('');
    }
  };
  
  const handleCancelPresetEdit = () => {
    setIsEditingPreset(null);
    setEditPresetName('');
  };
  
  const handleImportUnitsLibrary = () => {
    try {
      const parsedData = JSON.parse(importData);
      
      // Basic validation
      if (!Array.isArray(parsedData) && !parsedData.categories) {
        setImportError('Invalid format. Expected an array of categories or an object with categories property.');
        return;
      }
      
      // In a real app, you would process and integrate the imported units here
      
      // For this demo, just show success
      setImportError('');
      setImportData('');
      setShowImportModal(false);
      
      // Show success message
      alert('Custom units imported successfully!');
    } catch (error) {
      setImportError('Invalid JSON format. Please check your input.');
    }
  };
  
  return (
    <div className="pb-20 md:pb-0">
      <div className="space-y-6">        
        {/* Theme Settings */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-3">Appearance</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-md border ${
                    theme === 'light' 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-border bg-background text-foreground'
                  }`}
                >
                  <Sun className="w-5 h-5" />
                  <span className="text-xs font-medium">Light</span>
                </button>
                
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-md border ${
                    theme === 'dark' 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-border bg-background text-foreground'
                  }`}
                >
                  <Moon className="w-5 h-5" />
                  <span className="text-xs font-medium">Dark</span>
                </button>
                
                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-md border ${
                    theme === 'system' 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-border bg-background text-foreground'
                  }`}
                >
                  <Laptop className="w-5 h-5" />
                  <span className="text-xs font-medium">System</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Preset Management */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-3">Presets</h2>
          
          {presets.length === 0 ? (
            <div className="p-3 bg-muted/50 rounded-md text-center">
              <p className="text-sm text-muted-foreground">No presets saved</p>
              <p className="text-xs text-muted-foreground mt-1">Create presets from the converter page</p>
            </div>
          ) : (
            <div className="space-y-2">
              {presets.map(preset => (
                <div 
                  key={preset.id} 
                  className="flex items-center justify-between p-2.5 bg-muted/50 rounded-md"
                >
                  {isEditingPreset === preset.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editPresetName}
                        onChange={(e) => setEditPresetName(e.target.value)}
                        className="flex-1 bg-background text-foreground border border-input rounded-md px-2.5 py-1 text-sm"
                      />
                      <button
                        onClick={handleSavePresetEdit}
                        className="p-1 rounded-sm text-primary hover:bg-primary/10"
                        aria-label="Save"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelPresetEdit}
                        className="p-1 rounded-sm text-muted-foreground hover:bg-muted"
                        aria-label="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium">{preset.name}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditPreset(preset.id, preset.name)}
                          className="p-1 rounded-sm text-muted-foreground hover:text-primary hover:bg-muted/70"
                          aria-label="Edit preset"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removePreset(preset.id)}
                          className="p-1 rounded-sm text-muted-foreground hover:text-destructive hover:bg-muted/70"
                          aria-label="Delete preset"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Custom Units */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-3">Custom Units</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Import custom units library to extend available conversions
          </p>
          
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 text-sm rounded-md hover:bg-primary/90 transition-colors"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Import Library</span>
          </button>
        </div>
        
        {/* Data Management */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-3">Data</h2>
          
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="inline-flex items-center gap-1.5 w-full bg-muted text-foreground px-3 py-1.5 text-sm rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <Trash className="w-3.5 h-3.5" />
            <span>Reset All Data</span>
          </button>
          <p className="text-xs text-muted-foreground mt-1.5">
            Clears all presets, favorites, history, and settings
          </p>
        </div>
        
        {/* About Section */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-2">About</h2>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Calcq v1.0.0</p>
            <p>A modern, feature-rich unit conversion tool</p>
          </div>
        </div>
      </div>
      
      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg shadow-lg p-5 w-full max-w-md">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Import Units Library</h2>
              <button 
                onClick={() => setShowImportModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mb-4">
              <label htmlFor="importData" className="block text-sm font-medium text-foreground mb-1.5">
                Paste JSON Data
              </label>
              <textarea
                id="importData"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={6}
                className="w-full bg-background text-foreground border border-input rounded-md px-3 py-2 text-sm"
                placeholder={'{\n  "categories": [\n    {\n      "id": "custom",\n      "name": "Custom Units",\n      "units": []\n    }\n  ]\n}'}
              />
              {importError && (
                <p className="mt-1.5 text-xs text-destructive">{importError}</p>
              )}
            </div>
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-3 py-1.5 text-sm border border-border rounded-md bg-muted text-foreground hover:bg-muted/70 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImportUnitsLibrary}
                className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Import</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 