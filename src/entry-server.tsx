import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

// For providing context to providers that need it during SSR
import { ThemeProvider } from './contexts/ThemeProvider';
import { HistoryProvider } from './contexts/HistoryContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { PresetsProvider } from './contexts/PresetsContext';
import { UserProvider } from './contexts/UserContext';
import { PostHogProvider } from 'posthog-js/react';

export function render(url: string) {
  const helmetContext = {};
  
  // Create minimal initial state for hydration
  // Note: We'll keep localStorage-based state on client-side only
  const appState = {
    // Add minimal state needed for initial render
    // This will be serialized to JSON and sent to the client
  };
  
  // Render the app to string
  const appHtml = renderToString(
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        debug: import.meta.env.MODE === 'development',
      }}
    >
      <HelmetProvider context={helmetContext}>
        <ThemeProvider>
          <UserProvider>
            <HistoryProvider>
              <FavoritesProvider>
                <PresetsProvider>
                  <StaticRouter location={url}>
                    <App />
                  </StaticRouter>
                </PresetsProvider>
              </FavoritesProvider>
            </HistoryProvider>
          </UserProvider>
        </ThemeProvider>
      </HelmetProvider>
    </PostHogProvider>
  );
  
  // Return HTML string and context
  return { 
    appHtml, 
    appState,
    helmetContext 
  };
}