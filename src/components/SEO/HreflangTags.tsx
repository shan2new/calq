import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface HreflangProps {
  currentPath?: string;
  supportedLanguages?: Array<{code: string, path: string}>;
}

export const HreflangTags: React.FC<HreflangProps> = ({ 
  currentPath,
  supportedLanguages = [
    { code: 'en', path: '' },
    { code: 'es', path: '/es' },
    { code: 'fr', path: '/fr' }
  ]
}) => {
  const location = useLocation();
  const baseUrl = 'https://calcq.app';
  const path = currentPath || location.pathname;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return (
    <Helmet>
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${cleanPath}`} />
      
      {supportedLanguages.map(lang => (
        <link 
          key={lang.code}
          rel="alternate" 
          hrefLang={lang.code} 
          href={`${baseUrl}${lang.path}${cleanPath}`} 
        />
      ))}
    </Helmet>
  );
};

export default HreflangTags; 