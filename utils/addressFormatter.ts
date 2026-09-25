/**
 * Utilidad de formateo y limpieza de direcciones para República Dominicana.
 * Convierte textos con divisiones administrativas como "Región Ozama" en
 * formatos limpios y ejecutivos: "Edificio Josefina, NO. 25, Av. de los Próceres, Santo Domingo"
 */

export const cleanFormattedAddress = (rawAddress: string, addressComponents?: any[]): string => {
  if (!rawAddress) return "";

  // 1. Si vienen componentes estructurados de Google Geocoding API
  if (addressComponents && Array.isArray(addressComponents) && addressComponents.length > 0) {
    const getComp = (type: string) => {
      const c = addressComponents.find((comp: any) => comp.types.includes(type));
      return c ? c.long_name : "";
    };

    const streetNumber = getComp("street_number");
    const route = getComp("route");
    const sublocality =
      getComp("sublocality_level_1") ||
      getComp("sublocality") ||
      getComp("neighborhood");
    const locality =
      getComp("locality") || getComp("administrative_area_level_2");
    const premise = getComp("premise") || getComp("subpremise");

    const parts: string[] = [];
    if (premise) parts.push(premise);
    if (streetNumber && route) {
      parts.push(`No. ${streetNumber} ${route}`);
    } else if (route) {
      parts.push(route);
    }
    if (sublocality && route && sublocality.toLowerCase() !== route.toLowerCase()) {
      parts.push(sublocality);
    }
    if (locality && !locality.toLowerCase().includes("ozama")) {
      const cleanLocality = locality.replace(/Distrito Nacional/i, "Santo Domingo");
      parts.push(cleanLocality);
    }

    if (parts.length >= 2) {
      return parts.join(", ");
    }
  }

  // 2. Limpieza mediante Regex para strings devueltos por APIs
  let cleaned = rawAddress
    .replace(/,\s*Región\s+Ozama/gi, "")
    .replace(/,\s*Ozama/gi, "")
    .replace(/,\s*República\s+Dominicana/gi, "")
    .replace(/,\s*Dominican\s+Republic/gi, "")
    .replace(/,\s*DO\b/gi, "")
    .replace(/\bDistrito Nacional\b/gi, "Santo Domingo")
    .trim();

  // Limpiar comas duplicadas o sobrantes
  cleaned = cleaned.replace(/,\s*,/g, ",").replace(/^,\s*/, "").replace(/,\s*$/, "");

  return cleaned || rawAddress;
};

/**
 * Combina el detalle de edificio/apto/casa con la calle y ciudad.
 * Coloca los datos específicos de vivienda AL PRINCIPIO de la dirección.
 * Ej: ("Av. de los Próceres, Santo Domingo", "Edificio Josefina, NO. 25")
 *  => "Edificio Josefina, NO. 25, Av. de los Próceres, Santo Domingo"
 */
export const combineFullAddress = (description: string, additionalInfo?: string): string => {
  const cleanDesc = cleanFormattedAddress(description);
  const info = additionalInfo?.trim();
  if (!info) return cleanDesc;

  // Si la dirección limpia ya incluye la información adicional al inicio
  if (cleanDesc.toLowerCase().startsWith(info.toLowerCase())) {
    return cleanDesc;
  }

  return `${info}, ${cleanDesc}`;
};
