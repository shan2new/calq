import React from 'react';
import { Link } from 'react-router-dom';
import { Ruler, Scale, Beaker, Thermometer, Square, PlaneTakeoff, Clock, HardDrive, ArrowRight, Check } from 'lucide-react';

const Home: React.FC = () => {
  const conversionCategories = [
    { id: 'length', name: 'Length', icon: <Ruler className="w-5 h-5" /> },
    { id: 'mass', name: 'Mass', icon: <Scale className="w-5 h-5" /> },
    { id: 'volume', name: 'Volume', icon: <Beaker className="w-5 h-5" /> },
    { id: 'temperature', name: 'Temperature', icon: <Thermometer className="w-5 h-5" /> },
    { id: 'area', name: 'Area', icon: <Square className="w-5 h-5" /> },
    { id: 'speed', name: 'Speed', icon: <PlaneTakeoff className="w-5 h-5" /> },
    { id: 'time', name: 'Time', icon: <Clock className="w-5 h-5" /> },
    { id: 'digital', name: 'Digital', icon: <HardDrive className="w-5 h-5" /> },
  ];
  
  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Hero section */}
      <div className="flex flex-col items-center text-center space-y-4 py-6">
        <h1 className="text-3xl font-bold">Calcq</h1>
        <p className="text-muted-foreground max-w-md">
          Fast, accurate unit conversions across multiple categories
        </p>
        <Link
          to="/converter"
          className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm md:text-base md:px-5 md:py-3 text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Start Converting <ArrowRight className="ml-2 w-3.5 h-3.5 md:w-4 md:h-4" />
        </Link>
      </div>
      
      {/* Categories section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Popular Categories</h2>
          <Link to="/converter" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {conversionCategories.map((category) => (
            <Link
              key={category.id}
              to={`/converter?category=${category.id}`}
              className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all"
            >
              <div className="mb-2 p-1.5 bg-primary/10 rounded-full text-primary">{category.icon}</div>
              <span className="text-sm font-medium">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Features section */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <ul className="space-y-3">
          <li className="flex items-start">
            <div className="mr-3 mt-1">
              <Check className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="font-medium">Comprehensive Unit Library</span>
              <p className="text-sm text-muted-foreground">Access a wide range of measurement units for all your conversion needs</p>
            </div>
          </li>
          <li className="flex items-start">
            <div className="mr-3 mt-1">
              <Check className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="font-medium">Conversion History</span>
              <p className="text-sm text-muted-foreground">Easily access your recent conversions for quick reference</p>
            </div>
          </li>
          <li className="flex items-start">
            <div className="mr-3 mt-1">
              <Check className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="font-medium">Save Favorites</span>
              <p className="text-sm text-muted-foreground">Bookmark frequent conversions for faster access</p>
            </div>
          </li>
          <li className="flex items-start">
            <div className="mr-3 mt-1">
              <Check className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="font-medium">Offline Support</span>
              <p className="text-sm text-muted-foreground">Convert units anytime, even without an internet connection</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Home; 