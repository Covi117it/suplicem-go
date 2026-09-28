import { useState, useContext, useRef, useEffect, useCallback } from "react";
import * as Location from "expo-location";
import { ROLE } from "@/constants/UserConstants";
import { AuthContext } from "@/context/authContext";
import { sendDriverLocation } from "@/services/tripsService";

export const useDriverLocationTracking = (tripStatus?: string) => {
  const authContext = useContext(AuthContext);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const stopDriverLocationTracking = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
      console.log("🛑 Rastreo GPS en primer plano del conductor detenido.");
    }
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

      try {
        const initialLoc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (initialLoc?.coords) {
          const { latitude, longitude } = initialLoc.coords;
          sendDriverLocation(latitude, longitude).catch(() => {});
        }
      } catch (locErr) {
        console.warn("No se pudo obtener posición inicial inmediata:", locErr);
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (loc) => {
          if (authContext?.user?.userType === ROLE.DRIVER && loc?.coords) {
            const { latitude, longitude } = loc.coords;
            setLocation({ latitude, longitude });
            sendDriverLocation(latitude, longitude).catch(() => {});
          }
        }
      );

      subscriptionRef.current = subscription;
    } catch (error: any) {
      console.warn("Aviso al rastrear ubicación del conductor:", error?.message || error);
    }
  }, [authContext?.user?.userType]);

  useEffect(() => {
    if (tripStatus === "accepted" || tripStatus === "started") {
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