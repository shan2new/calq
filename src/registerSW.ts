import { registerSW } from 'virtual:pwa-register';

// This is the service worker registration
// It automatically updates when a new version is available
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        // Show a UI element to notify the user there's an update available
        if (confirm('New content available. Reload to update?')) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        // Show a UI element to notify the user the app is ready for offline use
        console.log('App is ready for offline use');
      },
    });
  }
}; 