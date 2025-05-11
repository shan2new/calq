/**
 * Performance optimization utilities to improve Core Web Vitals
 * and ensure high Google PageSpeed scores.
 */

/**
 * Defers non-critical JavaScript by adding async or defer attributes
 * and loads scripts after the initial page render.
 */
export function deferNonCriticalJS() {
  // Create an observer to watch when page is idle
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      loadAnalytics();
      loadThirdPartyScripts();
    });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(() => {
      loadAnalytics();
      loadThirdPartyScripts();
    }, 2000);
  }
}

/**
 * Load analytics scripts after the page is interactive
 */
function loadAnalytics() {
  const script = document.createElement('script');
  script.src = '/js/analytics.js';
  script.async = true;
  document.body.appendChild(script);
}

/**
 * Load non-critical third-party scripts
 */
function loadThirdPartyScripts() {
  const scripts = [
    { src: 'https://www.googletagmanager.com/gtag/js?id=G-EXAMPLE', async: true },
    { src: '/js/feedback-widget.js', async: true },
    { src: '/js/social-sharing.js', defer: true }
  ];
  
  scripts.forEach(scriptData => {
    const script = document.createElement('script');
    script.src = scriptData.src;
    if (scriptData.async) script.async = true;
    if (scriptData.defer) script.defer = true;
    document.body.appendChild(script);
  });
}

/**
 * Prefetch critical assets and DNS for future page navigations
 */
export function prefetchResources(resources: {
  dns?: string[];
  preconnect?: string[];
  prefetch?: string[];
  prerender?: string[];
}) {
  if (typeof document === 'undefined') return;
  
  const head = document.head;
  
  // DNS prefetch
  resources.dns?.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    head.appendChild(link);
  });
  
  // Preconnect
  resources.preconnect?.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    head.appendChild(link);
  });
  
  // Prefetch
  resources.prefetch?.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    head.appendChild(link);
  });
  
  // Prerender
  resources.prerender?.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prerender';
    link.href = url;
    head.appendChild(link);
  });
}

/**
 * Implement font optimization for better CLS and LCP
 */
export function optimizeFonts() {
  // Font display swap ensures text is visible during font loading
  const fontStyle = document.createElement('style');
  fontStyle.textContent = `
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 400 700;
      font-display: swap;
      src: url('/fonts/inter-var-latin.woff2') format('woff2');
    }
  `;
  document.head.appendChild(fontStyle);
  
  // Preload font files
  const fontPreload = document.createElement('link');
  fontPreload.rel = 'preload';
  fontPreload.href = '/fonts/inter-var-latin.woff2';
  fontPreload.as = 'font';
  fontPreload.type = 'font/woff2';
  fontPreload.crossOrigin = 'anonymous';
  document.head.appendChild(fontPreload);
}

/**
 * Optimize image loading with modern techniques
 */
export function configureImageLoading() {
  // Feature detection for native lazy loading
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      const imgElement = img as HTMLImageElement;
      if (imgElement.src) {
        // Already has src, do nothing
      } else if (imgElement.getAttribute('data-src')) {
        // Set src from data-src
        imgElement.src = imgElement.getAttribute('data-src') || '';
      }
    });
  } else {
    // Fallback for browsers without native lazy loading support
    // Using a dynamic import pattern that's more compatible with TypeScript
    const script = document.createElement('script');
    script.src = '/js/lazysizes.min.js';
    script.async = true;
    script.onload = () => console.log('Fallback lazy-loading initialized');
    script.onerror = () => console.error('Failed to load lazy loading script');
    document.body.appendChild(script);
  }
}

/**
 * Apply critical CSS inline and defer non-critical CSS
 */
export function optimizeCSS() {
  if (typeof document === 'undefined') return;
  
  // Add critical CSS inline
  const criticalStyle = document.createElement('style');
  criticalStyle.textContent = `
    /* Critical CSS for above-the-fold content */
    body { margin: 0; font-family: system-ui, sans-serif; }
    .header { display: flex; align-items: center; padding: 1rem; }
    .main-content { padding: 1rem; }
  `;
  document.head.appendChild(criticalStyle);
  
  // Load non-critical CSS asynchronously
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/css/non-critical.css';
  link.media = 'print';
  link.onload = () => {
    link.media = 'all';
  };
  document.head.appendChild(link);
}

/**
 * Initialize core performance optimizations
 */
export function initPerformanceOptimizations() {
  if (typeof window === 'undefined') return;
  
  // Setup observer for when page becomes idle
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      deferNonCriticalJS();
      configureImageLoading();
      optimizeCSS();
    });
  } else {
    setTimeout(() => {
      deferNonCriticalJS();
      configureImageLoading();
      optimizeCSS();
    }, 1000);
  }
  
  // Apply font optimization immediately
  optimizeFonts();
  
  // Prefetch critical resources
  prefetchResources({
    dns: [
      'www.google-analytics.com',
      'www.googletagmanager.com'
    ],
    preconnect: [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ],
    prefetch: [
      '/convert/length',
      '/convert/temperature'
    ],
    prerender: [
      '/convert/length/meter/foot'
    ]
  });
}

// Add TypeScript interfaces for window object
declare global {
  interface Window {
    requestIdleCallback: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  }
}

export default initPerformanceOptimizations; 