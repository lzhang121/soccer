import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import App from './App';
import './style.css';

declare global {
  interface Window {
    __SS_CANCEL_BOOT_FALLBACK__?: () => void;
  }
}

window.__SS_CANCEL_BOOT_FALLBACK__?.();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
