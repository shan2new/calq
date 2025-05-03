import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';

// Import providers
import { ThemeProvider } from './contexts/ThemeProvider';
import { HistoryProvider } from './contexts/HistoryContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { PresetsProvider } from './contexts/PresetsContext';
import { UserProvider } from './contexts/UserContext';
import { Analytics } from "@vercel/analytics/react";
import { registerServiceWorker } from './registerSW';
import { initializeUserPreferences } from './lib/user-preferences';
import { preloadFrequentConversionData } from './lib/indexedDB';

// Initialize user preferences
initializeUserPreferences();

// Preload frequently used conversion data
preloadFrequentConversionData();

// Register service worker for PWA capabilities
registerServiceWorker();

// Get initial state from server (if available)
const initialState = window.__INITIAL_STATE__ || {};

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

// Use hydrateRoot for SSR
const root = document.getElementById('root');
if (root) {
  ReactDOM.hydrateRoot(
    root,
    <React.StrictMode>
      <HelmetProvider>
        <ThemeProvider>
          <UserProvider>
            <HistoryProvider>
              <FavoritesProvider>
                <PresetsProvider>
                  <BrowserRouter>
                    <App />
                    <Analytics />
                  </BrowserRouter>
                </PresetsProvider>
              </FavoritesProvider>
            </HistoryProvider>
          </UserProvider>
        </ThemeProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
} 