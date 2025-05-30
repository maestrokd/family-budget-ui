import React, {Suspense} from 'react'
import './App.css'
import {Navigate, Route, Routes} from 'react-router-dom'
import WebLayout from "@/components/layouts/WebLayout.tsx";
import SettingsPage from "@/pages/SettingsPage.tsx";
import TelegramLayout from './components/layouts/TelegramLayout';

const WelcomePage = React.lazy(() => import('@/pages/WelcomePage'))
const HealthDashboard = React.lazy(() => import('@/pages/HealthDashboard'))

const App: React.FC = () => (

    <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
      <Routes>
        <Route path={`${import.meta.env.VITE_FE_BASE_URL_PATH}/`} element={<WebLayout><WelcomePage/></WebLayout>}/>
        <Route path={`${import.meta.env.VITE_FE_BASE_URL_PATH}/web/health`} element={<WebLayout><HealthDashboard/></WebLayout>}/>
        <Route path={`${import.meta.env.VITE_FE_BASE_URL_PATH}/web/health/test`} element={<WebLayout><HealthDashboard/></WebLayout>}/>
        <Route path={`${import.meta.env.VITE_FE_BASE_URL_PATH}/web/settings`} element={<WebLayout><SettingsPage/></WebLayout>}/>
        <Route path={`${import.meta.env.VITE_FE_BASE_URL_PATH}/telegram/settings`} element={<TelegramLayout><SettingsPage/></TelegramLayout>}/>
        <Route path={`${import.meta.env.VITE_FE_BASE_URL_PATH}/*`} element={<Navigate to={`${import.meta.env.VITE_FE_BASE_URL_PATH}/`} replace/>}/>
      </Routes>
    </Suspense>
)

export default App
