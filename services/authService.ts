import api from "./api";
import { safeRequest } from "./apiSafe";

export const login = async (email: string, password: string) => {
  return await safeRequest(() => api.post("/auth/login", { email, password }));
};

export const recoverPassword = async (email: string) => {
  return await safeRequest(() =>
    api.post("/auth/recover-password", { email })
  );
};

export const getCurrentUser = async (token: string) => {
  return await safeRequest(() =>
    api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  );
};

export const resendVerificationEmail = async (email: string, idToken?: string) => {
  return await safeRequest(() =>
    api.post("/auth/resend-verification", { email, idToken })
  );
};