import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';

// Wait for i18next to be initialized before rendering the app
import i18next from 'i18next';

const root = ReactDOM.createRoot(document.getElementById('root')!);

i18next.on('initialized', () => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
