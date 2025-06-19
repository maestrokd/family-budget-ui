import axios, {type AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse} from "axios";
import axiosRetry from "axios-retry";
import type {LoginResponse} from "./AuthService";
import type {NavigateFunction} from "react-router-dom";

let navigateFn: NavigateFunction | null = null;

export const registerNavigate = (fn: NavigateFunction) => {
  navigateFn = fn;
};

// 1. Create axios instance with baseURL & JSON headers
// axios.defaults.withCredentials = true;
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BE_REST_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  // Treat 4xx as errors but only throw on 5xx by default
  validateStatus: (status) => status < 400,
});

// 2. Retry on network errors / 5xx up to 3 times
axiosRetry(apiClient, {
  retries: 0,
  retryDelay: axiosRetry.exponentialDelay,
});

// 3. Request interceptor: inject auth token if present
apiClient.interceptors.request.use(
    (config) => {
      config.headers = config.headers ?? {};
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
);



// 4. Handle 401 by refreshing token and retrying once
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalConfig = (error.config ?? {}) as AxiosRequestConfig & { _retry?: boolean };
      const status = error.response?.status;

      // On 401, attempt refresh only once and skip if refresh endpoint itself
      if (status === 401 && !originalConfig._retry) {
        // Avoid infinite loop: do not retry /auth/refresh
        if (originalConfig.url?.endsWith('/auth/refresh')) {
          localStorage.removeItem('token');
          navigateFn?.('/login', { replace: true });
          return Promise.reject(error);
        }

        originalConfig._retry = true;
        try {
          // call refresh endpoint (refresh token via HttpOnly cookie)
          const refreshResp = await apiClient.post<LoginResponse>('/auth/refresh', undefined, { withCredentials: true });
          const newToken = refreshResp.data.accessToken;
          localStorage.setItem('token', newToken);
          originalConfig.headers = originalConfig.headers ?? {};
          originalConfig.headers.Authorization = `Bearer ${newToken}`;
          return apiClient.request(originalConfig);
        } catch {
          // Refresh failed: clear token and stop
          localStorage.removeItem('token');
          return Promise.reject(error);
        }
      }

      // All other errors
      if (error.response) {
        console.error('API Error:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('API Error: No response received', error.request);
      } else {
        console.error('API Error:', error.message);
      }
      return Promise.reject(error);
    }
);


// 4. Handle 401 by refreshing token and retrying
/*apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const {response, config} = error;
      console.error(
          'API Error:',
          response.status,
          response.data
      );
      // on 401, try refresh once
      if (response?.status === 401 && !config._retry) {
        config._retry = true;
        try {
          // call refresh endpoint (refresh token is sent via HttpOnly cookie)
          const refreshResp = await apiClient.post<LoginResponse>('/auth/refresh');
          console.info(
              'Refresh response:',
              refreshResp.status,
              refreshResp.data
          );
          const {accessToken} = refreshResp.data;
          console.info(
              'New access token:',
              accessToken
          );
          localStorage.setItem('token', accessToken);
          // update header and retry original request
          config.headers = config.headers ?? {};
          config.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient.request(config);
        } catch {
          // if refresh fails, clear token or redirect to login
          localStorage.removeItem('token');
        }
      }

      // log other errors
      if (response) {
        console.error('API Error:', response.status, response.data);
      } else if (error.request) {
        console.error('API Error: No response received', error.request);
      } else {
        console.error('API Error:', error.message);
      }
      return Promise.reject(error);
    }
);*/

// 5. Generic HTTP methods returning `response.data`
export const get = async <T>(
    url: string,
    config?: AxiosRequestConfig
): Promise<T> =>
    (await apiClient.get<T>(url, config)).data;

export const post = async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
): Promise<T> =>
    (await apiClient.post<T>(url, data, config)).data;

export const put = async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
): Promise<T> =>
    (await apiClient.put<T>(url, data, config)).data;

export const patch = async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
): Promise<T> =>
    (await apiClient.patch<T>(url, data, config)).data;

export const del = async <T>(
    url: string,
    config?: AxiosRequestConfig
): Promise<T> =>
    (await apiClient.delete<T>(url, config)).data;

// 6. Default export for easy imports
export default {
  get,
  post,
  put,
  patch,
  del,
};
