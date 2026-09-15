import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface InfoRowProps {
  label: string;
  value?: string | number | null;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
}

export const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  icon,
  iconColor = "#64748B",
  children,
  style,
  labelStyle,
  valueStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelContainer}>
        {icon && (
          <Ionicons
            name={icon}
            size={16}
            color={iconColor}
            style={styles.icon}
          />
        )}
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      </View>
      {children ? (
        children
      ) : (
        <Text style={[styles.value, valueStyle]}>{value ?? "N/A"}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
  },
});

export default InfoRow;
