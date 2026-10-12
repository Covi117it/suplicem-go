import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ORDER_PREFIX } from "@/constants/UserConstants";
import { formatRD } from "@/utils/currencyUtils";
import ContactButtons from "@/components/common/ContactButtons";
import StatusBadge from "@/components/StatusBadge";

interface AdminTripOrdersListProps {
  orders?: any[];
}

export const AdminTripOrdersList: React.FC<AdminTripOrdersListProps> = ({ orders = [] }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleOrder = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Órdenes Asignadas ({orders.length})</Text>

      {orders.map((order, index) => {
        const isExpanded = expandedIndex === index;

        return (
          <View key={order.id || index} style={styles.orderCard}>
            <TouchableOpacity
              onPress={() => toggleOrder(index)}
              style={styles.orderHeader}
              activeOpacity={0.7}
            >
              <Text style={styles.orderNumber}>
                {`${ORDER_PREFIX.ORD}${order?.orderNumber || order?.id}`}
              </Text>
              <Text style={styles.chevron}>{isExpanded ? "▲" : "▼"}</Text>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.expandedContent}>
                {/* Datos del Cliente */}
                <View style={styles.subSection}>
                  <Text style={styles.subTitle}>Datos del cliente</Text>
                  <Text style={styles.textValue}>
                    👤 {order.userNames} {order.userLastNames}
                  </Text>
                  <Text style={styles.textValue}>📞 {order.userPhone}</Text>
                  <ContactButtons
                    phone={order.userPhone}
                    callLabel="Llamar"
                    whatsappLabel="WhatsApp"
                    layout="row"
                    style={styles.contactRow}
                  />
                </View>

                {/* Productos */}
                <View style={styles.subSection}>
                  <Text style={styles.subTitle}>Productos y Carga Transportada</Text>
                  {(order.items || []).map((item: any, itemIdx: number) => (
                    <View key={itemIdx} style={styles.itemBox}>
                      <Text style={styles.itemName}>🛒 {item.name}</Text>
                      <Text style={styles.itemDetails}>
                        🚚 Carga en este viaje:{" "}
                        <Text style={{ fontWeight: "bold", color: "#0F294A" }}>
                          {order.tripTons ? `${order.tripTons} t` : `${item.quantity} ${item.unit}`}
                        </Text>
                      </Text>
                      <Text style={[styles.itemDetails, { color: "#64748B", fontSize: 12 }]}>
                        Total orden del cliente: {item.quantity} {item.unit} | Monto: {formatRD(item.subtotal)}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Direcciones de Entrega */}
                <View style={styles.subSection}>
                  <Text style={styles.subTitle}>Direcciones de Entrega</Text>
                  {(order.deliveries || []).map((delivery: any, delIdx: number) => (
                    <View key={delivery.id || delIdx} style={styles.deliveryBox}>
                      <Text style={styles.textValue}>
                        📍 {delivery.address?.description}
                        {delivery.address?.additionalInfo ? `, ${delivery.address.additionalInfo}` : ""}
                      </Text>
                      <Text style={styles.textValue}>
                        🪣 Cantidad: {delivery.quantity} {delivery.unit}
                      </Text>

                      {delivery.status === "delivered" && (
                        <View style={styles.badgeWrapper}>
                          <StatusBadge status="delivered" size="small" />
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default AdminTripOrdersList;

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 10,
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
    overflow: "hidden",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#F9FAFB",
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  chevron: {
    fontSize: 16,
    color: "#4B5563",
  },
  expandedContent: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  subSection: {
    marginBottom: 14,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  textValue: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 2,
  },
  contactRow: {
    marginTop: 6,
  },
  itemBox: {
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  itemDetails: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 2,
  },
  deliveryBox: {
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  badgeWrapper: {
    marginTop: 6,
    alignSelf: "flex-start",
  },
});
