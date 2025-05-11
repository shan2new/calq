import React from 'react';
import { Helmet } from 'react-helmet-async';

export const ResourceHints: React.FC = () => {
  return (
    <Helmet>
      {/* Preconnect to critical domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Preload critical assets */}
      <link rel="preload" href="/fonts/inter-var-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href="/images/og-default.jpg" as="image" />
      
      {/* DNS prefetch for third party services */}
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      
      {/* Prerender most common conversion pages for instant loading */}
      <link rel="prerender" href="/convert/length/meter/foot" />
      <link rel="prerender" href="/convert/temperature/celsius/fahrenheit" />
      <link rel="prerender" href="/convert/weight/kilogram/pound" />
      
      {/* Resource hints for common static assets */}
      <link rel="prefetch" href="/images/calculator-bg.svg" />
      <link rel="prefetch" href="/js/conversion-worker.js" />
      
      {/* Preload key JavaScript files */}
      <link rel="modulepreload" href="/src/components/converter/ConverterInput.tsx" />
      <link rel="modulepreload" href="/src/components/converter/ConverterOutput.tsx" />
    </Helmet>
  );
};

export default ResourceHints; 