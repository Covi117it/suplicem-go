/**
 * Cálculo de distancia Haversine y tiempo aproximado de viaje.
 * Retorna la distancia en km (con factor de red vial) y tiempo estimado en minutos.
 */

export interface TripEstimate {
  distanceKm: string;
  durationMinutes: number;
  formattedText: string;
}

export const WAREHOUSE_LOCATION = {
  latitude: 18.4861,
  longitude: -69.9312,
  name: "Almacén Central Suplicem",
  address: "Av. John F. Kennedy, Santo Domingo",
};

export const calculateTripEstimate = (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): TripEstimate | null => {
  if (
    !origin ||
    !destination ||
    !origin.latitude ||
    !origin.longitude ||
    !destination.latitude ||
    !destination.longitude
  ) {
    return null;
  }

  const R = 6371; // Radio de la Tierra en km
  const dLat = ((destination.latitude - origin.latitude) * Math.PI) / 180;
  const dLon = ((destination.longitude - origin.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((origin.latitude * Math.PI) / 180) *
      Math.cos((destination.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistanceKm = R * c;

  // Factor de red vial (~1.35x) y velocidad promedio urbana en Rep. Dom. (~35 km/h)
  const drivingDistanceKm = Math.max(0.5, straightDistanceKm * 1.35);
  const durationMinutes = Math.max(4, Math.round((drivingDistanceKm / 35) * 60));

  return {
    distanceKm: drivingDistanceKm.toFixed(1),
    durationMinutes,
    formattedText: `⏱️ ~${durationMinutes} min (${drivingDistanceKm.toFixed(1)} km)`,
  };
};
