import React, {Suspense, useEffect} from 'react'
import './App.css'
import {Navigate, Route, Routes, useNavigate} from 'react-router-dom'
import WebLayout from "@/components/layouts/WebLayout.tsx";
import SettingsPage from "@/pages/SettingsPage.tsx";
import TelegramLayout from './components/layouts/TelegramLayout';
import TelegramHealthDashboard1 from "@/pages/TelegramHealthDashboard1.tsx";
import TelegramHealthDashboard2 from "@/pages/TelegramHealthDashboard2.tsx";
import PrivateRoute from "@/components/PrivateRoute.tsx";
import {LoginPage} from '@/pages/LoginPage';
import {registerNavigate} from "@/services/ApiService.ts";
import RegistrationPage from "@/pages/RegistrationPage.tsx";
import ResetPasswordPage from "@/pages/ResetPasswordPage.tsx";
import DefaultLayout from "@/components/layouts/DefaultLayout.tsx";

const WelcomePage = React.lazy(() => import('@/pages/WelcomePage'))
const HealthDashboard = React.lazy(() => import('@/pages/HealthDashboard'))


const App: React.FC = () => {
    const navigate = useNavigate();
    useEffect(() => {
        registerNavigate(navigate);
    }, [navigate]);

    return (

        <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
            <Routes>
                <Route path="register" element={<DefaultLayout><RegistrationPage/></DefaultLayout>}/>
                <Route path="password/reset" element={<DefaultLayout><ResetPasswordPage/></DefaultLayout>}/>
                <Route path="login" element={<DefaultLayout><LoginPage/></DefaultLayout>}/>
                <Route path="telegram/login" element={<DefaultLayout><LoginPage/></DefaultLayout>}/>
                <Route element={<PrivateRoute/>}>
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
}

export default App
