import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TripPreviewSummaryCardProps {
  totalTons: number;
  ordersCount: number;
  comments?: string;
}

export const TripPreviewSummaryCard: React.FC<TripPreviewSummaryCardProps> = ({
  totalTons,
  ordersCount,
  comments,
}) => {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <View style={styles.tripIconCircle}>
          <Ionicons name="cube-outline" size={22} color="#E31E24" />
        </View>
        <View style={styles.summaryTextCol}>
          <Text style={styles.summaryTitle}>Carga del Viaje</Text>
          <Text style={styles.summarySubtitle}>
            {ordersCount} {ordersCount === 1 ? "orden a entregar" : "órdenes a entregar"}
          </Text>
        </View>
        <View style={styles.tonsBadge}>
          <Text style={styles.tonsBadgeText}>{totalTons} Toneladas</Text>
        </View>
      </View>

      {Boolean(comments) && (
        <View style={styles.tripCommentsBox}>
          <Ionicons name="chatbox-ellipses-outline" size={16} color="#475569" />
          <Text style={styles.tripCommentsText}>{comments}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
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
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tripIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTextCol: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
  },
  summarySubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  tonsBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tonsBadgeText: {
    color: "#E31E24",
    fontWeight: "bold",
    fontSize: 13,
  },
  tripCommentsBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F1F5F9",
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  tripCommentsText: {
    fontSize: 13,
    color: "#334155",
    flex: 1,
  },
});
