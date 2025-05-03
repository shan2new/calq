import React, { useState, useEffect } from 'react';
import { X, Search, Calculator, History, Settings, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  icon: React.ReactNode;
}

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Tour steps
  const tourSteps: TourStep[] = [
    {
      id: 'search',
      title: 'Quick Search',
      description: 'Find units instantly with the search bar. Type any unit name or symbol to get started.',
      target: '.search-bar',
      position: 'bottom',
      icon: <Search className="w-5 h-5" />
    },
    {
      id: 'converter',
      title: 'Unit Converter',
      description: 'Convert between thousands of different units across multiple categories.',
      target: 'nav a[aria-label="Converter"]',
      position: 'top',
      icon: <Calculator className="w-5 h-5" />
    },
    {
      id: 'history',
      title: 'Conversion History',
      description: 'Your conversion history is automatically saved for quick reference.',
      target: 'nav a[aria-label="History"]',
      position: 'top',
      icon: <History className="w-5 h-5" />
    },
    {
      id: 'settings',
      title: 'Customize Your Experience',
      description: 'Change themes, manage presets, and configure your preferences.',
      target: 'nav a[aria-label="Settings"]',
      position: 'top',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  useEffect(() => {
    // Check if this is the first visit
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    
    if (!hasSeenOnboarding) {
      // Set a timeout to allow components to render first
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Mark onboarding as seen (moved to dismissal handler to ensure user sees it)
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    // Mark as seen only when completed or dismissed
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsVisible(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleNext();
  };

  if (!isVisible) return null;

  const currentTourStep = tourSteps[currentStep];

  // Calculate position class
  let positionClass = 'bottom-24 left-1/2 transform -translate-x-1/2';
  if (currentTourStep.id === 'search') {
    positionClass = 'top-20 left-1/2 transform -translate-x-1/2';
  }

  // Navigation paths for each step
  const getNavigationPath = (stepId: string) => {
    switch (stepId) {
      case 'converter': return '/converter';
      case 'history': return '/history';
      case 'settings': return '/settings';
      default: return '';
    }
  };

  // Determine if we should show a "Try It" button
  const showActionButton = currentTourStep.id !== 'search';
  const actionPath = getNavigationPath(currentTourStep.id);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      
      {/* Tour tooltip */}
      <div 
        className={`absolute ${positionClass} bg-card border border-border rounded-lg shadow-lg w-11/12 max-w-xs p-4 pointer-events-auto animate-fadeIn`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 text-primary rounded-full">
              {currentTourStep.icon}
            </div>
            <h3 className="font-semibold">{currentTourStep.title}</h3>
          </div>
          <button 
            onClick={handleDismiss} 
            className="p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full ripple"
            aria-label="Skip tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">{currentTourStep.description}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {tourSteps.map((_, index) => (
              <div 
                key={index} 
                className={`h-1.5 w-6 rounded-full ${index === currentStep ? 'bg-primary' : 'bg-muted'}`}
                aria-hidden="true"
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            {showActionButton && (
              <button
                onClick={() => handleNavigate(actionPath)}
                className="px-3 py-1.5 border border-border rounded-md bg-background text-foreground hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm ripple"
              >
                Try it
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm flex items-center gap-1 ripple"
            >
              {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding; 