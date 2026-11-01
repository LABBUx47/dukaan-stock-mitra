import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker for offline support and Chromium installability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Trigger background update checks
        registration.update().catch(() => {});
      })
      .catch((err) => {
        console.warn('Service Worker registration note:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);

