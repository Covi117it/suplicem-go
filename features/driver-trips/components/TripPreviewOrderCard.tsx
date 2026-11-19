import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { InfoRow } from "@/components/InfoRow";
import { ORDER_PREFIX } from "@/constants/UserConstants";
import { formatRD } from "@/utils/currencyUtils";
import { openExternalNavigation } from "@/utils/navigationUtils";

interface TripPreviewOrderCardProps {
  order: any;
  index: number;
  onCallClient: (phone: string) => void;
  onWhatsapp: (phone: string) => void;
}

const hasValidGPS = (address?: any): boolean => {
  if (!address?.latitude || !address?.longitude) return false;
  const lat = Number(address.latitude);
  const lng = Number(address.longitude);
  return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
};

export const TripPreviewOrderCard: React.FC<TripPreviewOrderCardProps> = ({
  order,
  index,
  onCallClient,
  onWhatsapp,
}) => {
  const clientName = `${order.userNames || ""} ${order.userLastNames || ""}`.trim() || "No especificado";

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeaderRow}>
        <View style={styles.orderBadge}>
          <Ionicons name="receipt-outline" size={16} color="#0F294A" />
          <Text style={styles.orderBadgeText}>
            {ORDER_PREFIX.ORD}{order.orderNumber}
          </Text>
        </View>
        <Text style={styles.orderIndexText}>Parada #{index + 1}</Text>
      </View>

      <View style={styles.subSection}>
        <Text style={styles.subSectionTitle}>Datos del Cliente</Text>
        <InfoRow icon="person-outline" label="Cliente" value={clientName} />
        <InfoRow icon="call-outline" label="Teléfono" value={order.userPhone || "No registrado"} />

        {Boolean(order.userPhone) && (
          <View style={styles.clientContactButtons}>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => onCallClient(order.userPhone)}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={15} color="#fff" />
              <Text style={styles.contactButtonText}>Llamar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={() => onWhatsapp(order.userPhone)}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#fff" />
              <Text style={styles.contactButtonText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.subSection}>
        <Text style={styles.subSectionTitle}>Materiales a Entregar</Text>
        {order.items?.map((item: any, iIdx: number) => (
          <View key={iIdx} style={styles.productRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productQuantity}>
                Cantidad: {item.quantity} {item.unit}
              </Text>
            </View>
            {Boolean(item.subtotal) && (
              <Text style={styles.productPrice}>{formatRD(item.subtotal)}</Text>
            )}
          </View>
        ))}
      </View>

      <View style={[styles.subSection, { borderBottomWidth: 0 }]}>
        <Text style={styles.subSectionTitle}>Dirección de Entrega</Text>
        {order.deliveries?.map((delivery: any, dIdx: number) => (
          <View key={dIdx} style={{ marginBottom: 8 }}>
            <View style={styles.deliveryRow}>
              <Ionicons name="location-sharp" size={18} color="#E31E24" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.deliveryAddressText}>
                  {delivery.address?.description || "Dirección no especificada"}
                </Text>
                {Boolean(delivery.address?.additionalInfo) && (
                  <Text style={styles.deliveryExtraText}>
                    Ref: {delivery.address.additionalInfo}
                  </Text>
                )}
              </View>
            </View>

            {Boolean(hasValidGPS(delivery?.address)) && (
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={() =>
                  openExternalNavigation({
                    latitude: Number(delivery.address.latitude),
                    longitude: Number(delivery.address.longitude),
                    label: `${order.userNames || ""} - ${delivery.address?.description || "Destino"}`,
                  })
                }
                activeOpacity={0.85}
              >
                <Ionicons name="compass-outline" size={16} color="#FFFFFF" />
                <Text style={styles.navigationButtonText}>
                  🗺️ Navegar con GPS (Google Maps / Waze)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  orderHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 10,
  },
  orderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orderBadgeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F294A",
  },
  orderIndexText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  subSection: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#64748B",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  clientContactButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#0F294A",
    borderRadius: 8,
    paddingVertical: 8,
  },
  whatsappButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#25D366",
    borderRadius: 8,
    paddingVertical: 8,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  productName: {
    fontSize: 13,
    color: "#1E293B",
    fontWeight: "500",
  },
  productQuantity: {
    fontSize: 12,
    color: "#64748B",
  },
  productPrice: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0F294A",
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  deliveryAddressText: {
    fontSize: 13,
    color: "#1E293B",
    lineHeight: 18,
  },
  deliveryExtraText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    fontStyle: "italic",
  },
  navigationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#0F294A",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  navigationButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});
