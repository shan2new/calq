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
  keywords?: string;
  noIndex?: boolean;
  language?: string;
  publishedTime?: string; 
  modifiedTime?: string;
}

export const MetadataManager: React.FC<MetadataProps> = ({
  title,
  description,
  fromUnit,
  toUnit,
  category,
  value,
  canonicalPath,
  imageUrl = '/images/og-default.jpg',
  keywords,
  noIndex = false,
  language = 'en',
  publishedTime,
  modifiedTime
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
  
  // Generate keywords if not provided
  const pageKeywords = keywords || (fromUnit && toUnit && category
    ? `${fromUnit} to ${toUnit}, ${category} converter, unit conversion, online calculator, ${fromUnit}, ${toUnit}`
    : 'unit converter, online calculator, measurement conversion, calcq');
  
  // Get current date for auto-generated dates if needed
  const currentDate = new Date().toISOString();
  const publishDate = publishedTime || currentDate;
  const modifyDate = modifiedTime || currentDate;
  
  return (
    <Helmet>
      <html lang={language} />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={currentUrl} />
      
      {/* Search console verification - replace with your actual verification code */}
      <meta name="google-site-verification" content="CALCQ-VERIFICATION-CODE" />
      
      {/* Additional meta tags for SEO */}
      <meta name="keywords" content={pageKeywords} />
      {noIndex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      )}
      <meta name="googlebot" content={noIndex ? "noindex,nofollow" : "index,follow"} />
      
      {/* Technical and mobile optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#18181b" media="(prefers-color-scheme: dark)" />
      <meta name="application-name" content="Calcq" />
      <meta name="apple-mobile-web-app-title" content="Calcq" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Social media sharing meta tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="Calcq" />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={language} />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Optional publication date for articles */}
      {publishedTime && <meta property="article:published_time" content={publishDate} />}
      {modifiedTime && <meta property="article:modified_time" content={modifyDate} />}
      
      {/* PWA related tags */}
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
      <meta name="msapplication-TileColor" content="#da532c" />
    </Helmet>
  );
};

export default MetadataManager; 