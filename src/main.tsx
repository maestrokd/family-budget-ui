import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {HashRouter} from 'react-router-dom'
import {QueryProvider} from './providers/QueryProvider'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryProvider>
        <HashRouter>
          <App/>
        </HashRouter>
      </QueryProvider>
    </StrictMode>
)
