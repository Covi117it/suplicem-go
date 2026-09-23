import { useState, useContext } from "react";
import * as Location from "expo-location";
import { ROLE } from "@/constants/UserConstants";
import { AuthContext } from "@/context/authContext";
import { useMountEffect } from "@/hooks/lifeCicle";
import { sendDriverLocation } from "@/services/tripsService";

export const useDriverLocationTracking = (tripStatus?: string) => {
  const authContext = useContext(AuthContext);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const startDriverLocationTracking = async () => {
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
          setLocation({ latitude, longitude });
          sendDriverLocation(latitude, longitude).catch(() => {});
        }
      } catch (locErr) {
        console.warn("No se pudo obtener posición inicial inmediata:", locErr);
      }

      await Location.watchPositionAsync(
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
    } catch (error: any) {
      console.warn("Aviso al rastrear ubicación del conductor:", error?.message || error);
    }
  };

  useMountEffect(async () => {
    if (tripStatus === "accepted" || tripStatus === "started") {
      startDriverLocationTracking();
    }
  });

  return { location };
};
