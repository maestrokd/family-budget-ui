import {createContext, type ReactNode, useContext, useEffect, useRef, useState} from 'react';
import {post, registerLogoutFn, registerRefreshFn} from "@/services/ApiService.ts";
import {type LoginResponse} from "@/services/AuthService.ts";
import WebApp from "@twa-dev/sdk";
import {jwtDecode} from 'jwt-decode';

interface Principal {
    id: string;
    authorities: string[];
    username: string;
}

interface AuthContextType {
    token: string | null;
    isAuthenticated: boolean;
    principal: Principal | null;
    isTelegram: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithTelegram: () => Promise<string>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const didInit = useRef(false);
    const [initDone, setInitDone] = useState(false)
    const [token, setToken] = useState<string | null>(null);
    const [principal, setPrincipal] = useState<Principal | null>(null);
    const [telegramInitDataString, setTelegramInitDataString] = useState<string | null>(null);

    useEffect(() => {
        registerRefreshFn(refreshFn);
        registerLogoutFn(logout);
    });

    const refreshFn = async (): Promise<string> => {
        if (telegramInitDataString) {
            return await loginWithTelegram();
        } else {
            return await refresh();
        }
    };

    const refresh = async (): Promise<string> => {
        try {
            const {accessToken} = await post<LoginResponse>('/auth/refresh', undefined, {withCredentials: true});
            setToken(accessToken);
            localStorage.setItem('token', accessToken);
            return accessToken
        } catch (e) {
            console.error('AuthProvider Refresh - error', e);
            throw e;
        }
    };

    const login = async (email: string, password: string): Promise<void> => {
        const {accessToken} = await post<LoginResponse>('/auth/login', {username: email, password, initData: telegramInitDataString});
        setToken(accessToken);
        localStorage.setItem('token', accessToken);
        const {sub, authorities} = jwtDecode<{ sub: string; authorities: string[] }>(accessToken);
        setPrincipal({id: sub, username: '', authorities: authorities});
    };

    const loginWithTelegram = async (initDataParam?: string | null): Promise<string> => {
        const initData = initDataParam ?? telegramInitDataString;
        const {accessToken} = await post<LoginResponse>('/auth/login/telegram', {initData: initData});
        setToken(accessToken);
        localStorage.setItem('token', accessToken);
        return accessToken
    };

    const logout = () => {
        setToken(null);
        setPrincipal(null);
        localStorage.removeItem('token');
        // Close WebApp in Telegram
        /*if (window && window.Telegram && window.Telegram.WebApp) {
          WebApp.close();
        }*/
    };


    useEffect(() => {
        if (didInit.current) return;
        didInit.current = true;

        const init = async () => {
            setInitDone(false)
            if (WebApp) {
                WebApp.ready();
            }

            let token = null;
            if (WebApp?.initData) {
                const initDataString = WebApp.initData;
                if (initDataString) {
                    setTelegramInitDataString(initDataString);
                    try {
                        token = await loginWithTelegram(initDataString);
                    } catch (e) {
                        console.error('AuthProvider useEffect - loginWithTelegram - error', e);
                    }
                }
            } else {
                const savedJwt = localStorage.getItem('token');
                if (savedJwt) {
                    try {
                        token = await refresh();
                    } catch (e) {
                        console.error('AuthProvider useEffect - refresh savedJwt - error', e);
                    }
                }
            }
            if (token) {
                const {sub, authorities} = jwtDecode<{ sub: string; authorities: string[] }>(token);
                setPrincipal({id: sub, username: '', authorities: authorities});
            }
            setInitDone(true);
        };
        init();

    });

    if (!initDone) {
        return <div className="flex items-center justify-center h-screen">Loading…</div>
    }

    return (
        <AuthContext.Provider
            value={{
                token,
                isAuthenticated: Boolean(token),
                principal,
                isTelegram: Boolean(telegramInitDataString),
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
