import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerServiceWorker } from './registerSW';
import { ThemeProvider } from './contexts/ThemeProvider';
import { HistoryProvider } from './contexts/HistoryContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { PresetsProvider } from './contexts/PresetsContext';
import { initializeUserPreferences } from './lib/user-preferences';
import { preloadFrequentConversionData } from './lib/indexedDB';
import { Analytics } from '@vercel/analytics/react';
import { PostHogProvider } from 'posthog-js/react';

// Initialize user preferences
initializeUserPreferences();

// Preload frequently used conversion data
preloadFrequentConversionData();

// Register service worker for PWA capabilities
registerServiceWorker();

// Add a global handler for gesture taps with haptic feedback
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.closest('button, a, [role="button"]')) {
    // Trigger haptic feedback for buttons on supported devices
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }
});

// Setup improved focus styles for keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-navigation');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-navigation');
});

// Set lang attribute for accessibility
document.documentElement.lang = 'en';

// Add high contrast detection
if (window.matchMedia('(prefers-contrast: more)').matches) {
  document.documentElement.classList.add('high-contrast');
}

// Add reduced motion preference detection
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('reduce-motion');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        debug: import.meta.env.MODE === 'development',
      }}
    >
      <ThemeProvider>
        <HistoryProvider>
          <FavoritesProvider>
            <PresetsProvider>
              <App />
              <Analytics />
            </PresetsProvider>
          </FavoritesProvider>
        </HistoryProvider>
      </ThemeProvider>
    </PostHogProvider>
  </React.StrictMode>,
);
