import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AdminTrip, isTripFractional } from "../hooks/useAdminTripsList";

type StatusInfo = {
  text: string;
  color: string;
};

const statusTranslation: Record<string, StatusInfo> = {
  available: { text: "Pendiente", color: "#FFA500" },
  assigned: { text: "Asignado", color: "#D97706" },
  accepted: { text: "Aceptado", color: "#0047AB" },
  canceled: { text: "Cancelado", color: "#F44336" },
  started: { text: "Iniciado", color: "#2196F3" },
  in_progress: { text: "En curso", color: "#2196F3" },
  completed: { text: "Finalizado", color: "#4CAF50" },
  default: { text: "Desconocido", color: "#9E9E9E" },
};

interface AdminTripCardProps {
  trip: AdminTrip;
  onPress: (tripId: string) => void;
}

export const AdminTripCard: React.FC<AdminTripCardProps> = ({ trip, onPress }) => {
  const statusInfo = statusTranslation[trip.status ?? ""] || statusTranslation.default;
  const isFractional = isTripFractional(trip.tripNumber);

  return (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => onPress(trip.id)}
      activeOpacity={0.8}
    >
      <View style={styles.tripHeader}>
        <View style={styles.tripNumberCol}>
          <Text style={styles.tripNumber}>{trip.tripNumber}</Text>
          {isFractional && (
            <View style={styles.fractionalTag}>
              <Text style={styles.fractionalTagText}>🧩 Despacho Fraccionado</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
          <Text style={styles.statusBadgeText}>{statusInfo.text}</Text>
        </View>
      </View>
      <Text style={styles.tripInfo}>
        Toneladas: <Text style={styles.bold}>{trip.totalTons}</Text>
      </Text>
      <Text style={styles.tripInfo}>
        Fecha: <Text style={styles.bold}>{new Date(trip.createdAt).toLocaleString()}</Text>
      </Text>
      {trip.comments ? (
        <Text style={styles.tripComment}>{trip.comments}</Text>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tripCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tripNumberCol: {
    flex: 1,
  },
  tripNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
  },
  fractionalTag: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  fractionalTagText: {
    fontSize: 11,
    color: "#92400E",
    fontWeight: "700",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  tripInfo: {
    fontSize: 14,
    color: "#333",
    marginTop: 4,
  },
  bold: {
    fontWeight: "bold",
  },
  tripComment: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
    marginTop: 6,
  },
});
