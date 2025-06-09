import {get, post} from "./ApiService.ts";


export interface HealthResponse {
  status: string;
  env: string;
}

export interface TelegramHealthResponse {
  telegramId: number;
  firstName: string;
  currentUserProfileEmail: string;
  currentSheetProfileName: string;
}


export const fetchHealthCheck = async (): Promise<HealthResponse> => {
  return await get<HealthResponse>('/health');
};

export const fetchHealthMessage = async (
    message: string
): Promise<string> =>
    await get<string>('/health/message', { params: { message } });

export const fetchTelegramHealth = async (initData: string): Promise<TelegramHealthResponse> => {
  return await post<TelegramHealthResponse>('/health/telegram', { initData });
};
