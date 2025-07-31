import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // Assure-toi que le chemin vers App.tsx est correct
import './index.css'; // Importe ton fichier CSS global (pour Tailwind par exemple)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
