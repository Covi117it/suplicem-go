import React, { useContext } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/components/ScreenHeader";
import { AuthContext } from "@/context/authContext";
import { useOrders } from "@/context/orderContext";
import { formatRD } from "@/utils/currencyUtils";
import { openExternalNavigation } from "@/utils/navigationUtils";
import { useClientOrderTracking } from "../hooks/useClientOrderTracking";
import { useRepeatOrder } from "../hooks/useRepeatOrder";
import { ClientOrderSummaryCard } from "../components/ClientOrderSummaryCard";
import { ClientOrderReorderBanner } from "../components/ClientOrderReorderBanner";
import { ClientOrderTrackingSteps } from "../components/ClientOrderTrackingSteps";
import { ClientOrderMap } from "../components/ClientOrderMap";

interface ClientOrderDetailScreenProps {
  orderId?: string;
}

export const ClientOrderDetailScreen: React.FC<
  ClientOrderDetailScreenProps
> = ({ orderId }) => {
  const { user } = useContext(AuthContext);
  const { orders } = useOrders();

  const selectedOrder = orders.find((order) => order.id === orderId);

  const { trip, driverLocation, handleCallDriver, handleWhatsapp } =
    useClientOrderTracking(selectedOrder);

  const { handleRepeatOrder } = useRepeatOrder(selectedOrder);

  if (!selectedOrder) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No se encontró información de la orden.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <ScreenHeader title="Detalle de Orden" showBack={true} />

      {/* 1. Resumen de la Orden y Datos de Entrega */}
      <ClientOrderSummaryCard
        selectedOrder={selectedOrder}
        userPhone={user?.phone}
        trip={trip}
        onCallDriver={handleCallDriver}
        onWhatsappDriver={handleWhatsapp}
      />

      {/* 2. Banner de Repetir Pedido */}
      <ClientOrderReorderBanner
        itemsCount={selectedOrder.items?.length || 0}
        onRepeatOrder={handleRepeatOrder}
      />

      {/* 3. Lista de Productos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Productos</Text>
        {selectedOrder.items?.map((item: any, index: number) => (
          <View key={item.id || index} style={styles.productCard}>
            <Text style={styles.productTitle}>🛒 Producto {index + 1}</Text>
            <Text style={styles.productLine}>
              📄 <Text style={styles.bold}>Descripción:</Text> {item.name}
            </Text>
            <Text style={styles.productLine}>
              📦 <Text style={styles.bold}>Cantidad:</Text> {item.quantity}{" "}
              {item.unit}
            </Text>
            <Text style={styles.productLine}>
              💰 <Text style={styles.bold}>Monto total:</Text>{" "}
              {formatRD(item.subtotal)}
            </Text>
          </View>
        ))}
      </View>

      {/* 4. Lista de Entregas por Destino */}
      {selectedOrder.deliveries && selectedOrder.deliveries.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entregas</Text>
          {selectedOrder.deliveries.map((delivery: any, idx: number) => (
            <View key={idx} style={styles.deliveryCard}>
              <Text style={styles.deliveryAddress}>
                📍 {delivery.address?.description}
                {delivery.address?.additionalInfo
                  ? `, ${delivery.address.additionalInfo}`
                  : ""}
              </Text>
              <Text style={styles.deliveryValue}>
                🪣{" "}
                {
                  selectedOrder?.items?.find(
                    (o: any) => o.productId === delivery.productId
                  )?.name
                }{" "}
                - {delivery.quantity} {delivery.unit}
              </Text>

              {delivery.address?.latitude && delivery.address?.longitude && (
                <TouchableOpacity
                  style={styles.navigationButton}
                  onPress={() =>
                    openExternalNavigation({
                      latitude: Number(delivery.address.latitude),
                      longitude: Number(delivery.address.longitude),
                      label: delivery.address?.description || "Destino de Entrega",
                    })
                  }
                  activeOpacity={0.85}
                >
                  <Ionicons name="compass-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.navigationButtonText}>
                    🗺️ Ver ubicación en GPS (Google Maps / Waze)
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {/* 5. Comentarios */}
      {selectedOrder.comments ? (
        <View style={styles.section}>
          <Text style={styles.commentsLabel}>Comentarios:</Text>
          <Text style={styles.commentsValue}>{selectedOrder.comments}</Text>
        </View>
      ) : null}

      {/* 6. Seguimiento de Pasos */}
      <ClientOrderTrackingSteps tripStatus={trip?.status} />

      {/* 7. Mapa de Seguimiento en Vivo */}
      <ClientOrderMap
        driverLocation={driverLocation}
        trip={trip}
        deliveries={selectedOrder.deliveries}
        orderId={selectedOrder.id}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff8f3",
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff8f3",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0F294A",
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  productTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0F294A",
    marginBottom: 6,
  },
  productLine: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 4,
  },
  bold: {
    fontWeight: "bold",
    color: "#1E293B",
  },
  deliveryCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  deliveryAddress: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F294A",
    marginBottom: 4,
  },
  deliveryValue: {
    fontSize: 13,
    color: "#64748B",
  },
  commentsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 4,
  },
  commentsValue: {
    fontSize: 14,
    color: "#1E293B",
  },
  navigationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#0284C7",
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  navigationButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});
