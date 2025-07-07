import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index-minimal.css'; // Use minimal CSS for debugging
import App from './App.jsx';
// Temporarily disable iOS utils to test basic functionality
// import './utils/iosUtils.js';
// import './assets/fonts/fonts.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
