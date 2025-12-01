import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ChaosMonkey } from './ChaosMonkey';
import ErrorBoundary from './ErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChaosMonkey>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ChaosMonkey>
  </StrictMode>,
);
