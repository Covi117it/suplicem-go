import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Order } from "@/types/orders";
import { Trip } from "@/types/trips";
import { tonsToBags } from "@/constants/cartConstants";

interface OrderTripsProgressCardProps {
  order: Order;
  orderTrips: Trip[];
  availableToDispatch: number;
  onDispatchNextTrip: () => void;
  isDispatching?: boolean;
}

export const OrderTripsProgressCard: React.FC<OrderTripsProgressCardProps> = ({
  order,
  orderTrips,
  availableToDispatch,
  onDispatchNextTrip,
  isDispatching,
}) => {
  const totalTons = Number(order.totalTons || order.pendingBalance) || 0;
  const deliveredTons = Number(order.deliveredTons) || 0;

  // Total real de fundas de cemento sumando los ítems de la orden (sin divisiones a ciegas)
  const totalBagsInOrder = (order.items || []).reduce((sum: number, item: any) => {
    const isCement = item.unit === "fundas" || !item.unit || item.name?.toLowerCase().includes("cemento");
    return sum + (isCement ? (Number(item.quantity) || 0) : 0);
  }, 0);

  const progressRatio = totalTons > 0 ? Math.min(1, Math.max(0, deliveredTons / totalTons)) : 0;
  const deliveredBags = Math.round(totalBagsInOrder * progressRatio);
  const bagsToDispatch = totalTons > 0 ? Math.max(0, Math.round(totalBagsInOrder * (availableToDispatch / totalTons))) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="git-network-outline" size={20} color="#0F294A" />
        <Text style={styles.title}>Progreso y Despachos de la Orden</Text>
      </View>

      {/* Resumen de Tonelaje y Fundas */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Orden</Text>
          <Text style={styles.statValue}>{totalTons.toFixed(2)} t</Text>
          <Text style={styles.statSubValue}>({totalBagsInOrder.toLocaleString()} fundas)</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Entregado</Text>
          <Text style={[styles.statValue, { color: "#166534" }]}>{deliveredTons.toFixed(2)} t</Text>
          <Text style={styles.statSubValue}>({deliveredBags.toLocaleString()} fundas)</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Por Programar</Text>
          <Text style={[styles.statValue, { color: availableToDispatch > 0 ? "#C2410C" : "#64748B" }]}>
            {availableToDispatch.toFixed(2)} t
          </Text>
          <Text style={styles.statSubValue}>({bagsToDispatch.toLocaleString()} fundas)</Text>
        </View>
      </View>

      {/* Lista de Viajes Existentes */}
      {orderTrips.length > 0 && (
        <View style={styles.tripsList}>
          <Text style={styles.subTitle}>Viajes generados ({orderTrips.length}):</Text>
          {orderTrips.map((t, idx) => (
            <View key={t.id || idx} style={styles.tripItem}>
              <View style={styles.tripItemHeader}>
                <Text style={styles.tripNumber}>🚚 {t.tripNumber}</Text>
                <Text style={styles.tripStatus}>{t.status || "available"}</Text>
              </View>
              <Text style={styles.tripDetails}>
                Carga: <Text style={styles.bold}>{t.totalTons} t</Text>
                {t.assignedDriverId ? ` • Conductor asignado` : " • Bolsa general"}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Botón para Despachar Siguiente Viaje si queda saldo disponible */}
      {availableToDispatch > 0 && order.status === "approved" && (
        <TouchableOpacity
          style={styles.dispatchButton}
          onPress={onDispatchNextTrip}
          disabled={isDispatching}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
          <Text style={styles.dispatchButtonText}>
            {isDispatching
              ? "Programando viaje..."
              : `Programar Viaje Simultáneo (${availableToDispatch.toFixed(2)} t)`}
          </Text>
        </TouchableOpacity>
      )}

      {availableToDispatch <= 0 && totalTons > 0 && (
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-done-circle" size={16} color="#15803D" />
          <Text style={styles.completedText}>
            Todo el tonelaje de la orden ha sido despachado en sus respectivos viajes.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F294A",
  },
  statSubValue: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  tripsList: {
    marginBottom: 10,
  },
  tripItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 6,
  },
  tripItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tripNumber: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F294A",
  },
  tripStatus: {
    fontSize: 11,
    color: "#0284C7",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  tripDetails: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },
  bold: {
    fontWeight: "700",
  },
  dispatchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#166534",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
    marginTop: 6,
  },
  dispatchButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DCFCE7",
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  completedText: {
    flex: 1,
    fontSize: 12,
    color: "#15803D",
    fontWeight: "600",
  },
});
