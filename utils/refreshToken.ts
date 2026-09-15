import axios from "axios";
import { getAuthSession, saveAuthSession, clearAuthSession } from "./authStorage";
import { getBaseUrl } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const API_URL = `${getBaseUrl()}/auth/refresh-token`;

let activeRefreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  const session = await getAuthSession();

  if (!session?.refreshToken) {
    await handleSessionExpired();
    return null;
  }

  try {
    const response = await axios.post(
      API_URL,
      { refreshToken: session.refreshToken },
      { timeout: 15000 }
    );

    const { token, refreshToken, expiresIn } = response.data;
    const now = Date.now();

    const newSession = {
      token,
      refreshToken: refreshToken || session.refreshToken,
      expiresAt: now + (parseInt(expiresIn, 10) || 3600) * 1000,
    };

    await saveAuthSession(newSession);
    return token;
  } catch (error) {
    console.warn("Error al renovar sesión con el Refresh Token:", error);
    await handleSessionExpired();
    return null;
  }
}


export async function getValidToken(): Promise<string | null> {
  const session = await getAuthSession();
  if (!session) return null;

  const now = Date.now();
  // Margen de seguridad de 60 segundos antes del vencimiento oficial
  const isExpiringSoon = now >= session.expiresAt - 60000;

  if (!isExpiringSoon) {
    return session.token;
  }

  // Mutex: Si ya hay un refresco en progreso, esperamos a esa misma promesa
  if (activeRefreshPromise) {
    return await activeRefreshPromise;
  }

  activeRefreshPromise = (async () => {
    try {
      return await refreshAccessToken();
    } finally {
      activeRefreshPromise = null;
    }
  })();

  return await activeRefreshPromise;
}

// redirige al login 
export async function handleSessionExpired(): Promise<void> {
  try {
    await clearAuthSession();
    await AsyncStorage.removeItem("auth-key");
    router.replace("/login");
  } catch (err) {
    console.warn("Error durante el cierre de sesión expirada:", err);
  }
}
