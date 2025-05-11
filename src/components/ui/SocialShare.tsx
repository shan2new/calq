import React from 'react';
import { useLocation } from 'react-router-dom';

interface SocialShareProps {
  title?: string;
  description?: string;
  hashtags?: string[];
  className?: string;
  showLabels?: boolean;
  compact?: boolean;
  iconSize?: 'sm' | 'md' | 'lg';
}

/**
 * SocialShare component for easy sharing of content across multiple platforms
 * This helps increase social signals which indirectly affect SEO and also generates backlinks
 */
export const SocialShare: React.FC<SocialShareProps> = ({
  title = 'Calcq Unit Converter',
  description = 'Free online unit converter with 4,500+ units and 33 categories',
  hashtags = ['converter', 'calculator', 'unitconversion'],
  className = '',
  showLabels = false,
  compact = false,
  iconSize = 'md'
}) => {
  const location = useLocation();
  const currentUrl = `https://calcq.app${location.pathname}`;
  const hashtagsString = hashtags.join(',');
  
  // Get appropriate icon size class
  const getIconClass = () => {
    switch (iconSize) {
      case 'sm': return 'h-4 w-4';
      case 'lg': return 'h-6 w-6';
      case 'md':
      default: return 'h-5 w-5';
    }
  };
  
  // Get button size class
  const getButtonClass = () => {
    switch (iconSize) {
      case 'sm': return 'p-1.5 text-xs';
      case 'lg': return 'p-3 text-base';
      case 'md':
      default: return 'p-2 text-sm';
    }
  };
  
  const iconClass = getIconClass();
  const buttonClass = getButtonClass();
  
  const containerClass = compact 
    ? 'flex space-x-1' 
    : 'flex flex-wrap gap-2';
  
  return (
    <div className={`${containerClass} ${className}`}>
      {/* Twitter/X Share Button */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}&hashtags=${encodeURIComponent(hashtagsString)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Twitter/X"
        className={`flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition-colors ${buttonClass}`}
      >
        <svg className={iconClass} aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        {showLabels && <span className="ml-2">Twitter</span>}
      </a>
      
      {/* Facebook Share Button */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className={`flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:bg-[#0e68d6] transition-colors ${buttonClass}`}
      >
        <svg className={iconClass} aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
        </svg>
        {showLabels && <span className="ml-2">Facebook</span>}
      </a>
      
      {/* LinkedIn Share Button */}
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className={`flex items-center justify-center rounded-full bg-[#0A66C2] text-white hover:bg-[#0958a8] transition-colors ${buttonClass}`}
      >
        <svg className={iconClass} aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        {showLabels && <span className="ml-2">LinkedIn</span>}
      </a>
      
      {/* Reddit Share Button */}
      <a
        href={`https://www.reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Reddit"
        className={`flex items-center justify-center rounded-full bg-[#FF4500] text-white hover:bg-[#e53d00] transition-colors ${buttonClass}`}
      >
        <svg className={iconClass} aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
        {showLabels && <span className="ml-2">Reddit</span>}
      </a>
      
      {/* WhatsApp Share Button */}
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${currentUrl}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className={`flex items-center justify-center rounded-full bg-[#25D366] text-white hover:bg-[#1fb855] transition-colors ${buttonClass}`}
      >
        <svg className={iconClass} aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        {showLabels && <span className="ml-2">WhatsApp</span>}
      </a>
      
      {/* Email Share Button */}
      <a
        href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description} ${currentUrl}`)}`}
        rel="noopener noreferrer"
        aria-label="Share via Email"
        className={`flex items-center justify-center rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-colors ${buttonClass}`}
      >
        <svg className={iconClass} aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
          <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
          <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
        </svg>
        {showLabels && <span className="ml-2">Email</span>}
      </a>
      
      {/* Copy Link Button */}
      <button
        onClick={() => {
          navigator.clipboard.writeText(currentUrl);
          // You could add a toast/notification here to confirm copy
        }}
        aria-label="Copy link"
        className={`flex items-center justify-center rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors ${buttonClass}`}
      >
        <svg className={iconClass} aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z" clipRule="evenodd" />
        </svg>
        {showLabels && <span className="ml-2">Copy</span>}
      </button>
    </div>
  );
};

export default SocialShare; 