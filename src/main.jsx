import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ChaosMonkey } from './ChaosMonkey'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChaosMonkey>
      <App />
    </ChaosMonkey>
  </StrictMode>,
)
