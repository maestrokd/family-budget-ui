import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import './i18n';
import App from './App.tsx'
import {HashRouter} from 'react-router-dom'
import {QueryProvider} from './providers/QueryProvider'
import WebApp from '@twa-dev/sdk'
import {AuthProvider} from "@/contexts/AuthContext.tsx";
import {ThemeProvider} from "@/components/theme/theme-provider.tsx";

WebApp.ready();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryProvider>
            <HashRouter>
                <AuthProvider>
                    <ThemeProvider defaultTheme="system" storageKey="fb-ui-theme">
                        <App/>
                    </ThemeProvider>
                </AuthProvider>
            </HashRouter>
        </QueryProvider>
    </StrictMode>
)
