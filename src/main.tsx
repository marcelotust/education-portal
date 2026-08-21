import * as Sentry from '@sentry/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App';
import { SentryErrorFallback } from './components/layout/SentryErrorFallback';
import './index.css';
import { recoverFromStaleChunk } from './lib/staleChunkRecovery';
import { initSentry } from './lib/sentry';

recoverFromStaleChunk();
initSentry(import.meta.env.VITE_SENTRY_DSN);

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('Root element #root not found in index.html.');
}

createRoot(rootElement).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={SentryErrorFallback}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
