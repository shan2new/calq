import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Star, MoreVertical, Save, Copy, Share, Plus, Info } from 'lucide-react';

interface ToolTipProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  visible?: boolean;
  children: React.ReactNode;
}

const Tooltip: React.FC<ToolTipProps> = ({
  content,
  position = 'top',
  visible = false,
  children,
}) => {
  return (
    <div className="tooltip-container relative inline-block">
      {children}
      {visible && (
        <div 
          className={`absolute z-50 px-2 py-1 bg-foreground text-background text-xs rounded shadow-lg whitespace-nowrap ${
            position === 'top' ? 'bottom-full left-1/2 transform -translate-x-1/2 mb-1' :
            position === 'bottom' ? 'top-full left-1/2 transform -translate-x-1/2 mt-1' :
            position === 'left' ? 'right-full top-1/2 transform -translate-y-1/2 mr-1' :
            'left-full top-1/2 transform -translate-y-1/2 ml-1'
          }`}
        >
          {content}
          <div 
            className={`absolute w-0 h-0 border-4 border-transparent ${
              position === 'top' ? 'top-full border-t-foreground left-1/2 transform -translate-x-1/2' :
              position === 'bottom' ? 'bottom-full border-b-foreground left-1/2 transform -translate-x-1/2' :
              position === 'left' ? 'left-full border-l-foreground top-1/2 transform -translate-y-1/2' :
              'right-full border-r-foreground top-1/2 transform -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </div>
  );
};

// Floating Action Button Component
interface FloatingActionButtonProps {
  visible: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  visible,
  onClick,
  icon,
  label,
}) => {
  return (
    <button
      className={`fixed right-4 bottom-16 w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center transition-all duration-300 ${
        visible ? 'transform scale-100 opacity-100' : 'transform scale-0 opacity-0 pointer-events-none'
      }`}
      onClick={onClick}
      aria-label={label}
    >
      {icon}
    </button>
  );
};

interface ConverterActionsProps {
  canSave: boolean;
  isFavorite: boolean;
  onSwap: () => void;
  onFavorite: () => void;
  onSavePreset: () => void;
  onCopy?: () => void;
  onShare?: () => void;
  onOpenHelp?: () => void;
  swapButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

const ConverterActions: React.FC<ConverterActionsProps> = ({
  canSave,
  isFavorite,
  onSwap,
  onFavorite,
  onSavePreset,
  onCopy,
  onShare,
  onOpenHelp,
  swapButtonRef,
}) => {
  const [showTooltips, setShowTooltips] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showFAB, setShowFAB] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  
  // Check if user has seen tooltips before
  useEffect(() => {
    const hasSeenTooltips = localStorage.getItem('calcq_seen_tooltips');
    if (!hasSeenTooltips) {
      // Show tooltips after a short delay
      const timer = setTimeout(() => {
        setShowTooltips(true);
      }, 1000);
      
      // Mark as seen after 10 seconds
      const hideTimer = setTimeout(() => {
        setShowTooltips(false);
        localStorage.setItem('calcq_seen_tooltips', 'true');
      }, 10000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, []);
  
  // Update FAB visibility
  useEffect(() => {
    if (canSave) {
      const timer = setTimeout(() => {
        setShowFAB(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowFAB(false);
    }
  }, [canSave]);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  // Trigger haptic feedback if available
  const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };
  
  const handleAction = (callback?: () => void) => {
    if (callback) {
      triggerHapticFeedback();
      callback();
    }
    setIsMenuOpen(false);
  };
  
  return (
    <div className="converter-actions relative">
      <div className="flex items-center gap-2">
        <Tooltip
          content="Swap units"
          position="top"
          visible={showTooltips}
        >
          <button 
            className="action-button p-2 rounded-md hover:bg-muted transition-colors ripple"
            onClick={() => handleAction(onSwap)}
            aria-label="Swap units"
            ref={swapButtonRef}
          >
            <ArrowUpDown className="w-5 h-5" />
          </button>
        </Tooltip>
        
        <Tooltip
          content={isFavorite ? "Remove from favorites" : "Add to favorites"}
          position="top"
          visible={showTooltips}
        >
          <button 
            className={`action-button p-2 rounded-md hover:bg-muted transition-colors ripple ${
              isFavorite ? 'text-primary' : ''
            }`}
            onClick={() => handleAction(onFavorite)}
            disabled={!canSave}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={isFavorite ? "w-5 h-5 fill-primary" : "w-5 h-5"} />
          </button>
        </Tooltip>
        
        <Tooltip
          content="More options"
          position="top"
          visible={showTooltips}
        >
          <div className="relative" ref={menuRef}>
            <button 
              className="action-button p-2 rounded-md hover:bg-muted transition-colors ripple"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="More options"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-20 min-w-40">
                <div className="py-1" role="menu">
                  {onCopy && (
                    <button
                      className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-muted transition-colors"
                      onClick={() => handleAction(onCopy)}
                      role="menuitem"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy result</span>
                    </button>
                  )}
                  
                  {onShare && (
                    <button
                      className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-muted transition-colors"
                      onClick={() => handleAction(onShare)}
                      role="menuitem"
                    >
                      <Share className="w-4 h-4" />
                      <span>Share conversion</span>
                    </button>
                  )}
                  
                  <button
                    className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-muted transition-colors"
                    onClick={() => handleAction(onSavePreset)}
                    role="menuitem"
                    disabled={!canSave}
                  >
                    <Save className="w-4 h-4" />
                    <span>Save as preset</span>
                  </button>
                  
                  {onOpenHelp && (
                    <button
                      className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-muted transition-colors"
                      onClick={() => handleAction(onOpenHelp)}
                      role="menuitem"
                    >
                      <Info className="w-4 h-4" />
                      <span>Help & info</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Tooltip>
      </div>
      
      <FloatingActionButton 
        visible={showFAB} 
        onClick={onSavePreset}
        icon={<Plus className="w-5 h-5" />}
        label="Save preset"
      />
    </div>
  );
};

export default ConverterActions; 