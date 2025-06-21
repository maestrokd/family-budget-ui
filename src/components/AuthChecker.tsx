import React, {useEffect} from 'react';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';

const AuthChecker: React.FC = () => {
  console.log('AuthChecker - in ');

  const { isAuthenticated, isTelegram, /*telegramAuth,*/ loginWithTelegram/*, addTelegramAuth*/} = useAuth();
  const {search, pathname} = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AuthChecker useEffect - in ');

    if (isTelegram) {
      loginWithTelegram()
          .then(() => {
            navigate(pathname + window.location.search, { replace: true });
          })
          .catch(() => {
            navigate('#login', { replace: true });
          });
      return;
    }

    if (!isTelegram) {
      if (!isAuthenticated) {
        console.log('AuthChecker useEffect not authenticated - in ');
        navigate('login', { replace: true });
      }
    }

  }, [isAuthenticated, isTelegram, search, navigate, pathname]);

  return <Outlet/>;
};

export default AuthChecker;
