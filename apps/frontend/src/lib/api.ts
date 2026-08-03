import axios from "axios";
import {
  AUTH_STORAGE_KEYS,
  clearAuthStorage,
  getAuthStorage,
  getStoredAuthItem,
} from "./auth-storage";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getStoredAuthItem(AUTH_STORAGE_KEYS.accessToken);
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = String(originalRequest?.url || "");
    const isLoginRequest = requestUrl.includes("/auth/login");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isLoginRequest
    ) {
      originalRequest._retry = true;
      const refreshToken = getStoredAuthItem(AUTH_STORAGE_KEYS.refreshToken);
      const storage = getAuthStorage();

      if (refreshToken && storage) {
        try {
          const { data: tokens } = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            {},
            {
              headers: { Authorization: `Bearer ${refreshToken}` },
              withCredentials: true,
            },
          );

          storage.setItem(AUTH_STORAGE_KEYS.accessToken, tokens.accessToken);
          storage.setItem(AUTH_STORAGE_KEYS.refreshToken, tokens.refreshToken);
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${tokens.accessToken}`,
          };
          return api(originalRequest);
        } catch {
          clearAuthStorage();
        }
      } else {
        clearAuthStorage();
      }

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
