import {createContext, type ReactNode, useContext, useEffect, useState} from 'react';
import {post, registerAuthContext, registerLoginWithTelegram, registerSetToken} from "@/services/ApiService.ts";
import {type LoginResponse} from "@/services/AuthService.ts";
import WebApp from "@twa-dev/sdk";

interface Principal {
  id: number;
  username: string;
  authorities: string[];
}

interface AuthContextType {
  token: string | null;
  principal: Principal | null;
  telegramAuth: string | null;
  telegramInitDataString: string | null;
  isAuthenticated: boolean;
  isTelegram: boolean;
  addTelegramAuth: (
      telegramAuth: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithTelegram: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: { children: ReactNode }) => {
  console.log('AuthProvider - in ');

  const [token, setToken] = useState<string | null>(null);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [telegramAuth, setTelegramAuth] = useState<string | null>(null);
  const [telegramInitDataString, setTelegramInitDataString] = useState<string | null>(null);

  // re-register whenever the token or telegram data changes:
  useEffect(() => {
    registerAuthContext(
        () => token,
        () => Boolean(telegramInitDataString),
    );
    registerSetToken(setToken);
    registerLoginWithTelegram(loginWithTelegram);
  }, [token, telegramInitDataString, setToken]);

  const refresh = async (): Promise<void> => {
    console.info('AuthProvider Refresh - in');
    const {accessToken} = await post<LoginResponse>('/auth/refresh', undefined, { withCredentials: true });
    // TODO catch
    console.info(
        'Refresh response:',
        accessToken
    );
    setToken(accessToken);
    localStorage.setItem('token', accessToken);
  };

  const login = async (email: string, password: string): Promise<void> => {
    console.info('AuthProvider Login - in');
    const {accessToken} = await post<LoginResponse>('/auth/login', {username:email, password});
    console.info(
        'Login response:',
        accessToken
    );
    setToken(accessToken);
    localStorage.setItem('token', accessToken);
  };

  const loginWithTelegram = async (): Promise<void> => {
    console.info('AuthProvider Telegram Login - in');
    const {accessToken} = await post<LoginResponse>('/auth/login/telegram', {initData: telegramInitDataString});
    console.info(
        'Telegram Login response:',
        accessToken
    );
    setToken(accessToken);
    localStorage.setItem('token', accessToken);
  };

  const logout = () => {
    console.info('Logout - in');
    setToken(null);
    setPrincipal(null);
    localStorage.removeItem('token');
    // Закрити WebApp у Telegram при виході
    /*if (window && window.Telegram && window.Telegram.WebApp) {
      WebApp.close();
    }*/
  };

  const addTelegramAuth = async (telegramAuth: string) => {
    setTelegramAuth(telegramAuth);
  };

  useEffect(() => {
    if (WebApp) {
      WebApp.ready();
      const initDataString = WebApp.initData;
      console.log('initDataString', initDataString);
      if (initDataString) {
        setTelegramInitDataString(initDataString);
      }
    }

    const savedJwt = localStorage.getItem('token');
    if (savedJwt) {
      refresh()
    }
  }, []);


  return (
      <AuthContext.Provider
          value={{
            token,
            principal,
            isAuthenticated: Boolean(token),
            telegramInitDataString,
            isTelegram: Boolean(telegramInitDataString),
            telegramAuth,
            addTelegramAuth,
            login,
            loginWithTelegram,
            logout,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth should be used within AuthProvider');
  return ctx;
};
