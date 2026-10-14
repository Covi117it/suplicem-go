<<<<<<< Updated upstream
import { useState, useContext, useRef, useEffect, useCallback } from "react";
=======
import { useState, useContext, useEffect, useRef } from "react";
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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

=======
  const stopDriverLocationTracking = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
      console.log("🛑 Rastreo GPS (watchPositionAsync) detenido correctamente para ahorrar batería.");
    }
  };

  const startDriverLocationTracking = async () => {
>>>>>>> Stashed changes
    try {
      stopDriverLocationTracking();

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

<<<<<<< Updated upstream
      const subscription = await Location.watchPositionAsync(
=======
      const sub = await Location.watchPositionAsync(
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
      subscriptionRef.current = subscription;
=======
      subscriptionRef.current = sub;
>>>>>>> Stashed changes
    } catch (error: any) {
      console.warn("Aviso al rastrear ubicación del conductor:", error?.message || error);
    }
  }, [authContext?.user?.userType]);

  useEffect(() => {
<<<<<<< Updated upstream
    if (tripStatus === "accepted" || tripStatus === "started") {
=======
    if (tripStatus === "accepted" || tripStatus === "started" || tripStatus === "in_progress") {
>>>>>>> Stashed changes
      startDriverLocationTracking();
    } else {
      stopDriverLocationTracking();
    }

    return () => {
      stopDriverLocationTracking();
    };
<<<<<<< Updated upstream
  }, [tripStatus, startDriverLocationTracking, stopDriverLocationTracking]);

  return { location, stopDriverLocationTracking };
};
=======
  }, [tripStatus]);

  return { location, stopDriverLocationTracking };
};
>>>>>>> Stashed changes
