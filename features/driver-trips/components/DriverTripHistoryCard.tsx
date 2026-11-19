import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Trip } from "@/types/trips";
import { driverTripStatusMap } from "../hooks/useDriverTripsHistory";

interface DriverTripHistoryCardProps {
  trip: Trip;
  onPress: (tripId: string) => void;
}

export const DriverTripHistoryCard: React.FC<DriverTripHistoryCardProps> = ({
  trip,
  onPress,
}) => {
  const { text: statusText, color: statusColor } =
    driverTripStatusMap[trip.status || "default"] || driverTripStatusMap.default;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(trip.id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{trip.tripNumber}</Text>
        <Text style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          {statusText}
        </Text>
      </View>
      <Text style={styles.cardDetail}>Toneladas: {trip.totalTons}</Text>
      <Text style={styles.cardDetail}>
        Fecha: {new Date(trip.createdAt).toLocaleDateString()}{" "}
        {new Date(trip.createdAt).toLocaleTimeString()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    color: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "bold",
  },
  cardDetail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
});
