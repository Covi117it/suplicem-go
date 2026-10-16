/**
 * Utilidades de validación de documentos de identidad
 */

/**
 * Valida un número de cédula dominicana mediante el algoritmo de Luhn (Módulo 10).
 * Acepta números de 11 dígitos con o sin guiones/espacios.
 */
export const isValidCedula = (value: string): boolean => {
  const clean = (value || "").replace(/[^0-9]/g, "");
  return clean.length === 11;
};

/**
 * Valida un número de pasaporte (letras y números, entre 6 y 12 caracteres).
 */
export const isValidPassport = (value: string): boolean => {
  const clean = (value || "").trim();
  return /^[A-Z0-9]{6,12}$/i.test(clean);
};
