import { useState, useCallback, useEffect } from "react";
import { Linking } from "react-native";
import { useFocusEffect } from "expo-router";
import { getOrderTracking } from "@/services/orderService";
import { socketService } from "@/services/socketService";
import { getAuthSession } from "@/utils/authStorage";

export const useClientOrderTracking = (selectedOrder?: any) => {
  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
  } | null>(null);
  const [trip, setTrip] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [tonsInfo, setTonsInfo] = useState<{
    totalTons: number;
    deliveredTons: number;
    pendingBalance: number;
  }>({
    totalTons: 0,
    deliveredTons: 0,
    pendingBalance: 0,
  });

  const refreshDriverLocationAndTripStatus = useCallback(async () => {
    if (!selectedOrder?.id) return;

    try {
      const response = await getOrderTracking(selectedOrder.id);
      const trackingData = response?.data?.tracking || (response as any)?.tracking;
      if (trackingData) {
        const { trip: trackingTrip, location, driver, trips: trackingTrips } = trackingData;
        let mergedTrip = null;
        if (trackingTrip) {
          mergedTrip = {
            ...trackingTrip,
            assignedDriverId: trackingTrip.assignedDriverId || driver?.id,
            driver: trackingTrip.driver || driver,
            deliveryPin: trackingTrip.deliveryPin,
          };
          setTrip(mergedTrip);
        }

        if (Array.isArray(trackingTrips) && trackingTrips.length > 0) {
          setTrips(trackingTrips);
        } else if (mergedTrip) {
          setTrips([mergedTrip]);
        } else {
          setTrips([]);
        }

        setTonsInfo({
          totalTons: Number(trackingData.totalTons) || Number(selectedOrder.totalTons) || 0,
          deliveredTons: Number(trackingData.deliveredTons) || Number(selectedOrder.deliveredTons) || 0,
          pendingBalance: Number(trackingData.pendingBalance) || Number(selectedOrder.pendingBalance) || 0,
        });

        if (location) {
          setDriverLocation({
            latitude: location.latitude,
            longitude: location.longitude,
            heading: location.heading,
            speed: location.speed,
          });
        }
      }
    } catch (error) {
      console.error("Error al obtener tracking de orden:", error);
    }
  }, [selectedOrder?.id, selectedOrder?.totalTons, selectedOrder?.deliveredTons, selectedOrder?.pendingBalance]);

  // Suscripción WebSocket en tiempo real para seguimiento del camión
  useEffect(() => {
    if (!trip?.id) return;

    let isMounted = true;

    const setupSocket = async () => {
      const session = await getAuthSession();
      if (!session?.token || !isMounted) return;

      socketService.connect(session.token);
      socketService.joinTrip(trip.id);

      const unsubscribe = socketService.onLocationUpdate((data) => {
        if (!isMounted) return;
        if (data.tripId === trip.id) {
          setDriverLocation({
            latitude: data.lat,
            longitude: data.lng,
            heading: data.heading,
            speed: data.speed,
          });
          setTrip((prev: any) =>
            prev ? { ...prev, location: { latitude: data.lat, longitude: data.lng } } : prev
          );
        }
      });

      return unsubscribe;
    };

    let cleanupPromise = setupSocket();

    return () => {
      isMounted = false;
      cleanupPromise.then((unsubscribe) => {
        if (unsubscribe) unsubscribe();
        socketService.leaveTrip(trip.id);
      });
    };
  }, [trip?.id]);

  useFocusEffect(
    useCallback(() => {
      if (!selectedOrder) return;

      refreshDriverLocationAndTripStatus();

      const isTerminal = ["completed", "rejected", "cancelled"].includes(selectedOrder?.status);
      if (isTerminal) return;

      const interval = setInterval(() => {
        refreshDriverLocationAndTripStatus();
      }, 45000);

      return () => clearInterval(interval);
    }, [selectedOrder, refreshDriverLocationAndTripStatus])
  );

  const handleCallDriver = (phoneToCall?: string) => {
    const phone = phoneToCall || trip?.driver?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleWhatsapp = (phone?: string) => {
    const targetPhone = phone || trip?.driver?.phone;
    if (targetPhone) {
      const formattedPhone = targetPhone.startsWith("+") ? targetPhone : `+1${targetPhone}`;
      Linking.openURL(`whatsapp://send?phone=${formattedPhone}`);
    }
  };

  return {
    trip,
    trips,
    tonsInfo,
    driverLocation,
    handleCallDriver,
    handleWhatsapp,
  };
};
