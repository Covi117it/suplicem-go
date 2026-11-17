import { useState, useContext, useRef, useEffect, useCallback } from "react";
import * as Location from "expo-location";
import { ROLE } from "@/constants/UserConstants";
import { AuthContext } from "@/context/authContext";
import { sendDriverLocation } from "@/services/tripsService";
import { socketService } from "@/services/socketService";
import { getAuthSession } from "@/utils/authStorage";

export const useDriverLocationTracking = (tripStatus?: string, tripId?: string) => {
  const authContext = useContext(AuthContext);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const lastEmittedCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  const stopDriverLocationTracking = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
      console.log("🛑 Rastreo GPS en primer plano del conductor detenido.");
    }
    socketService.disconnect();
  }, []);

  const startDriverLocationTracking = useCallback(async () => {
    // Si ya existe una suscripción activa, evitamos duplicar escuchadores
    if (subscriptionRef.current) return;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permiso de ubicación no concedido para el conductor");
        return;
      }

      // Conectar WebSocket con el token de la sesión segura
      const session = await getAuthSession();
      socketService.connect(session?.token);

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3500, // Intervalo fluido de 3.5 segundos
          distanceInterval: 5,  // 5 metros mínimos para emitir
        },
        (loc) => {
          if (authContext?.user?.userType === ROLE.DRIVER && loc?.coords) {
            const { latitude, longitude, speed, heading } = loc.coords;
            setLocation({ latitude, longitude });

            // Filtro de reposo: no emitir si la velocidad es < 2 km/h y no hay desplazamiento
            const last = lastEmittedCoordsRef.current;
            const speedKmh = (speed || 0) * 3.6;
            const hasMoved =
              !last ||
              Math.abs(last.lat - latitude) > 0.00008 || // ~8 metros
              Math.abs(last.lng - longitude) > 0.00008;

            if (speedKmh > 2 || hasMoved) {
              lastEmittedCoordsRef.current = { lat: latitude, lng: longitude };

              // Emisión en tiempo real por WebSocket (RAM Lightsail < 10ms)
              if (tripId && socketService.isConnected()) {
                socketService.emitDriverLocation({
                  tripId,
                  lat: latitude,
                  lng: longitude,
                  speed: speed || 0,
                  heading: heading || 0,
                });
              } else {
                // Respaldo por HTTP si el socket estuviera reconectando
                sendDriverLocation(latitude, longitude).catch(() => {});
              }
            }
          }
        }
      );

      subscriptionRef.current = subscription;
    } catch (error: any) {
      console.warn("Aviso al rastrear ubicación del conductor:", error?.message || error);
    }
  }, [authContext?.user?.userType, tripId]);

  useEffect(() => {
    if (tripStatus === "accepted" || tripStatus === "started" || tripStatus === "in_progress") {
      startDriverLocationTracking();
    } else {
      stopDriverLocationTracking();
    }

    return () => {
      stopDriverLocationTracking();
    };
  }, [tripStatus, startDriverLocationTracking, stopDriverLocationTracking]);

  return { location, stopDriverLocationTracking };
};