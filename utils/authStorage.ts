import * as SecureStore from "expo-secure-store";

export async function saveAuthSession(data: {
  token: string;
  refreshToken: string;
  expiresAt: number;
}) {
  await SecureStore.setItemAsync("auth", JSON.stringify(data));
}

export async function getAuthSession() {
  const value = await SecureStore.getItemAsync("auth");
  return value ? JSON.parse(value) : null;
}

export async function clearAuthSession() {
  await SecureStore.deleteItemAsync("auth");
}

export async function saveAcceptedTerms(userId: string) {
  try {
    await SecureStore.setItemAsync(`terms_accepted_${userId}`, "true");
  } catch (error) {
    console.error("Error guardando aceptación de términos:", error);
  }
}

export async function checkAcceptedTerms(userId: string): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(`terms_accepted_${userId}`);
    return value === "true";
  } catch (error) {
    return false;
  }
}

export async function resetAcceptedTerms(userId?: string) {
  try {
    if (userId) {
      await SecureStore.deleteItemAsync(`terms_accepted_${userId}`);
      await SecureStore.setItemAsync(`terms_notice_enabled_${userId}`, "true");
    }
  } catch (error) {
    console.error("Error reseteando aceptación de términos:", error);
  }
}

export async function setTermsNoticeEnabled(userId: string, enabled: boolean) {
  try {
    await SecureStore.setItemAsync(`terms_notice_enabled_${userId}`, enabled ? "true" : "false");
    if (enabled) {
      await SecureStore.deleteItemAsync(`terms_accepted_${userId}`);
    } else {
      await SecureStore.setItemAsync(`terms_accepted_${userId}`, "true");
    }
  } catch (error) {
    console.error("Error cambiando estado del aviso de términos:", error);
  }
}

export async function isTermsNoticeEnabled(userId: string): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(`terms_notice_enabled_${userId}`);
    if (value === null) {
      const accepted = await checkAcceptedTerms(userId);
      return !accepted;
    }
    return value === "true";
  } catch (error) {
    return true;
  }
}
