import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface MetadataProps {
  title?: string;
  description?: string;
  fromUnit?: string;
  toUnit?: string;
  category?: string;
  value?: string | number;
  canonicalPath?: string;
  imageUrl?: string;
}

export const MetadataManager: React.FC<MetadataProps> = ({
  title,
  description,
  fromUnit,
  toUnit,
  category,
  value,
  canonicalPath,
  imageUrl = '/images/og-default.jpg'
}) => {
  const location = useLocation();
  
  // Determine the canonical URL
  let currentUrl;
  if (canonicalPath) {
    // Use provided canonical path if available
    currentUrl = `https://calcq.app${canonicalPath}`;
  } else if (location.pathname.startsWith('/convert/')) {
    // Use current path if it's already a SEO-friendly URL
    currentUrl = `https://calcq.app${location.pathname}`;
  } else {
    // Fallback to home page for other cases
    currentUrl = 'https://calcq.app/';
  }
  
  // Generate dynamic title if conversion parameters are available
  const pageTitle = title || (fromUnit && toUnit && category
    ? `Convert ${fromUnit} to ${toUnit} | ${category} Converter | Calcq`
    : 'Unit Converter | Fast, Accurate Calculations | Calcq');
  
  // Generate dynamic description if conversion parameters are available
  const pageDescription = description || (fromUnit && toUnit && category
    ? `Convert ${value || ''} ${fromUnit} to ${toUnit} with Calcq's ${category} converter. Instant, accurate unit conversions with step-by-step process.`
    : 'Calcq provides instant, accurate unit conversions across multiple categories. Convert length, mass, volume, and more with our easy-to-use calculator.');
  
  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph tags */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={imageUrl} />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};

export default MetadataManager; 