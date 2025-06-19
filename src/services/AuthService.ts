import {post} from "./ApiService";

export interface LoginResponse {
  accessToken: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export const login = async (email: string, password: string): Promise<void> => {
  console.info('Login - in');
  const {accessToken} = await post<LoginResponse>('/auth/login', {username:email, password});
  console.info(
      'Login response:',
      accessToken
  );
  localStorage.setItem('token', accessToken);
};

export const loginWithTelegram = async (initData: string): Promise<void> => {
  console.info('Telegram Login - in');
  const {accessToken} = await post<LoginResponse>('/auth/login/telegram', {initData});
  console.info(
      'Telegram Login response:',
      accessToken
  );
  localStorage.setItem('token', accessToken);
};
