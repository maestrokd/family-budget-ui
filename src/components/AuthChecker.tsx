import React, {useEffect} from 'react';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';

const AuthChecker: React.FC = () => {
  const {telegramAuth, addTelegramAuth} = useAuth();
  const {search, pathname} = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AuthChecker - in")
    const params = new URLSearchParams(search);
    console.log("params")
    console.log(params)
    const authParam = params.get('telegram_auth') || undefined;
    console.log("authParam")
    console.log(authParam)
    if (authParam) {
      addTelegramAuth(authParam);
      console.log(telegramAuth)
    }
  }, [search, telegramAuth, addTelegramAuth, navigate, pathname]);

  return <Outlet/>;
};

export default AuthChecker;
