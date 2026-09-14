import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

export interface StatusBadgeProps {
  status: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: "small" | "medium";
}

export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
}

export const getStatusConfig = (status?: string | null): StatusConfig => {
  const normalized = (status || "").toLowerCase().trim();

  switch (normalized) {
    case "pending":
      return {
        label: "Pendiente",
        color: "#D97706",
        bg: "rgba(245, 158, 11, 0.12)",
        border: "rgba(245, 158, 11, 0.35)",
      };
    case "approved":
      return {
        label: "Aprobada",
        color: "#059669",
        bg: "rgba(16, 185, 129, 0.12)",
        border: "rgba(16, 185, 129, 0.35)",
      };
    case "on_the_way":
      return {
        label: "En camino",
        color: "#2563EB",
        bg: "rgba(37, 99, 235, 0.12)",
        border: "rgba(37, 99, 235, 0.35)",
      };
    case "in_progress":
      return {
        label: "En progreso",
        color: "#2563EB",
        bg: "rgba(37, 99, 235, 0.12)",
        border: "rgba(37, 99, 235, 0.35)",
      };
    case "delivered":
      return {
        label: "Entregado",
        color: "#059669",
        bg: "rgba(16, 185, 129, 0.12)",
        border: "rgba(16, 185, 129, 0.35)",
      };
    case "completed":
      return {
        label: "Completada",
        color: "#059669",
        bg: "rgba(16, 185, 129, 0.12)",
        border: "rgba(16, 185, 129, 0.35)",
      };
    case "rejected":
      return {
        label: "Rechazada",
        color: "#DC2626",
        bg: "rgba(239, 68, 68, 0.12)",
        border: "rgba(239, 68, 68, 0.35)",
      };
    case "canceled":
    case "cancelled":
      return {
        label: "Cancelada",
        color: "#DC2626",
        bg: "rgba(239, 68, 68, 0.12)",
        border: "rgba(239, 68, 68, 0.35)",
      };
    case "active":
      return {
        label: "Activo",
        color: "#059669",
        bg: "rgba(16, 185, 129, 0.12)",
        border: "rgba(16, 185, 129, 0.35)",
      };
    case "inactive":
      return {
        label: "Inactivo",
        color: "#DC2626",
        bg: "rgba(239, 68, 68, 0.12)",
        border: "rgba(239, 68, 68, 0.35)",
      };
    default:
      return {
        label: status || "Desconocido",
        color: "#4B5563",
        bg: "rgba(107, 114, 128, 0.12)",
        border: "rgba(107, 114, 128, 0.35)",
      };
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  style,
  textStyle,
  size = "medium",
}) => {
  const config = getStatusConfig(status);
  const isSmall = size === "small";

  return (
    <View
      style={[
        styles.badge,
        isSmall && styles.badgeSmall,
        { backgroundColor: config.bg, borderColor: config.border },
        style,
      ]}
    >
      <View
        style={[
          styles.dot,
          isSmall && styles.dotSmall,
          { backgroundColor: config.color },
        ]}
      />
      <Text
        style={[
          styles.text,
          isSmall && styles.textSmall,
          { color: config.color },
          textStyle,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
  textSmall: {
    fontSize: 11,
    fontWeight: "500",
  },
});

export default StatusBadge;
