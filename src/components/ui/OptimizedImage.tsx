import React, { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
}

/**
 * OptimizedImage component that improves Core Web Vitals by:
 * - Supporting modern image formats (WebP/AVIF)
 * - Properly handling aspect ratio to prevent CLS
 * - Supporting lazy loading and priority loading
 * - Providing placeholder during loading
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '100vw',
  loading: loadingProp,
  onLoad
}) => {
  const [loaded, setLoaded] = useState(false);
  
  // Determine if we should use lazy loading
  const loading = priority ? 'eager' : loadingProp || 'lazy';
  
  // Generate WebP and AVIF versions of the image
  const baseSrc = src.replace(/\.(jpg|jpeg|png|gif)$/i, '');
  
  // Handle image load event
  const handleImageLoad = () => {
    setLoaded(true);
    if (onLoad) onLoad();
  };

  // Add blur-up effect when image loads
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = handleImageLoad;
  }, [src]);

  // Calculate aspect ratio if width and height are provided
  const aspectRatio = width && height ? `${width / height}` : undefined;

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio: aspectRatio,
        width: width ? `${width}px` : '100%',
      }}
    >
      {/* Add a placeholder background */}
      <div
        className={`absolute inset-0 bg-gray-200 ${loaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      />
      
      <picture>
        {/* AVIF format - best compression and quality */}
        <source 
          srcSet={`${baseSrc}.avif`} 
          type="image/avif" 
          sizes={sizes}
        />
        
        {/* WebP format - wide support */}
        <source 
          srcSet={`${baseSrc}.webp`} 
          type="image/webp"
          sizes={sizes}
        />
        
        {/* Original format fallback */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          onLoad={handleImageLoad}
          className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} w-full h-full object-cover`}
          style={{ 
            aspectRatio: aspectRatio,
          }}
        />
      </picture>
    </div>
  );
};

export default OptimizedImage; 