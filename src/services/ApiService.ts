import axios, {type AxiosInstance, type AxiosRequestConfig, type AxiosResponse} from "axios";
import axiosRetry from "axios-retry";

// 1. Create axios instance with baseURL & JSON headers
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BE_REST_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Treat 4xx as errors but only throw on 5xx by default
  validateStatus: (status) => status < 500,
});

// 2. Retry on network errors / 5xx up to 3 times
axiosRetry(apiClient, {
  retries: 3,
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

// 4. Response interceptor: centralized logging & error handling
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      const {response, request, message} = error;
      if (response) {
        console.error(
            'API Error:',
            response.status,
            response.data
        );
        if (response.status === 401) {
          // e.g. redirect to login, clear storage, etc.
        }
      } else if (request) {
        console.error(
            'API Error: No response received',
            request
        );
      } else {
        console.error('API Error:', message);
      }
      return Promise.reject(error);
    }
);

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
