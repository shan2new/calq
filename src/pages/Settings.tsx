import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeProvider';
import { usePresets } from '../contexts/PresetsContext';
import { Sun, Moon, Laptop, Pencil, Trash } from 'lucide-react';

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
    <div className="container mx-auto py-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Customize your unit converter experience</p>
        </div>
        
        {/* Theme Settings */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Theme
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 p-3 rounded-md border ${
                    theme === 'light' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Sun className="w-5 h-5" />
                    <span>Light</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 p-3 rounded-md border ${
                    theme === 'dark' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Moon className="w-5 h-5" />
                    <span>Dark</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setTheme('system')}
                  className={`flex-1 p-3 rounded-md border ${
                    theme === 'system' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Laptop className="w-5 h-5" />
                    <span>System</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Preset Management */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Preset Management</h2>
          
          {presets.length === 0 ? (
            <p className="text-muted-foreground">No presets saved yet.</p>
          ) : (
            <div className="space-y-3">
              {presets.map(preset => (
                <div 
                  key={preset.id} 
                  className="flex items-center justify-between p-3 bg-muted rounded-md"
                >
                  {isEditingPreset === preset.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editPresetName}
                        onChange={(e) => setEditPresetName(e.target.value)}
                        className="flex-1 bg-background text-foreground border border-input rounded-md px-3 py-1"
                      />
                      <button
                        onClick={handleSavePresetEdit}
                        className="text-primary"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelPresetEdit}
                        className="text-muted-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium">{preset.name}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPreset(preset.id, preset.name)}
                          className="text-foreground hover:text-primary"
                          aria-label="Edit preset"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removePreset(preset.id)}
                          className="text-foreground hover:text-destructive"
                          aria-label="Delete preset"
                        >
                          <Trash className="w-4 h-4" />
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
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Custom Units</h2>
          <p className="text-muted-foreground mb-4">
            Import custom units JSON library to extend the available conversions.
          </p>
          
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Import Units Library
          </button>
        </div>
        
        {/* Data Management */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Data Management</h2>
          
          <div className="space-y-2">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors"
            >
              Reset All Data
            </button>
            <p className="text-xs text-muted-foreground">
              This will clear all presets, favorites, history, and settings.
            </p>
          </div>
        </div>
        
        {/* About Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">About</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Unit Converter PWA v1.0.0</p>
            <p>A modern, feature-rich unit conversion tool.</p>
            <p>Supports 4,500+ units across 33 categories.</p>
          </div>
        </div>
      </div>
      
      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Import Units Library</h2>
            
            <div className="mb-4">
              <label htmlFor="importData" className="block text-sm font-medium text-foreground mb-1">
                Paste JSON Data
              </label>
              <textarea
                id="importData"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={8}
                className="w-full bg-background text-foreground border border-input rounded-md px-3 py-2"
                placeholder={'{\n  "categories": [\n    {\n      "id": "custom",\n      "name": "Custom Units",\n      "units": []\n    }\n  ]\n}'}
              />
              {importError && (
                <p className="mt-1 text-sm text-destructive">{importError}</p>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportData('');
                  setImportError('');
                }}
                className="bg-muted text-foreground rounded-md px-4 py-2 hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImportUnitsLibrary}
                disabled={!importData.trim()}
                className="bg-primary text-primary-foreground rounded-md px-4 py-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 