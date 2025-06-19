import React, {useEffect} from 'react';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';
import WebApp from "@twa-dev/sdk";
import {loginWithTelegram} from "@/services/AuthService.ts";

const AuthChecker: React.FC = () => {
  const {telegramAuth, addTelegramAuth} = useAuth();
  const {search, pathname} = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AuthChecker - in ');

    const authenticate = async () => {

      if (WebApp) {
        WebApp.ready();
        const initDataString = WebApp.initData;
        console.log('initDataString', initDataString);

        if (initDataString) {
          try {
            await loginWithTelegram(initDataString);
          } catch (err) {
            console.error('Telegram login failed', err);
            /*navigate('/login', {replace: true});
            return;*/
          }
        }
      }
    }

    authenticate();

    const params = new URLSearchParams(search);
    const authParam = params.get('telegram_auth') || undefined;
    if (authParam) {
      addTelegramAuth(authParam);
    }
  }, [search, telegramAuth, addTelegramAuth, navigate, pathname]);

  return <Outlet/>;
};

export default AuthChecker;
