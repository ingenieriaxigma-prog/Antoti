import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';
import '../styles/globals.css';

// ✅ PWA Support
import { initPWA } from './utils/pwa';

// ✅ Analytics Support
import { initAnalytics } from './utils/analytics';

// Verificar que el DOM esté listo
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Initialize PWA features
initPWA();

// Initialize Analytics
initAnalytics();

// Renderizar la aplicación
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);