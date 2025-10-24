import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SessionProvider } from 'next-auth/react'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider baseUrl="http://localhost:3000"> {/* URL del backencito */}
      <App />
    </SessionProvider>
  </StrictMode>
)
