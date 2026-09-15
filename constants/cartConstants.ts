export type TonOption = {
  fundas: number;
  toneladas: number;
};

export const TON_OPTIONS: TonOption[] = [
  { fundas: 100, toneladas: 4.25 },
  { fundas: 200, toneladas: 8.5 },
  { fundas: 300, toneladas: 12.75 },
  { fundas: 400, toneladas: 17 },
  { fundas: 500, toneladas: 20.25 },
  { fundas: 600, toneladas: 25.5 },
  { fundas: 1000, toneladas: 42.5 },
];

export const DELIVERY_OPTIONS = [
  { label: "Almacén", value: "almacen" },
  { label: "Domicilio", value: "domicilio" },
];

export type BankAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  rnc: string;
  currency: string;
  holder: string;
};

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "banreservas",
    bankName: "Banreservas",
    accountNumber: "960-123456-7",
    accountType: "Cuenta Corriente",
    rnc: "131-45678-9",
    currency: "DOP (Pesos Dominicanos)",
    holder: "SUPLICEM S.R.L.",
  },
  {
    id: "bhd",
    bankName: "Banco BHD",
    accountNumber: "240-987654-3",
    accountType: "Cuenta Corriente",
    rnc: "131-45678-9",
    currency: "DOP (Pesos Dominicanos)",
    holder: "SUPLICEM S.R.L.",
  },
  {
    id: "popular",
    bankName: "Banco Popular",
    accountNumber: "780-451239-1",
    accountType: "Cuenta Corriente",
    rnc: "131-45678-9",
    currency: "DOP (Pesos Dominicanos)",
    holder: "SUPLICEM S.R.L.",
  },
  {
    id: "santacruz",
    bankName: "Banco Santa Cruz",
    accountNumber: "550-882314-9",
    accountType: "Cuenta de Ahorros",
    rnc: "131-45678-9",
    currency: "DOP (Pesos Dominicanos)",
    holder: "SUPLICEM S.R.L.",
  },
];
