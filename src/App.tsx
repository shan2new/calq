import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeProvider';
import { UserProvider } from './contexts/UserContext';
import './index.css';

// Pages
import Home from './pages/Home';
import History from './pages/History';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import ConverterWithSpecialized from './pages/ConverterWithSpecialized';

// SEO Components
import MetadataManager from './components/SEO/MetadataManager';

// URL utilities
import { parseCanonicalPath, buildCanonicalPath } from './lib/url-utils';

// SEO-friendly route component
const SEOConverterRoute = () => {
  const params = useParams<{
    category?: string;
    fromUnit?: string;
    toUnit?: string;
    value?: string;
  }>();
  
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

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <UserProvider>
          <Router>
            <Layout>
              {/* Base app metadata */}
              <MetadataManager />
              
              <Routes>
                <Route path="/" element={<Home />} />
                
                {/* SEO-friendly URL format - higher priority */}
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

export default App; 