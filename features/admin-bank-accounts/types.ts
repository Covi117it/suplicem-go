import { CreateBankAccountPayload } from "@/services/configService";

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  savings: "Ahorros",
  checking: "Corriente",
  current: "Cuenta Corriente",
};

export const ACCOUNT_TYPES: { label: string; value: CreateBankAccountPayload["accountType"] }[] = [
  { label: "Ahorros", value: "savings" },
  { label: "Corriente", value: "checking" },
  { label: "Cuenta Corriente", value: "current" },
];

export const emptyForm: CreateBankAccountPayload = {
  bankName: "",
  accountHolder: "",
  accountNumber: "",
  accountType: "savings",
  currency: "DOP",
  routingNumber: "",
  swiftCode: "",
};
