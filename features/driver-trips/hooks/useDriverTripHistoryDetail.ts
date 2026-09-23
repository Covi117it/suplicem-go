import { useState, useEffect, useCallback } from "react";
import { useAlert } from "@/context/alertContext";
import { getTripDetail } from "@/services/tripsService";

export const useDriverTripHistoryDetail = (tripId?: string) => {
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrderIndex, setExpandedOrderIndex] = useState<number | null>(null);

  const { showAlert } = useAlert();

  const fetchTrip = useCallback(async () => {
    if (!tripId) return;

    try {
      setLoading(true);
      const response = await getTripDetail(tripId);
      if (response?.success && response?.trip) {
        setTrip(response.trip);
      } else {
        showAlert({
          message: "No se pudieron cargar los detalles del viaje.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error al obtener detalle del viaje:", error);
      showAlert({
        message: "Error de red al consultar el viaje.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [tripId, showAlert]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  const toggleOrder = (index: number) => {
    setExpandedOrderIndex((prev) => (prev === index ? null : index));
  };

  return {
    trip,
    loading,
    expandedOrderIndex,
    toggleOrder,
    refreshTrip: fetchTrip,
  };
};
