import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ActiveTripBannerProps {
  currTrip: any;
  onContinue: (trip: any) => void;
  onReject: (trip: any) => void;
}

export const ActiveTripBanner: React.FC<ActiveTripBannerProps> = ({
  currTrip,
  onContinue,
  onReject,
}) => {
  const isAccepted = currTrip.status === "accepted";
  const isAssigned = currTrip.status === "assigned";
  const canReject = currTrip.status !== "started" && currTrip.status !== "in_progress";

  return (
    <View style={styles.activeTripCard}>
      <View style={styles.activeTripHeaderRow}>
        <View
          style={[
            styles.activeTripIconCircle,
            isAccepted && { backgroundColor: "#2563EB" },
            isAssigned && { backgroundColor: "#D97706" },
          ]}
        >
          <Ionicons
            name={
              isAccepted
                ? "checkmark-circle"
                : isAssigned
                ? "person-add"
                : "navigate"
            }
            size={20}
            color="#fff"
          />
        </View>
        <View style={styles.headerTextCol}>
          <Text style={styles.activeTripTitle}>
            {isAccepted
              ? `Viaje aceptado: #${currTrip.tripNumber}`
              : isAssigned
              ? `Viaje asignado: #${currTrip.tripNumber}`
              : `Viaje en curso: #${currTrip.tripNumber}`}
          </Text>
          <Text style={styles.activeTripSubtitle}>
            {isAccepted
              ? `Listo para iniciar ruta • ${currTrip.totalTons} Toneladas`
              : isAssigned
              ? `Asignado por administración • ${currTrip.totalTons} Toneladas`
              : `Ruta en camino • ${currTrip.totalTons} Toneladas`}
          </Text>
        </View>
        <View
          style={[
            styles.activeTripStatusBadge,
            isAccepted && { backgroundColor: "#DBEAFE" },
            isAssigned && { backgroundColor: "#FEF3C7" },
          ]}
        >
          <Text
            style={[
              styles.activeTripStatusText,
              isAccepted && { color: "#1D4ED8" },
              isAssigned && { color: "#B45309" },
            ]}
          >
            {isAccepted ? "Aceptado" : isAssigned ? "Asignado" : "En curso"}
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.continueTripButton}
          activeOpacity={0.85}
          onPress={() => onContinue(currTrip)}
        >
          <Text style={styles.continueTripButtonText}>
            {currTrip.status === "started" || currTrip.status === "in_progress"
              ? "Ver viaje en curso"
              : "Ir a iniciar ruta"}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>

        {canReject && (
          <TouchableOpacity
            style={styles.rejectTripButton}
            activeOpacity={0.85}
            onPress={() => onReject(currTrip)}
          >
            <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
            <Text style={styles.rejectTripButtonText}>Rechazar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  activeTripCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "#3B82F6",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  activeTripHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeTripIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  activeTripTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  activeTripSubtitle: {
    fontSize: 12,
    color: "#3B82F6",
    marginTop: 2,
  },
  activeTripStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#D1FAE5",
  },
  activeTripStatusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#065F46",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  continueTripButton: {
    flex: 1.5,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  continueTripButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  rejectTripButton: {
    flex: 1,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  rejectTripButtonText: {
    color: "#DC2626",
    fontWeight: "bold",
    fontSize: 13,
  },
});
