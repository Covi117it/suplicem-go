import { useContext, useMemo, useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { AuthContext } from "@/context/authContext";
import { useLoading } from "@/context/loadingContext";
import { useAlert } from "@/context/alertContext";
import { AcceptedTripContext } from "@/context/TripContext";
import {
  getDriverActiveTrip,
  getDriverActualTrips,
  getTripAvailable,
  getTripDetail,
  updateTripStatus,
} from "@/services/tripsService";
import { Trip } from "@/types/trips";

export const useDriverHomeTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [actualTrips, setActualTrips] = useState<any[]>([]);
  const router = useRouter();
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();
  const { user } = useContext(AuthContext);
  const { trip: contextTrip, saveTrip, clearTrip } = useContext(AcceptedTripContext);

  const hasAcceptedTrip = Boolean(
    (activeTrip && activeTrip.status !== "assigned") ||
    (contextTrip && contextTrip.status !== "assigned")
  );

  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [tripToReject, setTripToReject] = useState<any>(null);
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  const handleOpenRejectModal = (trip: any) => {
    setTripToReject(trip);
    setRejectReason("");
    setIsRejectModalVisible(true);
  };

  const handleCloseRejectModal = () => {
    setIsRejectModalVisible(false);
    setTripToReject(null);
    setRejectReason("");
  };

  const fetchTrips = async () => {
    try {
      const response = await getTripAvailable();
      if (response.success && response.trips) {
        const mappedTrips: Trip[] = response.trips.map((trip: any) => ({
          id: trip.id,
          tripNumber: trip.tripNumber,
          totalTons: trip.totalTons,
          createdAt: trip.createdAt,
          assignedDriverId: trip.assignedDriverId,
          comments: trip.comments,
          status: trip.status,
        }));

        setTrips(mappedTrips);
      }
    } catch (error) {
      console.error("❌ Error fetching trips:", error);
    }
  };

  const validateTrips = async () => {
    try {
      const actualRes = await getDriverActualTrips();
      const myActuals = actualRes?.data?.trips || [];
      setActualTrips(Array.isArray(myActuals) ? myActuals : []);

      const response = await getDriverActiveTrip();

      if (response?.success && response?.data?.hasActiveTrip && response?.data?.trip) {
        const trip = response.data.trip;
        const isMyTrip =
          !user?.uid ||
          trip.assignedDriverId === user?.uid ||
          trip.driverId === user?.uid ||
          trip.driver?.id === user?.uid;

        if (isMyTrip) {
          setActiveTrip(trip);
          saveTrip(trip);
          return;
        }
      }

      setActiveTrip(null);
      clearTrip();
    } catch (error) {
      console.error("Error validando viaje activo:", error);
      setActiveTrip(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const getTripsAsync = async () => {
        show();
        await fetchTrips();
        await validateTrips();
        hide();
      };

      getTripsAsync();
      return () => {};
    }, [])
  );

  const handleConfirmReject = async () => {
    if (!tripToReject?.id) return;
    if (rejectReason.trim().length < 5) {
      showAlert({
        message: "El motivo del rechazo debe tener al menos 5 caracteres.",
        type: "warning",
      });
      return;
    }

    setIsSubmittingReject(true);
    show();
    try {
      const res = await updateTripStatus(tripToReject.id, "canceled", rejectReason.trim());
      if (res?.success) {
        handleCloseRejectModal();
        showAlert({
          message: "Has rechazado el viaje. Se ha notificado al Administrador para su reasignación.",
          type: "success",
        });
        await fetchTrips();
        await validateTrips();
      } else {
        showAlert({
          message: res?.message || "No se pudo rechazar el viaje.",
          type: "error",
        });
      }
    } catch (err: any) {
      showAlert({
        message: err?.message || "Error al rechazar el viaje.",
        type: "error",
      });
    } finally {
      setIsSubmittingReject(false);
      hide();
    }
  };

  const handleStartTripFromHome = async (tripItem: any) => {
    try {
      show();
      const detailRes = await getTripDetail(tripItem.id);
      const fullTrip = detailRes?.success && detailRes?.trip ? detailRes.trip : tripItem;

      const startRes = await updateTripStatus(tripItem.id, "started");
      if (startRes?.success) {
        const startedTrip = { ...fullTrip, status: "started" };
        saveTrip(startedTrip as any);
        setActiveTrip(startedTrip);
        showAlert({
          message: `Viaje #${tripItem.tripNumber} iniciado. ¡Buen viaje!`,
          type: "success",
        });
        router.push("/driver-order");
      } else {
        saveTrip({ ...fullTrip, status: "accepted" } as any);
        showAlert({
          message: startRes?.message || "No se pudo iniciar la ruta.",
          type: "warning",
        });
        router.push("/driver-order");
      }
    } catch (err: any) {
      showAlert({
        message: err?.message || "Error al iniciar la ruta.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  const displayedTrips = useMemo(() => {
    return [...trips].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });
  }, [trips]);

  return {
    trips,
    displayedTrips,
    activeTrip,
    actualTrips,
    hasAcceptedTrip,
    isRejectModalVisible,
    rejectReason,
    setRejectReason,
    isSubmittingReject,
    saveTrip,
    fetchTrips,
    handleOpenRejectModal,
    handleCloseRejectModal,
    handleConfirmReject,
    handleStartTripFromHome,
    router,
  };
};
