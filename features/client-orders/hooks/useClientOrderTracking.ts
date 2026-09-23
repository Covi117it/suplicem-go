import { useState, useCallback } from "react";
import { Linking } from "react-native";
import { useFocusEffect } from "expo-router";
import { getOrderTracking } from "@/services/orderService";

export const useClientOrderTracking = (selectedOrder?: any) => {
  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [trip, setTrip] = useState<any>(null);

  const refreshDriverLocationAndTripStatus = useCallback(async () => {
    if (!selectedOrder?.id) return;

    try {
      const response = await getOrderTracking(selectedOrder.id);
      if (response?.success && response?.data?.tracking) {
        const { trip: trackingTrip, location, driver } = response.data.tracking;
        if (trackingTrip) {
          const mergedTrip = {
            ...trackingTrip,
            assignedDriverId: trackingTrip.assignedDriverId || driver?.id,
            driver: trackingTrip.driver || driver,
          };
          setTrip(mergedTrip);
        }
        if (location) {
          setDriverLocation({
            latitude: location.latitude,
            longitude: location.longitude,
          });
        }
      }
    } catch (error) {
      console.error("Error al obtener tracking de orden:", error);
    }
  }, [selectedOrder?.id]);

  useFocusEffect(
    useCallback(() => {
      if (!selectedOrder) return;

      refreshDriverLocationAndTripStatus();

      const interval = setInterval(() => {
        refreshDriverLocationAndTripStatus();
      }, 8000);

      return () => clearInterval(interval);
    }, [selectedOrder, refreshDriverLocationAndTripStatus])
  );

  const handleCallDriver = () => {
    if (trip?.driver?.phone) {
      Linking.openURL(`tel:${trip.driver.phone}`);
    }
  };

  const handleWhatsapp = (phone?: string) => {
    if (phone) {
      const formattedPhone = phone.startsWith("+") ? phone : `+1${phone}`;
      Linking.openURL(`whatsapp://send?phone=${formattedPhone}`);
    }
  };

  return {
    trip,
    driverLocation,
    handleCallDriver,
    handleWhatsapp,
  };
};
