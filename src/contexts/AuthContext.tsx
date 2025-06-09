import {createContext, type ReactNode, useContext, useState} from 'react';

interface AuthContextType {
  telegramAuth: string | null;
  addTelegramAuth: (
      telegramAuth: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: { children: ReactNode }) => {
  const [telegramAuth, setTelegramAuth] = useState<string | null>(null);

  const addTelegramAuth = async (telegramAuth: string) => {
    setTelegramAuth(telegramAuth);
  };

  return (
      <AuthContext.Provider
          value={{
            telegramAuth,
            addTelegramAuth,
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
