import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/global.css';
import { initMagneticButtons } from './lib/magneticButtons.js';

initMagneticButtons();

// Art-style testing: ?theme=ember picks a [data-theme] block from tokens.css
// and persists it; ?theme=default clears it. No param → last choice sticks.
const requested = new URLSearchParams(location.search).get('theme');
if (requested !== null) {
  try {
    if (requested === '' || requested === 'default') localStorage.removeItem('cp2157_theme');
    else localStorage.setItem('cp2157_theme', requested);
  } catch { /* private mode */ }
}
try {
  const theme = localStorage.getItem('cp2157_theme');
  if (theme) document.documentElement.dataset.theme = theme;
} catch { /* private mode */ }

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
