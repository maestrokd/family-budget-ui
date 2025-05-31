import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter} from 'react-router-dom'
import {QueryProvider} from './providers/QueryProvider'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryProvider>
        <BrowserRouter basename={import.meta.env.VITE_FE_BASE_URL_PATH}>
          <App/>
        </BrowserRouter>
      </QueryProvider>
    </StrictMode>
)
