import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SessionProvider } from '@auth/react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider
      baseUrl={import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}
      basePath="/auth"
      refetchOnWindowFocus={false}
      // @ts-ignore - permite enviar cookies (credenciales) en las peticiones
      fetchOptions={{ credentials: 'include' }}
    >
      <App />
    </SessionProvider>
  </StrictMode>
)