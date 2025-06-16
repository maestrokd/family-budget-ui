import {post} from "./ApiService";

export interface LoginResponse {
  accessToken: string;
}

export const loginWithTelegram = async (initData: string): Promise<void> => {
  const {accessToken} = await post<LoginResponse>('/auth/login/telegram', {initData});
  localStorage.setItem('token', accessToken);
};
