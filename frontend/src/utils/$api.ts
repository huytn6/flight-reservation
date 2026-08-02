import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { storage } from '@/utils/storage';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  request_id?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export const $api = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Inject Access Token
$api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Automatic Refresh Token & Response Unwrapping
$api.interceptors.response.use(
  (response: AxiosResponse) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body) {
      if (body.success === false) {
        const errorMsg = body.error?.message || 'Request failed';
        const err = new Error(errorMsg) as any;
        err.code = body.error?.code;
        err.details = body.error?.details;
        return Promise.reject(err);
      }
      return body.data !== undefined ? body.data : body;
    }
    return body;
  },
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return $api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentToken = storage.getAccessToken();
      if (!currentToken) {
        storage.clearTokens();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${env.apiBaseUrl}/auth/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${currentToken}` },
          }
        );

        const newAccessToken = response.data?.data?.token || response.data?.token;
        if (newAccessToken) {
          storage.setAccessToken(newAccessToken);
          processQueue(null, newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return $api(originalRequest);
        } else {
          throw new Error('No token returned');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        storage.clearTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const backendError = error.response?.data?.error;
    if (backendError) {
      const customErr = new Error(backendError.message || 'An error occurred') as any;
      customErr.code = backendError.code;
      customErr.details = backendError.details;
      customErr.status = error.response?.status;
      return Promise.reject(customErr);
    }

    return Promise.reject(error);
  }
);

export default $api;
