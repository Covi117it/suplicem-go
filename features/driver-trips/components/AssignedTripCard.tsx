import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Trip } from "@/types/trips";

interface AssignedTripCardProps {
  trip: Trip;
  hasAcceptedTrip: boolean;
  onStartRoute: (trip: Trip) => void;
  onReject: (trip: Trip) => void;
  onViewDetail: (trip: Trip) => void;
}

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const AssignedTripCard: React.FC<AssignedTripCardProps> = ({
  trip,
  hasAcceptedTrip,
  onStartRoute,
  onReject,
  onViewDetail,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.label}>Viaje: {trip.tripNumber}</Text>
        <View style={styles.assignedBadge}>
          <Text style={styles.assignedBadgeText}>✓ Aceptado</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="cube-outline" size={18} color="#E31E24" />
        <Text style={styles.detail}>Toneladas: {trip.totalTons}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={18} color="#E31E24" />
        <Text style={styles.detail}>Fecha: {formatDate(trip.createdAt)}</Text>
      </View>

      {trip.comments ? (
        <View style={styles.infoRow}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#666" />
          <Text style={[styles.detail, { color: "#666" }]}>{trip.comments}</Text>
        </View>
      ) : null}

      <View style={styles.cardActionsContainer}>
        <TouchableOpacity
          style={styles.mainStartRouteButton}
          activeOpacity={0.8}
          onPress={() => onStartRoute(trip)}
        >
          <Ionicons name="navigate" size={19} color="#fff" />
          <Text style={styles.mainStartRouteButtonText}>Iniciar Ruta</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActionsRow}>
          <TouchableOpacity
            style={styles.rejectCardButton}
            activeOpacity={0.8}
            onPress={() => onReject(trip)}
          >
            <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
            <Text style={styles.rejectButtonText}>Rechazar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailCardButton}
            activeOpacity={0.8}
            onPress={() => onViewDetail(trip)}
          >
            <Ionicons name="eye-outline" size={18} color="#0F294A" />
            <Text style={styles.detailButtonText}>Ver Detalle</Text>
          </TouchableOpacity>
        </View>
      </View>
      {hasAcceptedTrip && (
        <Text style={styles.disabledTripNotice}>
          Ya tienes un viaje aceptado o en curso
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F294A",
  },
  assignedBadge: {
    backgroundColor: "#DBEAFE",
    borderWidth: 1,
    borderColor: "#2563EB",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  assignedBadgeText: {
    color: "#1D4ED8",
    fontSize: 11,
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  detail: {
    fontSize: 14,
    color: "#333",
  },
  cardActionsContainer: {
    marginTop: 14,
    gap: 8,
  },
  mainStartRouteButton: {
    backgroundColor: "#E31E24",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  mainStartRouteButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryActionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  rejectCardButton: {
    flex: 1,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  rejectButtonText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 13,
  },
  detailCardButton: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  detailButtonText: {
    color: "#0F294A",
    fontWeight: "700",
    fontSize: 13,
  },
  disabledTripNotice: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 6,
    fontStyle: "italic",
  },
});
