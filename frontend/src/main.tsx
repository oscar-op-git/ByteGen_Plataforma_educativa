import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'react-hot-toast'
import './styles/output.css'

;(window as any).__API_BASE_URL__ =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster position="bottom-right" /> 
  </StrictMode>
)