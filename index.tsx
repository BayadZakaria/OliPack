
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Shim pour process.env afin de garantir la compatibilité dans le navigateur
// Utilisation de 'any' pour éviter les erreurs TypeScript sur l'objet window
(window as any).process = (window as any).process || { env: {} };
if (!(window as any).process.env) (window as any).process.env = {};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
