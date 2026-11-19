import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { getDriverTripsHistory } from "@/services/tripsService";
import { Trip } from "@/types/trips";

export type TripStatusInfo = {
  text: string;
  color: string;
};

export const driverTripStatusMap: Record<string, TripStatusInfo> = {
  completed: { text: "Finalizado", color: "#4CAF50" },
  accepted: { text: "Aceptado", color: "#0047AB" },
  assigned: { text: "Asignado", color: "#D97706" },
  canceled: { text: "Cancelado", color: "#F44336" },
  started: { text: "En curso", color: "#2196F3" },
  in_progress: { text: "En curso", color: "#2196F3" },
  available: { text: "Disponible", color: "#A020F0" },
  default: { text: "Desconocido", color: "#9E9E9E" },
};

export const useDriverTripsHistory = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [search, setSearch] = useState("");
  const { show, hide } = useLoading();
  const router = useRouter();
  const { showAlert } = useAlert();

  const fetchTrips = async () => {
    try {
      show();
      const data = await getDriverTripsHistory();
      hide();
      if (data.success) {
        setTrips(data.trips);
      } else {
        showAlert({
          message: "No se pudieron cargar los viajes.",
          type: "error",
        });
      }
    } catch (err) {
      hide();
      console.error(err);
      showAlert({
        message: "Hubo un problema al obtener los viajes.",
        type: "error",
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [])
  );

  const handleOpenTrip = (tripId: string) => {
    router.push({
      pathname: "/(protected)/(tabs)/(orders)/(driver)/driver-trip-detail",
      params: { tripId },
    });
  };

  const filteredTrips = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    if (!searchLower) return trips;

    return trips.filter((trip) => {
      const matchesTripNumber = trip.tripNumber?.toLowerCase().includes(searchLower);
      const matchesComments = trip.comments?.toLowerCase().includes(searchLower);
      const matchesStatus = (driverTripStatusMap[trip.status || "default"]?.text || "Desconocido")
        .toLowerCase()
        .includes(searchLower);
      const matchesOrderIds = trip.orderIds?.some((id) =>
        id.toLowerCase().includes(searchLower)
      );
      const matchesCreatedAt = new Date(trip.createdAt)
        .toLocaleString()
        .toLowerCase()
        .includes(searchLower);

      return (
        matchesTripNumber ||
        matchesComments ||
        matchesStatus ||
        matchesOrderIds ||
        matchesCreatedAt
      );
    });
  }, [trips, search]);

  return {
    trips,
    search,
    setSearch,
    filteredTrips,
    fetchTrips,
    handleOpenTrip,
  };
};
