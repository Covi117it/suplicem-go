import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CheckRender from "@/components/CheckRender";
import InfoRow from "@/components/InfoRow";
import StatusBadge from "@/components/StatusBadge";
import { ORDER_PREFIX } from "@/constants/UserConstants";
import { Palette } from "@/constants/theme";
import { formatRD } from "@/utils/currencyUtils";
import { openExternalNavigation } from "@/utils/navigationUtils";

type DriverTripOrderCardProps = {
  order: any;
  isExpanded: boolean;
  onToggle: () => void;
  onCall: (phone: string) => void;
  onWhatsapp: (phone: string) => void;
  tripStatus: string;
  onOpenDeliveryModal: (orderId: string, deliveryIndex: number) => void;
};

export const DriverTripOrderCard: React.FC<DriverTripOrderCardProps> = ({
  order,
  isExpanded,
  onToggle,
  onCall,
  onWhatsapp,
  tripStatus,
  onOpenDeliveryModal,
}) => {
  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity onPress={onToggle} style={styles.headerRow}>
        <Text style={styles.orderLabel}>
          {`${ORDER_PREFIX.ORD}${order?.orderNumber}`}
        </Text>
        <Text style={styles.chevron}>{isExpanded ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos del cliente</Text>
            <InfoRow
              icon="person-outline"
              label="Cliente"
              value={`${order.userNames} ${order.userLastNames}`}
            />
            <InfoRow
              icon="call-outline"
              label="Teléfono"
              value={order.userPhone}
            />
          </View>

          <TouchableOpacity
            style={styles.callButton}
            onPress={() => onCall(order.userPhone)}
          >
            <Text style={styles.actionText}>📞 Llamar al cliente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.callButton, styles.whatsappButton]}
            onPress={() => onWhatsapp(order.userPhone)}
          >
            <Text style={styles.actionText}>💬 Chat en WhatsApp</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Productos</Text>
            {order.items.map((item: any, index: number) => (
              <View key={index} style={styles.productCard}>
                <Text style={styles.productTitle}>🛒 Producto {index + 1}</Text>
                <InfoRow
                  icon="document-text-outline"
                  label="Descripción"
                  value={item.name}
                />
                <InfoRow
                  icon="cube-outline"
                  label="Cantidad"
                  value={`${item.quantity} ${item.unit}`}
                />
                <InfoRow
                  icon="cash-outline"
                  label="Monto total"
                  value={formatRD(item.subtotal)}
                />
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Direcciones de entrega</Text>
            {order?.deliveries?.map((delivery: any, index: number) => (
              <View key={delivery.productId || index} style={styles.deliveryCard}>
                <Text style={styles.value}>
                  📍 {delivery.address?.description}
                  {delivery.address?.additionalInfo
                    ? `, ${delivery.address.additionalInfo}`
                    : ""}
                </Text>
                <Text style={styles.value}>
                  🪣{" "}
                  {order?.items?.find((o: any) => o.productId === delivery.productId)?.name}{" "}
                  - {delivery.quantity} {delivery.unit}
                </Text>

                {delivery.address?.latitude && delivery.address?.longitude && (
                  <TouchableOpacity
                    style={styles.navigationButton}
                    onPress={() =>
                      openExternalNavigation({
                        latitude: Number(delivery.address.latitude),
                        longitude: Number(delivery.address.longitude),
                        label: `${order.userNames || ""} ${order.userLastNames || ""} - ${delivery.address?.description || "Destino"}`,
                      })
                    }
                    activeOpacity={0.85}
                  >
                    <Ionicons name="compass-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.navigationButtonText}>
                      🗺️ Navegar con GPS (Google Maps / Waze)
                    </Text>
                  </TouchableOpacity>
                )}

                <CheckRender allowed={delivery.status === "delivered"}>
                  <View style={{ marginTop: 8 }}>
                    <StatusBadge status="delivered" size="small" />
                  </View>
                </CheckRender>
                <CheckRender
                  allowed={
                    delivery.status !== "delivered" && tripStatus === "started"
                  }
                >
                  <TouchableOpacity
                    style={styles.deliverButton}
                    onPress={() => onOpenDeliveryModal(order?.id, index)}
                  >
                    <Text style={styles.deliverButtonText}>
                      Marcar como entregado
                    </Text>
                  </TouchableOpacity>
                </CheckRender>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default DriverTripOrderCard;

const styles = StyleSheet.create({
  cardContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  orderLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Palette.text,
  },
  chevron: {
    fontSize: 18,
    color: Palette.text,
  },
  expandedContent: {
    marginTop: 6,
  },
  section: {
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: Palette.primaryDark,
  },
  value: {
    fontSize: 15,
    color: "#333",
    marginBottom: 4,
  },
  callButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  whatsappButton: {
    backgroundColor: "#25D366",
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eee",
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  deliveryCard: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  deliverButton: {
    backgroundColor: "#FF7F32",
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  deliverButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  navigationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#0284C7",
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  navigationButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
});
