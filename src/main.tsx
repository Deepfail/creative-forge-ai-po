import React from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from 'sonner'
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./index.css"

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary 
    FallbackComponent={ErrorFallback}
    onError={(error, errorInfo) => {
      console.error('React Error Boundary caught an error:', error, errorInfo)
    }}
  >
    <App />
    <Toaster position="top-center" />
  </ErrorBoundary>
)
