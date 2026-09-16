import { safeRequest } from "./apiSafe";
import protectedApi from "./protectedApi";

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  rnc: string;
  currency?: string;
  holder?: string;
}

export const getBankAccounts = async () => {
  const result = await safeRequest(() => protectedApi.get("/config/bank-accounts"));
  if (result.success && result.data) {
    return {
      success: true,
      bankAccounts: (result.data.bankAccounts || []) as BankAccount[],
    };
  }
  return {
    success: false,
    message: result.message || "Error al obtener las cuentas bancarias",
    bankAccounts: [] as BankAccount[],
  };
};
