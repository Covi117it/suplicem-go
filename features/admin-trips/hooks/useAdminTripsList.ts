import { useCallback, useContext, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { AcceptedTripContext } from "@/context/TripContext";
import { getAllTrips, getTripDetail } from "@/services/tripsService";
import { FilterOption } from "@/components/FilterChips";

export type AdminTrip = {
  id: string;
  tripNumber: string;
  orderIds: string[];
  comments: string;
  totalTons: number;
  status: string | null;
  createdAt: string;
};

export const isTripFractional = (tripNumber?: string): boolean => {
  if (!tripNumber) return false;
  return /-\d+$/.test(tripNumber.trim());
};

export const TRIP_FILTER_OPTIONS: FilterOption<string>[] = [
  { id: "Todos", label: "Todos" },
  { id: "available", label: "Pendientes" },
  { id: "accepted", label: "Aceptados" },
  { id: "completed", label: "Finalizados" },
  { id: "fractional", label: "🧩 Fraccionados" },
  { id: "canceled", label: "Cancelados" },
];

export const useAdminTripsList = () => {
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");

  const { show, hide } = useLoading();
  const router = useRouter();
  const { saveTrip } = useContext(AcceptedTripContext);
  const { showAlert } = useAlert();

  const fetchTrips = async () => {
    show();
    const data = await getAllTrips();
    hide();
    if (data.success) {
      setTrips(data.trips);
    } else {
      showAlert({
        message: "No se pudieron cargar las órdenes.",
        type: "error",
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [])
  );

  const tripCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Todos: trips.length,
      available: 0,
      accepted: 0,
      completed: 0,
      fractional: 0,
      canceled: 0,
    };
    trips.forEach((t) => {
      let status = t.status || "default";
      if (status === "started" || status === "in_progress") {
        status = "accepted";
      }
      if (status === "assigned") {
        status = "available";
      }
      if (counts[status] !== undefined) {
        counts[status] = (counts[status] || 0) + 1;
      }
      if (isTripFractional(t.tripNumber)) {
        counts.fractional = (counts.fractional || 0) + 1;
      }
    });
    return counts;
  }, [trips]);

  const filteredTrips = useMemo(() => {
    const searchLower = search.trim().toLowerCase();

    return trips.filter((trip) => {
      const matchesSearch =
        !searchLower ||
        trip.tripNumber?.toLowerCase().includes(searchLower) ||
        trip.comments?.toLowerCase().includes(searchLower) ||
        trip.orderIds.some((id) =>
          id.toLowerCase().includes(searchLower)
        );

      const matchesStatus =
        statusFilter === "Todos" ||
        (statusFilter === "fractional" && isTripFractional(trip.tripNumber)) ||
        trip.status === statusFilter ||
        (statusFilter === "available" && trip.status === "assigned") ||
        (statusFilter === "accepted" &&
          (trip.status === "started" || trip.status === "in_progress"));

      return matchesSearch && matchesStatus;
    });
  }, [trips, search, statusFilter]);

  const handleViewTrip = useCallback(
    async (tripId: string) => {
      try {
        show();
        const response = await getTripDetail(tripId);

        if (response.success && response.trip) {
          saveTrip(response.trip);
          router.push("/trip-detail-screen");
        } else {
          showAlert({
            message: "No se pudo cargar el detalle del viaje.",
            type: "error",
          });
        }
      } catch (error) {
        console.error("❌ Error fetching trip detail:", error);
        showAlert({
          message: "Ocurrió un error al consultar el detalle.",
          type: "error",
        });
      } finally {
        hide();
      }
    },
    [show, hide, saveTrip, router, showAlert]
  );

  return {
    trips,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    tripCounts,
    filteredTrips,
    handleViewTrip,
  };
};
