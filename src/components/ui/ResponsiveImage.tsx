import React from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  sizes = '100vw',
  loading = 'lazy',
  priority = false
}) => {
  // Generate WebP version path
  const webpSrc = src.replace(/\.(png|jpg|jpeg)$/, '.webp');
  const avifSrc = src.replace(/\.(png|jpg|jpeg)$/, '.avif');
  const baseSrc = src;
  
  // Generate responsive srcSet for different sizes (up to original size)
  const generateSrcSet = (source: string) => {
    const sizes = [320, 640, 960, 1280, 1920];
    const srcSets = sizes
      .filter(size => size <= width * 2) // Don't go beyond 2x original width
      .map(size => {
        const resizedSrc = source.replace(
          /\.(png|jpg|jpeg|webp|avif)$/,
          `-${size}.$1`
        );
        return `${resizedSrc} ${size}w`;
      });
    
    return srcSets.length > 0 ? srcSets.join(', ') : undefined;
  };
  
  return (
    <picture>
      {/* AVIF format - best compression but less supported */}
      <source
        type="image/avif"
        srcSet={generateSrcSet(avifSrc)}
        sizes={sizes}
      />
      
      {/* WebP format - good compression, better support */}
      <source
        type="image/webp"
        srcSet={generateSrcSet(webpSrc)}
        sizes={sizes}
      />
      
      {/* Original format as fallback */}
      <img 
        src={baseSrc} 
        alt={alt} 
        width={width} 
        height={height} 
        loading={priority ? 'eager' : loading} 
        className={className}
        srcSet={generateSrcSet(baseSrc)}
        sizes={sizes}
        style={{ maxWidth: '100%', height: 'auto' }}
        onError={(e) => {
          // Fallback if image fails to load
          const target = e.target as HTMLImageElement;
          console.warn(`Image failed to load: ${target.src}`);
        }}
      />
    </picture>
  );
};

export default ResponsiveImage; 