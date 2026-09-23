import { useContext, useState } from "react";
import { Linking } from "react-native";
import { useRouter } from "expo-router";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { AcceptedTripContext } from "@/context/TripContext";
import { useMountEffect } from "@/hooks/lifeCicle";
import {
  orderDelivered,
  enqueueOfflineDelivery,
  syncPendingDeliveries,
} from "@/services/orderService";
import { startOrCancelrip, updateTripStatus } from "@/services/tripsService";
import { stopBackgroundLocationUpdates } from "@/services/backgroundLocationTask";
import { useDriverLocationTracking } from "./useDriverLocationTracking";
import { updateDeliveryStatus } from "../utils/deliveryUtils";

export const useActiveTripExecution = () => {
  const router = useRouter();
  const { trip, saveTrip, clearTrip } = useContext(AcceptedTripContext);
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();

  const { location } = useDriverLocationTracking(trip?.status);

  const [expandedOrderIndex, setExpandedOrderIndex] = useState<number | null>(null);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [isDeliveryModalVisible, setIsDeliveryModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<{
    orderId: string;
    deliveryIndex: number;
  } | null>(null);

  const navigateBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)/(tabs)/(home)/(driver)");
    }
  };

  useMountEffect(async () => {
    syncPendingDeliveries();
  });

  const handleStartTrip = async () => {
    if (!trip?.id) {
      showAlert({ message: "Error: No se encontró el ID del viaje.", type: "error" });
      return;
    }
    try {
      show();
      const response = await startOrCancelrip(trip.id, "started");
      if (response.success) {
        saveTrip({ ...trip, status: "started" });
        showAlert({ message: "Viaje iniciado. Puedes comenzar la ruta.", type: "success" });
      } else {
        showAlert({ message: "Error: No se pudo iniciar el viaje.", type: "error" });
      }
    } catch (error) {
      console.error("Error al iniciar viaje:", error);
      showAlert({ message: "Error: Ocurrió un error al iniciar el viaje.", type: "error" });
    } finally {
      hide();
    }
  };

  const handleOpenDeliveryModal = (orderId: string, deliveryIndex: number) => {
    setCurrentOrder({ orderId, deliveryIndex });
    setIsDeliveryModalVisible(true);
  };

  const handleSendDelivery = async () => {
    if (!currentOrder) return;
    try {
      show();
      const response = await orderDelivered(currentOrder.orderId, currentOrder.deliveryIndex);
      if (response?.success) {
        const updated = updateDeliveryStatus(trip, currentOrder.orderId, currentOrder.deliveryIndex, "delivered");
        saveTrip(updated);
        showAlert({ message: "Entrega marcada como realizada con éxito.", type: "success" });
      } else {
        showAlert({ message: response?.message || "Error al completar la entrega.", type: "error" });
      }
      setIsDeliveryModalVisible(false);
    } catch (error: any) {
      console.warn("⚠️ Sin conexión: guardando entrega en cola offline...", error?.message || error);
      await enqueueOfflineDelivery(currentOrder.orderId, currentOrder.deliveryIndex);
      const updated = updateDeliveryStatus(trip, currentOrder.orderId, currentOrder.deliveryIndex, "delivered");
      saveTrip(updated);
      showAlert({
        message: "Sin conexión. La entrega se guardó en tu teléfono y se sincronizará automáticamente.",
        type: "info",
      });
      setIsDeliveryModalVisible(false);
    } finally {
      hide();
    }
  };

  const confirmCancelTrip = async () => {
    setIsCancelModalVisible(false);
    if (!trip?.id) {
      showAlert({ message: "Error: No se encontró el ID del viaje.", type: "error" });
      return;
    }
    try {
      show();
      const response = await startOrCancelrip(trip.id, "available");
      if (response.success) {
        await stopBackgroundLocationUpdates();
        clearTrip();
        showAlert({ message: "El viaje se ha cancelado correctamente.", type: "success" });
        navigateBack();
      } else {
        showAlert({ message: "Error: No se pudo cancelar el viaje.", type: "error" });
      }
    } catch (error) {
      console.error("❌ Error al cancelar viaje:", error);
      showAlert({ message: "Error: Ocurrió un error al cancelar el viaje.", type: "error" });
    } finally {
      hide();
    }
  };

  const handleCompleteOrder = async () => {
    if (!trip?.id) {
      showAlert({ message: "Error: No se encontró el ID del viaje.", type: "error" });
      return;
    }
    if (isSubmitting) return;

    if (trip.orders && Array.isArray(trip.orders)) {
      for (const tripOrder of trip.orders) {
        if (tripOrder?.deliveries && Array.isArray(tripOrder.deliveries)) {
          const allDelivered = tripOrder.deliveries.every((loc: any) => loc.status === "delivered");
          if (!allDelivered) {
            showAlert({
              message: "Debes completar todas las entregas antes de finalizar el viaje.",
              type: "warning",
            });
            return;
          }
        }
      }
    }

    try {
      setIsSubmitting(true);
      show();
      const response = await updateTripStatus(trip.id, "completed");
      if (response.success) {
        await stopBackgroundLocationUpdates();
        clearTrip();
        showAlert({ message: response.message || "Viaje completado. Gracias por tu trabajo.", type: "success" });
        navigateBack();
      } else {
        showAlert({ message: response.message || "Error: No se pudo completar el viaje.", type: "warning" });
      }
    } catch (error: any) {
      console.error("❌ Error al completar viaje:", error);
      showAlert({ message: error.message || "Error: Ocurrió un error al completar el viaje.", type: "error" });
    } finally {
      setIsSubmitting(false);
      hide();
    }
  };

  const handleCallClient = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsapp = (phone: string) => {
    const formattedPhone = phone.startsWith("+") ? phone : `+1${phone}`;
    Linking.openURL(`whatsapp://send?phone=${formattedPhone}`);
  };

  const toggleOrder = (index: number) => {
    setExpandedOrderIndex((prev) => (prev === index ? null : index));
  };

  return {
    trip,
    location,
    expandedOrderIndex,
    isCancelModalVisible,
    isDeliveryModalVisible,
    navigateBack,
    handleStartTrip,
    handleOpenDeliveryModal,
    handleSendDelivery,
    confirmCancelTrip,
    handleCompleteOrder,
    handleCallClient,
    handleWhatsapp,
    toggleOrder,
    setIsCancelModalVisible,
    setIsDeliveryModalVisible,
  };
};
