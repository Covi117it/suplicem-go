import ConfirmationModal from "@/components/ConfirmationModal";
import { InfoRow } from "@/components/InfoRow";
import { ScreenHeader } from "@/components/ScreenHeader";
import { DriverTripMap } from "@/components/driver/DriverTripMap";
import { DriverTripOrderCard } from "@/components/driver/DriverTripOrderCard";
import { TripActionButtons } from "@/components/driver/TripActionButtons";
import { ROLE } from "@/constants/UserConstants";
import { Palette } from "@/constants/theme";
import { useAlert } from "@/context/alertContext";
import { AuthContext } from "@/context/authContext";
import { useLoading } from "@/context/loadingContext";
import { AcceptedTripContext } from "@/context/TripContext";
import { useMountEffect } from "@/hooks/lifeCicle";
import {
  orderDelivered,
  enqueueOfflineDelivery,
  syncPendingDeliveries,
  markAsDelivered,
} from "@/services/orderService";
import { sendDriverLocation, startOrCancelrip, updateTripStatus } from "@/services/tripsService";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import {
  startBackgroundLocationUpdates,
  stopBackgroundLocationUpdates,
} from "@/services/backgroundLocationTask";
import React, { useContext, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";

const DriverOrderDetailScreen: React.FC = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const router = useRouter();
  const { trip, saveTrip } = useContext(AcceptedTripContext);
  const authContext = useContext(AuthContext);
  const [expandedOrderIndex, setExpandedOrderIndex] = useState<number | null>(null);
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para el modal de entrega
  const [isDeliveryModalVisible, setIsDeliveryModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<{
    orderId: string;
    deliveryIndex: number;
  } | null>(null);

  useMountEffect(async () => {
    if (trip?.status === "accepted" || trip?.status === "started") {
      startDriverLocationTracking();
    }
    // Sincronizar automáticamente entregas offline pendientes
    syncPendingDeliveries();
  });

  const startDriverLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      showAlert({
        message: "Se necesita acceso a la ubicación.",
        type: "warning",
      });
      return;
    }

    try {
      await startBackgroundLocationUpdates();
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (loc) => {
          if (authContext?.user?.userType === ROLE.DRIVER) {
            const { latitude, longitude } = loc.coords;
            setLocation({ latitude, longitude });
            sendDriverLocation(latitude, longitude);
          }
        }
      );
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Error al rastrear la ubicación del conductor.",
        type: "error",
      });
    }
  };

  const handleStartTrip = async () => {
    if (!trip?.id) {
      showAlert({
        message: "Error: No se encontró el ID del viaje.",
        type: "error",
      });
      return;
    }

    try {
      show();
      const response = await startOrCancelrip(trip.id, "started");

      if (response.success) {
        let updatedTrip = { ...trip, status: "started" };
        saveTrip(updatedTrip);
        showAlert({
          message: "Viaje iniciado. Puedes comenzar la ruta.",
          type: "success",
        });
      } else {
        showAlert({
          message: "Error: No se pudo iniciar el viaje.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error al iniciar viaje:", error);
      showAlert({
        message: "Error: Ocurrió un error al iniciar el viaje.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  function updateDeliveryStatus(
    tripData: any,
    orderId: string,
    deliveryIndex: number,
    newStatus: string
  ): any {
    const updatedTrip = { ...tripData };
    const order = updatedTrip.orders.find((o: any) => o.id === orderId);

    if (
      order &&
      Array.isArray(order.deliveries) &&
      deliveryIndex >= 0 &&
      deliveryIndex < order.deliveries.length
    ) {
      order.deliveries[deliveryIndex].status = newStatus;
    } else {
      console.warn("Orden no encontrada o índice de delivery inválido");
    }

    return updatedTrip;
  }

  const handleOpenDeliveryModal = (orderId: string, deliveryIndex: number) => {
    setCurrentOrder({ orderId, deliveryIndex });
    setIsDeliveryModalVisible(true);
  };

  const handleSendDelivery = async () => {
    if (!currentOrder) return;

    try {
      show();
      const response = await orderDelivered(
        currentOrder.orderId,
        currentOrder.deliveryIndex
      );

      if (response?.success) {
        const updatedTrip = updateDeliveryStatus(
          trip,
          currentOrder.orderId,
          currentOrder.deliveryIndex,
          "delivered"
        );
        saveTrip(updatedTrip);
        showAlert({
          message: "Entrega marcada como realizada con éxito.",
          type: "success",
        });
        setIsDeliveryModalVisible(false);
      } else {
        showAlert({
          message: response?.message || "Error al completar la entrega.",
          type: "error",
        });
      }
    } catch (error: any) {
      console.warn("⚠️ Sin conexión: guardando entrega en cola offline...", error?.message || error);
      await enqueueOfflineDelivery(
        currentOrder.orderId,
        currentOrder.deliveryIndex
      );

      const updatedTrip = updateDeliveryStatus(
        trip,
        currentOrder.orderId,
        currentOrder.deliveryIndex,
        "delivered"
      );
      saveTrip(updatedTrip);

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
      showAlert({
        message: "Error: No se encontró el ID del viaje.",
        type: "error",
      });
      return;
    }

    try {
      show();
      const response = await startOrCancelrip(trip.id, "available");

      if (response.success) {
        await stopBackgroundLocationUpdates();
        let updatedTrip = { ...trip, status: "canceled" };
        saveTrip(updatedTrip);
        showAlert({
          message: "El viaje se ha cancelado correctamente.",
          type: "success",
        });
        router.back();
      } else {
        showAlert({
          message: "Error: No se pudo cancelar el viaje.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("❌ Error al cancelar viaje:", error);
      showAlert({
        message: "Error: Ocurrió un error al cancelar el viaje.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  const handleCompleteOrder = async () => {
    if (!trip?.id) {
      showAlert({
        message: "Error: No se encontró el ID del viaje.",
        type: "error",
      });
      return;
    }

    if (isSubmitting) return;

    if (trip.orders && Array.isArray(trip.orders)) {
      for (const tripOrder of trip.orders) {
        if (tripOrder?.deliveries && Array.isArray(tripOrder.deliveries)) {
          const allDelivered = tripOrder.deliveries.every(
            (loc: any) => loc.status === "delivered"
          );
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
        let updatedTrip = { ...trip, status: "completed" };
        saveTrip(updatedTrip);
        showAlert({
          message: response.message || "Viaje completado. Gracias por tu trabajo.",
          type: "success",
        });
        router.back();
      } else {
        showAlert({
          message: response.message || "Error: No se pudo completar el viaje.",
          type: "warning",
        });
      }
    } catch (error: any) {
      console.error("❌ Error al completar viaje:", error);
      showAlert({
        message: error.message || "Error: Ocurrió un error al completar el viaje.",
        type: "error",
      });
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <ScreenHeader
        title="Detalle del viaje"
        subtitle={`Viaje #${trip?.tripNumber || "N/A"}`}
        showBack={true}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ordenes</Text>
        {trip?.orders?.map((order: any, index: number) => (
          <DriverTripOrderCard
            key={index}
            order={order}
            isExpanded={expandedOrderIndex === index}
            onToggle={() => toggleOrder(index)}
            onCall={handleCallClient}
            onWhatsapp={handleWhatsapp}
            tripStatus={trip?.status}
            onOpenDeliveryModal={handleOpenDeliveryModal}
          />
        ))}

        <View style={{ marginTop: 10 }}>
          <InfoRow
            icon="chatbox-ellipses-outline"
            label="Comentarios"
            value={trip?.comments || "Ninguno"}
          />
        </View>
      </View>

      <TripActionButtons
        tripStatus={trip?.status || ""}
        onStartTrip={handleStartTrip}
        onCompleteOrder={handleCompleteOrder}
        onCancel={() => setIsCancelModalVisible(true)}
      />

      <DriverTripMap
        location={location}
        orders={trip?.orders}
        tripStatus={trip?.status || ""}
      />

      <ConfirmationModal
        visible={isCancelModalVisible}
        title="Cancelar viaje"
        message="¿Estás seguro de que deseas cancelar este viaje?"
        onConfirm={confirmCancelTrip}
        onCancel={() => setIsCancelModalVisible(false)}
        confirmText="Sí, cancelar"
        cancelText="No, volver"
      />

      <ConfirmationModal
        visible={isDeliveryModalVisible}
        title="Confirmar Entrega"
        message="¿Confirmas que este pedido fue entregado en el destino?"
        onConfirm={handleSendDelivery}
        onCancel={() => setIsDeliveryModalVisible(false)}
        confirmText="Sí, entregar"
        cancelText="Cancelar"
      />
    </ScrollView>
  );
};

export default DriverOrderDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: Palette.primaryDark,
  },
});
