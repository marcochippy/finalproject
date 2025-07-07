import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { setupIOSCompatibility, fixIOSPWANavigation } from './utils/iosUtils.js';
// import './assets/fonts/fonts.css';

// Initialize iOS compatibility and PWA navigation fixes
setupIOSCompatibility();
fixIOSPWANavigation();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
