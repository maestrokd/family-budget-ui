import {get} from "./ApiService.ts";


export interface HealthResponse {
  status: string;
  env: string;
}


export const fetchHealthCheck = async (): Promise<HealthResponse> => {
  return await get<HealthResponse>('/health');
};

export const fetchHealthMessage = async (
    message: string
): Promise<string> =>
    await get<string>('/health/message', { params: { message } });
