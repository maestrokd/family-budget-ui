import React, {Suspense} from 'react'
import './App.css'
import {Navigate, Route, Routes} from 'react-router-dom'
import WebLayout from "@/components/layouts/WebLayout.tsx";
import SettingsPage from "@/pages/SettingsPage.tsx";
import TelegramLayout from './components/layouts/TelegramLayout';
import TelegramHealthDashboard1 from "@/pages/TelegramHealthDashboard1.tsx";
import TelegramHealthDashboard2 from "@/pages/TelegramHealthDashboard2.tsx";
import AuthChecker from "@/components/AuthChecker.tsx";

const WelcomePage = React.lazy(() => import('@/pages/WelcomePage'))
const HealthDashboard = React.lazy(() => import('@/pages/HealthDashboard'))

const App: React.FC = () => (

    <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
      <Routes>
        <Route element={<AuthChecker/>}>
          <Route path="/" element={<WebLayout><WelcomePage/></WebLayout>}/>
          <Route path="web/health" element={<WebLayout><HealthDashboard/></WebLayout>}/>
          <Route path="web/health/test" element={<WebLayout><HealthDashboard/></WebLayout>}/>
          <Route path="web/health/telegram/log" element={<WebLayout><TelegramHealthDashboard1/></WebLayout>}/>
          <Route path="web/health/telegram" element={<WebLayout><TelegramHealthDashboard2/></WebLayout>}/>
          <Route path="web/settings" element={<WebLayout><SettingsPage/></WebLayout>}/>
          <Route path="telegram/settings" element={<TelegramLayout><SettingsPage/></TelegramLayout>}/>
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Route>
      </Routes>
    </Suspense>
)

export default App
