import axios from "axios";

// Backend de producción en AWS (fallback si no hay variable de entorno)
const PRODUCTION_API_URL = "http://54.211.170.107/api";

export const getBaseUrl = () => {
  return process.env.EXPO_PUBLIC_API_URL || PRODUCTION_API_URL;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 45000,
});

export default api;