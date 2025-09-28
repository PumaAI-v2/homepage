import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { analytics, HealthCheckService } from './services/analytics'
import './index.css'

// Initialize production services
if (import.meta.env.PROD) {
  analytics.init();
}

// Log health status
HealthCheckService.logHealthStatus();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)