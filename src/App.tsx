import React, {Suspense, useEffect} from 'react'
import './App.css'
import {Navigate, Outlet, Route, Routes, useNavigate} from 'react-router-dom'
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
import SheetProfilesPage from "@/pages/SheetProfilesPage.tsx";
import CreateSheetProfilePage from "@/pages/CreateSheetProfilePage.tsx";
import EditSheetProfilePage from "@/pages/EditSheetProfilePage.tsx";
import ManageSheetProfileAccessPage from "@/pages/ManageSheetProfileAccessPage.tsx";

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
                    <Route path="web" element={<WebLayout><Outlet/></WebLayout>}>
                        <Route path="health" element={<HealthDashboard/>}/>
                        <Route path="health/test" element={<HealthDashboard/>}/>
                        <Route path="health/telegram/log" element={<TelegramHealthDashboard1/>}/>
                        <Route path="health/telegram" element={<TelegramHealthDashboard2/>}/>
                        <Route path="sheet-profiles" element={<SheetProfilesPage/>}/>
                        <Route path="sheet-profiles/create" element={<CreateSheetProfilePage/>}/>
                        <Route path="sheet-profiles/edit/:uuid" element={<EditSheetProfilePage/>}/>
                        <Route path="sheet-profiles/manage-access/:uuid" element={<ManageSheetProfileAccessPage/>}/>
                        <Route path="settings" element={<SettingsPage/>}/>
                    </Route>
                    <Route path="telegram" element={<TelegramLayout><Outlet/></TelegramLayout>}>
                        <Route path="sheet-profiles" element={<SheetProfilesPage/>}/>
                        <Route path="sheet-profiles/create" element={<CreateSheetProfilePage/>}/>
                        <Route path="sheet-profiles/edit/:uuid" element={<EditSheetProfilePage/>}/>
                        <Route path="sheet-profiles/manage-access/:uuid" element={<ManageSheetProfileAccessPage/>}/>
                        <Route path="settings" element={<SettingsPage/>}/>
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace/>}/>
                </Route>
            </Routes>
        </Suspense>
    )
}

export default App
