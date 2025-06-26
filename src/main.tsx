import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {HashRouter} from 'react-router-dom'
import {QueryProvider} from './providers/QueryProvider'
import WebApp from '@twa-dev/sdk'
import {AuthProvider} from "@/contexts/AuthContext.tsx";

WebApp.ready();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryProvider>
            <HashRouter>
                <AuthProvider>
                    <App/>
                </AuthProvider>
            </HashRouter>
        </QueryProvider>
    </StrictMode>
)
