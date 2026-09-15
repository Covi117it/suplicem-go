import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Palette } from "@/constants/theme";

export type OrderFilterType = "all" | "approved" | "on_the_way" | "pending" | "delivered" | "canceled";

export interface OrderFilterOption {
  id: OrderFilterType;
  label: string;
}

interface OrderFilterChipsProps {
  activeFilter: OrderFilterType;
  onSelectFilter: (filter: OrderFilterType) => void;
  counts: Record<OrderFilterType, number>;
}

export const FILTER_OPTIONS: OrderFilterOption[] = [
  { id: "all", label: "Todas" },
  { id: "approved", label: "Aprobadas" },
  { id: "on_the_way", label: "En camino" },
  { id: "pending", label: "Pendientes" },
  { id: "delivered", label: "Entregadas" },
  { id: "canceled", label: "Canceladas" },
];

export const OrderFilterChips: React.FC<OrderFilterChipsProps> = ({
  activeFilter,
  onSelectFilter,
  counts,
}) => {
  // Solo muestra "Canceladas" si el cliente tiene órdenes canceladas
  const visibleOptions = FILTER_OPTIONS.filter(
    (opt) => opt.id !== "canceled" || (counts.canceled && counts.canceled > 0)
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {visibleOptions.map((opt) => {
          const isActive = activeFilter === opt.id;
          const count = counts[opt.id] ?? 0;

          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelectFilter(opt.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {opt.label}
              </Text>
              <View
                style={[
                  styles.badge,
                  isActive ? styles.badgeActive : styles.badgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    isActive ? styles.badgeTextActive : styles.badgeTextInactive,
                  ]}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default OrderFilterChips;

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surface,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chipActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
    elevation: 2,
    shadowOpacity: 0.15,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.textDark,
    marginRight: 6,
  },
  chipTextActive: {
    color: "#ffffff",
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.28)",
  },
  badgeInactive: {
    backgroundColor: "#F1F5F9",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  badgeTextActive: {
    color: "#ffffff",
  },
  badgeTextInactive: {
    color: Palette.textMuted,
  },
});