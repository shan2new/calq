import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeProvider';
import { HistoryProvider } from './contexts/HistoryContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { PresetsProvider } from './contexts/PresetsContext';
import { UserProvider } from './contexts/UserContext';
import { registerServiceWorker } from './registerSW';
import './index.css';

// Register service worker for PWA functionality
registerServiceWorker();

// Set lang attribute for accessibility
document.documentElement.lang = 'en';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <UserProvider>
        <HistoryProvider>
          <FavoritesProvider>
            <PresetsProvider>
              <App />
            </PresetsProvider>
          </FavoritesProvider>
        </HistoryProvider>
      </UserProvider>
    </ThemeProvider>
  </React.StrictMode>,
); 