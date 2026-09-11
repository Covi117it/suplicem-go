/**
 * Servicio de Validación de Identificación de Suplicem
 *
 * NOTA DE NEGOCIO:
 * La comprobación por base de datos internacional o algoritmos restrictivos ha sido removida.
 * Todo el proceso de verificación de identidad (cédula / pasaporte) queda a cargo del Administrador
 * desde la pantalla de "Solicitudes de Registro", donde se revisa el número adjuntado junto con la
 * imagen cargada por el usuario.
 */

export interface IdentityVerificationResult {
  isValid: boolean;
  message?: string;
  documentType?: "Cedula" | "Pasaporte";
}

/**
 * Validación básica de presencia de documento.
 * La verificación de autenticidad se realiza de forma humana por el Administrador.
 */
export function isBasicIdentityPresent(identification: string): boolean {
  return typeof identification === "string" && identification.trim().length >= 4;
}

