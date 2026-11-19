import { useContext, useEffect, useState } from "react";
import { Linking } from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { AcceptedTripContext } from "@/context/TripContext";
import { aceptedTrip, getTripDetail } from "@/services/tripsService";

export const useDriverTripPreview = (tripId?: string) => {
  const router = useRouter();
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();
  const { saveTrip } = useContext(AcceptedTripContext);

  const [trip, setTrip] = useState<any>(null);
  const [loadingTrip, setLoadingTrip] = useState(true);

  useEffect(() => {
    if (!tripId) return;

    const fetchDetail = async () => {
      try {
        setLoadingTrip(true);
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
        setLoadingTrip(false);
      }
    };

    fetchDetail();
  }, [tripId, showAlert]);

  const handleCallClient = (phone: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsapp = (phone: string) => {
    if (!phone) return;
    const formattedPhone = phone.startsWith("+") ? phone : `+1${phone}`;
    Linking.openURL(`whatsapp://send?phone=${formattedPhone}`);
  };

  const handleAccept = async () => {
    if (!tripId) return;

    try {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Ubicación no concedida al aceptar el viaje");
        }
      } catch (e) {
        console.warn("Aviso de permisos de ubicación:", e);
      }

      show();
      const acceptResponse = await aceptedTrip(tripId);

      if (acceptResponse.success) {
        const updatedTrip = { ...trip, status: "accepted" };
        saveTrip(updatedTrip);
        showAlert({
          message: "¡Viaje aceptado con éxito! Ahora puedes iniciar tu ruta.",
          type: "success",
        });
        router.replace("/driver-order");
      } else {
        showAlert({
          message: acceptResponse?.message || "No se pudo aceptar el viaje.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error aceptando viaje:", error);
      showAlert({
        message: "Ocurrió un error al aceptar el viaje.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  return {
    trip,
    loadingTrip,
    handleCallClient,
    handleWhatsapp,
    handleAccept,
  };
};
