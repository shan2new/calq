import { BrowserRouter as Router, Routes, Route, useLocation, useParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeProvider';
import { UserProvider } from './contexts/UserContext';
import { useEffect } from 'react';
import { trackPageView, trackSeoUrlConversion } from './lib/analytics';
import './index.css';

// Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import History from './pages/History';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import ConverterWithSpecialized from './pages/ConverterWithSpecialized';
import CategoryLanding from './pages/CategoryLanding';

// SEO Components
import MetadataManager from './components/SEO/MetadataManager';
import { WebApplicationStructuredData, ProductStructuredData } from './components/SEO/StructuredData';
import ResourceHints from './components/SEO/ResourceHints';
import HreflangTags from './components/SEO/HreflangTags';

// Page view tracker component
const PageViewTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Track page view on route changes
    trackPageView(location.pathname);
  }, [location]);
  
  return null;
};

// Legacy route component - no redirects, just render the converter
const LegacyConverterRoute = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  return (
    <ConverterWithSpecialized 
      initialCategory={searchParams.get('category') || undefined}
      initialFromUnit={searchParams.get('from') || undefined}
      initialToUnit={searchParams.get('to') || undefined}
      initialValue={searchParams.get('value') ? Number(searchParams.get('value')) : undefined}
      useLegacyUrlFormat={true} // Tell the component to use legacy URL format
    />
  );
};

// SEO-friendly route component for unit conversions
const SEOConverterRoute = () => {
  const params = useParams<{
    category?: string;
    fromUnit?: string;
    toUnit?: string;
    value?: string;
  }>();
  
  useEffect(() => {
    // Track SEO URL conversions
    if (params.category && params.fromUnit && params.toUnit) {
      trackSeoUrlConversion(
        params.category,
        params.fromUnit,
        params.toUnit,
        params.value || ''
      );
    }
  }, [params.category, params.fromUnit, params.toUnit, params.value]);
  
  return (
    <ConverterWithSpecialized 
      initialCategory={params.category}
      initialFromUnit={params.fromUnit}
      initialToUnit={params.toUnit}
      initialValue={params.value ? Number(params.value) : undefined}
      disableUrlUpdates={true} // Disable automatic URL updates to prevent loops
    />
  );
};

// Web Worker Setup
const setupWebWorker = () => {
  // Check if Worker API is supported
  if (typeof Worker !== 'undefined') {
    // Create a global worker if it doesn't exist yet
    if (!window.conversionWorker) {
      window.conversionWorker = new Worker('/conversion-worker.js');
      
      // Set up message handler
      window.conversionWorker.onmessage = (e) => {
        // Dispatch a custom event to notify components of worker results
        const event = new CustomEvent('conversionResult', { detail: e.data });
        window.dispatchEvent(event);
      };
      
      console.log('Conversion web worker initialized');
    }
  }
};

function App() {
  // Initialize web worker for calculations
  useEffect(() => {
    setupWebWorker();
    
    // Clean up worker on component unmount
    return () => {
      if (window.conversionWorker) {
        window.conversionWorker.terminate();
        delete window.conversionWorker;
      }
    };
  }, []);
  
  return (
    <HelmetProvider>
      <ThemeProvider>
        <UserProvider>
          <Router>
            <Layout>
              {/* Base app metadata */}
              <MetadataManager />
              
              {/* Resource hints for Core Web Vitals */}
              <ResourceHints />
              
              {/* Hreflang tags for internationalization */}
              <HreflangTags />
              
              {/* Global structured data */}
              <WebApplicationStructuredData />
              <ProductStructuredData />
              
              {/* Track page views */}
              <PageViewTracker />
              
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                
                {/* Category landing pages */}
                <Route path="/convert/:category" element={<CategoryLanding />} />
                
                {/* SEO-friendly URL format for conversions */}
                <Route 
                  path="/convert/:category/:fromUnit/:toUnit/:value?" 
                  element={<SEOConverterRoute />} 
                />
                
                {/* Legacy URL format - no redirects */}
                <Route path="/converter" element={<LegacyConverterRoute />} />
                
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </Router>
        </UserProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

// Add TypeScript interfaces for window object to include the web worker
declare global {
  interface Window {
    conversionWorker?: Worker;
  }
}

export default App; 