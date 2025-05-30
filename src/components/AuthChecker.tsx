import React, {useEffect} from 'react';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';

const AuthChecker: React.FC = () => {
  const {telegramAuth, addTelegramAuth} = useAuth();
  const {search, pathname} = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const authParam = params.get('telegram_auth') || undefined;
    if (authParam) {
      addTelegramAuth(authParam);
    }
  }, [search, telegramAuth, addTelegramAuth, navigate, pathname]);

  return <Outlet/>;
};

export default AuthChecker;
