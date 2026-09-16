import { getValidToken, refreshAccessToken, handleSessionExpired } from "@/utils/refreshToken";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getBaseUrl } from "./api";


let active401RefreshPromise: Promise<string | null> | null = null;

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const protectedApi = axios.create({
  baseURL: getBaseUrl(),
  timeout: 45000,
});

// Inyección del token y refresco proactivo con Mutex
protectedApi.interceptors.request.use(async (config) => {
  const token = await getValidToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// manejo reactivo de 401s con reintento automático
protectedApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    if (
      !error.response ||
      error.response.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!active401RefreshPromise) {
      active401RefreshPromise = (async () => {
        try {
          return await refreshAccessToken();
        } finally {
          active401RefreshPromise = null;
        }
      })();
    }

    const newToken = await active401RefreshPromise;

    if (newToken) {
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      // Reintentar la petición original silenciosamente con el nuevo token
      return protectedApi(originalRequest);
    }

    // Si el refresco falló definitivamente, redirigir al login
    await handleSessionExpired();
    return Promise.reject(error);
  }
);

export default protectedApi;

