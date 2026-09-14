import ConfirmationModal from "@/components/ConfirmationModal";
import InfoRow from "@/components/InfoRow";
import ScreenHeader from "@/components/ScreenHeader";
import DeliveryProofModal from "@/components/driver/DeliveryProofModal";
import DriverTripMap from "@/components/driver/DriverTripMap";
import DriverTripOrderCard from "@/components/driver/DriverTripOrderCard";
import TripActionButtons from "@/components/driver/TripActionButtons";
import { ROLE } from "@/constants/UserConstants";
import { Palette } from "@/constants/theme";
import { useAlert } from "@/context/alertContext";
import { AuthContext } from "@/context/authContext";
import { useLoading } from "@/context/loadingContext";
import { AcceptedTripContext } from "@/context/TripContext";
import { useMountEffect } from "@/hooks/lifeCicle";
import { completeDeliveryWithProof } from "@/services/orderService";
import { sendDriverLocation, startOrCancelrip } from "@/services/tripsService";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
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

  // Estado para el modal de entrega
  const [isDeliveryModalVisible, setIsDeliveryModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<{
    orderId: string;
    deliveryIndex: number;
  } | null>(null);
  const [deliveryImage, setDeliveryImage] = useState<string | null>(null);
  const [deliveryComment, setDeliveryComment] = useState("");

  useMountEffect(async () => {
    if (trip?.status === "accepted" || trip?.status === "started") {
      startDriverLocationTracking();
    }
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
        let updatedTrip = trip;
        updatedTrip.status = "started";
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
    const updatedTrip = tripData;
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
    setDeliveryImage(null);
    setDeliveryComment("");
    setIsDeliveryModalVisible(true);
  };

  const handleSendDelivery = async () => {
    if (!deliveryImage) {
      showAlert({
        message: "Debe subir una foto para marcar la entrega.",
        type: "warning",
      });
      return;
    }
    if (!deliveryComment) {
      showAlert({
        message: "Debe agregar un comentario a la entrega.",
        type: "warning",
      });
      return;
    }

    if (!currentOrder) return;

    try {
      show();
      const response = await completeDeliveryWithProof(
        currentOrder.orderId,
        currentOrder.deliveryIndex,
        deliveryImage,
        deliveryComment
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
    } catch (error) {
      console.error("❌ Error al marcar como entregado:", error);
      showAlert({
        message: "Error: Ocurrió un error al marcar la entrega.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showAlert({
        message: "Se necesita permiso para acceder a la galería.",
        type: "warning",
      });
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets![0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      setDeliveryImage(manipResult.uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showAlert({
        message: "Se necesita permiso para acceder a la cámara.",
        type: "warning",
      });
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets![0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      setDeliveryImage(manipResult.uri);
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
        let updatedTrip = trip;
        updatedTrip.status = "canceled";
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

    for (const tripOrder of trip.orders) {
      const allDelivered = tripOrder?.deliveries.every(
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

    try {
      show();
      const response = await startOrCancelrip(trip.id, "completed");

      if (response.success) {
        let updatedTrip = trip;
        updatedTrip.status = "completed";
        saveTrip(updatedTrip);
        showAlert({
          message: "Viaje completado. Gracias por tu trabajo.",
          type: "success",
        });
        router.back();
      } else {
        showAlert({
          message: "Error: No se pudo completar el viaje.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("❌ Error al completar viaje:", error);
      showAlert({
        message: "Error: Ocurrió un error al completar el viaje.",
        type: "error",
      });
    } finally {
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
        tripStatus={trip?.status}
        onStartTrip={handleStartTrip}
        onCompleteOrder={handleCompleteOrder}
        onCancel={() => setIsCancelModalVisible(true)}
      />

      <DriverTripMap
        location={location}
        orders={trip?.orders}
        tripStatus={trip?.status}
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

      <DeliveryProofModal
        visible={isDeliveryModalVisible}
        onClose={() => setIsDeliveryModalVisible(false)}
        deliveryImage={deliveryImage}
        deliveryComment={deliveryComment}
        onChangeComment={setDeliveryComment}
        onTakePhoto={takePhoto}
        onPickImage={pickImage}
        onSubmit={handleSendDelivery}
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
