/**
 * Utilidades de validación de documentos de identidad
 */

/**
 * Valida un número de cédula dominicana mediante el algoritmo de Luhn (Módulo 10).
 * Acepta números de 11 dígitos con o sin guiones/espacios.
 */
export const isValidCedula = (value: string): boolean => {
  const clean = (value || "").replace(/[-\s]/g, "");
  if (!/^\d{11}$/.test(clean)) return false;

  const digits = clean.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let tmp = digits[i] * (i % 2 === 0 ? 1 : 2);
    if (tmp > 9) tmp -= 9;
    sum += tmp;
  }
  return (10 - (sum % 10)) % 10 === digits[10];
};

/**
 * Valida un número de pasaporte (letras y números, entre 6 y 12 caracteres).
 */
export const isValidPassport = (value: string): boolean => {
  const clean = (value || "").trim();
  return /^[A-Z0-9]{6,12}$/i.test(clean);
};
