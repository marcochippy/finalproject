import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { setupIOSCompatibility } from './utils/iosUtils.js';
// import './assets/fonts/fonts.css';

// Initialize iOS compatibility
setupIOSCompatibility();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
